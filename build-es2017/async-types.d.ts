export interface IDefaultTypes {
    readonly ABORTED: string;
    readonly END: string;
    readonly FULFILLED: string;
    readonly PENDING: string;
    readonly REJECTED: string;
    readonly REQUEST: string;
}
export declare const defaultTypes: IDefaultTypes;
export declare type TDefaultTypesOptional = {
    readonly [P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsOpts {
    readonly types?: TDefaultTypesOptional;
}
export declare const getAsyncTypeConstants: ({types}?: IGetAsyncTypeConstantsOpts) => {
    ABORTED: string;
    END: string;
    FULFILLED: string;
    PENDING: string;
    REJECTED: string;
    REQUEST: string;
};
export interface IGenerateAsyncActionOpts extends IGetAsyncTypeConstantsOpts {
    readonly actionName: string;
}
export declare const generateAsyncAction: ({actionName, types}: IGenerateAsyncActionOpts) => {
    [x: string]: string;
};
export declare const replaceSuffix: (targetStr: string, suffixToReplace: string, replacementString: string) => string;
