"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = require("semver");
const core_1 = require("@embroider/core");
let packageCache = core_1.PackageCache.shared('embroider-stage3');
function dependencySatisfies(node, 
// when we're running in traditional ember-cli, baseDir is configured and we
// do all lookups relative to that (single) package. But when we're running in
// embroider stage3 we process all packages simultaneously, so baseDir is left
// unconfigured and moduleName will be the full path to the source file.
baseDir, moduleName) {
    if (node.params.length !== 2) {
        throw new Error(`macroDependencySatisfies requires two arguments, you passed ${node.params.length}`);
    }
    if (!node.params.every((p) => p.type === 'StringLiteral')) {
        throw new Error(`all arguments to macroDependencySatisfies must be string literals`);
    }
    let packageName = node.params[0].value;
    let range = node.params[1].value;
    let us = packageCache.ownerOfFile(baseDir || moduleName);
    if (!us) {
        return false;
    }
    let pkg;
    try {
        pkg = packageCache.resolve(packageName, us);
    }
    catch (err) {
        // it's not an error if we can't resolve it, we just don't satisfy it.
    }
    if (pkg) {
        // we coerce here because we want versions like '3.9.0-beta.0' to satisfy
        // constraints like '> 3.8'. The coerce method is pretty aggressive, but
        // honestly if people areputting things into their package.json version that
        // are going to coerce weirdly, that's on them.
        let version = semver_1.coerce(pkg.version);
        if (version != null) {
            return semver_1.satisfies(version, range);
        }
    }
    return false;
}
exports.default = dependencySatisfies;
//# sourceMappingURL=dependency-satisfies.js.map