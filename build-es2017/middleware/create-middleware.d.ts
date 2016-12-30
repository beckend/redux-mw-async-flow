/// <reference types="bluebird" />
/// <reference types="redux-actions" />
/**
 * Detects action types with names ending with REQUEST, REJECTED, FULFILLED, ABORTED
 * Will dispatch PENDING if REQUEST
 * Will resolve if FULFILLED
 * REJECT when REJECTED or ABORTED
 * END after FULFILLED/REJECTED/ABORTED
 */
import { Middleware } from 'redux';
import { Action } from 'redux-actions';
import * as Bluebird from 'bluebird';
import { TDefaultTypesOptional } from '../async-types';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
export { Observable, Subject };
export interface IAsyncFlowActionMeta<TPayload> {
    readonly enable?: boolean;
    readonly timeout: number;
    readonly timeoutRequest: number;
    readonly promise: Bluebird<TPayload>;
    readonly endActionType: string | null;
    readonly timeStart: Date;
    readonly timeEnd: Date | null;
}
export declare type TAsyncFlowActionMetaOptional<TActionPayload> = {
    readonly [P in keyof IAsyncFlowActionMeta<TActionPayload>]?: IAsyncFlowActionMeta<TActionPayload>[P];
};
export interface IAsyncFlowActionOptional<TActionPayload> extends Action<TActionPayload> {
    meta: {
        asyncFlow: TAsyncFlowActionMetaOptional<TActionPayload>;
    };
}
export interface IAsyncFlowAction<TActionPayload> extends Action<TActionPayload> {
    meta: {
        asyncFlow: IAsyncFlowActionMeta<TActionPayload>;
    };
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
    readonly generateId?: IGenerateIdFn<TAction>;
}
export declare type TRequestId = string;
export declare type TDefaultOptsOptional<TAction> = {
    readonly [P in keyof IDefaultOpts<TAction>]?: IDefaultOpts<TAction>[P];
};
export interface ICreateAsyncFlowMiddlewareBaseOpts {
    asyncTypes?: TDefaultTypesOptional;
}
export declare type TCreateAsyncFlowMiddlewareOpts<TAction> = ICreateAsyncFlowMiddlewareBaseOpts & TDefaultOptsOptional<TAction>;
export declare const createAsyncFlowMiddleware: <TStoreState, TAction extends Action<any>>(opts?: TCreateAsyncFlowMiddlewareOpts<TAction>) => {
    middleware: Middleware;
    observers: {
        before: {
            obsOnAll: Observable<IAsyncFlowAction<any>>;
            obsOnRequest: Observable<IAsyncFlowAction<any>>;
            obsOnEnd: Observable<IAsyncFlowAction<any>>;
        };
        after: {
            obsOnAll: Observable<IAsyncFlowAction<any>>;
            obsOnRequest: Observable<IAsyncFlowAction<any>>;
            obsOnEnd: Observable<IAsyncFlowAction<any>>;
        };
    };
};
