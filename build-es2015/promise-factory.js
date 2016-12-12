"use strict";
const Bluebird = require("bluebird");
exports.createPromise = () => {
    let resolve;
    let reject;
    const promise = new Bluebird((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
};
//# sourceMappingURL=promise-factory.js.map