"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lGet = require("lodash.get");
exports.REQUEST_KEY_PROMISE = 'promise';
exports.REQUEST_KEY_RESOLVEFN = 'resolve';
exports.REQUEST_KEY_REJECTFN = 'reject';
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
    get(keyName) {
        return this.store[keyName];
    }
    resolve(keyName, payload) {
        const promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_RESOLVEFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            // tslint:disable-next-line: no-console
            console.warn(`${keyName} - was not found in request store and was not resolved.`);
        }
    }
    reject(keyName, payload) {
        const promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_REJECTFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            // tslint:disable-next-line: no-console
            console.warn(`${keyName} - was not found in request store and was not rejected.`);
        }
    }
}
exports.RequestStore = RequestStore;
//# sourceMappingURL=request-store.js.map