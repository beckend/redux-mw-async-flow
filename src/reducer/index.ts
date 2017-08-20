/**
 * Intercept action types of all the defaultTypes and set state
 */
import lGet = require('lodash.get');
import { ActionMeta, ReducerMeta } from 'redux-actions';
import {
  getAsyncTypeConstants,
  replaceSuffix,
  TDefaultTypesOptional,
} from '../async-types';
import { TRequestId } from '../middleware/create-middleware';
import { defaultOpts as middlewareDefaultOpts } from '../middleware/default-options';

export interface IActionsByActionType {
  [actionType: string]: IActionsByActionId;
}
export interface IActionsByActionId {
  // Id will be taken from async flow meta id
  [actionId: string]: ActionMeta<any, any>;
}
export interface IRequestCounters {
  [counterName: string]: number;
}
export interface IState {
  counters: IRequestCounters;
  /**
   * One latest single action by action type as key
   * useful to see if the type of action is currently pending or something
   * Keys sorted by REQUEST suffix
   */
  latestActions: IActionsByActionId;
}

// Meta added by middleware
export interface IDefaultOpts {
  // main key under meta
  readonly metaKey?: string;
  // id key under main key
  readonly metaKeyRequestID?: string;
}
export interface ICreateAsyncFlowReducerOpts {
  // async constants
  asyncTypes?: TDefaultTypesOptional;
}
export type TCreateAsyncFlowReducerOpts = ICreateAsyncFlowReducerOpts & IDefaultOpts;
export const createAsyncFlowReducer = (opts: TCreateAsyncFlowReducerOpts = {
  metaKey: middlewareDefaultOpts.metaKey,
  metaKeyRequestID: middlewareDefaultOpts.metaKeyRequestID,
}) => {
  const {
    REQUEST,
    PENDING,
    FULFILLED,
    REJECTED,
    ABORTED,
    END,
  } = getAsyncTypeConstants({ types: opts.asyncTypes });

  const {
    metaKey,
    metaKeyRequestID,
  }: IDefaultOpts = {
    ...middlewareDefaultOpts,
    ...opts,
  } as any;

  const initialState: IState = {
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

  const handleCommonAsyncActions = (state: IState, action: ActionMeta<any, any>, actionSuffix: string) => {
    const requestId = lGet<TRequestId>(action, metaRequestIdPath);
    const actionTypeKey = replaceSuffix(action.type, actionSuffix, REQUEST);
    const latestActionRequestId = lGet<TRequestId>(state.latestActions[actionTypeKey], metaRequestIdPath);
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
      } as IState;
    }
    return state;
  };

  const reducer: ReducerMeta<IState, any, any> = (state = initialState, action: ActionMeta<any, any>) => {
    // PENDING is dispatched before REQUEST
    if (action.type.endsWith(PENDING)) {
      const actionTypeKey = replaceSuffix(action.type, PENDING, REQUEST);
      return {
        counters: {
          ...state.counters,
          [PENDING]: state.counters[PENDING] + 1,
        },
        latestActions: {
          ...state.latestActions,
          [actionTypeKey]: action,
        },
      } as IState;
    } else if (action.type.endsWith(REQUEST)) {
      return handleCommonAsyncActions(state, action, REQUEST);
    } else if (action.type.endsWith(FULFILLED)) {
      return handleCommonAsyncActions(state, action, FULFILLED);
    } else if (action.type.endsWith(REJECTED)) {
      return handleCommonAsyncActions(state, action, REJECTED);
    } else if (action.type.endsWith(ABORTED)) {
      return handleCommonAsyncActions(state, action, ABORTED);
    } else if (action.type.endsWith(END)) {
      return handleCommonAsyncActions(state, action, END);
    }

    return state;
  };

  return reducer;
};

/**
 * need delete options in case the payload is big ass, maybe limit lru or something
 */
