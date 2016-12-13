/* tslint:disable: no-invalid-this */
/* tslint:disable: function-name */
/**
 * Temporary operator until something official comes along
 */
export function __invoke<TReturn>(fn: any, ...args: any[]): TReturn {
  return fn.apply(this, args);
}
