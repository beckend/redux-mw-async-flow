export interface IDefaultTypes {
    readonly REQUEST: string;
    readonly PENDING: string;
    readonly FULFILLED: string;
    readonly REJECTED: string;
    readonly ABORTED: string;
}
export declare const defaultTypes: IDefaultTypes;
export declare type TDefaultTypesOptional = {
    readonly [P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsParams {
    types?: TDefaultTypesOptional;
}
export declare const getAsyncTypeConstants: ({types}?: IGetAsyncTypeConstantsParams) => {
    _REQUEST: string;
    _PENDING: string;
    _FULFILLED: string;
    _REJECTED: string;
    _ABORTED: string;
};
