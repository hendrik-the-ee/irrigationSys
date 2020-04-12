import { PortablePluginConfig, ResolveOptions } from './portable-plugin-config';
import { TransformOptions } from '@babel/core';
export default class PortableBabelConfig extends PortablePluginConfig {
    constructor(config: TransformOptions, resolveOptions: ResolveOptions);
    protected makePortable(value: any, accessPath?: string[]): any;
    private resolveBabelPlugin;
}
