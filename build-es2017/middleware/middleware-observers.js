"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rxjs observers only triggered when the async action is matched/enabled
 */
const Observable_1 = require("rxjs/Observable");
exports.Observable = Observable_1.Observable;
const operators_1 = require("rxjs/operators");
const Subject_1 = require("rxjs/Subject");
exports.createObservers = ({ asyncTypes }) => {
    const createAllObservers = () => {
        // Gets all the actions through the middleware
        const rootSubject = new Subject_1.Subject();
        // lock out .next api etc
        const obsOnAll = rootSubject.asObservable();
        // filter by requests
        const obsOnRequest = obsOnAll
            .pipe(operators_1.filter((action) => action.type.endsWith(asyncTypes.REQUEST)));
        const obsOnEnd = obsOnAll
            .pipe(operators_1.filter((action) => action.type.endsWith(asyncTypes.END)));
        return {
            obsOnAll,
            obsOnEnd,
            obsOnRequest,
            rootSubject,
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