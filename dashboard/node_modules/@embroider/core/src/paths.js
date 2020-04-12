"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
// by "explicit", I mean that we want "./local/thing" instead of "local/thing"
// because
//     import "./local/thing"
// has a different meaning than
//     import "local/thing"
//
function explicitRelative(fromDir, toFile) {
    let result = path_1.relative(fromDir, toFile);
    if (!result.startsWith('/') && !result.startsWith('.')) {
        result = './' + result;
    }
    if (path_1.isAbsolute(toFile) && result.endsWith(toFile)) {
        // this prevents silly "relative" paths like
        // "../../../../../Users/you/projects/your/stuff" when we could have just
        // said "/Users/you/projects/your/stuff". The silly path isn't incorrect,
        // but it's unnecessarily verbose.
        return toFile;
    }
    return result;
}
exports.explicitRelative = explicitRelative;
//# sourceMappingURL=paths.js.map