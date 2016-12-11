"use strict";
var tslib_1 = require("tslib");
exports.defaultTypes = {
    REQUEST: '_REQUEST',
    PENDING: '_PENDING',
    FULFILLED: '_FULFILLED',
    REJECTED: '_REJECTED',
    ABORTED: '_ABORTED',
    END: '_END',
};
exports.getAsyncTypeConstants = function (_a) {
    var types = (_a === void 0 ? {} : _a).types;
    return (tslib_1.__assign({}, exports.defaultTypes, types));
};
exports.replaceSuffix = function (targetStr, suffixToReplace, replacementString) {
    return "" + targetStr.substring(0, targetStr.length - suffixToReplace.length) + replacementString;
};
exports.getMetaResult = function (types, overrides) {
    return (tslib_1.__assign((_a = {}, _a[types.PENDING] = false, _a[types.FULFILLED] = false, _a[types.REJECTED] = false, _a[types.END] = false, _a.PAYLOAD = null, _a.ERROR = null, _a), overrides));
    var _a;
};
//# sourceMappingURL=async-types.js.map