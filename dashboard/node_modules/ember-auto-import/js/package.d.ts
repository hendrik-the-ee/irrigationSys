import { Configuration } from 'webpack';
export declare function reloadDevPackages(): void;
export interface Options {
    exclude?: string[];
    alias?: {
        [fromName: string]: string;
    };
    webpack?: Configuration;
    publicAssetURL?: string;
    forbidEval?: boolean;
    skipBabel?: {
        package: string;
        semverRange?: string;
    }[];
}
export default class Package {
    name: string;
    root: string;
    isAddon: boolean;
    private _options;
    private _parent;
    private _hasBabelDetails;
    private _babelMajorVersion?;
    private _babelOptions;
    private autoImportOptions;
    private emberCLIBabelExtensions;
    private isAddonCache;
    private isDeveloping;
    private pkgGeneration;
    private pkgCache;
    static lookup(appOrAddon: any): Package;
    constructor(appOrAddon: any);
    _ensureBabelDetails(): void;
    readonly babelOptions: any;
    readonly babelMajorVersion: number | undefined;
    private buildBabelOptions;
    private readonly pkg;
    readonly namespace: string;
    hasDependency(name: string): boolean;
    private hasNonDevDependency;
    isEmberAddonDependency(name: string): boolean;
    assertAllowedDependency(name: string): void;
    excludesDependency(name: string): boolean;
    readonly webpackConfig: any;
    readonly skipBabel: Options["skipBabel"];
    aliasFor(name: string): string;
    readonly fileExtensions: string[];
    readonly publicAssetURL: string | undefined;
    readonly forbidsEval: boolean;
}
