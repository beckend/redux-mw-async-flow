/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
import { Subject } from 'rxjs/Subject';
import '../rxjs/add/__invoke';
import { filter } from 'rxjs/operator/filter';
import { IAsyncFlowAction } from './create-middleware';
import { Observable } from 'rxjs/Observable';
export { Observable };

export interface IAsyncTypes {
  REQUEST: string;
  END: string;
}
export interface ICreateObserversArgs {
  // async constants
  asyncTypes: IAsyncTypes;
}
export const createObservers = ({ asyncTypes }: ICreateObserversArgs) => {
  const createAllObservers = () => {
    // Gets all the actions through the middleware
    const rootSubject = new Subject<IAsyncFlowAction<any>>();

    // lock out .next api etc
    const obsOnAll = rootSubject.asObservable();

    // filter by requests
    const obsOnRequest = obsOnAll
      .__invoke<Observable<IAsyncFlowAction<any>>>(filter, (action: IAsyncFlowAction<any>) => action.type.endsWith(asyncTypes.REQUEST));

    const obsOnEnd = obsOnAll
      .__invoke<Observable<IAsyncFlowAction<any>>>(filter, (action: IAsyncFlowAction<any>) => action.type.endsWith(asyncTypes.END));

    return {
      rootSubject,
      obsOnAll,
      obsOnRequest,
      obsOnEnd
    };
  };

  return {
    // before dispatch
    before: createAllObservers(),
    // after dispatch
    after: createAllObservers()
  };
};
