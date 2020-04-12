"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const macro_if_1 = require("./macro-if");
function failBuild(node) {
    if (node.params.length < 1) {
        throw new Error(`macroFailBuild requires at least one argument`);
    }
    let values = node.params.map(macro_if_1.evaluate);
    for (let i = 0; i < values.length; i++) {
        if (!values[i].confident) {
            throw new Error(`argument ${i} to macroFailBuild is not statically analyzable`);
        }
    }
    let [message, ...rest] = values;
    throw new Error(util_1.format(`failBuild: ${message.value}`, ...rest.map((r) => r.value)));
}
exports.failBuild = failBuild;
//# sourceMappingURL=fail-build.js.map