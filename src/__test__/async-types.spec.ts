import {
  generateAsyncAction,
  getAsyncTypeConstants,
} from '../async-types';

describe('async-types', () => {
  it('getAsyncTypeConstants', () => {
    expect(getAsyncTypeConstants({
      types: {
        ABORTED: '_ABORTED___',
        END: '_END___',
        FULFILLED: '_FULFILLED___',
        PENDING: '_PENDING___',
        REJECTED: '_REJECTED___',
        REQUEST: '_REQUEST___',
      },
    }))
      .toMatchSnapshot();
  });

  it('generateAsyncAction with types', () => {
    expect(generateAsyncAction({
      actionName: 'namespaceAnother/MYACTION',
      types: {
        ABORTED: '_ABORTED___',
        END: '_END___',
        FULFILLED: '_FULFILLED___',
        PENDING: '_PENDING___',
        REJECTED: '_REJECTED___',
        REQUEST: '_REQUEST___',
      },
    }))
      .toMatchSnapshot();
  });
  it('generateAsyncAction with defaults', () => {
    expect(generateAsyncAction({
      actionName: 'namespace/MYACTION',
    }))
      .toMatchSnapshot();
  });
});
