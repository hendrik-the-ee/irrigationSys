"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@babel/types");
const core_1 = require("@babel/core");
const state_1 = require("./state");
const error_1 = __importDefault(require("./error"));
const evaluate_json_1 = require("./evaluate-json");
function getConfig(path, state, packageCache, own) {
    let packageName;
    if (own) {
        if (path.node.arguments.length !== 0) {
            throw error_1.default(path, `getOwnConfig takes zero arguments, you passed ${path.node.arguments.length}`);
        }
        packageName = undefined;
    }
    else {
        if (path.node.arguments.length !== 1) {
            throw error_1.default(path, `getConfig takes exactly one argument, you passed ${path.node.arguments.length}`);
        }
        let packageNode = path.node.arguments[0];
        if (packageNode.type !== 'StringLiteral') {
            throw error_1.default(evaluate_json_1.assertArray(path.get('arguments'))[0], `the argument to getConfig must be a string literal`);
        }
        packageName = packageNode.value;
    }
    let config;
    let pkg = targetPackage(state_1.sourceFile(path, state), packageName, packageCache);
    if (pkg) {
        config = state.opts.userConfigs[pkg.root];
    }
    path.replaceWith(literalConfig(config));
}
exports.default = getConfig;
function targetPackage(fromPath, packageName, packageCache) {
    let us = packageCache.ownerOfFile(fromPath);
    if (!us) {
        throw new Error(`unable to determine which npm package owns the file ${fromPath}`);
    }
    if (!packageName) {
        return us;
    }
    try {
        return packageCache.resolve(packageName, us);
    }
    catch (err) {
        return null;
    }
}
function literalConfig(config) {
    if (typeof config === 'undefined') {
        return types_1.identifier('undefined');
    }
    let ast = core_1.parse(`a(${JSON.stringify(config)})`, {});
    let statement = ast.program.body[0];
    let expression = statement.expression;
    return expression.arguments[0];
}
//# sourceMappingURL=get-config.js.map