export declare function macroIfBlock(node: any): any;
export declare function macroIfExpression(node: any, builders: any): any;
export declare function maybeAttrs(elementNode: any, node: any, builders: any): void;
export declare function evaluate(node: any): {
    confident: true;
    value: any;
} | {
    confident: false;
};
