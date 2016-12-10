"use strict";
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
        resolve: resolve,
        reject: reject,
    };
};
//# sourceMappingURL=promise-factory.js.map