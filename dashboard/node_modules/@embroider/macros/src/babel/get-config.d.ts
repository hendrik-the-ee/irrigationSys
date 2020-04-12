import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import State from './state';
import { PackageCache } from '@embroider/core';
export default function getConfig(path: NodePath<CallExpression>, state: State, packageCache: PackageCache, own: boolean): void;
