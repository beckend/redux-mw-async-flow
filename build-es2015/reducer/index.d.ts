import { TDefaultTypesOptional } from '../async-types';
import { ReducerMeta, ActionMeta } from 'redux-actions';
export interface IActionsByActionType {
    [actionType: string]: IActionsByActionId;
}
export interface IActionsByActionId {
    [actionId: string]: ActionMeta<any, any>;
}
export interface IRequestCounters {
    [counterName: string]: number;
}
export interface IState {
    counters: IRequestCounters;
    /**
     * One latest single action by action type as key, useful to see if the type of action is currently pending or something
     * Keys sorted by REQUEST suffix
     */
    latestActions: IActionsByActionId;
}
export interface IDefaultOpts {
    readonly metaKey?: string;
    readonly metaKeyRequestID?: string;
}
export interface ICreateAsyncFlowReducerOpts {
    asyncTypes?: TDefaultTypesOptional;
}
export declare type TCreateAsyncFlowReducerOpts = ICreateAsyncFlowReducerOpts & IDefaultOpts;
export declare const createAsyncFlowReducer: (opts?: TCreateAsyncFlowReducerOpts) => ReducerMeta<IState, any, any>;
