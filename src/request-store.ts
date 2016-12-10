/* tslint:disable: no-reserved-keywords */
/**
 * Store promise, resolve, reject outside of action
 */
import * as Bluebird from 'bluebird';
import { TResolveFn, TRejectFn } from './promise-factory';
import * as lodash from 'lodash';

export const REQUEST_KEY_PROMISE = 'promise';
export const REQUEST_KEY_RESOLVEFN = 'resolve';
export const REQUEST_KEY_REJECTFN = 'reject';

const lGet: typeof lodash.get = require('lodash.get');

export interface IRequestMap<TPayload> {
  promise: Bluebird<TPayload>;
  resolve: TResolveFn<TPayload>;
  reject: TRejectFn;
}
export interface IRequestStore {
  [requestName: string]: IRequestMap<any>;
}
export class RequestStore {

  public store: IRequestStore = {};

  public add(keyName: string, payload: IRequestMap<any>) {
    this.store[keyName] = payload;
  }

  public delete(keyName: string) {
    delete this.store[keyName];
  }

  public get(keyName: string) {
    return this.store[keyName];
  }

  public resolve<TPayload>(keyName: string, payload: TPayload) {
    const promiseFn = lGet<TResolveFn<TPayload>>(this.store, [keyName, REQUEST_KEY_RESOLVEFN]);
    if (promiseFn) {
      promiseFn(payload);
    } else {
      console.warn(`${keyName} - was not found in request store and was not resolved.`);
    }
  }

  public reject<TPayload>(keyName: string, payload: TPayload) {
    const promiseFn = lGet<TResolveFn<TPayload>>(this.store, [keyName, REQUEST_KEY_REJECTFN]);
    if (promiseFn) {
      promiseFn(payload);
    } else {
      console.warn(`${keyName} - was not found in request store and was not rejected.`);
    }
  }

}
