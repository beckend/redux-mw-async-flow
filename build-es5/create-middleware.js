"use strict";
var tslib_1 = require("tslib");
var request_store_1 = require("./request-store");
var async_types_1 = require("./async-types");
var promise_factory_1 = require("./promise-factory");
var merge = require('lodash.merge');
var lSet = require('lodash.set');
var lGet = require('lodash.get');
var uniqueid = require('uniqueid');
var asyncUniqueId = uniqueid(null, '-@@ASYNC_MIDDLEWARE');
exports.defaultOpts = {
    metaKey: 'asyncFlow',
    metaKeyRequestID: 'REQUEST_ID',
    timeout: 10000,
    generateId: function (_a) {
        var action = _a.action;
        return asyncUniqueId() + "-type--" + action.type;
    },
};
exports.createAsyncFlowMiddleware = function (opts) {
    if (opts === void 0) { opts = {
        metaKey: exports.defaultOpts.metaKey,
        timeout: exports.defaultOpts.timeout,
    }; }
    var _a = async_types_1.getAsyncTypeConstants({ types: opts.types }), _REQUEST = _a._REQUEST, _PENDING = _a._PENDING, _FULFILLED = _a._FULFILLED, _REJECTED = _a._REJECTED, _ABORTED = _a._ABORTED;
    var _b = tslib_1.__assign({}, exports.defaultOpts, opts), metaKey = _b.metaKey, timeout = _b.timeout, metaKeyRequestID = _b.metaKeyRequestID, generateId = _b.generateId;
    var requestStore = new request_store_1.RequestStore();
    var middleware = function () {
        return function (next) {
            return function (action) {
                /**
                 * Normal dispatch without async
                 */
                var getDispatchResult = function () { return next(action); };
                var actionType = action.type;
                /**
                 * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
                 * The rest is up to the user to dispatch
                 * REJECTED and FULFILLED suffixes manually
                 */
                if (lGet(action, ['meta', metaKey, 'enable']) === false) {
                    return getDispatchResult();
                }
                // used to get deep in action object
                var metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
                /**
                 * handle _REQUEST, dispatches _PENDING then dispatches _REQUEST with meta data
                 */
                if (actionType.endsWith(_REQUEST)) {
                    /**
                     * Generate uniqueid, make sure it does not exist
                     */
                    var currentRequestId_1 = lGet(action, metaRequestIdPath);
                    if (!currentRequestId_1 || {}.hasOwnProperty.call(requestStore, currentRequestId_1)) {
                        do {
                            currentRequestId_1 = generateId({ action: action });
                        } while ({}.hasOwnProperty.call(requestStore, currentRequestId_1));
                        lSet(action, metaRequestIdPath, currentRequestId_1);
                    }
                    // User override of the timeout for each request
                    var metaTimeoutKey = lGet(action, ['meta', metaKey, 'timeoutRequest']);
                    var timeoutRequest = metaTimeoutKey || timeout;
                    /**
                     * Dispatch pending first, with a twist, send a promise resolve reject with it
                     * So this way user can use to the promise to do stuff after the action
                     * The promise will be resolved later when getting _ABORTED, _REJECTED, or _FULFILLED
                     */
                    var _a = promise_factory_1.createPromise(), promise = _a.promise, reject = _a.reject, resolve = _a.resolve;
                    promise
                        .timeout(timeoutRequest, 'timeout')
                        .finally(function () {
                        // Cleanup from requestStore
                        requestStore.delete(currentRequestId_1);
                    });
                    // typescript being an asshole so need to do tricks
                    var tmpRequestStoreAddPayload = (_b = {},
                        _b[request_store_1.REQUEST_KEY_PROMISE] = promise,
                        _b[request_store_1.REQUEST_KEY_RESOLVEFN] = resolve,
                        _b[request_store_1.REQUEST_KEY_REJECTFN] = reject,
                        _b);
                    // Register promise to requestStore
                    requestStore.add(currentRequestId_1, tmpRequestStoreAddPayload);
                    /**
                     * dispatch _PENDING with meta
                     */
                    var pendingAction = merge({}, action, {
                        type: "" + actionType.substring(0, actionType.length - _REQUEST.length) + _PENDING,
                        meta: (_c = {},
                            _c[metaKey] = {
                                timeout: timeout,
                                timeoutRequest: timeoutRequest,
                                promise: promise,
                            },
                            _c),
                    });
                    next(pendingAction);
                    /**
                     * dispatch orginal action with meta data
                     */
                    var newAction = merge({}, action, {
                        meta: (_d = {},
                            _d[metaKey] = {
                                promise: promise,
                            },
                            _d),
                    });
                    next(newAction);
                    return;
                }
                else if (actionType.endsWith(_FULFILLED)) {
                    /**
                     * handle _FULFILLED
                     */
                    var epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.resolve(lGet(action, metaRequestIdPath), action.payload);
                    }
                    else {
                        console.warn(action.type + " - meta data not found, did you forget to send it?");
                    }
                }
                else if (actionType.endsWith(_REJECTED)) {
                    /**
                     * handle _REJECTED
                     */
                    var epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.reject(epicRequestId, action.payload);
                    }
                    else {
                        console.warn(action.type + " - meta data not found, did you forget to send it?");
                    }
                }
                else if (actionType.endsWith(_ABORTED)) {
                    /**
                     * handle _ABORTED
                     */
                    var epicRequestId = lGet(action, metaRequestIdPath);
                    if (epicRequestId) {
                        requestStore.reject(epicRequestId, action.payload);
                    }
                    else {
                        console.warn(action.type + " - meta data not found, did you forget to send it?");
                    }
                }
                /**
                 * Normal dispatch all but on _REQUEST
                 */
                return getDispatchResult();
                var _b, _c, _d;
            };
        };
    };
    return middleware;
};
//# sourceMappingURL=create-middleware.js.map