export declare function dependencySatisfies(packageName: string, semverRange: string): boolean;
export declare function macroIf(predicate: boolean, consequent: () => void, alternate: () => void): void;
export declare function getConfig<T>(packageName: string): T;
export declare function getOwnConfig<T>(): T;
export declare function failBuild(message: string): void;
export { default as MacrosConfig, Merger } from './macros-config';
import { PluginItem } from '@babel/core';
export declare function isEmbroiderMacrosPlugin(item: PluginItem): any;
