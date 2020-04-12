import { PluginItem } from '@babel/core';
export declare type Merger = (configs: unknown[]) => unknown;
export default class MacrosConfig {
    static shared(): MacrosConfig;
    static reset(): void;
    private configs;
    private mergers;
    setConfig(fromPath: string, packageName: string, config: unknown): void;
    setOwnConfig(fromPath: string, config: unknown): void;
    private internalSetConfig;
    useMerger(fromPath: string, merger: Merger): void;
    private cachedUserConfigs;
    private readonly userConfigs;
    babelPluginConfig(owningPackageRoot?: string): PluginItem;
    astPlugins(owningPackageRoot?: string): Function[];
    private mergerFor;
    packageMoved(oldPath: string, newPath: string): void;
    private moves;
    getConfig(fromPath: string, packageName: string): unknown;
    getOwnConfig(fromPath: string): unknown;
    resolvePackage(fromPath: string, packageName?: string | undefined): import("@embroider/core").Package;
}
