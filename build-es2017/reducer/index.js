"use strict";
const tslib_1 = require("tslib");
const default_options_1 = require("../middleware/default-options");
const async_types_1 = require("../async-types");
const lGet = require('lodash.get');
exports.createAsyncFlowReducer = (opts = {
        metaKey: default_options_1.defaultOpts.metaKey,
        metaKeyRequestID: default_options_1.defaultOpts.metaKeyRequestID
    }) => {
    const { REQUEST, PENDING, FULFILLED, REJECTED, ABORTED, END } = async_types_1.getAsyncTypeConstants({ types: opts.asyncTypes });
    const { metaKey, metaKeyRequestID } = tslib_1.__assign({}, default_options_1.defaultOpts, opts);
    const initialState = {
        counters: {
            // Total request passed through the reducer
            [REQUEST]: 0,
            // Only current pending ones
            [PENDING]: 0,
            // Total fullfilled
            [FULFILLED]: 0,
            // Total rejected
            [REJECTED]: 0,
            // Total aborted
            [ABORTED]: 0,
            // Total ended
            [END]: 0
        },
        latestActions: {}
    };
    // used to get deep in action object
    const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
    const handleCommonAsyncActions = (state, action, actionSuffix) => {
        const requestId = lGet(action, metaRequestIdPath);
        const actionTypeKey = async_types_1.replaceSuffix(action.type, actionSuffix, REQUEST);
        const latestActionRequestId = lGet(state.latestActions[actionTypeKey], metaRequestIdPath);
        if (requestId === latestActionRequestId) {
            return {
                counters: tslib_1.__assign({}, state.counters, { [actionSuffix]: state.counters[actionSuffix] + 1 }),
                latestActions: tslib_1.__assign({}, state.latestActions, { [actionTypeKey]: action })
            };
        }
        return state;
    };
    const reducer = (state = initialState, action) => {
        // PENDING is dispatched before REQUEST
        if (action.type.endsWith(PENDING)) {
            const actionTypeKey = async_types_1.replaceSuffix(action.type, PENDING, REQUEST);
            return {
                counters: tslib_1.__assign({}, state.counters, { [PENDING]: state.counters[PENDING] + 1 }),
                latestActions: tslib_1.__assign({}, state.latestActions, { [actionTypeKey]: action })
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
    };
    return reducer;
};
/**
 * need delete options in case the payload is big ass, maybe limit lru or something
 */
//# sourceMappingURL=index.js.map