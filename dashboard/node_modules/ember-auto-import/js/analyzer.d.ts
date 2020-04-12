import Plugin, { Tree } from 'broccoli-plugin';
import Package from './package';
export interface Import {
    path: string;
    package: Package;
    specifier: string;
    isDynamic: boolean;
}
export default class Analyzer extends Plugin {
    private pack;
    private previousTree;
    private modules;
    private paths;
    private parse;
    constructor(inputTree: Tree, pack: Package);
    setupParser(): Promise<void>;
    readonly imports: Import[];
    build(): Promise<void>;
    private getPatchset;
    private matchesExtension;
    removeImports(relativePath: string): void;
    updateImports(relativePath: string, source: string): void;
    private parseImports;
}
