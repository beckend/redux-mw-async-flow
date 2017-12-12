/**
 * Temporary operator until something official comes along
 */
import { Observable } from 'rxjs';

// tslint:disable-next-line: ban-types
export function __invoke<TFn extends Function>(this: Observable<any>, fn: TFn, ...args: any[]) {
  return fn.apply(this, args);
}
