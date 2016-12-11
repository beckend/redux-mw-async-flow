"use strict";
var tslib_1 = require("tslib");
/* tslint:disable: variable-name */
/* tslint:disable: no-reserved-keywords */
/**
 * Need a function to get from the Map which returns an object key valued
 * Haxx type the module since none exists
 */
var FifoXCacheOriginal = require('x-cache').FifoXCache;
exports.FifoXCacheOriginalClass = FifoXCacheOriginal;
var FifoXCache = (function (_super) {
    tslib_1.__extends(FifoXCache, _super);
    function FifoXCache() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.apply(this, args) || this;
    }
    FifoXCache.prototype.getAll = function () {
        var entry = this.tail;
        var returned = {};
        while (entry) {
            returned[entry.key] = entry.value;
            entry = entry.older;
        }
        return returned;
    };
    return FifoXCache;
}(exports.FifoXCacheOriginalClass));
exports.FifoXCache = FifoXCache;
//# sourceMappingURL=fifo-cache.js.map