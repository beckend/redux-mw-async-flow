/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IAsyncFlowAction } from './create-middleware';
export { Observable };
export interface IAsyncTypes {
    readonly REQUEST: string;
    readonly END: string;
}
export interface ICreateObserversArgs {
    readonly asyncTypes: IAsyncTypes;
}
export declare const createObservers: ({asyncTypes}: ICreateObserversArgs) => {
    after: {
        obsOnAll: Observable<IAsyncFlowAction<any>>;
        obsOnEnd: Observable<IAsyncFlowAction<any>>;
        obsOnRequest: Observable<IAsyncFlowAction<any>>;
        rootSubject: Subject<IAsyncFlowAction<any>>;
    };
    before: {
        obsOnAll: Observable<IAsyncFlowAction<any>>;
        obsOnEnd: Observable<IAsyncFlowAction<any>>;
        obsOnRequest: Observable<IAsyncFlowAction<any>>;
        rootSubject: Subject<IAsyncFlowAction<any>>;
    };
};
