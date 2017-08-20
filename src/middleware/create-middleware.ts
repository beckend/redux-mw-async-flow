/**
 * Detects action types with names ending with REQUEST, REJECTED, FULFILLED, ABORTED
 * Will dispatch PENDING if REQUEST
 * Will resolve if FULFILLED
 * REJECT when REJECTED or ABORTED
 * END after FULFILLED/REJECTED/ABORTED
 */
import * as Bluebird from 'bluebird';
import cloneDeep = require('lodash.clonedeep');
import lGet = require('lodash.get');
import merge = require('lodash.merge');
import lSet = require('lodash.set');
import { Dispatch, Middleware } from 'redux';
import { ActionMeta } from 'redux-actions';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
  getAsyncTypeConstants,
  replaceSuffix,
  TDefaultTypesOptional,
} from '../async-types';
import { createPromise } from '../promise-factory';
import {
  IRequestMap,
  REQUEST_KEY_PROMISE,
  REQUEST_KEY_REJECTFN,
  REQUEST_KEY_RESOLVEFN,
  RequestStore,
} from '../request-store';
import { newDate } from './date';
import { defaultOpts } from './default-options';
import { createObservers } from './middleware-observers';
export { Observable, Subject };

const uniqueid = require('uniqueid');

// Meta added by middleware
export interface IAsyncFlowActionMeta<TPayload> {
  // enable middleware, disabled will only acts as passthrough
  readonly enable?: boolean;
  // the global timeout
  readonly timeout: number;
  // override timeout only for this action
  readonly timeoutRequest: number;
  // main promise of the action
  readonly promise: Bluebird<TPayload>;
  // the original action type when dispatching and END action, user may want to check what kind if action it ended with
  readonly endActionType: string | null;
  // start of the async action
  readonly timeStart: Date;
  // end of the async action if it reaches end
  readonly timeEnd: Date | null;
}
// Optional version to pass what you want
export type TAsyncFlowActionMetaOptional<TActionPayload> = {
  readonly[P in keyof IAsyncFlowActionMeta<TActionPayload>]?: IAsyncFlowActionMeta<TActionPayload>[P];
};
// Can only apply to default metaKey
export interface IAsyncFlowActionOptional<TActionPayload> extends ActionMeta<TActionPayload, any> {
  meta: {
    asyncFlow: TAsyncFlowActionMetaOptional<TActionPayload>;
  };
}
// Action dispatched with meta added by middleware
export interface IAsyncFlowAction<TActionPayload> extends ActionMeta<TActionPayload, any> {
  meta: {
    asyncFlow: IAsyncFlowActionMeta<TActionPayload>;
  };
}
export type IGenerateIdFn<TAction> = (opts: { action: TAction }) => string;
export interface IDefaultOpts<TAction> {
  // main key under meta
  readonly metaKey: string;
  // id key under main key
  readonly metaKeyRequestID: string;
  // timeout for promise before rejecting
  readonly timeout: number;
  // function to override generation of async ids
  readonly generateId?: IGenerateIdFn<TAction>;
}
const getGenerateId = () => {
  const asyncUniqueId = uniqueid(null, '-@@ASYNC_FLOW');
  return ({ action }: { action: ActionMeta<any, any> }) => `${asyncUniqueId()}--${action.type}`;
};
export type TRequestId = string;
export type TDefaultOptsOptional<TAction> = {
  readonly[P in keyof IDefaultOpts<TAction>]?: IDefaultOpts<TAction>[P];
};
export interface ICreateAsyncFlowMiddlewareBaseOpts {
  // async constants
  asyncTypes?: TDefaultTypesOptional;
}
export type TCreateAsyncFlowMiddlewareOpts<TAction> =
  ICreateAsyncFlowMiddlewareBaseOpts & TDefaultOptsOptional<TAction>;
export const createAsyncFlowMiddleware = <TStoreState, TAction extends ActionMeta<any, any>>
(opts: TCreateAsyncFlowMiddlewareOpts<TAction> = {
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
      END,
      REQUEST,
    },
  });

  const {
    generateId: generateIdMerged,
    metaKey,
    metaKeyRequestID,
    timeout,
  }: IDefaultOpts<TAction> = {
    ...defaultOpts,
    ...opts,
  } as any;
  const generateId = generateIdMerged || getGenerateId();

  const requestStore = new RequestStore();

  const middleware: Middleware = () => {
    return (next: Dispatch<TStoreState>) => {
      return (action: any) => {
        const dispatchNormal = () => next(action);

        const actionType = action.type;
        /**
         * If meta.asyncFlow.enable is explicit set to false, completely skip this middleware.
         */
        if (!actionType || lGet<boolean>(action, ['meta', metaKey, 'enable']) === false) {
          return dispatchNormal();
        }

        const dispatchAsyncFlow = (actionArg: IAsyncFlowAction<any>) => {
          // Lets observers have a go before and after dispatches
          mwObservers.before.rootSubject.next(actionArg);
          const dispatchResult = next(actionArg);
          mwObservers.after.rootSubject.next(dispatchResult);

          return dispatchResult;
        };

        // used to get deep in action object
        const metaRequestIdPath = ['meta', metaKey, metaKeyRequestID];
        const metaPromisePath = ['meta', metaKey, 'promise'];
        // Resolve, reject and then set dispatch END payload
        const handleEndAction = (suffixType: string, resolve: boolean) => {
          /**
           * First dispatch the original action
           */
          const requestID = lGet<TRequestId>(action, metaRequestIdPath);
          const theAsyncFlowPromise = lGet<Bluebird<any>>(action, metaPromisePath);
          // Normal dispatch and opt out if not a asyncflow action
          if (!requestID || !theAsyncFlowPromise) {
            return dispatchNormal();
          }

          // Can dispatch as async flow action
          const dispatchResult = dispatchAsyncFlow(action as any);

          // Dispatch end if a valid async flow action
          if (requestID) {
            if (resolve) {
              requestStore.resolve(requestID, action.payload);
            } else {
              requestStore.reject(requestID, action.payload);
            }
            const actionEnd = merge({}, action, {
              meta: {
                [metaKey]: {
                  endActionType: actionType,
                  timeEnd: newDate(),
                },
              },
              type: replaceSuffix(actionType, suffixType, END),
            });

            dispatchAsyncFlow(actionEnd as any);
          } else {
            // tslint:disable-next-line: no-console
            console.warn(`${action.type} - meta data not found, did you forget to send it?`);
          }

          return dispatchResult;
        };
        /**
         * handle REQUEST, dispatches PENDING then dispatches REQUEST with meta data
         */
        if (actionType.endsWith(REQUEST)) {
          // Don't touch and mutate original action
          const actionClone = cloneDeep(action);
          /**
           * Generate uniqueid, make sure it does not exist
           */
          let requestID = lGet<TRequestId>(actionClone, metaRequestIdPath);
          /* istanbul ignore next */
          if (!requestID || {}.hasOwnProperty.call(requestStore, requestID)) {
            do {
              requestID = generateId({ action: actionClone });
            } while ({}.hasOwnProperty.call(requestStore, requestID));

            // This adds the id to the meta path, since it should not exist in this clause it's created in action object
            lSet<TRequestId>(actionClone, metaRequestIdPath, requestID);
          }

          // User override of the timeout for each request
          const metaTimeoutKey = lGet<number>(actionClone, ['meta', metaKey, 'timeoutRequest']);
          const timeoutRequest = metaTimeoutKey || timeout;
          /**
           * Dispatch pending first, with a twist, send a promise resolve reject with it
           * So this way user can use to the promise to do stuff after the action
           * The promise will be resolved/rejected later when getting ABORTED, REJECTED, or FULFILLED
           */
          const {
            promise,
            reject,
            resolve,
          } = createPromise<any>();
          promise
            .timeout(timeoutRequest, 'timeout')
            .catch((er) => {
              // force bluebird to normal reject on errors, fixes jest etc
              reject(er);
            })
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
                endActionType: null,
                promise,
                timeEnd: null,
                timeStart: newDate(),
                timeout,
                timeoutRequest,
              } as IAsyncFlowActionMeta<any>,
            },
          };
          const pendingAction: IAsyncFlowAction<any> = merge(
            {},
            actionClone,
            {
              type: replaceSuffix(actionType, REQUEST, PENDING),
            },
            addedActionMetaData
          ) as any;
          dispatchAsyncFlow(pendingAction);

          /**
           * Dispatch and return orginal action with meta data
           */
          const newAction: IAsyncFlowAction<any> = merge({}, actionClone, addedActionMetaData) as any;
          return dispatchAsyncFlow(newAction);
        } else if (actionType.endsWith(FULFILLED)) {
          return handleEndAction(FULFILLED, true);
        } else if (actionType.endsWith(REJECTED)) {
          return handleEndAction(REJECTED, false);
        } else if (actionType.endsWith(ABORTED)) {
          return handleEndAction(ABORTED, false);
        } else {
          /**
           * Normal dispatch when unmatched by suffixes
           */
          return dispatchNormal();
        }
      };
    };
  };

  return {
    middleware,
    // Do not expose rootSubject
    observers: {
      after: {
        obsOnAll: mwObservers.after.obsOnAll,
        obsOnEnd: mwObservers.after.obsOnEnd,
        obsOnRequest: mwObservers.after.obsOnRequest,
      },
      before: {
        obsOnAll: mwObservers.before.obsOnAll,
        obsOnEnd: mwObservers.before.obsOnEnd,
        obsOnRequest: mwObservers.before.obsOnRequest,
      },
    },
  };
};
