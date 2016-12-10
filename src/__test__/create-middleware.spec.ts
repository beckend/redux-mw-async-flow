/* tslint:disable: chai-vague-errors */
/* tslint:disable: max-line-length */
/* tslint:disable: no-increment-decrement */
// import { createStore, applyMiddleware } from 'redux';
import configureStore, { IStore } from 'redux-mock-store';
import {
  createAsyncFlowMiddleware,
  defaultOpts,
  TCreateAsyncFlowMiddlewareOpts,
  IAsyncFlowActionMeta,
} from '../create-middleware';
import { getAsyncTypeConstants } from '../async-types';
import { Action, ActionMeta } from 'redux-actions';

const {
  _REQUEST,
  // _PENDING,
  _FULFILLED,
  _REJECTED,
  _ABORTED,
} = getAsyncTypeConstants();

interface ICreateMockStoreOpts<TAction> {
  initialState?: any;
  asyncFlowOpts?: TCreateAsyncFlowMiddlewareOpts<TAction>;
}
const createMockStore = <TStoreState, TAction extends Action<any>>({ initialState, asyncFlowOpts }: ICreateMockStoreOpts<TAction> = {
  initialState: {},
}) => {
  return configureStore<any>([
    createAsyncFlowMiddleware<TStoreState, TAction>(asyncFlowOpts),
  ])(initialState);
};

describe('Middleware', () => {
  let mockStore: IStore<any>;
  beforeEach(() => {
    mockStore = createMockStore();
  });

  it('can be disabled, the action simply passes through', () => {
    const action: ActionMeta<{}, any> = {
      type: `ACTION${_REQUEST}`,
      meta: {
        [defaultOpts.metaKey]: {
          enable: false,
        } as IAsyncFlowActionMeta<any>,
      },
    };
    mockStore.dispatch(action);
    const actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(1);
    expect(actions[0])
      .toEqual(action);
  });

  it('actions that does not match suffix will pass through', () => {
    const action: Action<{}> = {
      type: 'ACTION',
    };
    mockStore.dispatch(action);
    const actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(1);
    expect(actions[0])
      .toEqual(action);
  });

  it('action with _REQUEST suffix will have _PENDING and _REQUEST dispatched', () => {
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    const actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(2);
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${_FULFILLED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    let actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(2);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();

    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${_FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value',
        },
      },
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(3);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeTruthy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeTruthy();
    expect(actions[2].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeTruthy();
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${_REJECTED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    let actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(2);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();

    const actionReject: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${_REJECTED}`,
      error: true,
      payload: new Error('Rejected!'),
    };
    mockStore.dispatch(actionReject);
    actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(3);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions[2].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${_ABORTED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    let actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(2);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isFulfilled())
      .toBeFalsy();

    const actionReject: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${_ABORTED}`,
      error: true,
      payload: new Error('Aborted!'),
    };
    mockStore.dispatch(actionReject);
    actions = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(3);
    expect(actions[0].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions[1].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions[2].meta[defaultOpts.metaKey].promise.isRejected())
      .toBeTruthy();
    expect(actions)
      .toMatchSnapshot();
  });
});

describe('Lets user set options', () => {
  it('metaKey', () => {
    const CUSTOM_META_KEY = 'Custom-Meta-Key';
    const mockStore = createMockStore({
      asyncFlowOpts: {
        metaKey: CUSTOM_META_KEY,
      },
    });
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    let actions = mockStore.getActions();
    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${_FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value',
        },
      },
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('metaKeyRequestID', () => {
    const CUSTOM_META_KEY_REQUEST_ID = 'Custom-Meta-REQUEST-ID-Key';
    const mockStore = createMockStore({
      asyncFlowOpts: {
        metaKeyRequestID: CUSTOM_META_KEY_REQUEST_ID,
      },
    });
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    let actions = mockStore.getActions();
    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${_FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value',
        },
      },
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('global request timeout', () => {
    const mockStore = createMockStore({
      asyncFlowOpts: {
        timeout: 5000,
      },
    });
    const action: Action<{}> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action);
    const actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('per request timeout', () => {
    const mockStore = createMockStore();
    const action: ActionMeta<{}, any> = {
      type: `ACTION${_REQUEST}`,
      meta: {
        [defaultOpts.metaKey]: {
          timeoutRequest: 2500,
        } as IAsyncFlowActionMeta<any>,
      },
    };
    mockStore.dispatch(action);
    const actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('generateId', () => {
    let idCounter = 2000;
    const mockStore = createMockStore({
      asyncFlowOpts: {
        generateId: ({ action }) => `${action.type}-${idCounter++}`,
      },
    });
    const action1: Action<any> = {
      type: `ACTION${_REQUEST}`,
    };
    const action2: Action<any> = {
      type: `ACTION${_REQUEST}`,
    };
    const action3: Action<any> = {
      type: `ACTION${_REQUEST}`,
    };
    mockStore.dispatch(action1);
    mockStore.dispatch(action2);
    mockStore.dispatch(action3);

    const actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });
});
