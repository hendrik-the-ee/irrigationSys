import { NodePath } from '@babel/traverse';
import { BoundVisitor } from './visitor';
export default function evaluateJSON(path: NodePath, visitor: BoundVisitor): {
    confident: boolean;
    value: any;
};
export declare function assertNotArray<T>(input: T | T[]): T;
export declare function assertArray<T>(input: T | T[]): T[];
