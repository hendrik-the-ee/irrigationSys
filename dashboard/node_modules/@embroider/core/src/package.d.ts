import { AddonMeta, AppMeta } from './metadata';
import PackageCache from './package-cache';
export default class Package {
    readonly root: string;
    protected packageCache: PackageCache;
    private dependencyKeys;
    constructor(root: string, packageCache: PackageCache, isApp?: boolean);
    readonly name: string;
    readonly version: string;
    readonly packageJSON: any;
    readonly meta: AddonMeta | AppMeta | undefined;
    isEmberPackage(): boolean;
    isV2Ember(): this is V2Package;
    isV2App(): this is V2AppPackage;
    isV2Addon(): this is V2AddonPackage;
    findDescendants(filter?: (pkg: Package) => boolean): Package[];
    readonly mayRebuild: boolean;
    readonly dependencies: Package[];
    hasDependency(name: string): boolean;
}
export interface PackageConstructor {
    new (root: string, mayUseDevDeps: boolean, packageCache: PackageCache): Package;
}
export interface V2Package extends Package {
    meta: AddonMeta | AppMeta;
}
export interface V2AddonPackage extends Package {
    meta: AddonMeta;
}
export interface V2AppPackage extends Package {
    meta: AppMeta;
}
