"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function macroIfBlock(node) {
    if (node.params.length !== 1) {
        throw new Error(`macroIf (block form) requires one arguments, you passed ${node.params.length}`);
    }
    let result = evaluate(node.params[0]);
    if (!result.confident) {
        throw new Error(`first argument to macroIf must be statically analyzable`);
    }
    if (result.value) {
        return node.program.body;
    }
    else {
        if (node.inverse) {
            return node.inverse.body;
        }
        else {
            return [];
        }
    }
}
exports.macroIfBlock = macroIfBlock;
function macroIfExpression(node, builders) {
    if (node.params.length !== 2 && node.params.length !== 3) {
        throw new Error(`macroIf (expression form) requires two or three arguments, you passed ${node.params.length}`);
    }
    let result = evaluate(node.params[0]);
    if (!result.confident) {
        throw new Error(`first argument to macroIf must be statically analyzable`);
    }
    if (result.value) {
        return node.params[1];
    }
    else {
        return node.params[2] || builders.undefined();
    }
}
exports.macroIfExpression = macroIfExpression;
function maybeAttrs(elementNode, node, builders) {
    let [predicate, ...bareAttrs] = node.params;
    if (!predicate) {
        throw new Error(`macroMaybeAttrs requires at least one argument`);
    }
    let result = evaluate(predicate);
    if (!result.confident) {
        throw new Error(`first argument to macroIf must be statically analyzable`);
    }
    for (let bareAttr of bareAttrs) {
        if (bareAttr.type !== 'PathExpression') {
            throw new Error(`macroMaybeAttrs found a ${bareAttr.type} where it expected a PathExpression`);
        }
    }
    if (result.value) {
        for (let bareAttr of bareAttrs) {
            elementNode.attributes.push(builders.attr(bareAttr.original, builders.text('')));
        }
        for (let attr of node.hash.pairs) {
            elementNode.attributes.push(builders.attr(attr.key, builders.mustache(attr.value)));
        }
    }
}
exports.maybeAttrs = maybeAttrs;
function evaluate(node) {
    switch (node.type) {
        case 'StringLiteral':
        case 'NumberLiteral':
        case 'BooleanLiteral':
        case 'NullLiteral':
        case 'UndefinedLiteral':
            return { confident: true, value: node.value };
        default:
            return { confident: false };
    }
}
exports.evaluate = evaluate;
//# sourceMappingURL=macro-if.js.map