"use strict";
const tslib_1 = require("tslib");
exports.defaultTypes = {
    REQUEST: 'REQUEST',
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED',
    ABORTED: 'ABORTED',
};
exports.getAsyncTypeConstants = ({ types } = {}) => {
    const { REQUEST, PENDING, FULFILLED, REJECTED, ABORTED, } = tslib_1.__assign({}, exports.defaultTypes, types);
    return {
        _REQUEST: `_${REQUEST}`,
        _PENDING: `_${PENDING}`,
        _FULFILLED: `_${FULFILLED}`,
        _REJECTED: `_${REJECTED}`,
        _ABORTED: `_${ABORTED}`,
    };
};
//# sourceMappingURL=async-types.js.map