"use strict";
var tslib_1 = require("tslib");
exports.defaultTypes = {
    REQUEST: '_REQUEST',
    PENDING: '_PENDING',
    FULFILLED: '_FULFILLED',
    REJECTED: '_REJECTED',
    ABORTED: '_ABORTED',
    END: '_END'
};
exports.getAsyncTypeConstants = function (_a) {
    var types = (_a === void 0 ? {} : _a).types;
    return (tslib_1.__assign({}, exports.defaultTypes, types));
};
exports.generateAsyncAction = function (_a) {
    var actionName = _a.actionName, _b = _a.types, types = _b === void 0 ? {} : _b;
    var _c = exports.getAsyncTypeConstants({ types: types }), REQUEST = _c.REQUEST, PENDING = _c.PENDING, FULFILLED = _c.FULFILLED, REJECTED = _c.REJECTED, ABORTED = _c.ABORTED, END = _c.END;
    var REQUEST_NAME = "" + actionName + REQUEST;
    var PENDING_NAME = "" + actionName + PENDING;
    var FULFILLED_NAME = "" + actionName + FULFILLED;
    var REJECTEDT_NAME = "" + actionName + REJECTED;
    var ABORTED_NAME = "" + actionName + ABORTED;
    var END_NAME = "" + actionName + END;
    return _d = {},
        _d[REQUEST_NAME] = REQUEST_NAME,
        _d[PENDING_NAME] = PENDING_NAME,
        _d[FULFILLED_NAME] = FULFILLED_NAME,
        _d[REJECTEDT_NAME] = REJECTEDT_NAME,
        _d[ABORTED_NAME] = ABORTED_NAME,
        _d[END_NAME] = END_NAME,
        _d;
    var _d;
};
exports.replaceSuffix = function (targetStr, suffixToReplace, replacementString) {
    return "" + targetStr.substring(0, targetStr.length - suffixToReplace.length) + replacementString;
};
//# sourceMappingURL=async-types.js.map