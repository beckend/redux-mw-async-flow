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
exports.generateAsyncAction = ({ actionName, types = {} }) => {
    const { REQUEST, PENDING, FULFILLED, REJECTED, ABORTED, END } = exports.getAsyncTypeConstants({ types });
    const REQUEST_NAME = `${actionName}${REQUEST}`;
    const PENDING_NAME = `${actionName}${PENDING}`;
    const FULFILLED_NAME = `${actionName}${FULFILLED}`;
    const REJECTEDT_NAME = `${actionName}${REJECTED}`;
    const ABORTED_NAME = `${actionName}${ABORTED}`;
    const END_NAME = `${actionName}${END}`;
    return {
        [REQUEST_NAME]: REQUEST_NAME,
        [PENDING_NAME]: PENDING_NAME,
        [FULFILLED_NAME]: FULFILLED_NAME,
        [REJECTEDT_NAME]: REJECTEDT_NAME,
        [ABORTED_NAME]: ABORTED_NAME,
        [END_NAME]: END_NAME
    };
};
exports.replaceSuffix = (targetStr, suffixToReplace, replacementString) => `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
//# sourceMappingURL=async-types.js.map