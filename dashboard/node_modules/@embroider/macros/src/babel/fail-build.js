"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_json_1 = __importDefault(require("./evaluate-json"));
const error_1 = __importDefault(require("./error"));
const util_1 = require("util");
function failBuild(path, visitor) {
    let args = path.get('arguments');
    if (args.length < 1) {
        throw error_1.default(path, `failBuild needs at least one argument`);
    }
    let argValues = args.map(a => evaluate(a, visitor));
    for (let i = 0; i < argValues.length; i++) {
        if (!argValues[i].confident) {
            throw error_1.default(args[i], `the arguments to failBuild must be statically known`);
        }
    }
    let [message, ...rest] = argValues;
    throw new Error(util_1.format(`failBuild: ${message.value}`, ...rest.map(r => r.value)));
}
exports.default = failBuild;
function evaluate(path, visitor) {
    let builtIn = path.evaluate();
    if (builtIn.confident) {
        return builtIn;
    }
    return evaluate_json_1.default(path, visitor);
}
//# sourceMappingURL=fail-build.js.map