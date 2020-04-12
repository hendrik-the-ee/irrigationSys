import Bundler from './bundler';
import Analyzer from './analyzer';
import Append from './broccoli-append';
import { Tree } from 'broccoli-plugin';
export default class AutoImport {
    private primaryPackage;
    private packages;
    private env;
    private consoleWrite;
    private analyzers;
    private bundles;
    private targets;
    static lookup(appOrAddon: any): AutoImport;
    constructor(appOrAddon: any);
    isPrimary(appOrAddon: any): boolean;
    analyze(tree: Tree, appOrAddon: any): Analyzer;
    makeBundler(allAppTree: Tree): Bundler;
    addTo(allAppTree: Tree): Append;
    included(addonInstance: any): void;
    private configureFingerprints;
    updateFastBootManifest(manifest: {
        vendorFiles: string[];
    }): void;
}
