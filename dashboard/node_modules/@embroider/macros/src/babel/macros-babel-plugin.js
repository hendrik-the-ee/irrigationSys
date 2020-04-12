"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@babel/types");
const core_1 = require("@embroider/core");
const dependency_satisfies_1 = __importDefault(require("./dependency-satisfies"));
const get_config_1 = __importDefault(require("./get-config"));
const macro_if_1 = __importDefault(require("./macro-if"));
const error_1 = __importDefault(require("./error"));
const fail_build_1 = __importDefault(require("./fail-build"));
const visitor_1 = require("./visitor");
const packageCache = core_1.PackageCache.shared('embroider-stage3');
function main() {
    let visitor = {
        Program: {
            enter(_, state) {
                state.removed = [];
                state.pendingTasks = [];
                state.generatedRequires = new Set();
            },
            exit(path, state) {
                state.pendingTasks.forEach(task => task());
                pruneRemovedImports(state);
                pruneMacroImports(path);
            },
        },
        CallExpression(path, state) {
            let callee = path.get('callee');
            if (callee.referencesImport('@embroider/macros', 'dependencySatisfies')) {
                dependency_satisfies_1.default(path, state, packageCache);
            }
            if (callee.referencesImport('@embroider/macros', 'getConfig')) {
                get_config_1.default(path, state, packageCache, false);
            }
            if (callee.referencesImport('@embroider/macros', 'getOwnConfig')) {
                get_config_1.default(path, state, packageCache, true);
            }
            if (callee.referencesImport('@embroider/macros', 'macroIf')) {
                macro_if_1.default(path, state, visitor_1.bindState(visitor, state));
            }
            if (callee.referencesImport('@embroider/macros', 'failBuild')) {
                fail_build_1.default(path, visitor_1.bindState(visitor, state));
            }
            if (callee.referencesImport('@embroider/macros', 'importSync')) {
                let r = types_1.identifier('require');
                state.generatedRequires.add(r);
                callee.replaceWith(r);
            }
        },
        ReferencedIdentifier(path, state) {
            if (path.referencesImport('@embroider/macros', 'dependencySatisfies')) {
                throw error_1.default(path, `You can only use dependencySatisfies as a function call`);
            }
            if (path.referencesImport('@embroider/macros', 'getConfig')) {
                throw error_1.default(path, `You can only use getConfig as a function call`);
            }
            if (path.referencesImport('@embroider/macros', 'getOwnConfig')) {
                throw error_1.default(path, `You can only use getOwnConfig as a function call`);
            }
            if (path.referencesImport('@embroider/macros', 'macroIf')) {
                throw error_1.default(path, `You can only use macroIf as a function call`);
            }
            if (path.referencesImport('@embroider/macros', 'failBuild')) {
                throw error_1.default(path, `You can only use failBuild as a function call`);
            }
            if (path.referencesImport('@embroider/macros', 'importSync')) {
                throw error_1.default(path, `You can only use importSync as a function call`);
            }
            if (state.opts.owningPackageRoot) {
                // there is only an owningPackageRoot when we are running inside a
                // classic ember-cli build. In the embroider stage3 build, there is no
                // owning package root because we're compiling *all* packages
                // simultaneously.
                //
                // given that we're inside classic ember-cli, stop here without trying
                // to require bare `require`. It's not needed, because both our
                // `importSync` and any user-written bare `require` can both mean the
                // same thing: runtime AMD `require`.
                return;
            }
            if (path.node.name === 'require' &&
                !state.generatedRequires.has(path.node) &&
                !path.scope.hasBinding('require')) {
                // Our importSync macro has been compiled to `require`. But we want to
                // distinguish that from any pre-existing, user-written `require`, which
                // should retain its *runtime* meaning.
                path.replaceWith(types_1.memberExpression(types_1.identifier('window'), path.node));
            }
        },
    };
    return { visitor };
}
exports.default = main;
function wasRemoved(path, state) {
    return state.removed.includes(path) || Boolean(path.findParent(p => state.removed.includes(p)));
}
// This removes imports that are only referred to from within code blocks that
// we killed.
function pruneRemovedImports(state) {
    if (state.removed.length === 0) {
        return;
    }
    let moduleScope = state.removed[0].findParent(path => path.type === 'Program').scope;
    for (let name of Object.keys(moduleScope.bindings)) {
        let binding = moduleScope.bindings[name];
        let bindingPath = binding.path;
        if (bindingPath.isImportSpecifier() || bindingPath.isImportDefaultSpecifier()) {
            if (binding.referencePaths.length > 0 && binding.referencePaths.every(path => wasRemoved(path, state))) {
                bindingPath.remove();
                let importPath = bindingPath.parentPath;
                if (importPath.get('specifiers').length === 0) {
                    importPath.remove();
                }
            }
        }
    }
}
// This removes imports from "@embroider/macros" itself, because we have no
// runtime behavior at all.
function pruneMacroImports(path) {
    if (!path.isProgram()) {
        return;
    }
    for (let topLevelPath of path.get('body')) {
        if (topLevelPath.isImportDeclaration() && topLevelPath.get('source').node.value === '@embroider/macros') {
            topLevelPath.remove();
        }
    }
}
//# sourceMappingURL=macros-babel-plugin.js.map