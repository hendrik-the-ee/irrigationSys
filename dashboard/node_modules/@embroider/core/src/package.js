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
const typescript_memoize_1 = require("typescript-memoize");
const fs_1 = require("fs");
const path_1 = require("path");
const get_1 = __importDefault(require("lodash/get"));
const flatMap_1 = __importDefault(require("lodash/flatMap"));
class Package {
    constructor(root, packageCache, isApp) {
        this.root = root;
        this.packageCache = packageCache;
        // In stage1 and stage2, we're careful to make sure our PackageCache entry
        // for the app itself gets created with an explicit `isApp` flag. In stage3
        // we don't have that much control, but we can rely on the v2-formatted app
        // being easy to identify from its metadata.
        let mayUseDevDeps = typeof isApp === 'boolean' ? isApp : this.isV2App();
        this.dependencyKeys = mayUseDevDeps
            ? ['dependencies', 'devDependencies', 'peerDependencies']
            : ['dependencies', 'peerDependencies'];
    }
    get name() {
        return this.packageJSON.name;
    }
    get version() {
        return this.packageJSON.version;
    }
    get packageJSON() {
        return JSON.parse(fs_1.readFileSync(path_1.join(this.root, 'package.json'), 'utf8'));
    }
    get meta() {
        let m = this.packageJSON['ember-addon'];
        if (this.isV2App()) {
            return m;
        }
        if (this.isV2Addon()) {
            return m;
        }
    }
    isEmberPackage() {
        let keywords = this.packageJSON.keywords;
        return Boolean(keywords && keywords.includes('ember-addon'));
    }
    isV2Ember() {
        return this.isEmberPackage() && get_1.default(this.packageJSON, 'ember-addon.version') === 2;
    }
    isV2App() {
        return this.isV2Ember() && this.packageJSON['ember-addon'].type === 'app';
    }
    isV2Addon() {
        return this.isV2Ember() && this.packageJSON['ember-addon'].type === 'addon';
    }
    findDescendants(filter) {
        let pkgs = new Set();
        let queue = [this];
        while (true) {
            let pkg = queue.shift();
            if (!pkg) {
                break;
            }
            if (!pkgs.has(pkg)) {
                pkgs.add(pkg);
                let nextLevel;
                if (filter) {
                    nextLevel = pkg.dependencies.filter(filter);
                }
                else {
                    nextLevel = pkg.dependencies;
                }
                nextLevel.forEach(d => queue.push(d));
            }
        }
        pkgs.delete(this);
        return [...pkgs.values()];
    }
    // by default, addons do not get rebuilt on the fly. This can be changed when
    // you are actively developing one.
    get mayRebuild() {
        return false;
    }
    get dependencies() {
        let names = flatMap_1.default(this.dependencyKeys, key => Object.keys(this.packageJSON[key] || {}));
        return names.map(name => this.packageCache.resolve(name, this));
    }
    hasDependency(name) {
        for (let section of this.dependencyKeys) {
            if (this.packageJSON[section]) {
                if (this.packageJSON[section][name]) {
                    return true;
                }
            }
        }
        return false;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "packageJSON", null);
__decorate([
    typescript_memoize_1.Memoize()
], Package.prototype, "dependencies", null);
exports.default = Package;
//# sourceMappingURL=package.js.map