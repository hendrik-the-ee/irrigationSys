export default class BundleConfig {
    private emberApp;
    constructor(emberApp: any);
    readonly names: ReadonlyArray<string>;
    readonly types: ReadonlyArray<string>;
    bundleEntrypoint(name: string, type: string): string | undefined;
    bundleForPath(path: string): string;
    readonly lazyChunkPath: string;
}
