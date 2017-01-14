"use strict";
/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
var Subject_1 = require("rxjs/Subject");
require("../rxjs/add/__invoke");
var filter_1 = require("rxjs/operator/filter");
var Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
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
            rootSubject: rootSubject,
            obsOnAll: obsOnAll,
            obsOnRequest: obsOnRequest,
            obsOnEnd: obsOnEnd
        };
    };
    return {
        // before dispatch
        before: createAllObservers(),
        // after dispatch
        after: createAllObservers()
    };
};
//# sourceMappingURL=middleware-observers.js.map