"use strict";
/* Macro Type Signatures */
Object.defineProperty(exports, "__esModule", { value: true });
// These are the macros you can use from your code. They have these stub
// implementations here so that their types work out correctly. Their real
// implementations are done in babel of course.
function dependencySatisfies(packageName, semverRange) {
    throw new Oops(packageName, semverRange);
}
exports.dependencySatisfies = dependencySatisfies;
function macroIf(predicate, consequent, alternate) {
    throw new Oops(predicate, consequent, alternate);
}
exports.macroIf = macroIf;
function getConfig(packageName) {
    throw new Oops(packageName);
}
exports.getConfig = getConfig;
function getOwnConfig() {
    throw new Oops();
}
exports.getOwnConfig = getOwnConfig;
function failBuild(message) {
    throw new Oops(message);
}
exports.failBuild = failBuild;
class Oops extends Error {
    constructor(...params) {
        super(`this method is really implemented at compile time via a babel plugin. If you're seeing this exception, something went wrong`);
        this.params = params;
    }
}
// Entrypoint for managing the macro config within Node.
var macros_config_1 = require("./macros-config");
exports.MacrosConfig = macros_config_1.default;
function isEmbroiderMacrosPlugin(item) {
    return ((Array.isArray(item) &&
        item.length > 1 &&
        item[1] &&
        typeof item[1] === 'object' &&
        item[1].embroiderMacrosConfigMarker) ||
        (item && typeof item === 'function' && item.embroiderMacrosASTMarker));
}
exports.isEmbroiderMacrosPlugin = isEmbroiderMacrosPlugin;
//# sourceMappingURL=index.js.map