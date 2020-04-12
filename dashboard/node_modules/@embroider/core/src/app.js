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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_handlebars_1 = require("./js-handlebars");
const resolve_1 = __importDefault(require("resolve"));
const typescript_memoize_1 = require("typescript-memoize");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const messages_1 = require("./messages");
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const merge_1 = __importDefault(require("lodash/merge"));
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const flatten_1 = __importDefault(require("lodash/flatten"));
const app_differ_1 = __importDefault(require("./app-differ"));
const ember_html_1 = require("./ember-html");
const assert_never_1 = __importDefault(require("assert-never"));
const fast_sourcemap_concat_1 = __importDefault(require("fast-sourcemap-concat"));
const macros_1 = require("@embroider/macros");
const portable_babel_config_1 = __importDefault(require("./portable-babel-config"));
const template_compiler_1 = __importDefault(require("./template-compiler"));
const os_1 = require("os");
const path_2 = require("path");
const paths_1 = require("./paths");
class ParsedEmberAsset {
    constructor(asset) {
        this.kind = 'parsed-ember';
        this.fileAsset = asset;
        this.html = new ember_html_1.PreparedEmberHTML(asset);
        this.relativePath = asset.relativePath;
    }
    validFor(other) {
        return this.fileAsset.mtime === other.mtime && this.fileAsset.size === other.size;
    }
}
class BuiltEmberAsset {
    constructor(asset) {
        this.kind = 'built-ember';
        this.parsedAsset = asset;
        this.source = asset.html.dom.serialize();
        this.relativePath = asset.relativePath;
    }
}
class ConcatenatedAsset {
    constructor(relativePath, sources) {
        this.relativePath = relativePath;
        this.sources = sources;
        this.kind = 'concatenated-asset';
    }
    get sourcemapPath() {
        return this.relativePath.replace(/\.js$/, '') + '.map';
    }
}
class AppFiles {
    constructor(relativePaths) {
        let tests = [];
        let components = [];
        let helpers = [];
        let otherAppFiles = [];
        this.perRoute = { children: new Map() };
        for (let relativePath of relativePaths.keys()) {
            relativePath = relativePath.split(path_2.sep).join('/');
            if (!relativePath.endsWith('.js') && !relativePath.endsWith('.hbs')) {
                continue;
            }
            if (relativePath.startsWith('tests/')) {
                if (relativePath.endsWith('-test.js')) {
                    tests.push(relativePath);
                }
                continue;
            }
            if (relativePath.startsWith('components/') || relativePath.startsWith('templates/components/')) {
                components.push(relativePath);
                continue;
            }
            else if (relativePath.startsWith('helpers/')) {
                helpers.push(relativePath);
                continue;
            }
            if (this.handleRouteFile(relativePath)) {
                continue;
            }
            otherAppFiles.push(relativePath);
        }
        this.tests = tests;
        this.components = components;
        this.helpers = helpers;
        this.otherAppFiles = otherAppFiles;
        let relocatedFiles = new Map();
        for (let [relativePath, owningPath] of relativePaths) {
            if (owningPath) {
                relocatedFiles.set(relativePath, owningPath);
            }
        }
        this.relocatedFiles = relocatedFiles;
    }
    handleRouteFile(relativePath) {
        let [prefix, ...rest] = relativePath.replace(/\.\w{1,3}$/, '').split('/');
        if (!['controllers', 'templates', 'routes'].includes(prefix)) {
            return false;
        }
        let type = prefix.slice(0, -1);
        let cursor = this.perRoute;
        for (let part of rest) {
            let child = cursor.children.get(part);
            if (child) {
                cursor = child;
            }
            else {
                let newEntry = { children: new Map() };
                cursor.children.set(part, newEntry);
                cursor = newEntry;
            }
        }
        cursor[type] = relativePath;
        return true;
    }
    get routeFiles() {
        return this.perRoute;
    }
}
class AppBuilder {
    constructor(root, app, adapter, options) {
        this.root = root;
        this.app = app;
        this.adapter = adapter;
        this.options = options;
        // for each relativePath, an Asset we have already emitted
        this.assets = new Map();
        macros_1.MacrosConfig.shared().setOwnConfig(__filename, { active: true });
    }
    scriptPriority(pkg) {
        switch (pkg.name) {
            case 'loader.js':
                return 0;
            case 'ember-source':
                return 10;
            default:
                return 1000;
        }
    }
    impliedAssets(type, emberENV) {
        let result = this.impliedAddonAssets(type).map((sourcePath) => {
            let stats = fs_extra_1.statSync(sourcePath);
            return {
                kind: 'on-disk',
                relativePath: paths_1.explicitRelative(this.root, sourcePath),
                sourcePath,
                mtime: stats.mtimeMs,
                size: stats.size,
            };
        });
        if (type === 'implicit-scripts') {
            result.unshift({
                kind: 'in-memory',
                relativePath: '_ember_env_.js',
                source: `window.EmberENV=${JSON.stringify(emberENV, null, 2)};`,
            });
        }
        return result;
    }
    impliedAddonAssets(type) {
        let result = [];
        for (let addon of sortBy_1.default(this.adapter.activeAddonDescendants, this.scriptPriority.bind(this))) {
            let implicitScripts = addon.meta[type];
            if (implicitScripts) {
                for (let mod of implicitScripts) {
                    result.push(resolve_1.default.sync(mod, { basedir: addon.root }));
                }
            }
        }
        return result;
    }
    babelConfig(templateCompiler, appFiles) {
        let babel = this.adapter.babelConfig();
        if (!babel.plugins) {
            babel.plugins = [];
        }
        // Our stage3 code is always allowed to use dynamic import. We may emit it
        // ourself when splitting routes.
        babel.plugins.push(require.resolve(this.adapter.babelMajorVersion() === 6
            ? 'babel-plugin-syntax-dynamic-import'
            : '@babel/plugin-syntax-dynamic-import'));
        // this is @embroider/macros configured for full stage3 resolution
        babel.plugins.push(macros_1.MacrosConfig.shared().babelPluginConfig());
        // this is our built-in support for the inline hbs macro
        babel.plugins.push([
            path_1.join(__dirname, 'babel-plugin-inline-hbs.js'),
            {
                templateCompiler,
                stage: 3,
            },
        ]);
        babel.plugins.push(this.adjustImportsPlugin(appFiles));
        return new portable_babel_config_1.default(babel, { basedir: this.root });
    }
    adjustImportsPlugin(appFiles) {
        let renamePackages = Object.assign({}, ...this.adapter.activeAddonDescendants.map(dep => dep.meta['renamed-packages']));
        let renameModules = Object.assign({}, ...this.adapter.activeAddonDescendants.map(dep => dep.meta['renamed-modules']));
        let activeAddons = {};
        for (let addon of this.adapter.activeAddonDescendants) {
            activeAddons[addon.name] = addon.root;
        }
        let relocatedFiles = {};
        for (let [relativePath, originalPath] of appFiles.relocatedFiles) {
            relocatedFiles[path_1.join(this.root, relativePath)] = originalPath;
        }
        let adjustOptions = {
            activeAddons,
            renameModules,
            renamePackages,
            extraImports: this.adapter.extraImports(),
            relocatedFiles,
            // it's important that this is a persistent location, because we fill it
            // up as a side-effect of babel transpilation, and babel is subject to
            // persistent caching.
            externalsDir: path_1.join(os_1.tmpdir(), 'embroider', 'externals'),
        };
        return [require.resolve('./babel-plugin-adjust-imports'), adjustOptions];
    }
    insertEmberApp(asset, appFiles, prepared, emberENV) {
        let html = asset.html;
        // our tests entrypoint already includes a correct module dependency on the
        // app, so we only insert the app when we're not inserting tests
        if (!asset.fileAsset.includeTests) {
            let appJS = this.appJSAsset(appFiles, prepared);
            html.insertScriptTag(html.javascript, appJS.relativePath, { type: 'module' });
        }
        html.insertStyleLink(html.styles, `assets/${this.app.name}.css`);
        let implicitScripts = this.impliedAssets('implicit-scripts', emberENV);
        if (implicitScripts.length > 0) {
            let vendorJS = new ConcatenatedAsset('assets/vendor.js', implicitScripts);
            prepared.set(vendorJS.relativePath, vendorJS);
            html.insertScriptTag(html.implicitScripts, vendorJS.relativePath);
        }
        let implicitStyles = this.impliedAssets('implicit-styles');
        if (implicitStyles.length > 0) {
            let vendorCSS = new ConcatenatedAsset('assets/vendor.css', implicitStyles);
            prepared.set(vendorCSS.relativePath, vendorCSS);
            html.insertStyleLink(html.implicitStyles, vendorCSS.relativePath);
        }
        if (asset.fileAsset.includeTests) {
            let testJS = prepared.get(`assets/test.js`);
            if (!testJS) {
                testJS = this.testJSEntrypoint(appFiles, prepared);
                prepared.set(testJS.relativePath, testJS);
            }
            html.insertScriptTag(html.testJavascript, testJS.relativePath, { type: 'module' });
            let implicitTestScripts = this.impliedAssets('implicit-test-scripts');
            if (implicitTestScripts.length > 0) {
                let testSupportJS = new ConcatenatedAsset('assets/test-support.js', implicitTestScripts);
                prepared.set(testSupportJS.relativePath, testSupportJS);
                html.insertScriptTag(html.implicitTestScripts, testSupportJS.relativePath);
            }
            let implicitTestStyles = this.impliedAssets('implicit-test-styles');
            if (implicitTestStyles.length > 0) {
                let testSupportCSS = new ConcatenatedAsset('assets/test-support.css', implicitTestStyles);
                prepared.set(testSupportCSS.relativePath, testSupportCSS);
                html.insertStyleLink(html.implicitTestStyles, testSupportCSS.relativePath);
            }
        }
    }
    updateAppJS(appJSPath) {
        if (!this.appDiffer) {
            this.appDiffer = new app_differ_1.default(this.root, appJSPath, this.adapter.activeAddonDescendants);
        }
        this.appDiffer.update();
        return new AppFiles(this.appDiffer.files);
    }
    prepareAsset(asset, appFiles, prepared, emberENV) {
        if (asset.kind === 'ember') {
            let prior = this.assets.get(asset.relativePath);
            let parsed;
            if (prior && prior.kind === 'built-ember' && prior.parsedAsset.validFor(asset)) {
                // we can reuse the parsed html
                parsed = prior.parsedAsset;
                parsed.html.clear();
            }
            else {
                parsed = new ParsedEmberAsset(asset);
            }
            this.insertEmberApp(parsed, appFiles, prepared, emberENV);
            prepared.set(asset.relativePath, new BuiltEmberAsset(parsed));
        }
        else {
            prepared.set(asset.relativePath, asset);
        }
    }
    prepareAssets(requestedAssets, appFiles, emberENV) {
        let prepared = new Map();
        for (let asset of requestedAssets) {
            this.prepareAsset(asset, appFiles, prepared, emberENV);
        }
        return prepared;
    }
    assetIsValid(asset, prior) {
        if (!prior) {
            return false;
        }
        switch (asset.kind) {
            case 'on-disk':
                return prior.kind === 'on-disk' && prior.size === asset.size && prior.mtime === asset.mtime;
            case 'in-memory':
                return prior.kind === 'in-memory' && stringOrBufferEqual(prior.source, asset.source);
            case 'built-ember':
                return prior.kind === 'built-ember' && prior.source === asset.source;
            case 'concatenated-asset':
                return (prior.kind === 'concatenated-asset' &&
                    prior.sources.length === asset.sources.length &&
                    prior.sources.every((priorFile, index) => {
                        let newFile = asset.sources[index];
                        return this.assetIsValid(newFile, priorFile);
                    }));
        }
        assert_never_1.default(asset);
    }
    updateOnDiskAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.copySync(asset.sourcePath, destination, { dereference: true });
    }
    updateInMemoryAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.writeFileSync(destination, asset.source, 'utf8');
    }
    updateBuiltEmberAsset(asset) {
        let destination = path_1.join(this.root, asset.relativePath);
        fs_extra_1.ensureDirSync(path_1.dirname(destination));
        fs_extra_1.writeFileSync(destination, asset.source, 'utf8');
    }
    async updateConcatenatedAsset(asset) {
        let concat = new fast_sourcemap_concat_1.default({
            outputFile: path_1.join(this.root, asset.relativePath),
            mapCommentType: asset.relativePath.endsWith('.js') ? 'line' : 'block',
            baseDir: this.root,
        });
        if (process.env.EMBROIDER_CONCAT_STATS) {
            let MeasureConcat = (await Promise.resolve().then(() => __importStar(require('./measure-concat')))).default;
            concat = new MeasureConcat(asset.relativePath, concat, this.root);
        }
        for (let source of asset.sources) {
            switch (source.kind) {
                case 'on-disk':
                    concat.addFile(paths_1.explicitRelative(this.root, source.sourcePath));
                    break;
                case 'in-memory':
                    if (typeof source.source !== 'string') {
                        throw new Error(`attempted to concatenated a Buffer-backed in-memory asset`);
                    }
                    concat.addSpace(source.source);
                    break;
                default:
                    assert_never_1.default(source);
            }
        }
        await concat.end();
    }
    async updateAssets(requestedAssets, appFiles, emberENV) {
        let assets = this.prepareAssets(requestedAssets, appFiles, emberENV);
        for (let asset of assets.values()) {
            if (this.assetIsValid(asset, this.assets.get(asset.relativePath))) {
                continue;
            }
            messages_1.debug('rebuilding %s', asset.relativePath);
            switch (asset.kind) {
                case 'on-disk':
                    this.updateOnDiskAsset(asset);
                    break;
                case 'in-memory':
                    this.updateInMemoryAsset(asset);
                    break;
                case 'built-ember':
                    this.updateBuiltEmberAsset(asset);
                    break;
                case 'concatenated-asset':
                    await this.updateConcatenatedAsset(asset);
                    break;
                default:
                    assert_never_1.default(asset);
            }
        }
        for (let oldAsset of this.assets.values()) {
            if (!assets.has(oldAsset.relativePath)) {
                fs_extra_1.unlinkSync(path_1.join(this.root, oldAsset.relativePath));
            }
        }
        this.assets = assets;
        return [...assets.values()];
    }
    gatherAssets(inputPaths) {
        // first gather all the assets out of addons
        let assets = [];
        for (let pkg of this.adapter.activeAddonDescendants) {
            if (pkg.meta['public-assets']) {
                for (let [filename, appRelativeURL] of Object.entries(pkg.meta['public-assets'] || {})) {
                    assets.push({
                        kind: 'on-disk',
                        sourcePath: path_1.join(pkg.root, filename),
                        relativePath: appRelativeURL,
                        mtime: 0,
                        size: 0,
                    });
                }
            }
        }
        // and finally tack on the ones from our app itself
        return assets.concat(this.adapter.assets(inputPaths));
    }
    async build(inputPaths) {
        let appFiles = this.updateAppJS(this.adapter.appJSSrcDir(inputPaths));
        let emberENV = this.adapter.emberENV();
        let assets = this.gatherAssets(inputPaths);
        let finalAssets = await this.updateAssets(assets, appFiles, emberENV);
        let templateCompiler = this.templateCompiler(emberENV);
        let babelConfig = this.babelConfig(templateCompiler, appFiles);
        this.addTemplateCompiler(templateCompiler);
        this.addBabelConfig(babelConfig);
        let assetPaths = assets.map(asset => asset.relativePath);
        for (let asset of finalAssets) {
            // our concatenated assets all have map files that ride along. Here we're
            // telling the final stage packager to be sure and serve the map files
            // too.
            if (asset.kind === 'concatenated-asset') {
                assetPaths.push(asset.sourcemapPath);
            }
        }
        let meta = {
            type: 'app',
            version: 2,
            assets: assetPaths,
            'template-compiler': {
                filename: '_template_compiler_.js',
                isParallelSafe: templateCompiler.isParallelSafe,
            },
            babel: {
                filename: '_babel_config_.js',
                isParallelSafe: babelConfig.isParallelSafe,
                majorVersion: this.adapter.babelMajorVersion(),
                fileFilter: '_babel_filter_.js',
            },
            'root-url': this.adapter.rootURL(),
        };
        if (!this.adapter.strictV2Format()) {
            meta['auto-upgraded'] = true;
        }
        let pkg = cloneDeep_1.default(this.app.packageJSON);
        if (pkg.keywords) {
            if (!pkg.keywords.includes('ember-addon')) {
                pkg.keywords.push('ember-addon');
            }
        }
        else {
            pkg.keywords = ['ember-addon'];
        }
        pkg['ember-addon'] = Object.assign({}, pkg['ember-addon'], meta);
        const pkgPath = path_1.join(this.root, 'package.json');
        // if package exists in the root, merge properties in pkg
        if (fs_extra_1.existsSync(pkgPath)) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const existingPkg = require(pkgPath);
            merge_1.default(pkg, existingPkg);
        }
        fs_extra_1.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    }
    templateCompiler(config) {
        let plugins = this.adapter.htmlbarsPlugins();
        if (!plugins.ast) {
            plugins.ast = [];
        }
        for (let macroPlugin of macros_1.MacrosConfig.shared().astPlugins()) {
            plugins.ast.push(macroPlugin);
        }
        return new template_compiler_1.default({
            plugins,
            compilerPath: resolve_1.default.sync(this.adapter.templateCompilerPath(), { basedir: this.root }),
            resolver: this.adapter.templateResolver(),
            EmberENV: config,
        });
    }
    addTemplateCompiler(templateCompiler) {
        fs_extra_1.writeFileSync(path_1.join(this.root, '_template_compiler_.js'), templateCompiler.serialize(), 'utf8');
    }
    addBabelConfig(babelConfig) {
        if (!babelConfig.isParallelSafe) {
            messages_1.warn('Your build is slower because some babel plugins are non-serializable');
        }
        fs_extra_1.writeFileSync(path_1.join(this.root, '_babel_config_.js'), babelConfig.serialize(), 'utf8');
        fs_extra_1.writeFileSync(path_1.join(this.root, '_babel_filter_.js'), babelFilterTemplate({ skipBabel: this.options.skipBabel }), 'utf8');
    }
    shouldSplitRoute(routeName) {
        return (!this.options.splitAtRoutes ||
            this.options.splitAtRoutes.find(pattern => {
                if (typeof pattern === 'string') {
                    return pattern === routeName;
                }
                else {
                    return pattern.test(routeName);
                }
            }));
    }
    splitRoute(routeName, files, addToParent, addLazyBundle) {
        let shouldSplit = routeName && this.shouldSplitRoute(routeName);
        let ownFiles = [];
        let ownNames = new Set();
        if (files.template) {
            if (shouldSplit) {
                ownFiles.push(files.template);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.template);
            }
        }
        if (files.controller) {
            if (shouldSplit) {
                ownFiles.push(files.controller);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.controller);
            }
        }
        if (files.route) {
            if (shouldSplit) {
                ownFiles.push(files.route);
                ownNames.add(routeName);
            }
            else {
                addToParent(routeName, files.route);
            }
        }
        for (let [childName, childFiles] of files.children) {
            this.splitRoute(`${routeName}.${childName}`, childFiles, (childRouteName, childFile) => {
                // this is our child calling "addToParent"
                if (shouldSplit) {
                    ownFiles.push(childFile);
                    ownNames.add(childRouteName);
                }
                else {
                    addToParent(childRouteName, childFile);
                }
            }, (routeNames, files) => {
                addLazyBundle(routeNames, files);
            });
        }
        if (ownFiles.length > 0) {
            addLazyBundle([...ownNames], ownFiles);
        }
    }
    appJSAsset(appFiles, prepared) {
        let cached = prepared.get(`assets/${this.app.name}.js`);
        if (cached) {
            return cached;
        }
        let requiredAppFiles = [appFiles.otherAppFiles];
        if (!this.options.staticComponents) {
            requiredAppFiles.push(appFiles.components);
        }
        if (!this.options.staticHelpers) {
            requiredAppFiles.push(appFiles.helpers);
        }
        let relativePath = `assets/${this.app.name}.js`;
        let lazyRoutes = [];
        for (let [routeName, routeFiles] of appFiles.routeFiles.children) {
            this.splitRoute(routeName, routeFiles, (_, filename) => {
                requiredAppFiles.push([filename]);
            }, (routeNames, files) => {
                let routeEntrypoint = `assets/_route_/${encodeURIComponent(routeNames[0])}.js`;
                if (!prepared.has(routeEntrypoint)) {
                    prepared.set(routeEntrypoint, this.routeEntrypoint(routeEntrypoint, files));
                }
                lazyRoutes.push({ names: routeNames, path: this.importPaths(routeEntrypoint, relativePath).buildtime });
            });
        }
        let amdModules = flatten_1.default(requiredAppFiles).map(file => this.importPaths(file, relativePath));
        // for the src tree, we can limit ourselves to only known resolvable
        // collections
        messages_1.todo('app src tree');
        // this is a backward-compatibility feature: addons can force inclusion of
        // modules.
        this.gatherImplicitModules('implicit-modules', amdModules);
        let source = entryTemplate({
            amdModules,
            autoRun: this.adapter.autoRun(),
            mainModule: paths_1.explicitRelative(path_1.dirname(relativePath), this.adapter.mainModule()),
            appConfig: this.adapter.mainModuleConfig(),
            lazyRoutes,
        });
        let asset = {
            kind: 'in-memory',
            source,
            relativePath,
        };
        prepared.set(relativePath, asset);
        return asset;
    }
    get modulePrefix() {
        return this.adapter.modulePrefix();
    }
    importPaths(appRelativePath, fromFile) {
        let noJS = appRelativePath.replace(/\.js$/, '');
        let noHBS = noJS.replace(/\.hbs$/, '');
        return {
            runtime: `${this.modulePrefix}/${noHBS}`,
            buildtime: paths_1.explicitRelative(path_1.dirname(fromFile), noJS),
        };
    }
    routeEntrypoint(relativePath, files) {
        let asset = {
            kind: 'in-memory',
            source: routeEntryTemplate({
                files: files.map(f => this.importPaths(f, relativePath)),
            }),
            relativePath,
        };
        return asset;
    }
    testJSEntrypoint(appFiles, prepared) {
        const myName = 'assets/test.js';
        let testModules = appFiles.tests
            .map(relativePath => {
            return `../${relativePath}`;
        })
            .filter(Boolean);
        // tests necessarily also include the app. This is where we account for
        // that. The classic solution was to always include the app's separate
        // script tag in the tests HTML, but that isn't as easy for final stage
        // packagers to understand. It's better to express it here as a direct
        // module dependency.
        testModules.unshift(paths_1.explicitRelative(path_1.dirname(myName), this.appJSAsset(appFiles, prepared).relativePath));
        let amdModules = [];
        // this is a backward-compatibility feature: addons can force inclusion of
        // test support modules.
        this.gatherImplicitModules('implicit-test-modules', amdModules);
        let source = entryTemplate({
            amdModules,
            eagerModules: testModules,
            testSuffix: true,
        });
        return {
            kind: 'in-memory',
            source,
            relativePath: myName,
        };
    }
    gatherImplicitModules(section, lazyModules) {
        for (let addon of this.adapter.activeAddonDescendants) {
            let implicitModules = addon.meta[section];
            if (implicitModules) {
                for (let name of implicitModules) {
                    lazyModules.push({
                        runtime: path_1.join(addon.name, name).replace(/\.hbs$/i, ''),
                        buildtime: paths_1.explicitRelative(path_1.join(this.root, 'assets'), path_1.join(addon.root, name)),
                    });
                }
            }
        }
    }
}
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "babelConfig", null);
__decorate([
    typescript_memoize_1.Memoize()
], AppBuilder.prototype, "modulePrefix", null);
exports.AppBuilder = AppBuilder;
const entryTemplate = js_handlebars_1.compile(`
import { importSync as i } from '@embroider/macros';
let w = window;
let d = w.define;

{{#each amdModules as |amdModule| ~}}
  d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}").default;});
{{/each}}

{{#each eagerModules as |eagerModule| ~}}
  i("{{js-string-escape eagerModule}}");
{{/each}}

{{#if lazyRoutes}}
  w._embroiderRouteBundles_ = [
    {{#each lazyRoutes as |route|}}
    {
      names: {{{json-stringify route.names}}},
      load: function() {
        return import("{{js-string-escape route.path}}");
      }
    },
    {{/each}}
  ]
{{/if}}

{{#if autoRun ~}}
  i("{{js-string-escape mainModule}}").default.create({{{json-stringify appConfig}}});
{{/if}}

{{#if testSuffix ~}}
  {{!- TODO: both of these suffixes should get dynamically generated so they incorporate
       any content-for added by addons. -}}

  {{!- this is the traditional test-support-suffix.js -}}
  runningTests = true;
  if (window.Testem) {
    window.Testem.hookIntoTestFramework();
  }

  {{!- this is the traditional tests-suffix.js -}}
  i('../tests/test-helper');
  EmberENV.TESTS_FILE_LOADED = true;
{{/if}}
`);
const routeEntryTemplate = js_handlebars_1.compile(`
import { importSync as i } from '@embroider/macros';
let d = window.define;
{{#each files as |amdModule| ~}}
d("{{js-string-escape amdModule.runtime}}", function(){ return i("{{js-string-escape amdModule.buildtime}}").default;});
{{/each}}
`);
function stringOrBufferEqual(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a === b;
    }
    if (a instanceof Buffer && b instanceof Buffer) {
        return Buffer.compare(a, b) === 0;
    }
    return false;
}
const babelFilterTemplate = js_handlebars_1.compile(`
const { babelFilter } = require('@embroider/core');
module.exports = babelFilter({{{json-stringify skipBabel}}});
`);
//# sourceMappingURL=app.js.map