/* tslint:disable: chai-vague-errors */
/* tslint:disable: no-backbone-get-set-outside-model */
import { FifoXCache } from '../fifo-cache';

describe('FifoXCache', () => {
  it('extended class works as original', () => {
    const cache = new FifoXCache(2);
    cache.put('elwin', 1215);
    cache.put('leon', 1233);
    cache.put('tom', 1234);
    expect(cache.get('elwin')).toBeFalsy();
    expect(cache.get('leon')).toBeTruthy();
  });

  it('getAll added function works, returns unique keys', () => {
    const cache = new FifoXCache();
    cache.put('elwin', 1215);
    cache.put('leon', 1233);
    cache.put('tom', 1234);
    expect((cache.getAll()))
      .toMatchSnapshot();
  });
});
