/* tslint:disable: chai-vague-errors */
import { getAsyncTypeConstants } from '../async-types';

describe('async-types', () => {
  it('getAsyncTypeConstants', () => {
    expect(getAsyncTypeConstants({
      types: {
        REQUEST: '_REQUEST___',
        PENDING: '_PENDING___',
        FULFILLED: '_FULFILLED___',
        REJECTED: '_REJECTED___',
        ABORTED: '_ABORTED___',
        END: '_END___'
      }
    }))
      .toMatchSnapshot();
  });
});
