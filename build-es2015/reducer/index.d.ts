import { ActionMeta, ReducerMeta } from 'redux-actions';
import { TDefaultTypesOptional } from '../async-types';
export interface IActionsByActionId {
    readonly [actionId: string]: ActionMeta<any, any>;
}
export interface IRequestCounters {
    readonly [counterName: string]: number;
}
export interface IState {
    readonly counters: IRequestCounters;
    /**
     * One latest single action by action type as key
     * useful to see if the type of action is currently pending or something
     * Keys sorted by REQUEST suffix
     */
    readonly latestActions: IActionsByActionId;
}
export interface IDefaultOpts {
    readonly metaKey?: string;
    readonly metaKeyRequestID?: string;
}
export interface ICreateAsyncFlowReducerOpts {
    readonly asyncTypes?: TDefaultTypesOptional;
}
export declare type TCreateAsyncFlowReducerOpts = ICreateAsyncFlowReducerOpts & IDefaultOpts;
export declare const createAsyncFlowReducer: ({asyncTypes, metaKey, metaKeyRequestID}?: TCreateAsyncFlowReducerOpts) => ReducerMeta<IState, any, any>;
