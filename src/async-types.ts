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
export const getAsyncTypeConstants = ({ types }: IGetAsyncTypeConstantsParams = {}) => {
  return {
    ...defaultTypes,
    ...types,
  } as IDefaultTypes;
};

export const replaceSuffix = (targetStr: string, suffixToReplace: string, replacementString: string) =>
  `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
