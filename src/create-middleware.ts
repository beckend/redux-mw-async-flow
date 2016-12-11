/* tslint:disable: no-unnecessary-local-variable */
/* tslint:disable: max-func-body-length */
/**
 * Detects action types with names ending with _REQUEST, _REJECTED, _FULFILLED, _ABORTED
 * Will dispatch _PENDING if _REQUEST
 * Will resolve if _FULFILLED
 * REJECT when _REJECTED or _ABORTED
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
} from './request-store';
import {
  getAsyncTypeConstants,
  TDefaultTypesOptional,
} from './async-types';
import { createPromise } from './promise-factory';

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
    _REQUEST,
    _PENDING,
    _FULFILLED,
    _REJECTED,
    _ABORTED,
  } = getAsyncTypeConstants({ types: opts.asyncTypes });

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
        const getDispatchResult = () => next(action);
        const actionType = action.type;
        /**
         * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
         * The rest is up to the user to dispatch
         * REJECTED and FULFILLED suffixes manually
         */
        if (lGet<boolean>(action, ['meta', metaKey, 'enable']) === false) { return getDispatchResult(); }

        // used to get deep in action object
        const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
        /**
         * handle _REQUEST, dispatches _PENDING then dispatches _REQUEST with meta data
         */
        if (actionType.endsWith(_REQUEST)) {
          /**
           * Generate uniqueid, make sure it does not exist
           */
          let currentRequestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (!currentRequestID || {}.hasOwnProperty.call(requestStore, currentRequestID)) {
            do {
              currentRequestID = generateId({ action });
            } while ({}.hasOwnProperty.call(requestStore, currentRequestID));

            lSet<TRequestId>(action, metaRequestIdPath, currentRequestID);
          }

          // User override of the timeout for each request
          const metaTimeoutKey = lGet<number>(action, ['meta', metaKey, 'timeoutRequest']);
          const timeoutRequest = metaTimeoutKey || timeout;
          /**
           * Dispatch pending first, with a twist, send a promise resolve reject with it
           * So this way user can use to the promise to do stuff after the action
           * The promise will be resolved later when getting _ABORTED, _REJECTED, or _FULFILLED
           */
          const {
            promise,
            reject,
            resolve,
          } = createPromise<any>();
          promise
            .timeout(timeoutRequest, 'timeout')
            .finally(() => {
              // Cleanup from requestStore
              requestStore.delete(currentRequestID);
            });

          // typescript being an asshole so need to do tricks
          const tmpRequestStoreAddPayload: any = {
            [REQUEST_KEY_PROMISE]: promise,
            [REQUEST_KEY_RESOLVEFN]: resolve,
            [REQUEST_KEY_REJECTFN]: reject,
          };
          // Register promise to requestStore
          requestStore.add(currentRequestID, tmpRequestStoreAddPayload as IRequestMap<any>);
          /**
           * dispatch _PENDING with meta
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
          const pendingAction: TAction = merge(
            {},
            action,
            {
              type: `${actionType.substring(0, actionType.length - _REQUEST.length)}${_PENDING}`,
            },
            addedActionMetaData
          );
          next(pendingAction);

          /**
           * dispatch orginal action with meta data
           */
          const newAction: TAction = merge({}, action, addedActionMetaData);
          next(newAction);
          return;
        } else if (actionType.endsWith(_FULFILLED)) {
          /**
           * handle _FULFILLED
           */
          const requestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (requestID) {
            requestStore.resolve(lGet<TRequestId>(action, metaRequestIdPath), action.payload);
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        } else if (actionType.endsWith(_REJECTED)) {
          /**
           * handle _REJECTED
           */
          const requestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (requestID) {
            requestStore.reject(requestID, action.payload);
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        } else if (actionType.endsWith(_ABORTED)) {
          /**
           * handle _ABORTED
           */
          const requestID = lGet<TRequestId>(action, metaRequestIdPath);
          if (requestID) {
            requestStore.reject(requestID, action.payload);
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        }
        /**
         * Normal dispatch all but on _REQUEST
         */
        return getDispatchResult();
      };
    };
  };

  return middleware;
};
