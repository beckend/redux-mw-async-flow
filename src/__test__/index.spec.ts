/* tslint:disable: chai-vague-errors */
import { createAsyncFlowMiddleware } from '../index';

describe('index exports', () => {
  it('createAsyncFlowMiddleware', () => {
    expect(createAsyncFlowMiddleware)
      .toBeTruthy();
  });
});
