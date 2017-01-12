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
  END: '_END'
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
    ...types
  }
);

export interface IGenerateAsyncActionOpts extends IGetAsyncTypeConstantsOpts {
  readonly actionName: string;
}
export const generateAsyncAction = ({ actionName, types = {} }: IGenerateAsyncActionOpts) => {
  const {
    REQUEST,
    PENDING,
    FULFILLED,
    REJECTED,
    ABORTED,
    END
  } = getAsyncTypeConstants({ types });

  const REQUEST_NAME = `${actionName}${REQUEST}`;
  const PENDING_NAME = `${actionName}${PENDING}`;
  const FULFILLED_NAME = `${actionName}${FULFILLED}`;
  const REJECTEDT_NAME = `${actionName}${REJECTED}`;
  const ABORTED_NAME = `${actionName}${ABORTED}`;
  const END_NAME = `${actionName}${END}`;

  return {
    [REQUEST_NAME]: REQUEST_NAME,
    [PENDING_NAME]: PENDING_NAME,
    [FULFILLED_NAME]: FULFILLED_NAME,
    [REJECTEDT_NAME]: REJECTEDT_NAME,
    [ABORTED_NAME]: ABORTED_NAME,
    [END_NAME]: END_NAME
  };
};

export const replaceSuffix = (targetStr: string, suffixToReplace: string, replacementString: string) =>
  `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
