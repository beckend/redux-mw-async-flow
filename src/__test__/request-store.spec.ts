import { createPromise } from '../promise-factory';
import { RequestStore } from '../request-store';

describe('RequestStore', () => {
  let requestStore: RequestStore;

  beforeEach(() => {
    requestStore = new RequestStore();
  });

  it('has not requests initially', () => {
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
    console.warn = (str: any) => {
      expect(typeof str === 'string')
        .toBeTruthy();
    };
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
    const originalConsoleWarn = console.warn;
    console.warn = (str: any) => {
      expect(typeof str === 'string')
        .toBeTruthy();
    };
    const requestKey = 'myKey';
    const resolvePayload = { data: [1, 2, 3] };
    requestStore.add(requestKey, createPromise<any>());
    requestStore.resolve(requestKey, resolvePayload);
    requestStore.resolve('does not exist', resolvePayload);
    expect(requestStore.store)
      .toMatchSnapshot();
    expect(requestStore.get(requestKey).promise.value())
      .toEqual(resolvePayload);
    console.warn = originalConsoleWarn;
  });

  it('reject', () => {
    const originalConsoleWarn = console.warn;
    console.warn = (str: any) => {
      expect(typeof str === 'string')
        .toBeTruthy();
    };
    const requestKey = 'myKey';
    const rejectPayload = { data: [1, 2, 3] };
    requestStore.add(requestKey, createPromise<any>());
    requestStore.reject(requestKey, rejectPayload);
    requestStore.reject('does not exist', rejectPayload);
    expect(requestStore.store)
      .toMatchSnapshot();
    expect(requestStore.get(requestKey).promise.reason())
      .toEqual(rejectPayload);
    console.warn = originalConsoleWarn;
  });
});
