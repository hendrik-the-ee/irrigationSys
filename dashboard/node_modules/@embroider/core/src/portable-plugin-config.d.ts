export declare const protocol = "__embroider_portable_plugin_values__";
export declare type ResolveOptions = {
    basedir: string;
} | {
    resolve: (name: string) => any;
};
export declare class PortablePluginConfig {
    private config;
    protected basedir: string | undefined;
    protected resolve: (name: string) => any;
    protected here: string;
    private parallelSafeFlag;
    readonly portable: any;
    readonly isParallelSafe: boolean;
    constructor(config: any, resolveOptions?: ResolveOptions);
    serialize(): string;
    protected makePortable(value: any, accessPath?: string[]): any;
    private globalPlaceholder;
    static load(input: any): any;
}
