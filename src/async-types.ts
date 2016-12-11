export interface IDefaultTypes {
  readonly REQUEST: string;
  readonly PENDING: string;
  readonly FULFILLED: string;
  readonly REJECTED: string;
  readonly ABORTED: string;
}
export const defaultTypes: IDefaultTypes = {
  REQUEST: '_REQUEST',
  PENDING: '_PENDING',
  FULFILLED: '_FULFILLED',
  REJECTED: '_REJECTED',
  ABORTED: '_ABORTED',
};

export type TDefaultTypesOptional = {
  readonly[P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsParams {
  readonly types?: TDefaultTypesOptional;
}
export const getAsyncTypeConstants = ({ types }: IGetAsyncTypeConstantsParams = {}) => {
  const {
    REQUEST,
    PENDING,
    FULFILLED,
    REJECTED,
    ABORTED,
  }: IDefaultTypes = {
      ...defaultTypes,
      ...types,
    };
  return {
    _REQUEST: REQUEST,
    _PENDING: PENDING,
    _FULFILLED: FULFILLED,
    _REJECTED: REJECTED,
    _ABORTED: ABORTED,
  };
};
