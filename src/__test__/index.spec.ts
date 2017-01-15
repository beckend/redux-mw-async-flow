/* tslint:disable: chai-vague-errors */
import {
  createAsyncFlowMiddleware,
  createAsyncFlowReducer,
} from '../index';

describe('index exports', () => {
  it('createAsyncFlowMiddleware', () => {
    expect(createAsyncFlowMiddleware)
      .toBeTruthy();
  });

  it('createAsyncFlowMiddleware', () => {
    expect(createAsyncFlowReducer)
      .toBeTruthy();
  });
});
