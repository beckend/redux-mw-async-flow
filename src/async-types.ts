export interface IDefaultTypes {
  readonly REQUEST: string;
  readonly PENDING: string;
  readonly FULFILLED: string;
  readonly REJECTED: string;
  readonly ABORTED: string;
  readonly END: string;
}
export const defaultTypes: IDefaultTypes = {
  REQUEST: '_REQUEST',
  PENDING: '_PENDING',
  FULFILLED: '_FULFILLED',
  REJECTED: '_REJECTED',
  ABORTED: '_ABORTED',
  END: '_END',
};

export type TDefaultTypesOptional = {
  readonly[P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsParams {
  readonly types?: TDefaultTypesOptional;
}
export const getAsyncTypeConstants = ({ types }: IGetAsyncTypeConstantsParams = {}) => (
  {
    ...defaultTypes,
    ...types,
  }
);

export const replaceSuffix = (targetStr: string, suffixToReplace: string, replacementString: string) =>
  `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;

export interface IGetMetaResultTypes {
  readonly PENDING: string;
  readonly FULFILLED: string;
  readonly REJECTED: string;
  readonly ABORTED: string;
  readonly END: string;
}
export interface IGetMetaResultOverrides {
  readonly PAYLOAD: any;
  readonly ERROR: boolean;
  readonly[keyName: string]: boolean | string;
}
export const getMetaResult = (types: IGetMetaResultTypes, overrides: IGetMetaResultOverrides) => (
  {
    [types.PENDING]: false,
    [types.FULFILLED]: false,
    [types.REJECTED]: false,
    [types.END]: false,
    PAYLOAD: null,
    ERROR: null,
    ...overrides,
  }
);
