"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bindState(visitor, state) {
    return {
        CallExpression(node) {
            return visitor.CallExpression(node, state);
        },
    };
}
exports.bindState = bindState;
//# sourceMappingURL=visitor.js.map