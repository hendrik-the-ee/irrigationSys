"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multi_tree_diff_1 = __importDefault(require("./multi-tree-diff"));
const walk_sync_1 = __importDefault(require("walk-sync"));
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const messages_1 = require("./messages");
const assert_never_1 = __importDefault(require("assert-never"));
class AppDiffer {
    constructor(outputPath, ownAppJSDir, activeAddonDescendants) {
        this.outputPath = outputPath;
        this.ownAppJSDir = ownAppJSDir;
        this.sourceDirs = [];
        // maps from each filename in the app to the original directory from whence it
        // came, if it came from an addon. The mapping allows us to preserve
        // resolution semantics so that each of the app files can still resolve
        // relative to where it was authored.
        //
        // files authored within the app map to null
        this.files = new Map();
        let trees = activeAddonDescendants
            .map((addon) => {
            let dir = addon.meta['app-js'];
            if (dir) {
                let definitelyDir = path_1.join(addon.root, dir);
                this.sourceDirs.push(definitelyDir);
                return {
                    mayChange: addon.mayRebuild,
                    walk() {
                        return walk_sync_1.default.entries(definitelyDir);
                    },
                };
            }
        })
            .filter(Boolean);
        trees.push({
            mayChange: true,
            walk() {
                return walk_sync_1.default.entries(ownAppJSDir);
            },
        });
        this.sourceDirs.push(ownAppJSDir);
        this.differ = new multi_tree_diff_1.default(trees);
    }
    update() {
        let { ops, sources } = this.differ.update();
        messages_1.debug(`app-differ operations count: %s`, ops.length);
        for (let [operation, relativePath] of ops) {
            let outputPath = path_1.join(this.outputPath, relativePath);
            switch (operation) {
                case 'unlink':
                    fs_extra_1.unlinkSync(outputPath);
                    this.files.delete(relativePath);
                    break;
                case 'rmdir':
                    fs_extra_1.rmdirSync(outputPath);
                    break;
                case 'mkdir':
                    fs_extra_1.mkdirpSync(outputPath);
                    break;
                case 'change':
                    fs_extra_1.removeSync(outputPath);
                // deliberate fallthrough
                case 'create':
                    let sourceDir = this.sourceDirs[sources.get(relativePath)];
                    let sourceFile = path_1.join(sourceDir, relativePath);
                    fs_extra_1.copySync(sourceFile, outputPath, { dereference: true });
                    this.files.set(relativePath, sourceDir === this.ownAppJSDir ? null : sourceFile);
                    break;
                default:
                    assert_never_1.default(operation);
            }
        }
    }
}
exports.default = AppDiffer;
//# sourceMappingURL=app-differ.js.map