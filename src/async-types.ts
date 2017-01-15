export interface IDefaultTypes {
  readonly ABORTED: string;
  readonly END: string;
  readonly FULFILLED: string;
  readonly PENDING: string;
  readonly REJECTED: string;
  readonly REQUEST: string;
}
export const defaultTypes: IDefaultTypes = {
  ABORTED: '_ABORTED',
  END: '_END',
  FULFILLED: '_FULFILLED',
  PENDING: '_PENDING',
  REJECTED: '_REJECTED',
  REQUEST: '_REQUEST',
};

export type TDefaultTypesOptional = {
  readonly[P in keyof IDefaultTypes]?: IDefaultTypes[P];
};
export interface IGetAsyncTypeConstantsOpts {
  readonly types?: TDefaultTypesOptional;
}
export const getAsyncTypeConstants = ({ types }: IGetAsyncTypeConstantsOpts = {}) => (
  {
    ...defaultTypes,
    ...types,
  }
);

export interface IGenerateAsyncActionOpts extends IGetAsyncTypeConstantsOpts {
  readonly actionName: string;
}
export const generateAsyncAction = ({ actionName, types = {} }: IGenerateAsyncActionOpts) => {
  const {
    ABORTED,
    END,
    FULFILLED,
    PENDING,
    REJECTED,
    REQUEST,
  } = getAsyncTypeConstants({ types });

  const ABORTED_NAME = `${actionName}${ABORTED}`;
  const END_NAME = `${actionName}${END}`;
  const FULFILLED_NAME = `${actionName}${FULFILLED}`;
  const PENDING_NAME = `${actionName}${PENDING}`;
  const REJECTEDT_NAME = `${actionName}${REJECTED}`;
  const REQUEST_NAME = `${actionName}${REQUEST}`;

  return {
    [ABORTED_NAME]: ABORTED_NAME,
    [END_NAME]: END_NAME,
    [FULFILLED_NAME]: FULFILLED_NAME,
    [PENDING_NAME]: PENDING_NAME,
    [REJECTEDT_NAME]: REJECTEDT_NAME,
    [REQUEST_NAME]: REQUEST_NAME,
  };
};

export const replaceSuffix = (targetStr: string, suffixToReplace: string, replacementString: string) =>
  `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
