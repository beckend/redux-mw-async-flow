import { __invoke } from '../../operator/__invoke';
declare module 'rxjs/Observable' {
    interface Observable<T> {
        __invoke: typeof __invoke;
    }
}
