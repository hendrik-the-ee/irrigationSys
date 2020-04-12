"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strip_bom_1 = __importDefault(require("strip-bom"));
const portable_plugin_config_1 = require("./portable-plugin-config");
const fs_1 = require("fs");
const broccoli_persistent_filter_1 = __importDefault(require("broccoli-persistent-filter"));
const json_stable_stringify_1 = __importDefault(require("json-stable-stringify"));
const crypto_1 = require("crypto");
const js_handlebars_1 = require("./js-handlebars");
const path_1 = require("path");
const core_1 = require("@babel/core");
const typescript_memoize_1 = require("typescript-memoize");
// we could directly depend on @glimmer/syntax and have nice types and
// everything. But the problem is, we really want to use the exact version that
// the app itself is using, and its copy is bundled away inside
// ember-template-compiler.js.
function loadGlimmerSyntax(templateCompilerPath) {
    let source = fs_1.readFileSync(templateCompilerPath, 'utf8');
    let replacedVar = false;
    // here we are stripping off the first `var Ember;`. That one small change
    // lets us crack open the file and get access to its internal loader, because
    // we can give it our own predefined `Ember` variable instead, which it will
    // use and put `Ember.__loader` onto.
    source = core_1.transform(source, {
        plugins: [
            function () {
                return {
                    visitor: {
                        VariableDeclarator(path) {
                            let id = path.node.id;
                            if (id.type === 'Identifier' && id.name === 'Ember' && !replacedVar) {
                                replacedVar = true;
                                path.remove();
                            }
                        },
                    },
                };
            },
        ],
    }).code;
    if (!replacedVar) {
        throw new Error(`didn't find expected source in ${templateCompilerPath}. Maybe we don't support your ember-source version?`);
    }
    // evades the require cache, which we need because the template compiler
    // shares internal module scoped state.
    let theExports = new Function(`
  let module = { exports: {} };
  let Ember = {};
  ${source};
  module.exports.Ember = Ember;
  return module.exports
  `)();
    let syntax = theExports.Ember.__loader.require('@glimmer/syntax');
    let compilerOptions = theExports.Ember.__loader.require('ember-template-compiler/lib/system/compile-options');
    return {
        print: syntax.print,
        preprocess: syntax.preprocess,
        defaultOptions: compilerOptions.default,
        registerPlugin: compilerOptions.registerPlugin,
        precompile: theExports.precompile,
        _Ember: theExports._Ember,
        cacheKey: crypto_1.createHash('md5')
            .update(source)
            .digest('hex'),
    };
}
function rehydrate(portable) {
    return new TemplateCompiler(PortableTemplateCompiler.load(portable));
}
exports.rehydrate = rehydrate;
class PortableTemplateCompiler extends portable_plugin_config_1.PortablePluginConfig {
    constructor(config) {
        super(config);
        this.here = __filename;
    }
    serialize() {
        return PortableTemplateCompiler.template({
            here: this.here,
            portable: this.portable,
        });
    }
}
PortableTemplateCompiler.template = js_handlebars_1.compile(`
  "use strict";
  const { rehydrate } = require('{{{js-string-escape here}}}');
  module.exports = rehydrate({{{json-stringify portable 2 }}});
  `);
class TemplateCompiler {
    // The signature of this function may feel a little weird, but that's because
    // it's designed to be easy to invoke via our portable plugin config in a new
    // process.
    constructor(params) {
        this.params = params;
        this.userPluginsCount = 0;
        // stage3 packagers don't need to know about our instance, they can just
        // grab the compile function and use it.
        this.compile = this.compile.bind(this);
    }
    get portableConfig() {
        return new PortableTemplateCompiler(this.params);
    }
    get isParallelSafe() {
        return this.portableConfig.isParallelSafe;
    }
    // this supports the case where we are included as part of a larger config
    // that's getting serialized. Specifically, we are passed as an argument into
    // babel-plugin-inline-hbs, so when the whole babel config is being serialized
    // this gets detected by PortablePluginConfig so we can represent ourself.
    get _parallelBabel() {
        if (this.portableConfig.isParallelSafe) {
            return {
                requireFile: __filename,
                buildUsing: 'rehydrate',
                params: this.portableConfig.portable,
            };
        }
    }
    // this supports the case where we want to create a standalone executable
    // Javascript file that will re-create an equivalent TemplateCompiler
    // instance.
    serialize() {
        return this.portableConfig.serialize();
    }
    // This allows us to survive even naive stringification in places like
    // thread-loader and babel-loader.
    toJSON() {
        return this.portableConfig.portable;
    }
    get syntax() {
        return this.setup().syntax;
    }
    get cacheKey() {
        return this.setup().cacheKey;
    }
    setup() {
        let syntax = loadGlimmerSyntax(this.params.compilerPath);
        this.userPluginsCount += registerPlugins(syntax, this.params.plugins);
        if (this.params.resolver) {
            let transform = this.params.resolver.astTransformer(this);
            if (transform) {
                syntax.registerPlugin('ast', transform);
                this.userPluginsCount++;
            }
        }
        initializeEmberENV(syntax, this.params.EmberENV);
        let cacheKey = crypto_1.createHash('md5')
            .update(json_stable_stringify_1.default({
            // todo: get resolver reflected in cacheKey
            syntax: syntax.cacheKey,
        }))
            .digest('hex');
        return { syntax, cacheKey };
    }
    // Compiles to the wire format plus dependency list.
    precompile(moduleName, contents) {
        let compiled = this.syntax.precompile(strip_bom_1.default(contents), {
            contents,
            moduleName,
        });
        let dependencies;
        if (this.params.resolver) {
            dependencies = this.params.resolver.dependenciesOf(moduleName);
        }
        else {
            dependencies = [];
        }
        return { compiled, dependencies };
    }
    // Compiles all the way from a template string to a javascript module string.
    compile(moduleName, contents) {
        let { compiled, dependencies } = this.precompile(moduleName, contents);
        let lines = [];
        let counter = 0;
        for (let { runtimeName, path } of dependencies) {
            lines.push(`import a${counter} from "${path}";`);
            lines.push(`window.define('${runtimeName}', function(){ return a${counter++}});`);
        }
        lines.push(`export default Ember.HTMLBars.template(${compiled});`);
        return lines.join('\n');
    }
    // Applies all custom AST transforms and emits the results still as
    // handlebars.
    applyTransforms(moduleName, contents) {
        let opts = this.syntax.defaultOptions({ contents, moduleName });
        if (opts.plugins && opts.plugins.ast) {
            // the user-provided plugins come first in the list, and those are the
            // only ones we want to run. The built-in plugins don't need to run here
            // in stage1, it's better that they run in stage3 when the appropriate
            // ember version is in charge.
            //
            // rather than slicing them off, we could choose instead to not call
            // syntax.defaultOptions, but then we lose some of the compatibility
            // normalization that it does on the user-provided plugins.
            opts.plugins.ast = opts.plugins.ast.slice(0, this.userPluginsCount);
        }
        let ast = this.syntax.preprocess(contents, opts);
        return this.syntax.print(ast);
    }
    parse(moduleName, contents) {
        // this is just a parse, so we deliberately don't run any plugins.
        let opts = { contents, moduleName, plugins: {} };
        return this.syntax.preprocess(contents, opts);
    }
    // Use applyTransforms on every file in a broccoli tree.
    applyTransformsToTree(tree) {
        return new TemplateCompileTree(tree, this, 1);
    }
    // Use applyTransforms on the contents of inline hbs template strings inside
    // Javascript.
    inlineTransformsBabelPlugin() {
        return [path_1.join(__dirname, 'babel-plugin-inline-hbs.js'), { templateCompiler: this, stage: 1 }];
    }
    baseDir() {
        return path_1.join(__dirname, '..');
    }
    // tests for the classic ember-cli-htmlbars-inline-precompile babel plugin
    static isInlinePrecompilePlugin(item) {
        if (typeof item === 'string') {
            return matchesSourceFile(item);
        }
        if (hasProperties(item) && item._parallelBabel) {
            return matchesSourceFile(item._parallelBabel.requireFile);
        }
        if (Array.isArray(item) && item.length > 0) {
            if (typeof item[0] === 'string') {
                return matchesSourceFile(item[0]);
            }
            if (hasProperties(item[0]) && item[0]._parallelBabel) {
                return matchesSourceFile(item[0]._parallelBabel.requireFile);
            }
        }
        return false;
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], TemplateCompiler.prototype, "portableConfig", null);
__decorate([
    typescript_memoize_1.Memoize()
], TemplateCompiler.prototype, "setup", null);
exports.default = TemplateCompiler;
class TemplateCompileTree extends broccoli_persistent_filter_1.default {
    constructor(inputTree, templateCompiler, stage) {
        super(inputTree, {
            name: `embroider-template-compile-stage${stage}`,
            persist: true,
            extensions: ['hbs', 'handlebars'],
            // in stage3 we are changing the file extensions from hbs to js. In
            // stage1, we are just keeping hbs.
            targetExtension: stage === 3 ? 'js' : undefined,
        });
        this.templateCompiler = templateCompiler;
        this.stage = stage;
    }
    processString(source, relativePath) {
        if (this.stage === 1) {
            return this.templateCompiler.applyTransforms(relativePath, source);
        }
        else {
            return this.templateCompiler.compile(relativePath, source);
        }
    }
    cacheKeyProcessString(source, relativePath) {
        return `${this.stage}-${this.templateCompiler.cacheKey}` + super.cacheKeyProcessString(source, relativePath);
    }
    baseDir() {
        return path_1.join(__dirname, '..');
    }
}
function matchesSourceFile(filename) {
    return /htmlbars-inline-precompile\/(index|lib\/require-from-worker)(\.js)?$/.test(filename);
}
function hasProperties(item) {
    return item && (typeof item === 'object' || typeof item === 'function');
}
function registerPlugins(syntax, plugins) {
    let userPluginsCount = 0;
    if (plugins.ast) {
        for (let i = 0, l = plugins.ast.length; i < l; i++) {
            syntax.registerPlugin('ast', plugins.ast[i]);
            userPluginsCount++;
        }
    }
    return userPluginsCount;
}
function initializeEmberENV(syntax, EmberENV) {
    if (!EmberENV) {
        return;
    }
    let props;
    if (EmberENV.FEATURES) {
        props = Object.keys(EmberENV.FEATURES);
        props.forEach(prop => {
            syntax._Ember.FEATURES[prop] = EmberENV.FEATURES[prop];
        });
    }
    if (EmberENV) {
        props = Object.keys(EmberENV);
        props.forEach(prop => {
            if (prop === 'FEATURES') {
                return;
            }
            syntax._Ember.ENV[prop] = EmberENV[prop];
        });
    }
}
//# sourceMappingURL=template-compiler.js.map