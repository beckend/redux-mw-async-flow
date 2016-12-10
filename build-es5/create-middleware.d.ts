/// <reference types="bluebird" />
/// <reference types="redux-actions" />
/**
 * Detects action types with names ending with _REQUEST, _REJECTED, _FULFILLED, _ABORTED
 * Will dispatch _PENDING if _REQUEST
 * Will resolve if _FULFILLED
 * REJECT when _REJECTED or _ABORTED
 */
import { Middleware } from 'redux';
import { Action } from 'redux-actions';
import * as Bluebird from 'bluebird';
import { TDefaultTypesOptional } from './async-types';
export interface IAsyncFlowActionMeta<TPayload> {
    enable?: boolean;
    timeout?: number;
    timeoutRequest?: number;
    promise: Bluebird<TPayload>;
}
export interface IGenerateIdFn<TAction> {
    (opts: {
        action: TAction;
    }): string;
}
export interface IDefaultOpts<TAction> {
    readonly metaKey: string;
    readonly metaKeyRequestID: string;
    readonly timeout: number;
    readonly generateId: IGenerateIdFn<TAction>;
}
export declare const defaultOpts: IDefaultOpts<any>;
export declare type TRequestId = string;
export declare type TDefaultOptsOptional<TAction> = {
    readonly [P in keyof IDefaultOpts<TAction>]?: IDefaultOpts<TAction>[P];
};
export interface ICreateAsyncFlowMiddlewareBaseOpts {
    types?: TDefaultTypesOptional;
}
export declare type TCreateAsyncFlowMiddlewareOpts<TAction> = ICreateAsyncFlowMiddlewareBaseOpts & TDefaultOptsOptional<TAction>;
export declare const createAsyncFlowMiddleware: <TStoreState, TAction extends Action<any>>(opts?: TCreateAsyncFlowMiddlewareOpts<TAction>) => Middleware;
