"use strict";
const tslib_1 = require("tslib");
const request_store_1 = require("./request-store");
const async_types_1 = require("./async-types");
const promise_factory_1 = require("./promise-factory");
const merge = require('lodash.merge');
const lSet = require('lodash.set');
const lGet = require('lodash.get');
const uniqueid = require('uniqueid');
const asyncUniqueId = uniqueid(null, '-@@ASYNC_MIDDLEWARE');
exports.defaultOpts = {
    metaKey: 'asyncFlow',
    metaKeyRequestID: 'REQUEST_ID',
    timeout: 10000,
    generateId: ({ action }) => `${asyncUniqueId()}-type--${action.type}`,
};
exports.createAsyncFlowMiddleware = (opts = {
        metaKey: exports.defaultOpts.metaKey,
        timeout: exports.defaultOpts.timeout,
    }) => {
    const { _REQUEST, _PENDING, _FULFILLED, _REJECTED, _ABORTED, } = async_types_1.getAsyncTypeConstants({ types: opts.types });
    const { metaKey, timeout, metaKeyRequestID, generateId, } = tslib_1.__assign({}, exports.defaultOpts, opts);
    const requestStore = new request_store_1.RequestStore();
    const middleware = () => {
        return (next) => {
            return (action) => {
                /**
                 * Normal dispatch without async
                 */
                const getDispatchResult = () => next(action);
                const actionType = action.type;
                /**
                 * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
                 * The rest is up to the user to dispatch
                 * REJECTED and FULFILLED suffixes manually
                 */
                if (lGet(action, ['meta', metaKey, 'enable']) === false) {
                    return getDispatchResult();
                }
                // used to get deep in action object
                const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
                /**
                 * handle _REQUEST, dispatches _PENDING then dispatches _REQUEST with meta data
                 */
                if (actionType.endsWith(_REQUEST)) {
                    /**
                     * Generate uniqueid, make sure it does not exist
                     */
                    let currentRequestId = lGet(action, metaRequestIdPath);
                    if (!currentRequestId || {}.hasOwnProperty.call(requestStore, currentRequestId)) {
                        do {
                            currentRequestId = generateId({ action });
                        } while ({}.hasOwnProperty.call(requestStore, currentRequestId));
                        lSet(action, metaRequestIdPath, currentRequestId);
                    }
                    // User override of the timeout for each request
                    const metaTimeoutKey = lGet(action, ['meta', metaKey, 'timeoutRequest']);
                    const timeoutRequest = metaTimeoutKey || timeout;
                    /**
                     * Dispatch pending first, with a twist, send a promise resolve reject with it
                     * So this way user can use to the promise to do stuff after the action
                     * The promise will be resolved later when getting _ABORTED, _REJECTED, or _FULFILLED
                     */
                    const { promise, reject, resolve, } = promise_factory_1.createPromise();
                    promise
                        .timeout(timeoutRequest, 'timeout')
                        .finally(() => {
                        // Cleanup from requestStore
                        requestStore.delete(currentRequestId);
                    });
                    // typescript being an asshole so need to do tricks
                    const tmpRequestStoreAddPayload = {
                        [request_store_1.REQUEST_KEY_PROMISE]: promise,
                        [request_store_1.REQUEST_KEY_RESOLVEFN]: resolve,
                        [request_store_1.REQUEST_KEY_REJECTFN]: reject,
                    };
                    // Register promise to requestStore
                    requestStore.add(currentRequestId, tmpRequestStoreAddPayload);
                    /**
                     * dispatch _PENDING with meta
                     */
                    const pendingAction = merge({}, action, {
                        type: `${actionType.substring(0, actionType.length - _REQUEST.length)}${_PENDING}`,
                        meta: {
                            [metaKey]: {
                                timeout,
                                timeoutRequest,
                                promise,
                            },
                        },
                    });
                    next(pendingAction);
                    /**
                     * dispatch orginal action with meta data
                     */
                    const newAction = merge({}, action, {
                        meta: {
                            [metaKey]: {
                                promise,
                            },
                        },
                    });
                    next(newAction);
                    return;
                }
                else if (actionType.endsWith(_FULFILLED)) {
                    /**
                     * handle _FULFILLED
                     */
                    const epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.resolve(lGet(action, metaRequestIdPath), action.payload);
                    }
                    else {
                        console.warn(`${action.type} - meta data not found, did you forget to send it?`);
                    }
                }
                else if (actionType.endsWith(_REJECTED)) {
                    /**
                     * handle _REJECTED
                     */
                    const epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.reject(epicRequestId, action.payload);
                    }
                    else {
                        console.warn(`${action.type} - meta data not found, did you forget to send it?`);
                    }
                }
                else if (actionType.endsWith(_ABORTED)) {
                    /**
                     * handle _ABORTED
                     */
                    const epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.reject(epicRequestId, action.payload);
                    }
                    else {
                        console.warn(`${action.type} - meta data not found, did you forget to send it?`);
                    }
                }
                /**
                 * Normal dispatch all but on _REQUEST
                 */
                return getDispatchResult();
            };
        };
    };
    return middleware;
};
//# sourceMappingURL=create-middleware.js.map