/// <reference types="bluebird" />
import * as Bluebird from 'bluebird';
export declare type TResolveFn<TPayload> = (thenableOrResult?: TPayload | Bluebird.Thenable<TPayload>) => void;
export declare type TRejectFn = (error?: Error | any) => void;
export declare const createPromise: <TPayload>() => {
    promise: Bluebird<TPayload>;
    resolve: TResolveFn<TPayload>;
    reject: TRejectFn;
};
