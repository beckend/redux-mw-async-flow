/**
 * Store promise, resolve, reject outside of action
 */
import * as Bluebird from 'bluebird';
import lGet = require('lodash.get');
import { TRejectFn, TResolveFn } from './promise-factory';

export const REQUEST_KEY_PROMISE = 'promise';
export const REQUEST_KEY_RESOLVEFN = 'resolve';
export const REQUEST_KEY_REJECTFN = 'reject';
export interface IRequestMap<TPayload> {
  readonly promise: Bluebird<TPayload>;
  readonly resolve: TResolveFn<TPayload>;
  readonly reject: TRejectFn;
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
    const promiseFn: TResolveFn<TPayload> | undefined = lGet(this.store, [keyName, REQUEST_KEY_RESOLVEFN]) as any;
    if (promiseFn) {
      promiseFn(payload);
    } else {
      // tslint:disable-next-line: no-console
      console.warn(`${keyName} - was not found in request store and was not resolved.`);
    }
  }

  public reject<TPayload>(keyName: string, payload: TPayload) {
    const promiseFn: TResolveFn<TPayload> | undefined = lGet(this.store, [keyName, REQUEST_KEY_REJECTFN]) as any;
    if (promiseFn) {
      promiseFn(payload);
    } else {
      // tslint:disable-next-line: no-console
      console.warn(`${keyName} - was not found in request store and was not rejected.`);
    }
  }

}
