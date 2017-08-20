"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTypes = {
    ABORTED: '_ABORTED',
    END: '_END',
    FULFILLED: '_FULFILLED',
    PENDING: '_PENDING',
    REJECTED: '_REJECTED',
    REQUEST: '_REQUEST',
};
exports.getAsyncTypeConstants = ({ types } = {}) => (Object.assign({}, exports.defaultTypes, types));
exports.generateAsyncAction = ({ actionName, types = {} }) => {
    const { ABORTED, END, FULFILLED, PENDING, REJECTED, REQUEST, } = exports.getAsyncTypeConstants({ types });
    const ABORTED_NAME = `${actionName}${ABORTED}`;
    const END_NAME = `${actionName}${END}`;
    const FULFILLED_NAME = `${actionName}${FULFILLED}`;
    const PENDING_NAME = `${actionName}${PENDING}`;
    const REJECTEDT_NAME = `${actionName}${REJECTED}`;
    const REQUEST_NAME = `${actionName}${REQUEST}`;
    return {
        [ABORTED_NAME]: ABORTED_NAME,
        [END_NAME]: END_NAME,
        [FULFILLED_NAME]: FULFILLED_NAME,
        [PENDING_NAME]: PENDING_NAME,
        [REJECTEDT_NAME]: REJECTEDT_NAME,
        [REQUEST_NAME]: REQUEST_NAME,
    };
};
exports.replaceSuffix = (targetStr, suffixToReplace, replacementString) => `${targetStr.substring(0, targetStr.length - suffixToReplace.length)}${replacementString}`;
//# sourceMappingURL=async-types.js.map