import Plugin, { Tree } from 'broccoli-plugin';
import Splitter, { BundleDependencies } from './splitter';
import Package from './package';
import BundleConfig from './bundle-config';
export interface BundlerPluginOptions {
    consoleWrite: (msg: string) => void;
    environment: 'development' | 'test' | 'production';
    splitter: Splitter;
    packages: Set<Package>;
    bundles: BundleConfig;
    targets: unknown;
}
export interface BuildResult {
    entrypoints: Map<string, string[]>;
    lazyAssets: string[];
    dir: string;
}
export interface BundlerHook {
    build(modules: Map<string, BundleDependencies>): Promise<BuildResult>;
}
export default class Bundler extends Plugin {
    private options;
    private lastDeps;
    private cachedBundlerHook;
    private didEnsureDirs;
    constructor(allAppTree: Tree, options: BundlerPluginOptions);
    private readonly rootPackage;
    private readonly publicAssetURL;
    private readonly skipBabel;
    readonly bundlerHook: BundlerHook;
    build(): Promise<void>;
    private ensureDirs;
    private addEntrypoints;
    private addLazyAssets;
}
