"use strict";
/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
const Subject_1 = require("rxjs/Subject");
require("../rxjs/add/__invoke");
const filter_1 = require("rxjs/operator/filter");
const Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
exports.createObservers = ({ asyncTypes }) => {
    const createAllObservers = () => {
        // Gets all the actions through the middleware
        const rootSubject = new Subject_1.Subject();
        // lock out .next api etc
        const obsOnAll = rootSubject.asObservable();
        // filter by requests
        const obsOnRequest = obsOnAll
            .__invoke(filter_1.filter, (action) => action.type.endsWith(asyncTypes.REQUEST));
        const obsOnEnd = obsOnAll
            .__invoke(filter_1.filter, (action) => action.type.endsWith(asyncTypes.END));
        return {
            rootSubject,
            obsOnAll,
            obsOnRequest,
            obsOnEnd
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