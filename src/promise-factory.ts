import * as Bluebird from 'bluebird';

export type TResolveFn<TPayload> = (thenableOrResult?: TPayload | Bluebird.Thenable<TPayload>) => void;
export type TRejectFn = (error?: Error | any) => void;

export const createPromise = <TPayload>() => {
  let resolve: any;
  let reject: any;
  const promise = new Bluebird<TPayload>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve as TResolveFn<TPayload>,
    reject: reject as TRejectFn,
  };
};
