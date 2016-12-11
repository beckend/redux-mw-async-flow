/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';
import { IAsyncFlowAction } from './create-middleware';
import { Observable } from 'rxjs/Observable';
export { Observable };
export interface IAsyncTypes {
    REQUEST: string;
    END: string;
}
export interface ICreateObserversArgs {
    asyncTypes: IAsyncTypes;
}
export declare const createObservers: ({asyncTypes}: ICreateObserversArgs) => {
    before: {
        rootSubject: Subject<IAsyncFlowAction<any>>;
        obsOnAll: Observable<IAsyncFlowAction<any>>;
        obsOnRequest: Observable<IAsyncFlowAction<any>>;
        obsOnEnd: Observable<IAsyncFlowAction<any>>;
    };
    after: {
        rootSubject: Subject<IAsyncFlowAction<any>>;
        obsOnAll: Observable<IAsyncFlowAction<any>>;
        obsOnRequest: Observable<IAsyncFlowAction<any>>;
        obsOnEnd: Observable<IAsyncFlowAction<any>>;
    };
};
