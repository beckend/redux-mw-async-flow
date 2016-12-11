export interface IFifoXCacheConstructor {
    new (...args: any[]): IFifoXCacheClass;
}
export interface IFifoXCacheClass {
    readonly tail: any;
    readonly put: any;
    readonly set: any;
    readonly get: any;
    readonly getArray: any;
}
export declare const FifoXCacheOriginalClass: IFifoXCacheConstructor;
export declare class FifoXCache extends FifoXCacheOriginalClass {
    constructor(...args: any[]);
    getAll<TKeyPayload>(): {
        [keyName: string]: TKeyPayload;
    };
}
