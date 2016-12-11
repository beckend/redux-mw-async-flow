/* tslint:disable: no-unnecessary-local-variable */
/* tslint:disable: max-func-body-length */
/**
 * Detects action types with names ending with REQUEST, REJECTED, FULFILLED, ABORTED
 * Will dispatch PENDING if REQUEST
 * Will resolve if FULFILLED
 * REJECT when REJECTED or ABORTED
 * END after FULFILLED/REJECTED/ABORTED
 */
import { Middleware, Dispatch } from 'redux';
import { Action } from 'redux-actions';
import * as Bluebird from 'bluebird';
import * as lodash from 'lodash';
import {
  RequestStore,
  IRequestMap,
  REQUEST_KEY_PROMISE,
  REQUEST_KEY_RESOLVEFN,
  REQUEST_KEY_REJECTFN,
} from '../request-store';
import {
  getAsyncTypeConstants,
  replaceSuffix,
  TDefaultTypesOptional,
} from '../async-types';
import { createPromise } from '../promise-factory';
import { createObservers } from './middleware-observers';

const merge: typeof lodash.merge = require('lodash.merge');
const lSet: typeof lodash.set = require('lodash.set');
const lGet: typeof lodash.get = require('lodash.get');
const uniqueid = require('uniqueid');

const asyncUniqueId = uniqueid(null, '-@@ASYNC_FLOW');

// Base and full options
export interface IAsyncFlowActionMetaBase<TPayload> {
  // enable middleware, disabled will only acts as passthrough
  readonly enable: boolean;
  // the global timeout
  readonly timeout: number;
  // override timeout only for this action
  readonly timeoutRequest?: number;
  readonly promise: Bluebird<TPayload>;
}
// Added by middleware
export interface IAsyncFlowActionMetaAdded<TPayload> {
  readonly enable?: boolean;
  readonly timeout: number;
  readonly timeoutRequest: number;
  readonly promise: Bluebird<TPayload>;
}
// Optional version to pass what you want
export type TAsyncFlowActionMetaOptional<TActionPayload> = {
  readonly[P in keyof IAsyncFlowActionMetaBase<TActionPayload>]?: IAsyncFlowActionMetaBase<TActionPayload>[P];
}
// Can only apply to default metaKey
export interface IAsyncFlowActionOptional<TActionPayload> extends Action<TActionPayload> {
  meta: {
    asyncFlow: TAsyncFlowActionMetaOptional<TActionPayload>;
  };
}
// Action dispatched with meta added by middleware
export interface IAsyncFlowAction<TActionPayload> extends Action<TActionPayload> {
  meta: {
    asyncFlow: IAsyncFlowActionMetaAdded<TActionPayload>;
  };
}
export interface IGenerateIdFn<TAction> {
  (opts: { action: TAction }): string;
}
export interface IDefaultOpts<TAction> {
  // main key under meta
  readonly metaKey: string;
  // id key under main key
  readonly metaKeyRequestID: string;
  // timeout for promise before rejecting
  readonly timeout: number;
  // function to override generation of async ids
  readonly generateId: IGenerateIdFn<TAction>;
}
export const defaultOpts: IDefaultOpts<any> = {
  metaKey: 'asyncFlow',
  metaKeyRequestID: 'REQUEST_ID',
  timeout: 10000,
  generateId: ({ action }: { action: Action<any> }) => `${asyncUniqueId()}--${action.type}`,
};
export type TRequestId = string;
export type TDefaultOptsOptional<TAction> = {
  readonly[P in keyof IDefaultOpts<TAction>]?: IDefaultOpts<TAction>[P];
}
export interface ICreateAsyncFlowMiddlewareBaseOpts {
  // async constants
  asyncTypes?: TDefaultTypesOptional;
}
export type TCreateAsyncFlowMiddlewareOpts<TAction> = ICreateAsyncFlowMiddlewareBaseOpts & TDefaultOptsOptional<TAction>;
export const createAsyncFlowMiddleware = <TStoreState, TAction extends Action<any>>(opts: TCreateAsyncFlowMiddlewareOpts<TAction> = {
  metaKey: defaultOpts.metaKey,
  timeout: defaultOpts.timeout,
}) => {
  const {
    REQUEST,
    PENDING,
    FULFILLED,
    REJECTED,
    ABORTED,
    END,
  } = getAsyncTypeConstants({ types: opts.asyncTypes });

  const mwObservers = createObservers({
    asyncTypes: {
      REQUEST,
      END,
    },
  });

  const {
    metaKey,
    timeout,
    metaKeyRequestID,
    generateId,
  }: IDefaultOpts<TAction> = {
      ...defaultOpts,
      ...opts,
    };

  const requestStore = new RequestStore();

  const middleware: Middleware = () => {
    return (next: Dispatch<TStoreState>) => {
      return (action: TAction) => {
        /**
         * Normal dispatch without async
         */
        const dispatchNormal = () => next(action);
        const dispatchAsyncFlow = (actionArg: IAsyncFlowAction<any>) => {
          // Lets observers have a go before and after dispatches
          mwObservers.before.rootSubject.next(actionArg);
          const dispatchResult = next(actionArg);
          mwObservers.after.rootSubject.next(dispatchResult);
        };
        const actionType = action.type;
        /**
         * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
         * The rest is up to the user to dispatch
         * REJECTED and FULFILLED suffixes manually
         */
        if (lGet<boolean>(action, ['meta', metaKey, 'enable']) === false) {
          dispatchNormal();
          return;
        }

        // used to get deep in action object
        const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
        // iF set will dispatch en END action
        let actionEnd;
        // Resole, reject and then set dispatch END payload
        const handleEndAction = (suffixType: string, resolve: boolean, payloadArg?: any) => {
          const requestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (requestID) {
            if (resolve) {
              requestStore.resolve(requestID, payloadArg || action.payload);
            } else {
              requestStore.reject(requestID, payloadArg || action.payload);
            }
            actionEnd = merge({}, action, {
              type: replaceSuffix(actionType, suffixType, END),
            });
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        };
        /**
         * handle REQUEST, dispatches PENDING then dispatches REQUEST with meta data
         */
        if (actionType.endsWith(REQUEST)) {
          /**
           * Generate uniqueid, make sure it does not exist
           */
          let requestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (!requestID || {}.hasOwnProperty.call(requestStore, requestID)) {
            do {
              requestID = generateId({ action });
            } while ({}.hasOwnProperty.call(requestStore, requestID));

            lSet<TRequestId>(action, metaRequestIdPath, requestID);
          }

          // User override of the timeout for each request
          const metaTimeoutKey = lGet<number>(action, ['meta', metaKey, 'timeoutRequest']);
          const timeoutRequest = metaTimeoutKey || timeout;
          /**
           * Dispatch pending first, with a twist, send a promise resolve reject with it
           * So this way user can use to the promise to do stuff after the action
           * The promise will be resolved later when getting ABORTED, REJECTED, or FULFILLED
           */
          const {
            promise,
            reject,
            resolve,
          } = createPromise<any>();
          promise
            .timeout(timeoutRequest, 'timeout')
            // .catch((er) => {
            //   // Dispatch REJECTED when TimeoutError
            //   if (er instanceof Bluebird.TimeoutError) {
            //     handleEndAction(REJECTED, false, er);
            //   } else {
            //     throw er || new Error('Unknown error');
            //   }
            // })
            .finally(() => {
              // Cleanup from requestStore
              requestStore.delete(requestID);
            });

          const tmpRequestStoreAddPayload: IRequestMap<any> = {
            [REQUEST_KEY_PROMISE]: promise,
            [REQUEST_KEY_RESOLVEFN]: resolve,
            [REQUEST_KEY_REJECTFN]: reject,
          } as any;
          // Register promise to requestStore
          requestStore.add(requestID, tmpRequestStoreAddPayload);
          /**
           * dispatch PENDING with meta
           */
          const addedActionMetaData = {
            meta: {
              [metaKey]: {
                timeout,
                timeoutRequest,
                promise,
              } as IAsyncFlowActionMetaAdded<any>
            }
          };
          const pendingAction: IAsyncFlowAction<any> = merge(
            {},
            action,
            {
              type: replaceSuffix(actionType, REQUEST, PENDING),
            },
            addedActionMetaData
          ) as any;
          dispatchAsyncFlow(pendingAction);

          /**
           * Dispatch orginal action with meta data
           */
          const newAction: IAsyncFlowAction<any> = merge({}, action, addedActionMetaData) as any;
          dispatchAsyncFlow(newAction);
          return;
        } else if (actionType.endsWith(FULFILLED)) {
          handleEndAction(FULFILLED, true);
        } else if (actionType.endsWith(REJECTED)) {
          handleEndAction(REJECTED, false);
        } else if (actionType.endsWith(ABORTED)) {
          handleEndAction(ABORTED, false);
        } else {
          /**
           * Normal dispatch when unmatched by suffixes
           */
          dispatchNormal();
          return;
        }

        // Reaching here it's atually a IAsyncFlowAction
        dispatchAsyncFlow(action as any);
        /**
         * Dispatch actionEnd if set for completion
         */
        if (actionEnd) { dispatchAsyncFlow(actionEnd); }
      };
    };
  };

  return {
    middleware,
    observers: mwObservers,
  };
};
