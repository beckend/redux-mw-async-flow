"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
var Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
var filter_1 = require("rxjs/operator/filter");
var Subject_1 = require("rxjs/Subject");
require("../rxjs/add/__invoke");
exports.createObservers = function (_a) {
    var asyncTypes = _a.asyncTypes;
    var createAllObservers = function () {
        // Gets all the actions through the middleware
        var rootSubject = new Subject_1.Subject();
        // lock out .next api etc
        var obsOnAll = rootSubject.asObservable();
        // filter by requests
        var obsOnRequest = obsOnAll
            .__invoke(filter_1.filter, function (action) { return action.type.endsWith(asyncTypes.REQUEST); });
        var obsOnEnd = obsOnAll
            .__invoke(filter_1.filter, function (action) { return action.type.endsWith(asyncTypes.END); });
        return {
            obsOnAll: obsOnAll,
            obsOnEnd: obsOnEnd,
            obsOnRequest: obsOnRequest,
            rootSubject: rootSubject,
        };
    };
    return {
        // after dispatch
        after: createAllObservers(),
        // before dispatch
        before: createAllObservers(),
    };
};
//# sourceMappingURL=middleware-observers.js.map