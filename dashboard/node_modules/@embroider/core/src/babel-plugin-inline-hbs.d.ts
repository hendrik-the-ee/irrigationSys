import { TaggedTemplateExpression, CallExpression, Program } from '@babel/types';
import { NodePath } from '@babel/traverse';
import TemplateCompiler from './template-compiler';
import { ResolvedDep } from './resolver';
interface State {
    opts: {
        templateCompiler: TemplateCompiler | unknown;
        stage: 1 | 3;
    };
    file: {
        code: string;
        opts: {
            filename: string;
        };
    };
    dependencies: Map<string, ResolvedDep>;
}
export default function inlineHBSTransform(): {
    visitor: {
        Program: {
            enter(_: NodePath<import("@babel/types").Node>, state: State): void;
            exit(path: NodePath<Program>, state: State): void;
        };
        TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>, state: State): void;
        CallExpression(path: NodePath<CallExpression>, state: State): void;
    };
};
export default namespace inlineHBSTransform {
    var _parallelBabel: {
        requireFile: string;
    };
    var baseDir: () => string;
}
export {};
