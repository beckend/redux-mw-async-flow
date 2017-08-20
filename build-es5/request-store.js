"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lGet = require("lodash.get");
exports.REQUEST_KEY_PROMISE = 'promise';
exports.REQUEST_KEY_RESOLVEFN = 'resolve';
exports.REQUEST_KEY_REJECTFN = 'reject';
var RequestStore = /** @class */ (function () {
    function RequestStore() {
        this.store = {};
    }
    RequestStore.prototype.add = function (keyName, payload) {
        this.store[keyName] = payload;
    };
    RequestStore.prototype.delete = function (keyName) {
        delete this.store[keyName];
    };
    RequestStore.prototype.get = function (keyName) {
        return this.store[keyName];
    };
    RequestStore.prototype.resolve = function (keyName, payload) {
        var promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_RESOLVEFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            // tslint:disable-next-line: no-console
            console.warn(keyName + " - was not found in request store and was not resolved.");
        }
    };
    RequestStore.prototype.reject = function (keyName, payload) {
        var promiseFn = lGet(this.store, [keyName, exports.REQUEST_KEY_REJECTFN]);
        if (promiseFn) {
            promiseFn(payload);
        }
        else {
            // tslint:disable-next-line: no-console
            console.warn(keyName + " - was not found in request store and was not rejected.");
        }
    };
    return RequestStore;
}());
exports.RequestStore = RequestStore;
//# sourceMappingURL=request-store.js.map