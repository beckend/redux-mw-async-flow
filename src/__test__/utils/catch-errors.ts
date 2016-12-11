/* tslint:disable: no-invalid-this */
/**
 * In async tests, JEST will die (in watch mode) if an exception is thrown from a callback. This utility will catch
 * the errors instead and report the test as failed in these case *
 *
 * @param {jest.DoneCallback} done
 * @param {T} callback
 * @returns {T}
 */
export function catchErrors<T extends Function>(done: jest.DoneCallback, callback: T): T {
  return function () {
    try {
      callback.apply(this, arguments);
    } catch (e) {
      done.fail(e);
    }
  } as any as T;
}
