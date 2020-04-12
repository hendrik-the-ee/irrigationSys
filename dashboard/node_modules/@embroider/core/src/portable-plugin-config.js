"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolve_1 = __importDefault(require("resolve"));
const js_handlebars_1 = require("./js-handlebars");
const mapValues_1 = __importDefault(require("lodash/mapValues"));
const assert_never_1 = __importDefault(require("assert-never"));
exports.protocol = '__embroider_portable_plugin_values__';
const { globalValues, nonce } = setupGlobals();
const template = js_handlebars_1.compile(`
const { PortablePluginConfig } = require('{{{js-string-escape here}}}');
module.exports = PortablePluginConfig.load({{{json-stringify portable 2}}});
`);
class PortablePluginConfig {
    constructor(config, resolveOptions) {
        this.config = config;
        this.here = __filename;
        this.parallelSafeFlag = true;
        if (resolveOptions) {
            if ('resolve' in resolveOptions) {
                this.resolve = resolveOptions.resolve;
            }
            else {
                this.basedir = resolveOptions.basedir;
                this.resolve = (name) => resolve_1.default.sync(name, { basedir: resolveOptions.basedir });
            }
        }
        else {
            this.resolve = (_) => {
                throw new Error(`No file resolving is configured for this PortablePluginConfig`);
            };
        }
        this.portable = this.makePortable(this.config);
        this.isParallelSafe = this.parallelSafeFlag;
    }
    serialize() {
        return template({ portable: this.portable, here: this.here });
    }
    makePortable(value, accessPath = []) {
        if (value === null) {
            return value;
        }
        let broccoli = maybeBroccoli(value);
        if (broccoli) {
            return broccoli;
        }
        let htmlbars = maybeHTMLBars(value);
        if (htmlbars) {
            return htmlbars;
        }
        if (Array.isArray(value)) {
            return value.map((element, index) => this.makePortable(element, accessPath.concat(String(index))));
        }
        switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
            case 'undefined':
                return value;
            case 'object':
                if (Object.getPrototypeOf(value) === Object.prototype) {
                    return mapValues_1.default(value, (propertyValue, key) => this.makePortable(propertyValue, accessPath.concat(key)));
                }
        }
        return this.globalPlaceholder(value);
    }
    globalPlaceholder(value) {
        let index = globalValues.length;
        globalValues.push(value);
        this.parallelSafeFlag = false;
        return {
            embroiderPlaceholder: true,
            type: 'global',
            nonce,
            index,
        };
    }
    static load(input) {
        if (Array.isArray(input)) {
            return input.map(element => this.load(element));
        }
        if (input && typeof input === 'object') {
            if (input.embroiderPlaceholder) {
                let placeholder = input;
                switch (placeholder.type) {
                    case 'global':
                        if (placeholder.nonce !== nonce) {
                            throw new Error(`unable to use this non-serializable babel config in this node process`);
                        }
                        return globalValues[placeholder.index];
                    case 'broccoli-parallel':
                        return buildBroccoli(placeholder);
                    case 'htmlbars-parallel':
                        return buildHTMLBars(placeholder);
                }
                assert_never_1.default(placeholder);
            }
            else {
                return mapValues_1.default(input, value => this.load(value));
            }
        }
        return input;
    }
}
exports.PortablePluginConfig = PortablePluginConfig;
function setupGlobals() {
    let G = global;
    if (!G[exports.protocol]) {
        G[exports.protocol] = { globalValues: [], nonce: Math.floor(Math.random() * Math.pow(2, 32)) };
    }
    return G[exports.protocol];
}
// === broccoli-babel-transpiler support ===
function maybeBroccoli(object) {
    const type = typeof object;
    const hasProperties = type === 'function' || (type === 'object' && object !== null);
    if (hasProperties &&
        object._parallelBabel !== null &&
        typeof object._parallelBabel === 'object' &&
        typeof object._parallelBabel.requireFile === 'string') {
        return {
            embroiderPlaceholder: true,
            type: 'broccoli-parallel',
            requireFile: object._parallelBabel.requireFile,
            buildUsing: object._parallelBabel.buildUsing,
            useMethod: object._parallelBabel.useMethod,
            params: object._parallelBabel.params,
        };
    }
}
function buildBroccoli(parallelApiInfo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let requiredStuff = require(parallelApiInfo.requireFile);
    if (parallelApiInfo.useMethod) {
        if (requiredStuff[parallelApiInfo.useMethod] === undefined) {
            throw new Error("method '" + parallelApiInfo.useMethod + "' does not exist in file " + parallelApiInfo.requireFile);
        }
        return requiredStuff[parallelApiInfo.useMethod];
    }
    if (parallelApiInfo.buildUsing) {
        if (typeof requiredStuff[parallelApiInfo.buildUsing] !== 'function') {
            throw new Error("'" + parallelApiInfo.buildUsing + "' is not a function in file " + parallelApiInfo.requireFile);
        }
        return requiredStuff[parallelApiInfo.buildUsing](parallelApiInfo.params);
    }
    return requiredStuff;
}
// ember-cli-htmlbars-inline-precompile support ===
function maybeHTMLBars(object) {
    const type = typeof object;
    const hasProperties = type === 'function' || (type === 'object' && object !== null);
    if (hasProperties &&
        object.parallelBabel !== null &&
        typeof object.parallelBabel === 'object' &&
        typeof object.parallelBabel.requireFile === 'string') {
        return {
            embroiderPlaceholder: true,
            type: 'htmlbars-parallel',
            requireFile: object.parallelBabel.requireFile,
            buildUsing: String(object.parallelBabel.buildUsing),
            params: object.parallelBabel.params,
        };
    }
}
function buildHTMLBars(parallelApiInfo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    let requiredStuff = require(parallelApiInfo.requireFile);
    if (typeof requiredStuff[parallelApiInfo.buildUsing] !== 'function') {
        throw new Error("'" + parallelApiInfo.buildUsing + "' is not a function in file " + parallelApiInfo.requireFile);
    }
    return requiredStuff[parallelApiInfo.buildUsing](parallelApiInfo.params);
}
//# sourceMappingURL=portable-plugin-config.js.map