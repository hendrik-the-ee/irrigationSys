export interface Packager<Options> {
    new (inputPath: string, outputPath: string, consoleWrite: (message: string) => void, options?: Options): PackagerInstance;
    annotation: string;
}
export interface PackagerInstance {
    build(): Promise<void>;
}
