"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sourceFile(path, state) {
    return state.opts.owningPackageRoot || path.hub.file.opts.filename;
}
exports.sourceFile = sourceFile;
//# sourceMappingURL=state.js.map