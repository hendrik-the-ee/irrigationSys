"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_json_1 = __importDefault(require("./evaluate-json"));
const types_1 = require("@babel/types");
const error_1 = __importDefault(require("./error"));
function macroIf(path, state, visitor) {
    let args = path.get('arguments');
    if (args.length !== 2 && args.length !== 3) {
        throw error_1.default(path, `macroIf takes two or three arguments, you passed ${args.length}`);
    }
    let [predicatePath, consequent, alternate] = args;
    let predicate = evaluate(predicatePath, visitor);
    if (!predicate.confident) {
        throw error_1.default(args[0], `the first argument to macroIf must be statically known`);
    }
    if (!consequent.isArrowFunctionExpression()) {
        throw error_1.default(args[1], `The second argument to macroIf must be an arrow function expression.`);
    }
    if (alternate && !alternate.isArrowFunctionExpression()) {
        throw error_1.default(args[2], `The third argument to macroIf must be an arrow function expression.`);
    }
    state.removed.push(path.get('callee'));
    let [kept, dropped] = predicate.value ? [consequent, alternate] : [alternate, consequent];
    if (kept) {
        let body = kept.get('body');
        if (body.type === 'BlockStatement') {
            path.replaceWith(types_1.callExpression(kept.node, []));
        }
        else {
            path.replaceWith(body);
        }
    }
    else {
        path.remove();
    }
    if (dropped) {
        state.removed.push(dropped);
    }
}
exports.default = macroIf;
function evaluate(path, visitor) {
    let builtIn = path.evaluate();
    if (builtIn.confident) {
        return builtIn;
    }
    // we can go further than babel's evaluate() because we know that we're
    // typically used on JSON, not full Javascript.
    return evaluate_json_1.default(path, visitor);
}
//# sourceMappingURL=macro-if.js.map