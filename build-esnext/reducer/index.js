"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Intercept action types of all the defaultTypes and set state
 */
const lGet = require("lodash.get");
const async_types_1 = require("../async-types");
const default_options_1 = require("../middleware/default-options");
exports.createAsyncFlowReducer = ({ asyncTypes, metaKey, metaKeyRequestID, } = {
        metaKey: default_options_1.defaultOpts.metaKey,
        metaKeyRequestID: default_options_1.defaultOpts.metaKeyRequestID,
    }) => {
    const { REQUEST, PENDING, FULFILLED, REJECTED, ABORTED, END, } = async_types_1.getAsyncTypeConstants({ types: asyncTypes });
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
            [END]: 0,
        },
        latestActions: {},
    };
    // used to get deep in action object
    const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
    const handleCommonAsyncActions = (state, action, actionSuffix) => {
        const requestId = lGet(action, metaRequestIdPath);
        const actionTypeKey = async_types_1.replaceSuffix(action.type, actionSuffix, REQUEST);
        const latestActionRequestId = lGet(state.latestActions[actionTypeKey], metaRequestIdPath);
        if (requestId === latestActionRequestId) {
            return {
                counters: {
                    ...state.counters,
                    [actionSuffix]: state.counters[actionSuffix] + 1,
                },
                latestActions: {
                    ...state.latestActions,
                    [actionTypeKey]: action,
                },
            };
        }
        return state;
    };
    const reducer = (state = initialState, action) => {
        // PENDING is dispatched before REQUEST
        if (action.type.endsWith(PENDING)) {
            const actionTypeKey = async_types_1.replaceSuffix(action.type, PENDING, REQUEST);
            return {
                counters: {
                    ...state.counters,
                    [PENDING]: state.counters[PENDING] + 1,
                },
                latestActions: {
                    ...state.latestActions,
                    [actionTypeKey]: action,
                },
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
//# sourceMappingURL=index.js.map