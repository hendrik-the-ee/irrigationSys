import { NodePath, Node } from '@babel/traverse';
export default interface State {
    removed: NodePath[];
    pendingTasks: (() => void)[];
    generatedRequires: Set<Node>;
    opts: {
        userConfigs: {
            [pkgRoot: string]: unknown;
        };
        owningPackageRoot: string | undefined;
    };
}
export declare function sourceFile(path: NodePath, state: State): string;
