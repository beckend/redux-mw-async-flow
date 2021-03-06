"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        reject: reject,
        resolve: resolve,
    };
};
//# sourceMappingURL=promise-factory.js.map