"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bluebird = require("bluebird");
exports.createPromise = function () {
    var resolve;
    var reject;
    var promise = new Bluebird(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    return {
        promise: promise,
        reject: reject,
        resolve: resolve,
    };
};
//# sourceMappingURL=promise-factory.js.map