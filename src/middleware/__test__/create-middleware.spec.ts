/* tslint:disable: chai-vague-errors */
/* tslint:disable: max-line-length */
/* tslint:disable: no-increment-decrement */
/* tslint:disable: max-func-body-length */
// import { createStore, applyMiddleware } from 'redux';
import configureStore, { IStore } from 'redux-mock-store';
import {
  createAsyncFlowMiddleware,
  defaultOpts,
  TCreateAsyncFlowMiddlewareOpts,
  TAsyncFlowActionMetaOptional,
  IAsyncFlowAction
} from '../create-middleware';
import { getAsyncTypeConstants } from '../../async-types';
import { Action, ActionMeta } from 'redux-actions';
import { createPromise } from '../../promise-factory';
import * as Bluebird from 'bluebird';

const {
  REQUEST,
  // PENDING,
  FULFILLED,
  REJECTED,
  ABORTED,
  END
} = getAsyncTypeConstants();

interface ICreateMockStoreOpts<TAction> {
  initialState?: any;
  asyncFlowOpts?: TCreateAsyncFlowMiddlewareOpts<TAction>;
}
const createMockStore = <TStoreState, TAction extends Action<any>>({ initialState, asyncFlowOpts }: ICreateMockStoreOpts<TAction> = {
  initialState: {}
}) => {
  const asyncFlowPayload = createAsyncFlowMiddleware<TStoreState, TAction>(asyncFlowOpts);
  const mockStore = configureStore<any>([
    asyncFlowPayload.middleware
  ])(initialState);

  return {
    mockStore,
    observers: asyncFlowPayload.observers
  };
};

describe('Middleware', () => {
  let mockStore: IStore<any>;
  beforeEach(() => {
    mockStore = createMockStore().mockStore;
  });

  it('can be disabled, the action simply passes through', () => {
    const action: ActionMeta<{}, any> = {
      type: `ACTION${REQUEST}`,
      meta: {
        [defaultOpts.metaKey]: {
          enable: false
        } as TAsyncFlowActionMetaOptional<{}>
      }
    };
    mockStore.dispatch(action);
    const actions: IAsyncFlowAction<{}>[] = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('actions that does not match suffix will pass through', () => {
    mockStore.dispatch({
      type: 'ACTION'
    } as Action<{}>);
    const actions: IAsyncFlowAction<{}>[] = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('warns you when you exclude meta from payload', () => {
    const originalConsoleWarn = console.warn;
    console.warn = (str: any) => {
      expect(typeof str === 'string')
        .toBeTruthy();
    };
    mockStore.dispatch({
      type: `ACTION${REQUEST}`
    } as Action<{}>);
    mockStore.dispatch({
      type: `ACTION${FULFILLED}`
    } as Action<{}>);
    console.warn = originalConsoleWarn;
  });

  it('action with REQUEST suffix will have PENDING and REQUEST dispatched', () => {
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    const actions: IAsyncFlowAction<{}>[] = mockStore.getActions();
    (expect as any)(actions)
      .toHaveLength(2);
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${FULFILLED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    let actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isFulfilled())
        .toBeFalsy();
    });
    expect(actions)
      .toMatchSnapshot();
    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value'
        }
      }
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isFulfilled())
        .toBeTruthy();
    });
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${REJECTED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    let actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isFulfilled())
        .toBeFalsy();
    });
    expect(actions)
      .toMatchSnapshot();
    const actionReject: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${REJECTED}`,
      error: true,
      payload: new Error('Rejected!')
    };
    mockStore.dispatch(actionReject);
    actions = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isRejected())
        .toBeTruthy();
    });
    expect(actions)
      .toMatchSnapshot();
  });

  it(`handle ${ABORTED} correctly with payload`, () => {
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    let actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isFulfilled())
        .toBeFalsy();
    });
    expect(actions)
      .toMatchSnapshot();
    const actionReject: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${ABORTED}`,
      error: true,
      payload: new Error('Aborted!')
    };
    mockStore.dispatch(actionReject);
    actions = mockStore.getActions();
    actions.forEach((asyncAction) => {
      expect(asyncAction.meta.asyncFlow.promise.isRejected())
        .toBeTruthy();
    });
    expect(actions)
      .toMatchSnapshot();
  });
});

describe('Lets user set options', () => {
  it('asyncTypes', () => {
    const asyncTypes = {
      REQUEST: '-request-suffix',
      PENDING: '-pending-SUFF',
      FULFILLED: 'fulfilledsuFf',
      REJECTED: '____rejected___-',
      ABORTED: '--__aborted-ab'
    };
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        asyncTypes
      }
    });
    const generatedTypes = getAsyncTypeConstants({ types: asyncTypes });
    let actions: IAsyncFlowAction<any>[];

    mockStore.dispatch({
      type: `ACTION_one${generatedTypes.REQUEST}`
    });
    actions = mockStore.getActions();
    mockStore.dispatch({
      ...actions[actions.length - 1],
      type: `ACTION_one${generatedTypes.FULFILLED}`,
      payload: 'fullfilled!'
    });

    mockStore.dispatch({
      type: `ACTION_two${generatedTypes.REQUEST}`
    });
    actions = mockStore.getActions();
    mockStore.dispatch({
      ...actions[actions.length - 1],
      type: `ACTION_two${generatedTypes.REJECTED}`,
      error: true,
      payload: new Error('rejected!')
    });

    mockStore.dispatch({
      type: `ACTION_three${generatedTypes.REQUEST}`
    });
    actions = mockStore.getActions();
    mockStore.dispatch({
      ...actions[actions.length - 1],
      type: `ACTION_three${generatedTypes.ABORTED}`,
      error: true,
      payload: new Error('aborted!')
    });

    actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('metaKey', () => {
    const CUSTOM_META_KEY = 'Custom-Meta-Key';
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        metaKey: CUSTOM_META_KEY
      }
    });
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    let actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value'
        }
      }
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('metaKeyRequestID', () => {
    const CUSTOM_META_KEYREQUEST_ID = 'Custom-Meta-REQUEST-ID-Key';
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        metaKeyRequestID: CUSTOM_META_KEYREQUEST_ID
      }
    });
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    let actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    const actionFullfill: ActionMeta<any, any> = {
      ...actions[0],
      type: `ACTION${FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value'
        }
      }
    };
    mockStore.dispatch(actionFullfill);
    actions = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('global request timeout', () => {
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        timeout: 5000
      }
    });
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    const actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('per request timeout', () => {
    const { mockStore } = createMockStore();
    const action: ActionMeta<{}, any> = {
      type: `ACTION${REQUEST}`,
      meta: {
        [defaultOpts.metaKey]: {
          timeoutRequest: 2500
        } as TAsyncFlowActionMetaOptional<any>
      }
    };
    mockStore.dispatch(action);
    const actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });

  it('generateId', () => {
    let idCounter = 2000;
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        generateId: ({ action }) => `${action.type}-${idCounter++}`
      }
    });
    const action1: Action<any> = {
      type: `ACTION${REQUEST}`
    };
    const action2: Action<any> = {
      type: `ACTION${REQUEST}`
    };
    const action3: Action<any> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action1);
    mockStore.dispatch(action2);
    mockStore.dispatch(action3);

    const actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    expect(actions)
      .toMatchSnapshot();
  });
});

describe('Middleware observers', () => {
  it('works as expected', async () => {
    const { mockStore, observers } = createMockStore();
    const actionRequest = `ACTION${REQUEST}`;
    const actionEnd = `ACTION${END}`;

    const allJobs: Bluebird<any>[] = [];

    // before.obsOnAll
    const { promise: beforeOnAllP, resolve: beforeOnAllResolve } = createPromise();
    allJobs.push(beforeOnAllP);
    const beforeOnAllActions: IAsyncFlowAction<any>[] = [];
    observers.before.obsOnAll.subscribe((action) => {
      beforeOnAllActions.push(action);
      if (action.type === actionEnd) {
        beforeOnAllResolve();
      }
    });

    // after.obsOnAll
    const { promise: afterOnAllP, resolve: afterOnAllResolve } = createPromise();
    allJobs.push(afterOnAllP);
    const afterOnAllActions: IAsyncFlowAction<any>[] = [];
    observers.after.obsOnAll.subscribe((action) => {
      afterOnAllActions.push(action);
      if (action.type === actionEnd) {
        afterOnAllResolve();
      }
    });

    // before.obsOnRequest
    const { promise: beforeOnRequestP, resolve: beforeOnRequestResolve } = createPromise();
    allJobs.push(beforeOnRequestP);
    const beforeOnRequestActions: IAsyncFlowAction<any>[] = [];
    observers.before.obsOnRequest.subscribe((action) => {
      beforeOnRequestActions.push(action);
      if (action.type === actionRequest) {
        beforeOnRequestResolve();
      }
    });

    // after.obsOnRequest
    const { promise: afterOnRequestP, resolve: afterOnRequestResolve } = createPromise();
    allJobs.push(afterOnRequestP);
    const afterOnRequestActions: IAsyncFlowAction<any>[] = [];
    observers.after.obsOnRequest.subscribe((action) => {
      afterOnRequestActions.push(action);
      if (action.type === actionRequest) {
        afterOnRequestResolve();
      }
    });

    // before.obsOnEnd
    const { promise: beforeOnEndP, resolve: beforeOnEndResolve } = createPromise();
    allJobs.push(beforeOnEndP);
    const beforeOnEndActions: IAsyncFlowAction<any>[] = [];
    observers.before.obsOnEnd.subscribe((action) => {
      beforeOnEndActions.push(action);
      if (action.type === actionEnd) {
        beforeOnEndResolve();
      }
    });

    // after.obsOnEnd
    const { promise: afterOnEndP, resolve: afterOnEndResolve } = createPromise();
    allJobs.push(afterOnEndP);
    const afterOnEndActions: IAsyncFlowAction<any>[] = [];
    observers.after.obsOnEnd.subscribe((action) => {
      afterOnEndActions.push(action);
      if (action.type === actionEnd) {
        afterOnEndResolve();
      }
    });

    // Trigger everything to action
    mockStore.dispatch({
      type: actionRequest
    });
    const actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    mockStore.dispatch({
      ...actions[0],
      type: `ACTION${FULFILLED}`,
      payload: {
        data: 1,
        more_data: [1, 2, 3],
        even_more_data: {
          key: 'value'
        }
      }
    });

    await Bluebird.all(allJobs);

    expect(beforeOnAllActions)
      .toMatchSnapshot();
    expect(afterOnAllActions)
      .toMatchSnapshot();
    expect(beforeOnRequestActions)
      .toMatchSnapshot();
    expect(afterOnRequestActions)
      .toMatchSnapshot();
    expect(beforeOnEndActions)
      .toMatchSnapshot();
    expect(afterOnEndActions)
      .toMatchSnapshot();
  });
});

describe('Middleware error handling', () => {
  it('when a promise times out', async () => {
    const { mockStore } = createMockStore({
      asyncFlowOpts: {
        timeout: 1
      }
    });
    const action: Action<{}> = {
      type: `ACTION${REQUEST}`
    };
    mockStore.dispatch(action);
    const actions: IAsyncFlowAction<any>[] = mockStore.getActions();
    const lastAction = actions.slice(-1).pop();
    if (lastAction) {
      try {
        await lastAction.meta.asyncFlow.promise;
      } catch (er) {
        expect(er)
          .toBeInstanceOf(Bluebird.TimeoutError);
      }
    }
  });
});
