export default interface Options {
    staticHelpers?: boolean;
    staticComponents?: boolean;
    splitAtRoutes?: (RegExp | string)[];
    skipBabel?: {
        package: string;
        semverRange?: string;
    }[];
}
export declare function optionsWithDefaults(options?: Options): Required<Options>;
