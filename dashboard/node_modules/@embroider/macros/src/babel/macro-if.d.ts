import { NodePath } from '@babel/traverse';
import State from './state';
import { CallExpression } from '@babel/types';
import { BoundVisitor } from './visitor';
export default function macroIf(path: NodePath<CallExpression>, state: State, visitor: BoundVisitor): void;
