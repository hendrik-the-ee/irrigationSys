"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auto_import_1 = __importDefault(require("./auto-import"));
module.exports = {
    name: 'ember-auto-import',
    setupPreprocessorRegistry(type, registry) {
        // we register on our parent registry (so we will process code
        // from the app or addon that chose to include us) rather than our
        // own registry (which would cause us to process our own code)
        if (type !== 'parent') {
            return;
        }
        // This is where we hook our analyzer into the build pipeline so
        // it will see all the consumer app or addon's javascript
        registry.add('js', {
            name: 'ember-auto-import-analyzer',
            toTree: (tree) => {
                return auto_import_1.default.lookup(this).analyze(tree, this);
            }
        });
    },
    included() {
        let autoImport = auto_import_1.default.lookup(this);
        this._super.included.apply(this, arguments);
        if (autoImport.isPrimary(this)) {
            autoImport.included(this);
        }
    },
    updateFastBootManifest(manifest) {
        let autoImport = auto_import_1.default.lookup(this);
        if (autoImport.isPrimary(this)) {
            autoImport.updateFastBootManifest(manifest);
        }
        return manifest;
    }
};
//# sourceMappingURL=index.js.map