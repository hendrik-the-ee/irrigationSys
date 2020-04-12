"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_name_1 = __importDefault(require("./package-name"));
const path_1 = require("path");
const types_1 = require("@babel/types");
const package_cache_1 = __importDefault(require("./package-cache"));
const fs_extra_1 = require("fs-extra");
const typescript_memoize_1 = require("typescript-memoize");
const js_handlebars_1 = require("./js-handlebars");
const paths_1 = require("./paths");
const packageCache = package_cache_1.default.shared('embroider-stage3');
function isDefineExpression(path) {
    // should we allow nested defines, or stop at the top level?
    if (!path.isCallExpression() || path.node.callee.type !== 'Identifier' || path.node.callee.name !== 'define') {
        return false;
    }
    const args = path.node.arguments;
    // only match define with 3 arguments define(name: string, deps: string[], cb: Function);
    return (Array.isArray(args) &&
        args.length === 3 &&
        types_1.isStringLiteral(args[0]) &&
        types_1.isArrayExpression(args[1]) &&
        types_1.isFunction(args[2]));
}
exports.isDefineExpression = isDefineExpression;
function adjustSpecifier(specifier, file, opts) {
    specifier = handleRenaming(specifier, file, opts);
    specifier = handleExternal(specifier, file, opts);
    if (file.isRelocated) {
        specifier = handleRelocation(specifier, file);
    }
    specifier = makeHBSExplicit(specifier, file);
    return specifier;
}
function handleRenaming(specifier, sourceFile, opts) {
    let packageName = package_name_1.default(specifier);
    if (!packageName) {
        return specifier;
    }
    for (let [candidate, replacement] of Object.entries(opts.renameModules)) {
        if (candidate === specifier) {
            return replacement;
        }
        if (candidate === specifier + '/index.js') {
            return replacement;
        }
        if (candidate === specifier + '.js') {
            return replacement;
        }
    }
    if (opts.renamePackages[packageName]) {
        return specifier.replace(packageName, opts.renamePackages[packageName]);
    }
    let pkg = sourceFile.owningPackage();
    if (!pkg || !pkg.isV2Ember()) {
        return specifier;
    }
    if (pkg.meta['auto-upgraded'] && pkg.name === packageName) {
        // we found a self-import, make it relative. Only auto-upgraded packages get
        // this help, v2 packages are natively supposed to use explicit hbs
        // extensions, and we want to push them all to do that correctly.
        let fullPath = specifier.replace(packageName, pkg.root);
        return paths_1.explicitRelative(path_1.dirname(sourceFile.name), fullPath);
    }
    return specifier;
}
function isExplicitlyExternal(packageName, fromPkg) {
    return Boolean(fromPkg.isV2Addon() && fromPkg.meta['externals'] && fromPkg.meta['externals'].includes(packageName));
}
function isResolvable(packageName, fromPkg) {
    try {
        let dep = packageCache.resolve(packageName, fromPkg);
        if (!dep.isEmberPackage() && !fromPkg.hasDependency('ember-auto-import')) {
            return false;
        }
    }
    catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            throw err;
        }
        return false;
    }
    return true;
}
const externalTemplate = js_handlebars_1.compile(`
{{#if (eq runtimeName "require")}}
const m = window.require;
{{else}}
const m = window.require("{{{js-string-escape runtimeName}}}");
{{/if}}
{{!-
  There are plenty of hand-written AMD defines floating around
  that lack this, and they will break when other build systems
  encounter them.

  As far as I can tell, Ember's loader was already treating this
  case as a module, so in theory we aren't breaking anything by
  marking it as such when other packagers come looking.

  todo: get review on this part.
-}}
if (m.default && !m.__esModule) {
  m.__esModule = true;
}
module.exports = m;
`);
function handleExternal(specifier, sourceFile, opts) {
    let packageName = package_name_1.default(specifier);
    if (!packageName) {
        // must have been relative, we only care about absolute imports here
        return specifier;
    }
    let pkg = sourceFile.owningPackage();
    if (!pkg || !pkg.isV2Ember()) {
        return specifier;
    }
    if (isExplicitlyExternal(packageName, pkg)) {
        return makeExternal(specifier, sourceFile, opts);
    }
    if (isResolvable(packageName, pkg)) {
        if (!pkg.meta['auto-upgraded'] && !pkg.hasDependency(packageName)) {
            throw new Error(`${pkg.name} is trying to import from ${packageName} but that is not one of its explicit dependencies`);
        }
        return specifier;
    }
    // we're being strict, packages authored in v2 need to list their own
    // externals, we won't resolve for them.
    if (!pkg.meta['auto-upgraded']) {
        return specifier;
    }
    if (opts.activeAddons[packageName]) {
        return paths_1.explicitRelative(path_1.dirname(sourceFile.name), specifier.replace(packageName, opts.activeAddons[packageName]));
    }
    else {
        return makeExternal(specifier, sourceFile, opts);
    }
}
function makeExternal(specifier, sourceFile, opts) {
    let target = path_1.join(opts.externalsDir, specifier + '.js');
    fs_extra_1.ensureDirSync(path_1.dirname(target));
    fs_extra_1.writeFileSync(target, externalTemplate({
        runtimeName: specifier,
    }));
    return paths_1.explicitRelative(path_1.dirname(sourceFile.name), target.slice(0, -3));
}
function handleRelocation(specifier, sourceFile) {
    let packageName = package_name_1.default(specifier);
    if (!packageName) {
        return specifier;
    }
    let pkg = sourceFile.owningPackage();
    if (!pkg || !pkg.isV2Ember()) {
        return specifier;
    }
    let targetPkg = packageCache.resolve(packageName, pkg);
    return paths_1.explicitRelative(path_1.dirname(sourceFile.name), specifier.replace(packageName, targetPkg.root));
}
function makeHBSExplicit(specifier, sourceFile) {
    if (/\.(hbs)|(js)|(css)$/.test(specifier)) {
        // already has a well-known explicit extension, so nevermind
        return specifier;
    }
    // our own externals by definition aren't things we can find on disk, so no
    // point trying
    if (specifier.startsWith('@embroider/externals/')) {
        return specifier;
    }
    let pkg = sourceFile.owningPackage();
    if (!pkg || !pkg.isV2Ember() || !pkg.meta['auto-upgraded']) {
        // only auto-upgraded packages get this adjustment, native v2 packages are
        // supposed to already say '.hbs' explicitly whenever they import a
        // template.
        return specifier;
    }
    let target;
    let packageName = package_name_1.default(specifier);
    if (packageName) {
        let base = packageCache.resolve(packageName, pkg).root;
        target = path_1.resolve(base, specifier.replace(packageName, '.') + '.hbs');
    }
    else {
        target = path_1.resolve(path_1.dirname(sourceFile.name), specifier + '.hbs');
    }
    if (fs_extra_1.pathExistsSync(target)) {
        return specifier + '.hbs';
    }
    return specifier;
}
function main() {
    return {
        visitor: {
            Program: {
                enter(path, state) {
                    state.emberCLIVanillaJobs = [];
                    state.adjustFile = new AdjustFile(path.hub.file.opts.filename, state.opts.relocatedFiles);
                    addExtraImports(path, state.opts.extraImports);
                },
                exit(_, state) {
                    state.emberCLIVanillaJobs.forEach(job => job());
                },
            },
            CallExpression(path, state) {
                // Should/can we make this early exit when the first define was found?
                if (!isDefineExpression(path)) {
                    return;
                }
                let pkg = state.adjustFile.owningPackage();
                if (pkg && pkg.isV2Ember() && !pkg.meta['auto-upgraded']) {
                    throw new Error(`The file ${state.adjustFile.originalFile} in package ${pkg.name} tried to use AMD define. Native V2 Ember addons are forbidden from using AMD define, they must use ECMA export only.`);
                }
                let { opts } = state;
                const dependencies = path.node.arguments[1];
                const specifiers = dependencies.elements.slice();
                specifiers.push(path.node.arguments[0]);
                for (let source of specifiers) {
                    if (!source) {
                        continue;
                    }
                    if (source.type !== 'StringLiteral') {
                        throw path.buildCodeFrameError(`expected only string literal arguments`);
                    }
                    if (source.value === 'exports' || source.value === 'require') {
                        // skip "special" AMD dependencies
                        continue;
                    }
                    let specifier = adjustSpecifier(source.value, state.adjustFile, opts);
                    if (specifier !== source.value) {
                        source.value = specifier;
                    }
                }
            },
            'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path, state) {
                let { opts, emberCLIVanillaJobs } = state;
                const { source } = path.node;
                if (source === null) {
                    return;
                }
                let specifier = adjustSpecifier(source.value, state.adjustFile, opts);
                if (specifier !== source.value) {
                    emberCLIVanillaJobs.push(() => (source.value = specifier));
                }
            },
        },
    };
}
exports.default = main;
main.baseDir = function () {
    return path_1.join(__dirname, '..');
};
function addExtraImports(path, extraImports) {
    let counter = 0;
    for (let { absPath, target, runtimeName } of extraImports) {
        if (absPath === path.hub.file.opts.filename) {
            if (runtimeName) {
                path.node.body.unshift(amdDefine(runtimeName, counter));
                path.node.body.unshift(types_1.importDeclaration([types_1.importDefaultSpecifier(types_1.identifier(`a${counter++}`))], types_1.stringLiteral(target)));
            }
            else {
                path.node.body.unshift(types_1.importDeclaration([], types_1.stringLiteral(target)));
            }
        }
    }
}
function amdDefine(runtimeName, importCounter) {
    return types_1.expressionStatement(types_1.callExpression(types_1.memberExpression(types_1.identifier('window'), types_1.identifier('define')), [
        types_1.stringLiteral(runtimeName),
        types_1.functionExpression(null, [], types_1.blockStatement([types_1.returnStatement(types_1.identifier(`a${importCounter}`))])),
    ]));
}
class AdjustFile {
    constructor(name, relocatedFiles) {
        this.name = name;
        this.originalFile = relocatedFiles[name] || name;
    }
    get isRelocated() {
        return this.originalFile !== this.name;
    }
    owningPackage() {
        return packageCache.ownerOfFile(this.originalFile);
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], AdjustFile.prototype, "owningPackage", null);
//# sourceMappingURL=babel-plugin-adjust-imports.js.map