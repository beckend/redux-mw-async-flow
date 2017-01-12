/* tslint:disable: chai-vague-errors */
import {
  getAsyncTypeConstants,
  generateAsyncAction
} from '../async-types';

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

  it('generateAsyncAction with types', () => {
    expect(generateAsyncAction({
      actionName: 'namespaceAnother/MYACTION',
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
  it('generateAsyncAction with defaults', () => {
    expect(generateAsyncAction({
      actionName: 'namespace/MYACTION'
    }))
      .toMatchSnapshot();
  });
});
