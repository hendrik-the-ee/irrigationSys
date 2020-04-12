import { Operation, Entry } from 'fs-tree-diff';
export interface InputTree {
    walk(): Entry[];
    mayChange: boolean;
}
export declare type Sources = Map<string, number>;
export default class MultiTreeDiff {
    private inTrees;
    private prevEntries;
    private prevCombined;
    private owners;
    constructor(inTrees: InputTree[]);
    update(): {
        ops: Operation[];
        sources: Sources;
    };
}
