"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_plugin_1 = __importDefault(require("broccoli-plugin"));
/*
  Takes some named broccoli trees and/or lists of broccoli trees and gives you
  the resulting inputPaths once those trees are built. Example:

    import { Tree } from 'broccoli-plugin';

    interface MyInputs<T> {
      codeFromMyApp: T,
      codeFromMyAddons: T[]
    }

    function(trees: MyInputs<Tree>): Tree {
      return WaitForTrees(trees, build);
    }

    async function build(paths: MyInputs<string>) {
      // paths.someTree is a string
      // paths.otherTrees is a string[]
    }

*/
class WaitForTrees extends broccoli_plugin_1.default {
    constructor(trees, annotation, buildHook) {
        super(flatTrees(trees), {
            persistentOutput: true,
            needsCache: false,
            annotation: annotation,
        });
        this.trees = trees;
        this.buildHook = buildHook;
    }
    async build() {
        let result = {};
        let inputPathCounter = 0;
        for (let entry of findTrees(this.trees)) {
            if (entry.single) {
                result[entry.name] = this.inputPaths[inputPathCounter++];
            }
            else if (entry.multi) {
                result[entry.name] = this.inputPaths.slice(inputPathCounter, (inputPathCounter += entry.multi.length));
            }
        }
        return this.buildHook(result);
    }
}
exports.default = WaitForTrees;
function isTree(x) {
    return x && typeof x.__broccoliGetInfo__ === 'function';
}
function* findTrees(trees) {
    for (let [name, value] of Object.entries(trees)) {
        if (Array.isArray(value)) {
            yield { name, multi: value.filter(isTree) };
        }
        else {
            if (isTree(value)) {
                yield { name, single: value };
            }
        }
    }
}
function flatTrees(trees) {
    let output = [];
    for (let value of findTrees(trees)) {
        if (value.multi) {
            output = output.concat(value.multi);
        }
        else if (value.single) {
            output.push(value.single);
        }
    }
    return output;
}
//# sourceMappingURL=wait-for-trees.js.map