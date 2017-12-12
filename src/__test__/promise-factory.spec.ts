import * as Bluebird from 'bluebird';
import { createPromise } from '../promise-factory';

describe('Promise factory', () => {
  it('createPromise - returns payload as expected', () => {
    const payload = createPromise<any>();
    expect(payload.promise)
      .toBeInstanceOf(Bluebird);
    expect(payload)
      .toMatchSnapshot();
  });
});
