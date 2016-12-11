/* tslint:disable: variable-name */
/* tslint:disable: no-reserved-keywords */
/**
 * Need a function to get from the Map which returns an object key valued
 * Haxx type the module since none exists
 */
const { FifoXCache: FifoXCacheOriginal } = require('x-cache');

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
export const FifoXCacheOriginalClass: IFifoXCacheConstructor = FifoXCacheOriginal;

export class FifoXCache extends FifoXCacheOriginalClass {

  constructor(...args: any[]) {
    super(...args);
  }

  public getAll<TKeyPayload>() {
    let entry = this.tail;
    const returned: {
      [keyName: string]: TKeyPayload;
    } = {};
    while (entry) {
      returned[entry.key] = entry.value;
      entry = entry.older;
    }
    return returned;
  }

}
