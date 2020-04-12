"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_tree_diff_1 = __importDefault(require("fs-tree-diff"));
class MultiTreeDiff {
    constructor(inTrees) {
        this.inTrees = inTrees;
        this.prevCombined = new fs_tree_diff_1.default();
        this.owners = new WeakMap();
    }
    update() {
        let combinedEntries = [];
        let sources = new Map();
        let entries = this.inTrees.map((tree, index) => {
            if (!tree.mayChange && this.prevEntries && this.prevEntries[index]) {
                return this.prevEntries[index];
            }
            return tree.walk();
        });
        this.prevEntries = entries;
        for (let [treeIndex, treeEntries] of entries.entries()) {
            for (let entry of treeEntries) {
                sources.set(entry.relativePath, treeIndex);
                this.owners.set(entry, treeIndex);
            }
            combinedEntries = combinedEntries.concat(treeEntries);
            treeIndex++;
        }
        // FSTree requires the entries to be sorted and uniq. We achieve uniqueness
        // by only keeping the winner for each relativePath.
        combinedEntries = combinedEntries.filter(entry => this.owners.get(entry) === sources.get(entry.relativePath));
        combinedEntries.sort(compareByRelativePath);
        let newFSTree = fs_tree_diff_1.default.fromEntries(combinedEntries);
        let ops = this.prevCombined.calculatePatch(newFSTree, isEqual(this.owners));
        this.prevCombined = newFSTree;
        return { ops, sources };
    }
}
exports.default = MultiTreeDiff;
function compareByRelativePath(entryA, entryB) {
    let pathA = entryA.relativePath;
    let pathB = entryB.relativePath;
    if (pathA < pathB) {
        return -1;
    }
    else if (pathA > pathB) {
        return 1;
    }
    return 0;
}
function isEqual(owners) {
    return function (a, b) {
        return fs_tree_diff_1.default.defaultIsEqual(a, b) && owners.get(a) === owners.get(b);
    };
}
//# sourceMappingURL=multi-tree-diff.js.map