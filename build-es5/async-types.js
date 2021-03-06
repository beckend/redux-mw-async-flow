"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
exports.defaultTypes = {
    ABORTED: '_ABORTED',
    END: '_END',
    FULFILLED: '_FULFILLED',
    PENDING: '_PENDING',
    REJECTED: '_REJECTED',
    REQUEST: '_REQUEST',
};
exports.getAsyncTypeConstants = function (_a) {
    var types = (_a === void 0 ? {} : _a).types;
    return (tslib_1.__assign({}, exports.defaultTypes, types));
};
exports.generateAsyncAction = function (_a) {
    var actionName = _a.actionName, _b = _a.types, types = _b === void 0 ? {} : _b;
    var _c = exports.getAsyncTypeConstants({ types: types }), ABORTED = _c.ABORTED, END = _c.END, FULFILLED = _c.FULFILLED, PENDING = _c.PENDING, REJECTED = _c.REJECTED, REQUEST = _c.REQUEST;
    var ABORTED_NAME = "" + actionName + ABORTED;
    var END_NAME = "" + actionName + END;
    var FULFILLED_NAME = "" + actionName + FULFILLED;
    var PENDING_NAME = "" + actionName + PENDING;
    var REJECTEDT_NAME = "" + actionName + REJECTED;
    var REQUEST_NAME = "" + actionName + REQUEST;
    return _d = {},
        _d[ABORTED_NAME] = ABORTED_NAME,
        _d[END_NAME] = END_NAME,
        _d[FULFILLED_NAME] = FULFILLED_NAME,
        _d[PENDING_NAME] = PENDING_NAME,
        _d[REJECTEDT_NAME] = REJECTEDT_NAME,
        _d[REQUEST_NAME] = REQUEST_NAME,
        _d;
    var _d;
};
exports.replaceSuffix = function (targetStr, suffixToReplace, replacementString) {
    return "" + targetStr.substring(0, targetStr.length - suffixToReplace.length) + replacementString;
};
//# sourceMappingURL=async-types.js.map