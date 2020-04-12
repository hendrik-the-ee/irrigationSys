import { Tree } from 'broccoli-plugin';
import PackageCache from './package-cache';
export default interface Stage {
    readonly tree: Tree;
    readonly inputPath: string;
    ready(): Promise<{
        readonly outputPath: string;
        readonly packageCache?: PackageCache;
    }>;
}
