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

const asyncUniqueId = uniqueid(null, '-@@ASYNC_MIDDLEWARE');

export interface IAsyncFlowActionMeta<TPayload> {
  // enable middleware, disabled will only acts as passthrough
  enable?: boolean;
  // the global timeout
  timeout?: number;
  // override timeout only for this action
  timeoutRequest?: number;
  promise: Bluebird<TPayload>;
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
  generateId: ({ action }: { action: Action<any> }) => `${asyncUniqueId()}-type--${action.type}`,
};
export type TRequestId = string;
export type TDefaultOptsOptional<TAction> = {
  readonly[P in keyof IDefaultOpts<TAction>]?: IDefaultOpts<TAction>[P];
}
export interface ICreateAsyncFlowMiddlewareBaseOpts {
  // async constants
  types?: TDefaultTypesOptional;
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
  } = getAsyncTypeConstants({ types: opts.types });

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
          let currentRequestId = lGet<TRequestId>(action, metaRequestIdPath);
          if (!currentRequestId || {}.hasOwnProperty.call(requestStore, currentRequestId)) {
            do {
              currentRequestId = generateId({ action });
            } while ({}.hasOwnProperty.call(requestStore, currentRequestId));

            lSet<TRequestId>(action, metaRequestIdPath, currentRequestId);
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
              requestStore.delete(currentRequestId);
            });

          // typescript being an asshole so need to do tricks
          const tmpRequestStoreAddPayload: any = {
            [REQUEST_KEY_PROMISE]: promise,
            [REQUEST_KEY_RESOLVEFN]: resolve,
            [REQUEST_KEY_REJECTFN]: reject,
          };
          // Register promise to requestStore
          requestStore.add(currentRequestId, tmpRequestStoreAddPayload as IRequestMap<any>);
          /**
           * dispatch _PENDING with meta
           */
          const pendingAction: TAction = merge({}, action, {
            type: `${actionType.substring(0, actionType.length - _REQUEST.length)}${_PENDING}`,
            meta: {
              [metaKey]: {
                timeout,
                timeoutRequest,
                promise,
              } as IAsyncFlowActionMeta<any>,
            },
          });
          next(pendingAction);

          /**
           * dispatch orginal action with meta data
           */
          const newAction = merge({}, action, {
            meta: {
              [metaKey]: {
                promise,
              } as IAsyncFlowActionMeta<any>,
            },
          });

          next(newAction);
          return;
        } else if (actionType.endsWith(_FULFILLED)) {
          /**
           * handle _FULFILLED
           */
          const epicRequestId = lGet<TRequestId>(action, metaRequestIdPath);
          if (epicRequestId) {
            requestStore.resolve(lGet<TRequestId>(action, metaRequestIdPath), action.payload);
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        } else if (actionType.endsWith(_REJECTED)) {
          /**
           * handle _REJECTED
           */
          const epicRequestId = lGet<TRequestId>(action, metaRequestIdPath);
          if (epicRequestId) {
            requestStore.reject(epicRequestId, action.payload);
          } else {
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }
        } else if (actionType.endsWith(_ABORTED)) {
          /**
           * handle _ABORTED
           */
          const epicRequestId = lGet<TRequestId>(action, metaRequestIdPath);
          if (epicRequestId) {
            requestStore.reject(epicRequestId, action.payload);
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
