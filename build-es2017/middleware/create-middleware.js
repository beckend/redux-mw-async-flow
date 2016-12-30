"use strict";
const tslib_1 = require("tslib");
const date_1 = require("./date");
const default_options_1 = require("./default-options");
const request_store_1 = require("../request-store");
const async_types_1 = require("../async-types");
const promise_factory_1 = require("../promise-factory");
const middleware_observers_1 = require("./middleware-observers");
const Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
const Subject_1 = require("rxjs/Subject");
exports.Subject = Subject_1.Subject;
const merge = require('lodash.merge');
const lSet = require('lodash.set');
const lGet = require('lodash.get');
const uniqueid = require('uniqueid');
const getGenerateId = () => {
    const asyncUniqueId = uniqueid(null, '-@@ASYNC_FLOW');
    return ({ action }) => `${asyncUniqueId()}--${action.type}`;
};
exports.createAsyncFlowMiddleware = (opts = {
        metaKey: default_options_1.defaultOpts.metaKey,
        timeout: default_options_1.defaultOpts.timeout
    }) => {
    const { REQUEST, PENDING, FULFILLED, REJECTED, ABORTED, END } = async_types_1.getAsyncTypeConstants({ types: opts.asyncTypes });
    const mwObservers = middleware_observers_1.createObservers({
        asyncTypes: {
            REQUEST,
            END
        }
    });
    const { metaKey, timeout, metaKeyRequestID, generateId: generateIdMerged } = tslib_1.__assign({}, default_options_1.defaultOpts, opts);
    const generateId = generateIdMerged || getGenerateId();
    const requestStore = new request_store_1.RequestStore();
    const middleware = () => {
        return (next) => {
            return (action) => {
                const dispatchNormal = () => next(action);
                const dispatchAsyncFlow = (actionArg) => {
                    // Lets observers have a go before and after dispatches
                    mwObservers.before.rootSubject.next(actionArg);
                    const dispatchResult = next(actionArg);
                    mwObservers.after.rootSubject.next(dispatchResult);
                };
                const actionType = action.type;
                /**
                 * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
                 */
                if (lGet(action, ['meta', metaKey, 'enable']) === false) {
                    dispatchNormal();
                    return;
                }
                // used to get deep in action object
                const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
                // iF set will dispatch en END action
                let actionEnd;
                // Resole, reject and then set dispatch END payload
                const handleEndAction = (suffixType, resolve, payloadArg) => {
                    const requestID = lGet(action, metaRequestIdPath);
                    if (requestID) {
                        if (resolve) {
                            requestStore.resolve(requestID, payloadArg || action.payload);
                        }
                        else {
                            requestStore.reject(requestID, payloadArg || action.payload);
                        }
                        actionEnd = merge({}, action, {
                            type: async_types_1.replaceSuffix(actionType, suffixType, END),
                            meta: {
                                [metaKey]: {
                                    endActionType: actionType,
                                    timeEnd: date_1.newDate()
                                }
                            }
                        });
                    }
                    else {
                        console.warn(`${action.type} - meta data not found, did you forget to send it?`);
                    }
                };
                /**
                 * handle REQUEST, dispatches PENDING then dispatches REQUEST with meta data
                 */
                if (actionType.endsWith(REQUEST)) {
                    /**
                     * Generate uniqueid, make sure it does not exist
                     */
                    let requestID = lGet(action, metaRequestIdPath);
                    /* istanbul ignore next */
                    if (!requestID || {}.hasOwnProperty.call(requestStore, requestID)) {
                        do {
                            requestID = generateId({ action });
                        } while ({}.hasOwnProperty.call(requestStore, requestID));
                        lSet(action, metaRequestIdPath, requestID);
                    }
                    // User override of the timeout for each request
                    const metaTimeoutKey = lGet(action, ['meta', metaKey, 'timeoutRequest']);
                    const timeoutRequest = metaTimeoutKey || timeout;
                    /**
                     * Dispatch pending first, with a twist, send a promise resolve reject with it
                     * So this way user can use to the promise to do stuff after the action
                     * The promise will be resolved/rejected later when getting ABORTED, REJECTED, or FULFILLED
                     */
                    const { promise, reject, resolve } = promise_factory_1.createPromise();
                    promise
                        .timeout(timeoutRequest, 'timeout')
                        .catch((er) => {
                        // force bluebird to normal reject on errors, fixes jest etc
                        reject(er);
                    })
                        .finally(() => {
                        // Cleanup from requestStore
                        requestStore.delete(requestID);
                    });
                    const tmpRequestStoreAddPayload = {
                        [request_store_1.REQUEST_KEY_PROMISE]: promise,
                        [request_store_1.REQUEST_KEY_RESOLVEFN]: resolve,
                        [request_store_1.REQUEST_KEY_REJECTFN]: reject
                    };
                    // Register promise to requestStore
                    requestStore.add(requestID, tmpRequestStoreAddPayload);
                    /**
                     * dispatch PENDING with meta
                     */
                    const addedActionMetaData = {
                        meta: {
                            [metaKey]: {
                                timeout,
                                timeoutRequest,
                                promise,
                                endActionType: null,
                                timeStart: date_1.newDate(),
                                timeEnd: null
                            }
                        }
                    };
                    const pendingAction = merge({}, action, {
                        type: async_types_1.replaceSuffix(actionType, REQUEST, PENDING)
                    }, addedActionMetaData);
                    dispatchAsyncFlow(pendingAction);
                    /**
                     * Dispatch orginal action with meta data
                     */
                    const newAction = merge({}, action, addedActionMetaData);
                    dispatchAsyncFlow(newAction);
                    return;
                }
                else if (actionType.endsWith(FULFILLED)) {
                    handleEndAction(FULFILLED, true);
                }
                else if (actionType.endsWith(REJECTED)) {
                    handleEndAction(REJECTED, false);
                }
                else if (actionType.endsWith(ABORTED)) {
                    handleEndAction(ABORTED, false);
                }
                else {
                    /**
                     * Normal dispatch when unmatched by suffixes
                     */
                    dispatchNormal();
                    return;
                }
                // Reaching here it's atually a IAsyncFlowAction
                dispatchAsyncFlow(action);
                /**
                 * Dispatch actionEnd if set for completion
                 */
                if (actionEnd) {
                    dispatchAsyncFlow(actionEnd);
                }
            };
        };
    };
    return {
        middleware,
        // Do not expose rootSubject
        observers: {
            before: {
                obsOnAll: mwObservers.before.obsOnAll,
                obsOnRequest: mwObservers.before.obsOnRequest,
                obsOnEnd: mwObservers.before.obsOnEnd
            },
            after: {
                obsOnAll: mwObservers.after.obsOnAll,
                obsOnRequest: mwObservers.after.obsOnRequest,
                obsOnEnd: mwObservers.after.obsOnEnd
            }
        }
    };
};
//# sourceMappingURL=create-middleware.js.map