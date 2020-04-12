import { NodePath } from '@babel/traverse';
import { CallExpression, Identifier } from '@babel/types';
import State from './state';
export default function main(): {
    visitor: {
        Program: {
            enter(_: NodePath<import("@babel/types").Node>, state: State): void;
            exit(path: NodePath<import("@babel/types").Node>, state: State): void;
        };
        CallExpression(path: NodePath<CallExpression>, state: State): void;
        ReferencedIdentifier(path: NodePath<Identifier>, state: State): void;
    };
};
