/* tslint:disable: chai-vague-errors */
import { ReducerMeta } from 'redux-actions';
import {
  createAsyncFlowReducer,
  IState,
} from '..';
import { defaultTypes } from '../../async-types';
import { defaultOpts as middlewareDefaultOpts } from '../../middleware/default-options';

describe('reducer creation', () => {
  it('can create without options', () => {
    const reducer = createAsyncFlowReducer();
    const {
      metaKey,
      metaKeyRequestID,
    } = middlewareDefaultOpts;
    expect(reducer(undefined as any, {
      type: 'MY_ACTION_REQUEST',
      [metaKey]: {
        [metaKeyRequestID]: 'myId',
      },
    } as any))
      .toMatchSnapshot();
  });

  it('can create with options and works', () => {
    const asyncRequestSuffix = '-request-suffix';
    const metaKey = '__THE_META_KEY';
    const metaKeyRequestID = '__THE_META_REQ_ID';
    const reducer = createAsyncFlowReducer({
      asyncTypes: {
        ABORTED: '--__aborted-ab',
        FULFILLED: 'fulfilledsuFf',
        PENDING: '-pending-SUFF',
        REJECTED: '____rejected___-',
        REQUEST: asyncRequestSuffix,
      },
      metaKey,
      metaKeyRequestID,
    });

    expect(reducer(undefined as any, {
      type: `something${asyncRequestSuffix}`,
      [metaKey]: {
        [metaKeyRequestID]: 'myId',
      },
    } as any))
      .toMatchSnapshot();
  });
});

describe('reducer tests', () => {
  let reducer: ReducerMeta<IState, any, any>;
  const {
    metaKey,
    metaKeyRequestID,
  } = middlewareDefaultOpts;
  beforeEach(() => {
    reducer = createAsyncFlowReducer();
  });

  it('initial state, with any action works', () => {
    expect(reducer(undefined as any, {
      type: 'MYACTION',
    } as any))
      .toMatchSnapshot();
  });

  Object.values(defaultTypes).forEach((asyncSuffix) => {
      it(`handle ${asyncSuffix}`, () => {
        const firstState = reducer(undefined as any, {
          type: `MYACTION${asyncSuffix}`,
          [metaKey]: {
            [metaKeyRequestID]: 'hello',
          },
        } as any);
        expect(firstState)
          .toMatchSnapshot();
        expect(reducer(firstState, {
          type: `MYACTION${asyncSuffix}`,
          [metaKey]: {
            [metaKeyRequestID]: 'hello2',
          },
        } as any))
          .toMatchSnapshot();
      });
  });
});
