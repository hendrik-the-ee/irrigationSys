"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function optionsWithDefaults(options) {
    let defaults = {
        staticHelpers: false,
        staticComponents: false,
        packageRules: [],
        splitAtRoutes: [],
        splitControllers: false,
        splitRouteClasses: false,
        skipBabel: [],
    };
    if (options) {
        return Object.assign(defaults, options);
    }
    return defaults;
}
exports.optionsWithDefaults = optionsWithDefaults;
//# sourceMappingURL=options.js.map