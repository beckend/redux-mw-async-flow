"use strict";
/* tslint:disable: variable-name */
/* tslint:disable: no-reserved-keywords */
/**
 * Need a function to get from the Map which returns an object key valued
 * Haxx type the module since none exists
 */
const { FifoXCache: FifoXCacheOriginal } = require('x-cache');
exports.FifoXCacheOriginalClass = FifoXCacheOriginal;
class FifoXCache extends exports.FifoXCacheOriginalClass {
    constructor(...args) {
        super(...args);
    }
    getAll() {
        let entry = this.tail;
        const returned = {};
        while (entry) {
            returned[entry.key] = entry.value;
            entry = entry.older;
        }
        return returned;
    }
}
exports.FifoXCache = FifoXCache;
//# sourceMappingURL=fifo-cache.js.map