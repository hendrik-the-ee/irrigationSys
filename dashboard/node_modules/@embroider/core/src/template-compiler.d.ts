import { Resolver, ResolvedDep } from './resolver';
import { Tree } from 'broccoli-plugin';
import { PluginItem } from '@babel/core';
export interface Plugins {
    ast?: unknown[];
}
interface AST {
    _deliberatelyOpaque: 'AST';
}
interface SetupCompilerParams {
    compilerPath: string;
    resolver?: Resolver;
    EmberENV: unknown;
    plugins: Plugins;
}
export declare function rehydrate(portable: unknown): TemplateCompiler;
export default class TemplateCompiler {
    private params;
    private userPluginsCount;
    constructor(params: SetupCompilerParams);
    private readonly portableConfig;
    readonly isParallelSafe: boolean;
    readonly _parallelBabel: {
        requireFile: string;
        buildUsing: string;
        params: any;
    } | undefined;
    serialize(): string;
    toJSON(): any;
    private readonly syntax;
    readonly cacheKey: string;
    private setup;
    precompile(moduleName: string, contents: string): {
        compiled: string;
        dependencies: ResolvedDep[];
    };
    compile(moduleName: string, contents: string): string;
    applyTransforms(moduleName: string, contents: string): string;
    parse(moduleName: string, contents: string): AST;
    applyTransformsToTree(tree: Tree): Tree;
    inlineTransformsBabelPlugin(): PluginItem;
    baseDir(): string;
    static isInlinePrecompilePlugin(item: PluginItem): boolean;
}
export {};
