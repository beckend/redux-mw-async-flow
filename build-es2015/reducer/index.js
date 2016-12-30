// /* tslint:disable: no-unnecessary-local-variable */
// /* tslint:disable: max-func-body-length */
// /**
//  * Intercept action types of all the defaultTypes and set state
//  */
// import * as lodash from 'lodash';
// import { TRequestId } from '../middleware/create-middleware';
// import { defaultOpts as middlewareDefaultOpts } from '../middleware/default-options';
// import {
//   TDefaultTypesOptional,
//   getAsyncTypeConstants,
//   replaceSuffix
// } from '../async-types';
// import { ReducerMeta, ActionMeta } from 'redux-actions';
// const lGet: typeof lodash.get = require('lodash.get');
// const merge: typeof lodash.merge = require('lodash.merge');
// const cloneDeep: typeof lodash.cloneDeep = require('lodash.clonedeep');
// // const { FifoXCache } = require('x-cache');
// export interface IActionsByActionType {
//   [actionType: string]: IActionsByActionId;
// }
// export interface IActionsByActionId {
//   // Id will be taken from async flow meta id
//   [actionId: string]: ActionMeta<any, any>;
// }
// export interface IRequestCounters {
//   [counterName: string]: number;
// }
// export interface IState {
//   counters: IRequestCounters;
//   /**
//    * All actions action type as keys
//    * only the REQUEST suffix will be used as id
//    * will keep default 50 in first in first out mode, unless they are pending, in that case will overflow until not pending
//    * Keys sorted by request id from async flow meta id
//    */
//   actions: IActionsByActionType;
//   /**
//    * One latest single action by action type as key, useful to see if the type of action is currently pending or something
//    * Keys sorted by REQUEST suffix
//    */
//   latestActions: IActionsByActionId;
//   /**
//    * same as actions but will only hold pending ones
//    * Keys sorted by REQUEST suffix
//    */
//   pendingActions: IActionsByActionType;
// }
// // Meta added by middleware
// export interface IDefaultOpts {
//   // main key under meta
//   readonly metaKey: string;
//   // id key under main key
//   readonly metaKeyRequestID: string;
//   // max actions to keep in state under the key 'actions'
//   readonly maxKeptActions: number;
// }
// export interface ICreateAsyncFlowReducerOpts {
//   // async constants
//   asyncTypes?: TDefaultTypesOptional;
// }
// export type TCreateAsyncFlowReducerOpts = ICreateAsyncFlowReducerOpts & IDefaultOpts;
// export const createAsyncFlowReducer = (opts: TCreateAsyncFlowReducerOpts = {
//   metaKey: middlewareDefaultOpts.metaKey,
//   metaKeyRequestID: middlewareDefaultOpts.metaKeyRequestID,
//   maxKeptActions: Infinity
// }) => {
//   const {
//     REQUEST,
//     PENDING,
//     FULFILLED,
//     REJECTED,
//     ABORTED,
//     END
//   } = getAsyncTypeConstants({ types: opts.asyncTypes });
//   const {
//     metaKey,
//     metaKeyRequestID,
//     maxKeptActions
//   }: IDefaultOpts = {
//       ...middlewareDefaultOpts,
//       ...opts
//     };
//   const initialState: IState = {
//     counters: {
//       // Total request passed through the reducer
//       [REQUEST]: 0,
//       // Only current pending ones
//       [PENDING]: 0,
//       // Total fullfilled
//       [FULFILLED]: 0,
//       // Total rejected
//       [REJECTED]: 0,
//       // Total aborted
//       [ABORTED]: 0,
//       // Total ended
//       [END]: 0
//     },
//     actions: {},
//     latestActions: {},
//     pendingActions: {}
//   };
//   // used to get deep in action object
//   const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
//   const reducer: ReducerMeta<IState, any, any> = (state = initialState, action: ActionMeta<any, any>) => {
//     // PENDING is dispatched before REQUEST
//     if (action.type.endsWith(PENDING)) {
//       const requestId = lGet<TRequestId>(action, metaRequestIdPath);
//       const actionTypeKey = replaceSuffix(action.type, PENDING, REQUEST);
//       return merge(
//         {},
//         state,
//         {
//           counters: {
//             [REQUEST]: state.counters[REQUEST] + 1,
//             [PENDING]: state.counters[PENDING] + 1
//           },
//           actions: {
//             [actionTypeKey]: {
//               [requestId]: action
//             }
//           },
//           latestActions: {
//             [actionTypeKey]: action
//           },
//           pendingActions: {
//             [actionTypeKey]: {
//               [requestId]: action
//             }
//           }
//         }
//       );
//     } else if (action.type.endsWith(REQUEST)) {
//       const requestId = lGet<TRequestId>(action, metaRequestIdPath);
//       const actionTypeKey = action.type;
//       // If id matches in latest, update that action also
//       const latestActionRequestId = lGet<TRequestId>(state.latestActions[actionTypeKey], metaRequestIdPath);
//       if (requestId === latestActionRequestId) {
//         return {
//           ...state,
//           latestActions: {
//             ...state.latestActions,
//             [actionTypeKey]: action
//           }
//         };
//       }
//     } else if (action.type.endsWith(FULFILLED)) {
//       const requestId = lGet<TRequestId>(action, metaRequestIdPath);
//       const actionTypeKey = replaceSuffix(action.type, FULFILLED, REQUEST);
//       const stateCloned = cloneDeep(state);
//       delete stateCloned.pendingActions[actionTypeKey][requestId];
//       stateCloned.counters[FULFILLED] = stateCloned.counters[FULFILLED] + 1;
//       // If id matches in latest, update that action also
//       const latestActionRequestId = lGet<TRequestId>(stateCloned.latestActions[actionTypeKey], metaRequestIdPath);
//       if (requestId === latestActionRequestId) {
//         return {
//           ...stateCloned,
//           latestActions: {
//             ...stateCloned.latestActions,
//             [actionTypeKey]: action
//           }
//         };
//       }
//     } else if (endsWith(type, _ABORTED)) {
//       newState = state
//         .set(asyncSuffixToRequest(type, _ABORTED), loadingStateAbortedMap.mergeDeep({
//           ID: oPGet(meta, 'async.REQUEST_ID') || null,
//           ERROR: payload ? fromJS(payload) : null
//         }))
//         .set(COUNTER, (state.get(COUNTER) as number) - 1);
//     }
//     return state;
//   };
//   return reducer;
// };
// /**
//  * need delete options in case the payload is big ass, maybe limit lru or something
//  */
//# sourceMappingURL=index.js.map