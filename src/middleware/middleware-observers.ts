/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
import { Observable } from 'rxjs/Observable';
import { filter } from 'rxjs/operator/filter';
import { Subject } from 'rxjs/Subject';
import '../rxjs/add/__invoke';
import { IAsyncFlowAction } from './create-middleware';
export { Observable };

export interface IAsyncTypes {
  readonly REQUEST: string;
  readonly END: string;
}
export interface ICreateObserversArgs {
  // async constants
  readonly asyncTypes: IAsyncTypes;
}
export const createObservers = ({ asyncTypes }: ICreateObserversArgs) => {
  const createAllObservers = () => {
    // Gets all the actions through the middleware
    const rootSubject = new Subject<IAsyncFlowAction<any>>();

    // lock out .next api etc
    const obsOnAll = rootSubject.asObservable();

    // filter by requests
    const obsOnRequest: Observable<IAsyncFlowAction<any>> = obsOnAll
      .__invoke(
        filter, (action: IAsyncFlowAction<any>) => action.type.endsWith(asyncTypes.REQUEST)
      );

    const obsOnEnd: Observable<IAsyncFlowAction<any>> = obsOnAll
      .__invoke(
        filter, (action: IAsyncFlowAction<any>) => action.type.endsWith(asyncTypes.END)
      );

    return {
      obsOnAll,
      obsOnEnd,
      obsOnRequest,
      rootSubject,
    };
  };

  return {
    // after dispatch
    after: createAllObservers(),
    // before dispatch
    before: createAllObservers(),
  };
};
