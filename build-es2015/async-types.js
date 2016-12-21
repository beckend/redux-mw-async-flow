"use strict";
const tslib_1 = require("tslib");
exports.defaultTypes = {
    REQUEST: '_REQUEST',
    PENDING: '_PENDING',
    FULFILLED: '_FULFILLED',
    REJECTED: '_REJECTED',
    ABORTED: '_ABORTED',
    END: '_END'
};
exports.getAsyncTypeConstants = ({ types } = {}) => (tslib_1.__assign({}, exports.defaultTypes, types));
exports.replaceSuffix = (targetStr, suffixToReplace, replacementString) => `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
//# sourceMappingURL=async-types.js.map