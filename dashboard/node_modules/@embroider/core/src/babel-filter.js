"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_cache_1 = __importDefault(require("./package-cache"));
const semver_1 = __importDefault(require("semver"));
function babelFilter(skipBabel) {
    return function shouldTranspileFile(filename) {
        if (!isJS(filename)) {
            // quick exit for non JS extensions
            return false;
        }
        let owner = package_cache_1.default.shared('embroider-stage3').ownerOfFile(filename);
        if (owner) {
            for (let { package: pkg, semverRange } of skipBabel) {
                if (owner.name === pkg && (semverRange == null || semver_1.default.satisfies(owner.version, semverRange))) {
                    if (owner.isEmberPackage()) {
                        throw new Error(`You can't use skipBabel to disable transpilation of Ember addons, it only works for non-Ember third-party packages`);
                    }
                    return false;
                }
            }
        }
        return true;
    };
}
exports.default = babelFilter;
function isJS(filename) {
    return /\.js$/i.test(filename);
}
//# sourceMappingURL=babel-filter.js.map