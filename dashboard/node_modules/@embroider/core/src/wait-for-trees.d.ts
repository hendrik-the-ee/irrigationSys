import BroccoliPlugin, { Tree } from 'broccoli-plugin';
export default class WaitForTrees<NamedTrees> extends BroccoliPlugin {
    private trees;
    private buildHook;
    constructor(trees: NamedTrees, annotation: string, buildHook: (trees: OutputPaths<NamedTrees>) => Promise<void>);
    build(): Promise<void>;
}
export declare type OutputPaths<NamedTrees> = {
    [P in keyof NamedTrees]: NamedTrees[P] extends Tree ? string : NamedTrees[P] extends Tree[] ? string[] : never;
};
