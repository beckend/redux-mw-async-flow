/**
 * Temporary operator until something official comes along
 */
import { Observable } from 'rxjs';
export declare function __invoke<TFn extends Function>(this: Observable<any>, fn: TFn, ...args: any[]): any;
