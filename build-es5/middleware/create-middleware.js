"use strict";
var tslib_1 = require("tslib");
var Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
var Subject_1 = require("rxjs/Subject");
exports.Subject = Subject_1.Subject;
var async_types_1 = require("../async-types");
var promise_factory_1 = require("../promise-factory");
var request_store_1 = require("../request-store");
var date_1 = require("./date");
var default_options_1 = require("./default-options");
var middleware_observers_1 = require("./middleware-observers");
var merge = require("lodash.merge");
var lSet = require("lodash.set");
var lGet = require("lodash.get");
var cloneDeep = require("lodash.clonedeep");
var uniqueid = require('uniqueid');
var getGenerateId = function () {
    var asyncUniqueId = uniqueid(null, '-@@ASYNC_FLOW');
    return function (_a) {
        var action = _a.action;
        return asyncUniqueId() + "--" + action.type;
    };
};
exports.createAsyncFlowMiddleware = function (opts) {
    if (opts === void 0) { opts = {
        metaKey: default_options_1.defaultOpts.metaKey,
        timeout: default_options_1.defaultOpts.timeout,
    }; }
    var _a = async_types_1.getAsyncTypeConstants({ types: opts.asyncTypes }), REQUEST = _a.REQUEST, PENDING = _a.PENDING, FULFILLED = _a.FULFILLED, REJECTED = _a.REJECTED, ABORTED = _a.ABORTED, END = _a.END;
    var mwObservers = middleware_observers_1.createObservers({
        asyncTypes: {
            REQUEST: REQUEST,
            END: END,
        },
    });
    var _b = tslib_1.__assign({}, default_options_1.defaultOpts, opts), metaKey = _b.metaKey, timeout = _b.timeout, metaKeyRequestID = _b.metaKeyRequestID, generateIdMerged = _b.generateId;
    var generateId = generateIdMerged || getGenerateId();
    var requestStore = new request_store_1.RequestStore();
    var middleware = function () {
        return function (next) {
            return function (action) {
                var dispatchNormal = function () { return next(action); };
                var dispatchAsyncFlow = function (actionArg) {
                    // Lets observers have a go before and after dispatches
                    mwObservers.before.rootSubject.next(actionArg);
                    var dispatchResult = next(actionArg);
                    mwObservers.after.rootSubject.next(dispatchResult);
                };
                var actionType = action.type;
                /**
                 * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
                 */
                if (!actionType || lGet(action, ['meta', metaKey, 'enable']) === false) {
                    dispatchNormal();
                    return;
                }
                // used to get deep in action object
                var metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
                var metaPromisePath = ['meta', metaKey, 'promise'];
                // Resolve, reject and then set dispatch END payload
                var handleEndAction = function (suffixType, resolve, payloadArg) {
                    /**
                     * First dispatch the original action
                     */
                    var requestID = lGet(action, metaRequestIdPath);
                    var theAsyncFlowPromise = lGet(action, metaPromisePath);
                    // Normal dispatch and opt out if not a asyncflow action
                    if (!requestID || !theAsyncFlowPromise) {
                        dispatchNormal();
                        return;
                    }
                    else {
                        // Can dispatch as async flow action
                        dispatchAsyncFlow(action);
                    }
                    if (requestID) {
                        if (resolve) {
                            requestStore.resolve(requestID, payloadArg || action.payload);
                        }
                        else {
                            requestStore.reject(requestID, payloadArg || action.payload);
                        }
                        var actionEnd = merge({}, action, {
                            meta: (_a = {},
                                _a[metaKey] = {
                                    endActionType: actionType,
                                    timeEnd: date_1.newDate(),
                                },
                                _a),
                            type: async_types_1.replaceSuffix(actionType, suffixType, END),
                        });
                        dispatchAsyncFlow(actionEnd);
                    }
                    else {
                        console.warn(action.type + " - meta data not found, did you forget to send it?");
                    }
                    var _a;
                };
                /**
                 * handle REQUEST, dispatches PENDING then dispatches REQUEST with meta data
                 */
                if (actionType.endsWith(REQUEST)) {
                    // Don't touch and mutate original action
                    var actionClone = cloneDeep(action);
                    /**
                     * Generate uniqueid, make sure it does not exist
                     */
                    var requestID_1 = lGet(actionClone, metaRequestIdPath);
                    /* istanbul ignore next */
                    if (!requestID_1 || {}.hasOwnProperty.call(requestStore, requestID_1)) {
                        do {
                            requestID_1 = generateId({ action: actionClone });
                        } while ({}.hasOwnProperty.call(requestStore, requestID_1));
                        // This adds the id to the meta path, since it should not exist in this clause it's created in action object
                        lSet(actionClone, metaRequestIdPath, requestID_1);
                    }
                    // User override of the timeout for each request
                    var metaTimeoutKey = lGet(actionClone, ['meta', metaKey, 'timeoutRequest']);
                    var timeoutRequest = metaTimeoutKey || timeout;
                    /**
                     * Dispatch pending first, with a twist, send a promise resolve reject with it
                     * So this way user can use to the promise to do stuff after the action
                     * The promise will be resolved/rejected later when getting ABORTED, REJECTED, or FULFILLED
                     */
                    var _a = promise_factory_1.createPromise(), promise = _a.promise, reject_1 = _a.reject, resolve = _a.resolve;
                    promise
                        .timeout(timeoutRequest, 'timeout')
                        .catch(function (er) {
                        // force bluebird to normal reject on errors, fixes jest etc
                        reject_1(er);
                    })
                        .finally(function () {
                        // Cleanup from requestStore
                        requestStore.delete(requestID_1);
                    });
                    var tmpRequestStoreAddPayload = (_b = {},
                        _b[request_store_1.REQUEST_KEY_PROMISE] = promise,
                        _b[request_store_1.REQUEST_KEY_RESOLVEFN] = resolve,
                        _b[request_store_1.REQUEST_KEY_REJECTFN] = reject_1,
                        _b);
                    // Register promise to requestStore
                    requestStore.add(requestID_1, tmpRequestStoreAddPayload);
                    /**
                     * dispatch PENDING with meta
                     */
                    var addedActionMetaData = {
                        meta: (_c = {},
                            _c[metaKey] = {
                                endActionType: null,
                                promise: promise,
                                timeEnd: null,
                                timeStart: date_1.newDate(),
                                timeout: timeout,
                                timeoutRequest: timeoutRequest,
                            },
                            _c),
                    };
                    var pendingAction = merge({}, actionClone, {
                        type: async_types_1.replaceSuffix(actionType, REQUEST, PENDING),
                    }, addedActionMetaData);
                    dispatchAsyncFlow(pendingAction);
                    /**
                     * Dispatch orginal action with meta data
                     */
                    var newAction = merge({}, actionClone, addedActionMetaData);
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
                }
                var _b, _c;
            };
        };
    };
    return {
        middleware: middleware,
        // Do not expose rootSubject
        observers: {
            after: {
                obsOnAll: mwObservers.after.obsOnAll,
                obsOnEnd: mwObservers.after.obsOnEnd,
                obsOnRequest: mwObservers.after.obsOnRequest,
            },
            before: {
                obsOnAll: mwObservers.before.obsOnAll,
                obsOnEnd: mwObservers.before.obsOnEnd,
                obsOnRequest: mwObservers.before.obsOnRequest,
            },
        },
    };
};
//# sourceMappingURL=create-middleware.js.map