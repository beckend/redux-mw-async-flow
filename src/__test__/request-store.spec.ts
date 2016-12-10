/* tslint:disable: no-backbone-get-set-outside-model */
import { RequestStore } from '../request-store';
import { createPromise } from '../promise-factory';

describe('RequestStore', () => {
  let requestStore: RequestStore;

  beforeEach(() => {
    requestStore = new RequestStore();
  });

  it('has not request initially', () => {
    expect(requestStore.store)
      .toMatchSnapshot();
  });

  it('add', () => {
    requestStore.add('requestKey1', { one: 1 } as any);
    requestStore.add('requestKey2', { one: 1 } as any);
    requestStore.add('requestKey32321', { one: 1 } as any);
    expect(requestStore.store)
      .toMatchSnapshot();
  });

  it('get', () => {
    const requestKey = 'myKey';
    const payload: any = { one: 1 };
    requestStore.add(requestKey, payload);
    expect(requestStore.get(requestKey))
      .toEqual(payload);
    expect(requestStore.get('does-not-exist'))
      .toBeFalsy();
  });

  it('delete', () => {
    const requestKey = 'myKey';
    requestStore.add(requestKey, { one: 1 } as any);
    expect(requestStore.store)
      .toMatchSnapshot();
    requestStore.delete(requestKey);
    requestStore.delete('does not exist');
    expect(requestStore.store)
      .toMatchSnapshot();
  });

  it('resolve', () => {
    const requestKey = 'myKey';
    const resolvePayload = { data: [1, 2, 3] };
    requestStore.add(requestKey, createPromise<any>());
    requestStore.resolve(requestKey, resolvePayload);
    requestStore.resolve('does not exist', resolvePayload);
    expect(requestStore.store)
      .toMatchSnapshot();
    expect(requestStore.get(requestKey).promise.value())
      .toEqual(resolvePayload);
  });

  it('reject', () => {
    const requestKey = 'myKey';
    const rejectPayload = { data: [1, 2, 3] };
    requestStore.add(requestKey, createPromise<any>());
    requestStore.reject(requestKey, rejectPayload);
    requestStore.reject('does not exist', rejectPayload);
    expect(requestStore.store)
      .toMatchSnapshot();
    expect(requestStore.get(requestKey).promise.reason())
      .toEqual(rejectPayload);
  });
});
