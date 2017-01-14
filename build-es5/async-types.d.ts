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
export interface IGetAsyncTypeConstantsOpts {
    readonly types?: TDefaultTypesOptional;
}
export declare const getAsyncTypeConstants: ({types}?: IGetAsyncTypeConstantsOpts) => {
    readonly REQUEST: string;
    readonly PENDING: string;
    readonly FULFILLED: string;
    readonly REJECTED: string;
    readonly ABORTED: string;
    readonly END: string;
};
export interface IGenerateAsyncActionOpts extends IGetAsyncTypeConstantsOpts {
    readonly actionName: string;
}
export declare const generateAsyncAction: ({actionName, types}: IGenerateAsyncActionOpts) => {
    [x: string]: string;
};
export declare const replaceSuffix: (targetStr: string, suffixToReplace: string, replacementString: string) => string;
