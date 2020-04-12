import Analyzer, { Import } from './analyzer';
import Package from './package';
import BundleConfig from './bundle-config';
export interface ResolvedImport {
    specifier: string;
    entrypoint: string;
    importedBy: Import[];
}
export interface BundleDependencies {
    staticImports: ResolvedImport[];
    dynamicImports: ResolvedImport[];
}
export interface SplitterOptions {
    bundles: BundleConfig;
    analyzers: Map<Analyzer, Package>;
}
export default class Splitter {
    private options;
    private lastImports;
    private lastDeps;
    private packageVersions;
    constructor(options: SplitterOptions);
    deps(): Promise<Map<string, BundleDependencies>>;
    private importsChanged;
    private computeTargets;
    private versionOfPackage;
    private assertSafeVersion;
    private computeDeps;
    private sortDependencies;
    private sortBundle;
    private chooseBundle;
    private bundleForPath;
}
