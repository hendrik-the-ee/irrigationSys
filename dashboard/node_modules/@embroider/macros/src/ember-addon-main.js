"use strict";
const path_1 = require("path");
const _1 = require(".");
module.exports = {
    name: '@embroider/macros',
    included(parent) {
        this._super.included.apply(this, arguments);
        let parentOptions = (parent.options = parent.options || {});
        let ownOptions = (parentOptions['@embroider/macros'] = parentOptions['@embroider/macros'] || {});
        // if parent is an addon it has root. If it's an app it has project.root.
        let source = parent.root || parent.project.root;
        if (ownOptions.setOwnConfig) {
            _1.MacrosConfig.shared().setOwnConfig(source, ownOptions.setOwnConfig);
        }
        if (ownOptions.setConfig) {
            for (let [packageName, config] of Object.entries(ownOptions.setConfig)) {
                _1.MacrosConfig.shared().setConfig(source, packageName, config);
            }
        }
        let babelOptions = (parentOptions.babel = parentOptions.babel || {});
        let babelPlugins = (babelOptions.plugins = babelOptions.plugins || []);
        babelPlugins.unshift(_1.MacrosConfig.shared().babelPluginConfig(source));
    },
    setupPreprocessorRegistry(type, registry) {
        if (type === 'parent') {
            // the htmlbars-ast-plugins are split into two parts because order is
            // important. Weirdly, they appear to run in the reverse order that you
            // register them here.
            let plugins = _1.MacrosConfig.shared().astPlugins(this.parent.root);
            plugins.forEach((plugin, index) => {
                registry.add('htmlbars-ast-plugin', {
                    name: `@embroider/macros/${index}`,
                    plugin,
                    baseDir() {
                        return path_1.join(__dirname, '..');
                    },
                });
            });
        }
    },
};
//# sourceMappingURL=ember-addon-main.js.map