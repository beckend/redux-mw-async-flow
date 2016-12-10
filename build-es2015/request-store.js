"use strict";
exports.REQUEST_KEY_PROMISE = 'promise';
exports.REQUEST_KEY_RESOLVEFN = 'resolve';
exports.REQUEST_KEY_REJECTFN = 'reject';
const lGet = require('lodash.get');
class RequestStore {
    constructor() {
        this.store = {};
    }
    add(keyName, payload) {
        this.store[keyName] = payload;
    }
    delete(keyName) {
        delete this.store[keyName];
    }
    resolve(keyName, payload) {
        const promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_RESOLVEFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            console.warn(`${keyName} - was not found in request store and was not resolved.`);
        }
    }
    reject(keyName, payload) {
        const promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_REJECTFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            console.warn(`${keyName} - was not found in request store and was not rejected.`);
        }
    }
}
exports.RequestStore = RequestStore;
//# sourceMappingURL=request-store.js.map