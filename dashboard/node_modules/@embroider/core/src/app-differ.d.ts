import { V2AddonPackage } from './package';
export default class AppDiffer {
    private outputPath;
    private ownAppJSDir;
    private differ;
    private sourceDirs;
    readonly files: Map<string, string | null>;
    constructor(outputPath: string, ownAppJSDir: string, activeAddonDescendants: V2AddonPackage[]);
    update(): void;
}
