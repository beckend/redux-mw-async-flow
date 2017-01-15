import { IDefaultOpts } from './create-middleware';

export const defaultOpts: IDefaultOpts<any> = {
  metaKey: 'asyncFlow',
  metaKeyRequestID: 'REQUEST_ID',
  timeout: 10000,
};
