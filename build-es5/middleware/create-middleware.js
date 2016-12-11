"use strict";
var tslib_1 = require("tslib");
var request_store_1 = require("../request-store");
var async_types_1 = require("../async-types");
var promise_factory_1 = require("../promise-factory");
var middleware_observers_1 = require("./middleware-observers");
var Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
var Subject_1 = require("rxjs/Subject");
exports.Subject = Subject_1.Subject;
var merge = require('lodash.merge');
var lSet = require('lodash.set');
var lGet = require('lodash.get');
var uniqueid = require('uniqueid');
var asyncUniqueId = uniqueid(null, '-@@ASYNC_FLOW');
exports.defaultOpts = {
    metaKey: 'asyncFlow',
    metaKeyRequestID: 'REQUEST_ID',
    timeout: 10000,
    generateId: function (_a) {
        var action = _a.action;
        return asyncUniqueId() + "--" + action.type;
    },
};
exports.createAsyncFlowMiddleware = function (opts) {
    if (opts === void 0) { opts = {
        metaKey: exports.defaultOpts.metaKey,
        timeout: exports.defaultOpts.timeout,
    }; }
    var _a = async_types_1.getAsyncTypeConstants({ types: opts.asyncTypes }), REQUEST = _a.REQUEST, PENDING = _a.PENDING, FULFILLED = _a.FULFILLED, REJECTED = _a.REJECTED, ABORTED = _a.ABORTED, END = _a.END;
    var mwObservers = middleware_observers_1.createObservers({
        asyncTypes: {
            REQUEST: REQUEST,
            END: END,
        },
    });
    var _b = tslib_1.__assign({}, exports.defaultOpts, opts), metaKey = _b.metaKey, timeout = _b.timeout, metaKeyRequestID = _b.metaKeyRequestID, generateId = _b.generateId;
    var requestStore = new request_store_1.RequestStore();
    var middleware = function () {
        return function (next) {
            return function (action) {
                /**
                 * Normal dispatch without async
                 */
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
                 * The rest is up to the user to dispatch
                 * REJECTED and FULFILLED suffixes manually
                 */
                if (lGet(action, ['meta', metaKey, 'enable']) === false) {
                    dispatchNormal();
                    return;
                }
                // used to get deep in action object
                var metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
                // iF set will dispatch en END action
                var actionEnd;
                // Resole, reject and then set dispatch END payload
                var handleEndAction = function (suffixType, resolve, payloadArg) {
                    var requestID = lGet(action, metaRequestIdPath);
                    if (requestID) {
                        if (resolve) {
                            requestStore.resolve(requestID, payloadArg || action.payload);
                        }
                        else {
                            requestStore.reject(requestID, payloadArg || action.payload);
                        }
                        actionEnd = merge({}, action, {
                            type: async_types_1.replaceSuffix(actionType, suffixType, END),
                        });
                    }
                    else {
                        console.warn(action.type + " - meta data not found, did you forget to send it?");
                    }
                };
                /**
                 * handle REQUEST, dispatches PENDING then dispatches REQUEST with meta data
                 */
                if (actionType.endsWith(REQUEST)) {
                    /**
                     * Generate uniqueid, make sure it does not exist
                     */
                    var requestID_1 = lGet(action, metaRequestIdPath);
                    if (!requestID_1 || {}.hasOwnProperty.call(requestStore, requestID_1)) {
                        do {
                            requestID_1 = generateId({ action: action });
                        } while ({}.hasOwnProperty.call(requestStore, requestID_1));
                        lSet(action, metaRequestIdPath, requestID_1);
                    }
                    // User override of the timeout for each request
                    var metaTimeoutKey = lGet(action, ['meta', metaKey, 'timeoutRequest']);
                    var timeoutRequest = metaTimeoutKey || timeout;
                    /**
                     * Dispatch pending first, with a twist, send a promise resolve reject with it
                     * So this way user can use to the promise to do stuff after the action
                     * The promise will be resolved later when getting ABORTED, REJECTED, or FULFILLED
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
                                timeout: timeout,
                                timeoutRequest: timeoutRequest,
                                promise: promise,
                            },
                            _c),
                    };
                    var pendingAction = merge({}, action, {
                        type: async_types_1.replaceSuffix(actionType, REQUEST, PENDING),
                    }, addedActionMetaData);
                    dispatchAsyncFlow(pendingAction);
                    /**
                     * Dispatch orginal action with meta data
                     */
                    var newAction = merge({}, action, addedActionMetaData);
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
                var _b, _c;
            };
        };
    };
    return {
        middleware: middleware,
        observers: mwObservers,
    };
};
//# sourceMappingURL=create-middleware.js.map