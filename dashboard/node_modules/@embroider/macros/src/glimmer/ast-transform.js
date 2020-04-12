"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const literal_1 = __importDefault(require("./literal"));
const get_config_1 = __importDefault(require("./get-config"));
const dependency_satisfies_1 = __importDefault(require("./dependency-satisfies"));
const macro_if_1 = require("./macro-if");
const fail_build_1 = require("./fail-build");
function makeFirstTransform(opts) {
    function embroiderFirstMacrosTransform(env) {
        let scopeStack = [];
        return {
            name: '@embroider/macros/first',
            visitor: {
                Program: {
                    enter(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.push(node.blockParams);
                        }
                    },
                    exit(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.pop();
                        }
                    },
                },
                SubExpression(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroGetOwnConfig') {
                        return literal_1.default(get_config_1.default(node, opts.userConfigs, opts.baseDir, env.meta.moduleName, true), env.syntax.builders);
                    }
                    if (node.path.original === 'macroGetConfig') {
                        return literal_1.default(get_config_1.default(node, opts.userConfigs, opts.baseDir, env.meta.moduleName, false), env.syntax.builders);
                    }
                    if (node.path.original === 'macroDependencySatisfies') {
                        return literal_1.default(dependency_satisfies_1.default(node, opts.baseDir, env.meta.moduleName), env.syntax.builders);
                    }
                },
                MustacheStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroGetOwnConfig') {
                        return env.syntax.builders.mustache(literal_1.default(get_config_1.default(node, opts.userConfigs, opts.baseDir, env.meta.moduleName, true), env.syntax.builders));
                    }
                    if (node.path.original === 'macroGetConfig') {
                        return env.syntax.builders.mustache(literal_1.default(get_config_1.default(node, opts.userConfigs, opts.baseDir, env.meta.moduleName, false), env.syntax.builders));
                    }
                    if (node.path.original === 'macroDependencySatisfies') {
                        return env.syntax.builders.mustache(literal_1.default(dependency_satisfies_1.default(node, opts.baseDir, env.meta.moduleName), env.syntax.builders));
                    }
                },
            },
        };
    }
    embroiderFirstMacrosTransform.embroiderMacrosASTMarker = true;
    embroiderFirstMacrosTransform.parallelBabel = {
        requireFile: __filename,
        buildUsing: 'makeFirstTransform',
        get params() {
            return {
                userConfigs: opts.userConfigs,
                baseDir: opts.baseDir,
            };
        },
    };
    return embroiderFirstMacrosTransform;
}
exports.makeFirstTransform = makeFirstTransform;
function makeSecondTransform() {
    function embroiderSecondMacrosTransform(env) {
        let scopeStack = [];
        return {
            name: '@embroider/macros/second',
            visitor: {
                Program: {
                    enter(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.push(node.blockParams);
                        }
                    },
                    exit(node) {
                        if (node.blockParams.length > 0) {
                            scopeStack.pop();
                        }
                    },
                },
                BlockStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroIf') {
                        return macro_if_1.macroIfBlock(node);
                    }
                },
                SubExpression(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroIf') {
                        return macro_if_1.macroIfExpression(node, env.syntax.builders);
                    }
                    if (node.path.original === 'macroFailBuild') {
                        fail_build_1.failBuild(node);
                    }
                },
                ElementNode(node) {
                    node.modifiers = node.modifiers.filter((modifier) => {
                        if (modifier.path.type !== 'PathExpression') {
                            return true;
                        }
                        if (inScope(scopeStack, modifier.path.parts[0])) {
                            return true;
                        }
                        if (modifier.path.original === 'macroMaybeAttrs') {
                            macro_if_1.maybeAttrs(node, modifier, env.syntax.builders);
                        }
                        else {
                            return true;
                        }
                    });
                },
                MustacheStatement(node) {
                    if (node.path.type !== 'PathExpression') {
                        return;
                    }
                    if (inScope(scopeStack, node.path.parts[0])) {
                        return;
                    }
                    if (node.path.original === 'macroIf') {
                        return env.syntax.builders.mustache(macro_if_1.macroIfExpression(node, env.syntax.builders));
                    }
                    if (node.path.original === 'macroFailBuild') {
                        fail_build_1.failBuild(node);
                    }
                },
            },
        };
    }
    embroiderSecondMacrosTransform.embroiderMacrosASTMarker = true;
    embroiderSecondMacrosTransform.parallelBabel = {
        requireFile: __filename,
        buildUsing: 'makeSecondTransform',
        params: undefined,
    };
    return embroiderSecondMacrosTransform;
}
exports.makeSecondTransform = makeSecondTransform;
function inScope(scopeStack, name) {
    for (let scope of scopeStack) {
        if (scope.includes(name)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=ast-transform.js.map