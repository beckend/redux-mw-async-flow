/// <reference types="bluebird" />
/**
 * Store promise, resolve, reject outside of action
 */
import * as Bluebird from 'bluebird';
import { TResolveFn, TRejectFn } from './promise-factory';
export declare const REQUEST_KEY_PROMISE = "promise";
export declare const REQUEST_KEY_RESOLVEFN = "resolve";
export declare const REQUEST_KEY_REJECTFN = "reject";
export interface IRequestMap<TPayload> {
    promise: Bluebird<TPayload>;
    resolve: TResolveFn<TPayload>;
    reject: TRejectFn;
}
export interface IRequestStore {
    [requestName: string]: IRequestMap<any>;
}
export declare class RequestStore {
    store: IRequestStore;
    add(keyName: string, payload: IRequestMap<any>): void;
    delete(keyName: string): void;
    resolve<TPayload>(keyName: string, payload: TPayload): void;
    reject<TPayload>(keyName: string, payload: TPayload): void;
}
