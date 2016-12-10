"use strict";
var tslib_1 = require("tslib");
exports.defaultTypes = {
    REQUEST: 'REQUEST',
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED',
    ABORTED: 'ABORTED',
};
exports.getAsyncTypeConstants = function (_a) {
    var types = (_a === void 0 ? {} : _a).types;
    var _b = tslib_1.__assign({}, exports.defaultTypes, types), REQUEST = _b.REQUEST, PENDING = _b.PENDING, FULFILLED = _b.FULFILLED, REJECTED = _b.REJECTED, ABORTED = _b.ABORTED;
    return {
        _REQUEST: "_" + REQUEST,
        _PENDING: "_" + PENDING,
        _FULFILLED: "_" + FULFILLED,
        _REJECTED: "_" + REJECTED,
        _ABORTED: "_" + ABORTED,
    };
};
//# sourceMappingURL=async-types.js.map