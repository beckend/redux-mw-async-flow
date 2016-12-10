export interface IDefaultTypes {
  readonly REQUEST: string;
  readonly PENDING: string;
  readonly FULFILLED: string;
  readonly REJECTED: string;
  readonly ABORTED: string;
}
export const defaultTypes: IDefaultTypes = {
  REQUEST: 'REQUEST',
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
  ABORTED: 'ABORTED',
};

export type TDefaultTypesOptional = {
  readonly[P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsParams {
  types?: TDefaultTypesOptional;
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
    _REQUEST: `_${REQUEST}`,
    _PENDING: `_${PENDING}`,
    _FULFILLED: `_${FULFILLED}`,
    _REJECTED: `_${REJECTED}`,
    _ABORTED: `_${ABORTED}`,
  };
};
