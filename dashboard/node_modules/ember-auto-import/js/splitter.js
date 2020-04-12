"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const util_1 = require("./util");
const lodash_1 = require("lodash");
const enhanced_resolve_1 = require("enhanced-resolve");
const pkg_up_1 = __importDefault(require("pkg-up"));
const path_1 = require("path");
const debug = debug_1.default('ember-auto-import:splitter');
const resolver = enhanced_resolve_1.ResolverFactory.createResolver({
    // upstream types seem to be broken here
    fileSystem: new enhanced_resolve_1.CachedInputFileSystem(new enhanced_resolve_1.NodeJsInputFileSystem(), 4000),
    extensions: ['.js', '.json'],
    mainFields: ['browser', 'module', 'main']
});
class Splitter {
    constructor(options) {
        this.options = options;
        this.lastDeps = null;
        this.packageVersions = new Map();
    }
    deps() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.importsChanged()) {
                this.lastDeps = yield this.computeDeps(this.options.analyzers);
                debug('output %s', new LazyPrintDeps(this.lastDeps));
            }
            return this.lastDeps;
        });
    }
    importsChanged() {
        let imports = [...this.options.analyzers.keys()].map(analyzer => analyzer.imports);
        if (!this.lastImports || !util_1.shallowEqual(this.lastImports, imports)) {
            this.lastImports = imports;
            return true;
        }
        return false;
    }
    computeTargets(analyzers) {
        return __awaiter(this, void 0, void 0, function* () {
            let specifiers = new Map();
            let imports = lodash_1.flatten([...analyzers.keys()].map(analyzer => analyzer.imports));
            yield Promise.all(imports.map((imp) => __awaiter(this, void 0, void 0, function* () {
                if (imp.specifier[0] === '.' || imp.specifier[0] === '/') {
                    // we're only trying to identify imports of external NPM
                    // packages, so relative imports are never relevant.
                    return;
                }
                let aliasedSpecifier = imp.package.aliasFor(imp.specifier);
                let parts = aliasedSpecifier.split('/');
                let packageName;
                if (aliasedSpecifier[0] === '@') {
                    packageName = `${parts[0]}/${parts[1]}`;
                }
                else {
                    packageName = parts[0];
                }
                if (imp.package.excludesDependency(packageName)) {
                    // This package has been explicitly excluded.
                    return;
                }
                if (!imp.package.hasDependency(packageName) ||
                    imp.package.isEmberAddonDependency(packageName)) {
                    return;
                }
                imp.package.assertAllowedDependency(packageName);
                let entrypoint = yield resolveEntrypoint(aliasedSpecifier, imp.package);
                let seenAlready = specifiers.get(imp.specifier);
                if (seenAlready) {
                    yield this.assertSafeVersion(seenAlready, imp, entrypoint);
                    seenAlready.importedBy.push(imp);
                }
                else {
                    specifiers.set(imp.specifier, {
                        specifier: imp.specifier,
                        entrypoint,
                        importedBy: [imp]
                    });
                }
            })));
            return specifiers;
        });
    }
    versionOfPackage(entrypoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.packageVersions.has(entrypoint)) {
                return this.packageVersions.get(entrypoint);
            }
            let pkgPath = yield pkg_up_1.default(path_1.dirname(entrypoint));
            let version = null;
            if (pkgPath) {
                let pkg = require(pkgPath);
                version = pkg.version;
            }
            this.packageVersions.set(entrypoint, version);
            return version;
        });
    }
    assertSafeVersion(have, nextImport, entrypoint) {
        return __awaiter(this, void 0, void 0, function* () {
            if (have.entrypoint === entrypoint) {
                // both import statements are resolving to the exact same entrypoint --
                // this is the normal and happy case
                return;
            }
            let [haveVersion, nextVersion] = yield Promise.all([
                this.versionOfPackage(have.entrypoint),
                this.versionOfPackage(entrypoint)
            ]);
            if (haveVersion !== nextVersion) {
                throw new Error(`${nextImport.package.name} and ${have.importedBy[0].package.name} are using different versions of ${have.specifier} (${nextVersion} located at ${entrypoint} vs ${haveVersion} located at ${have.entrypoint})`);
            }
        });
    }
    computeDeps(analyzers) {
        return __awaiter(this, void 0, void 0, function* () {
            let targets = yield this.computeTargets(analyzers);
            let deps = new Map();
            this.options.bundles.names.forEach(bundleName => {
                deps.set(bundleName, { staticImports: [], dynamicImports: [] });
            });
            for (let target of targets.values()) {
                let [dynamicUses, staticUses] = lodash_1.partition(target.importedBy, imp => imp.isDynamic);
                if (staticUses.length > 0) {
                    let bundleName = this.chooseBundle(staticUses);
                    deps.get(bundleName).staticImports.push(target);
                }
                if (dynamicUses.length > 0) {
                    let bundleName = this.chooseBundle(dynamicUses);
                    deps.get(bundleName).dynamicImports.push(target);
                }
            }
            this.sortDependencies(deps);
            return deps;
        });
    }
    sortDependencies(deps) {
        for (const bundle of deps.values()) {
            this.sortBundle(bundle);
        }
    }
    sortBundle(bundle) {
        for (const imports of lodash_1.values(bundle)) {
            imports.sort((a, b) => a.specifier.localeCompare(b.specifier));
        }
    }
    // given that a module is imported by the given list of paths, which
    // bundle should it go in?
    chooseBundle(importedBy) {
        let usedInBundles = {};
        importedBy.forEach(usage => {
            usedInBundles[this.bundleForPath(usage)] = true;
        });
        return this.options.bundles.names.find(bundle => usedInBundles[bundle]);
    }
    bundleForPath(usage) {
        let bundleName = this.options.bundles.bundleForPath(usage.path);
        if (this.options.bundles.names.indexOf(bundleName) === -1) {
            throw new Error(`bundleForPath("${usage.path}") returned ${bundleName}" but the only configured bundle names are ${this.options.bundles.names.join(',')}`);
        }
        debug('bundleForPath("%s")=%s', usage.path, bundleName);
        return bundleName;
    }
}
exports.default = Splitter;
function resolveEntrypoint(specifier, pkg) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolvePromise, reject) => {
            // upstream types seem to be out of date here
            resolver.resolve({}, pkg.root, specifier, {}, (err, path) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolvePromise(path);
                }
            });
        });
    });
}
class LazyPrintDeps {
    constructor(deps) {
        this.deps = deps;
    }
    describeResolvedImport(imp) {
        return {
            specifier: imp.specifier,
            entrypoint: imp.entrypoint,
            importedBy: imp.importedBy.map(this.describeImport.bind(this))
        };
    }
    describeImport(imp) {
        return {
            package: imp.package.name,
            path: imp.path,
            isDynamic: imp.isDynamic
        };
    }
    toString() {
        let output = {};
        for (let [bundle, { staticImports, dynamicImports }] of this.deps.entries()) {
            output[bundle] = {
                static: staticImports.map(this.describeResolvedImport.bind(this)),
                dynamic: dynamicImports.map(this.describeResolvedImport.bind(this))
            };
        }
        return JSON.stringify(output, null, 2);
    }
}
//# sourceMappingURL=splitter.js.map