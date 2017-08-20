import { Observable } from 'rxjs/Observable';
import { __invoke } from '../../operator/__invoke';

Observable.prototype.__invoke = __invoke;

declare module 'rxjs/Observable' {
  // tslint:disable-next-line: interface-name no-shadowed-variable
  interface Observable<T> {
    __invoke: typeof __invoke;
  }
}
