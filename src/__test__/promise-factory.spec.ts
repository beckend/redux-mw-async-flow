/* tslint:disable: chai-vague-errors */
import { createPromise } from '../promise-factory';
import * as Bluebird from 'bluebird';

describe('Promise factory', () => {
  it('createPromise - returns payload as expected', () => {
    const payload = createPromise<any>();
    expect(payload.promise).toBeInstanceOf(Bluebird);
    expect(payload).toMatchSnapshot();
  });
});
