// /* tslint:disable: no-unnecessary-local-variable */
// /**
//  * Intercept action types of all the defaultTypes and set state
//  */
// import { fromJS } from 'immutable';
// // import { LOADING_START, LOADING_END } from './action-types';
// import { endsWith } from 'lodash';
// import { get as oPGet } from 'object-path';
// import { COUNTER } from './constants';
// import { Reducer } from 'redux-actions';
// const { FifoXCache } = require('x-cache');
// const defaultTypes = ['REQUEST', 'PENDING', 'FULFILLED', 'REJECTED', 'ABORTED'];
// const [
//   REQUEST,
//   PENDING,
//   FULFILLED,
//   REJECTED,
//   ABORTED,
// ] = defaultTypes;
// const prefixedAsyncTypes = [
//   `_${REQUEST}`,
//   `_${PENDING}`,
//   `_${FULFILLED}`,
//   `_${REJECTED}`,
//   `_${ABORTED}`,
// ];
// const [_REQUEST, _PENDING, _FULFILLED, _REJECTED, _ABORTED] = prefixedAsyncTypes;
// /**
//  * Store in object, keys and the state
//  * {
//  *   'session/LOGIN_POST_REQUEST': true,
//  *   ...
//  * }
//  */
// const loadingStatePendingMap: TState = fromJS({
//   ID: null,
//   STATE: PENDING,
//   [PENDING]: true,
//   [FULFILLED]: false,
//   [REJECTED]: false,
//   [ABORTED]: false,
//   PAYLOAD: null,
//   ERROR: null,
// });
// const loadingStateFulfilledMap: TState = fromJS({
//   ID: null,
//   STATE: FULFILLED,
//   [PENDING]: false,
//   [FULFILLED]: true,
//   [REJECTED]: false,
//   [ABORTED]: false,
//   PAYLOAD: null,
//   ERROR: null,
// });
// const loadingStateRejectedMap: TState = fromJS({
//   ID: null,
//   STATE: REJECTED,
//   [PENDING]: false,
//   [FULFILLED]: false,
//   [REJECTED]: true,
//   [ABORTED]: false,
//   PAYLOAD: null,
//   ERROR: null,
// });
// const loadingStateAbortedMap: TState = fromJS({
//   ID: null,
//   STATE: ABORTED,
//   [PENDING]: false,
//   [FULFILLED]: false,
//   [REJECTED]: false,
//   [ABORTED]: true,
//   PAYLOAD: null,
//   ERROR: null,
// });
// /**
//  * Since the key is going to be stored as _REQUEST suffix
//  */
// const asyncSuffixToRequest = (targetStr: string, suffixToReplace: string) =>
//   `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${_REQUEST}`;
// export const initialState: TState = fromJS({
//   // Initial counter
//   [COUNTER]: 0,
// });
// export const createAsyncFlowReducer = <TState>() => {
//   const reducer: Reducer<TState, any> = (state = initialState, { type, meta, payload }) => {
//     let newState;
//     if (endsWith(type, _PENDING)) {
//       newState = state
//         .set(asyncSuffixToRequest(type, _PENDING), loadingStatePendingMap.mergeDeep({
//           ID: oPGet(meta, 'async.REQUEST_ID') || null,
//         }))
//         .set(COUNTER, (state.get(COUNTER) as number) + 1);
//     } else if (endsWith(type, _FULFILLED)) {
//       newState = state
//         .set(asyncSuffixToRequest(type, _FULFILLED), loadingStateFulfilledMap.mergeDeep({
//           ID: oPGet(meta, 'async.REQUEST_ID') || null,
//           PAYLOAD: payload,
//         }))
//         .set(COUNTER, (state.get(COUNTER) as number) - 1);
//     } else if (endsWith(type, _REJECTED)) {
//       newState = state
//         .set(asyncSuffixToRequest(type, _REJECTED), loadingStateRejectedMap.mergeDeep({
//           ID: oPGet(meta, 'async.REQUEST_ID') || null,
//           ERROR: payload ? fromJS(payload) : null,
//         }))
//         .set(COUNTER, (state.get(COUNTER) as number) - 1);
//     } else if (endsWith(type, _ABORTED)) {
//       newState = state
//         .set(asyncSuffixToRequest(type, _ABORTED), loadingStateAbortedMap.mergeDeep({
//           ID: oPGet(meta, 'async.REQUEST_ID') || null,
//           ERROR: payload ? fromJS(payload) : null,
//         }))
//         .set(COUNTER, (state.get(COUNTER) as number) - 1);
//     }
//     return newState || state;
//   };
//   return reducer;
// };
// /**
//  * need delete options in case the payload is big ass, maybe limit lru or something
//  */
//# sourceMappingURL=index.js.map