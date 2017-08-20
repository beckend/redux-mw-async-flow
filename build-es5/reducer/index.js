"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Intercept action types of all the defaultTypes and set state
 */
var lGet = require("lodash.get");
var async_types_1 = require("../async-types");
var default_options_1 = require("../middleware/default-options");
exports.createAsyncFlowReducer = function (opts) {
    if (opts === void 0) { opts = {
        metaKey: default_options_1.defaultOpts.metaKey,
        metaKeyRequestID: default_options_1.defaultOpts.metaKeyRequestID,
    }; }
    var _a = async_types_1.getAsyncTypeConstants({ types: opts.asyncTypes }), REQUEST = _a.REQUEST, PENDING = _a.PENDING, FULFILLED = _a.FULFILLED, REJECTED = _a.REJECTED, ABORTED = _a.ABORTED, END = _a.END;
    var _b = tslib_1.__assign({}, default_options_1.defaultOpts, opts), metaKey = _b.metaKey, metaKeyRequestID = _b.metaKeyRequestID;
    var initialState = {
        counters: (_c = {},
            // Total request passed through the reducer
            _c[REQUEST] = 0,
            // Only current pending ones
            _c[PENDING] = 0,
            // Total fullfilled
            _c[FULFILLED] = 0,
            // Total rejected
            _c[REJECTED] = 0,
            // Total aborted
            _c[ABORTED] = 0,
            // Total ended
            _c[END] = 0,
            _c),
        latestActions: {},
    };
    // used to get deep in action object
    var metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
    var handleCommonAsyncActions = function (state, action, actionSuffix) {
        var requestId = lGet(action, metaRequestIdPath);
        var actionTypeKey = async_types_1.replaceSuffix(action.type, actionSuffix, REQUEST);
        var latestActionRequestId = lGet(state.latestActions[actionTypeKey], metaRequestIdPath);
        if (requestId === latestActionRequestId) {
            return {
                counters: tslib_1.__assign({}, state.counters, (_a = {}, _a[actionSuffix] = state.counters[actionSuffix] + 1, _a)),
                latestActions: tslib_1.__assign({}, state.latestActions, (_b = {}, _b[actionTypeKey] = action, _b)),
            };
        }
        return state;
        var _a, _b;
    };
    var reducer = function (state, action) {
        if (state === void 0) { state = initialState; }
        // PENDING is dispatched before REQUEST
        if (action.type.endsWith(PENDING)) {
            var actionTypeKey = async_types_1.replaceSuffix(action.type, PENDING, REQUEST);
            return {
                counters: tslib_1.__assign({}, state.counters, (_a = {}, _a[PENDING] = state.counters[PENDING] + 1, _a)),
                latestActions: tslib_1.__assign({}, state.latestActions, (_b = {}, _b[actionTypeKey] = action, _b)),
            };
        }
        else if (action.type.endsWith(REQUEST)) {
            return handleCommonAsyncActions(state, action, REQUEST);
        }
        else if (action.type.endsWith(FULFILLED)) {
            return handleCommonAsyncActions(state, action, FULFILLED);
        }
        else if (action.type.endsWith(REJECTED)) {
            return handleCommonAsyncActions(state, action, REJECTED);
        }
        else if (action.type.endsWith(ABORTED)) {
            return handleCommonAsyncActions(state, action, ABORTED);
        }
        else if (action.type.endsWith(END)) {
            return handleCommonAsyncActions(state, action, END);
        }
        return state;
        var _a, _b;
    };
    return reducer;
    var _c;
};
/**
 * need delete options in case the payload is big ass, maybe limit lru or something
 */
//# sourceMappingURL=index.js.map