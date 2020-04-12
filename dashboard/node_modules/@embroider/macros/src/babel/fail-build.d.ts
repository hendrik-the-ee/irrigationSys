import { NodePath } from '@babel/traverse';
import { CallExpression } from '@babel/types';
import { BoundVisitor } from './visitor';
export default function failBuild(path: NodePath<CallExpression>, visitor: BoundVisitor): void;
