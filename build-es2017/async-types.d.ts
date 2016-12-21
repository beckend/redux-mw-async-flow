export interface IDefaultTypes {
    readonly REQUEST: string;
    readonly PENDING: string;
    readonly FULFILLED: string;
    readonly REJECTED: string;
    readonly ABORTED: string;
    readonly END: string;
}
export declare const defaultTypes: IDefaultTypes;
export declare type TDefaultTypesOptional = {
    readonly [P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsParams {
    readonly types?: TDefaultTypesOptional;
}
export declare const getAsyncTypeConstants: ({types}?: IGetAsyncTypeConstantsParams) => {
    readonly REQUEST: string;
    readonly PENDING: string;
    readonly FULFILLED: string;
    readonly REJECTED: string;
    readonly ABORTED: string;
    readonly END: string;
};
export declare const replaceSuffix: (targetStr: string, suffixToReplace: string, replacementString: string) => string;
