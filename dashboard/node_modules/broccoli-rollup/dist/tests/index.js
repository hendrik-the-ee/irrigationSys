"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const broccoli_test_helper_1 = require("broccoli-test-helper");
const Rollup = require("../index");
// tslint:disable-next-line:no-var-requires
const mergeTrees = require('broccoli-merge-trees');
const describe = QUnit.module;
const it = QUnit.test;
// tslint:disable:max-line-length
describe('Staging files smoke tests', () => {
    it('handles merged trees and building from staging', (assert) => __awaiter(this, void 0, void 0, function* () {
        yield using((use) => __awaiter(this, void 0, void 0, function* () {
            const input1 = use(yield broccoli_test_helper_1.createTempDir());
            const input2 = use(yield broccoli_test_helper_1.createTempDir());
            const node = new Rollup(mergeTrees([input1.path(), input2.path()]), {
                rollup: {
                    input: 'index.js',
                    output: {
                        file: 'out.js',
                        format: 'es',
                    },
                },
            });
            const output = use(broccoli_test_helper_1.createBuilder(node));
            input1.write({
                'add.js': 'export const add = num => num++;',
                'index.js': 'import two from "./two"; import { add } from "./add"; const result = add(two); export default result;',
            });
            input2.write({
                'minus.js': 'export const minus = num => num--;',
                'two.js': 'import { minus } from "./minus"; const two = minus(3); export default two;',
            });
            yield output.build();
            assert.deepEqual(output.read(), {
                'out.js': 'const minus = num => num--;\n\nconst two = minus(3);\n\nconst add = num => num++;\n\nconst result = add(two);\n\nexport default result;\n',
            });
        }));
    }));
});
describe('BroccoliRollup', () => {
    it('test build: initial update noop', (assert) => __awaiter(this, void 0, void 0, function* () {
        yield using((use) => __awaiter(this, void 0, void 0, function* () {
            const input = use(yield broccoli_test_helper_1.createTempDir());
            const subject = new Rollup(input.path(), {
                rollup: {
                    input: 'index.js',
                    output: {
                        file: 'out.js',
                        format: 'es',
                    },
                },
            });
            const output = use(broccoli_test_helper_1.createBuilder(subject));
            // INITIAL
            input.write({
                'add.js': 'export default x => x + x;',
                'index.js': 'import add from "./add"; const two = add(1); export default two;',
            });
            yield output.build();
            assert.deepEqual(output.read(), {
                'out.js': `var add = x => x + x;

const two = add(1);

export default two;
`,
            });
            assert.deepEqual(output.changes(), {
                'out.js': 'create',
            });
            // UPDATE
            input.write({
                'minus.js': `export default x => x - x;`,
            });
            yield output.build();
            assert.deepEqual(output.read(), {
                'out.js': `var add = x => x + x;

const two = add(1);

export default two;
`,
            });
            assert.deepEqual(output.changes(), {});
            input.write({
                'index.js': 'import add from "./add"; import minus from "./minus"; export default { a: add(1), b: minus(1) };',
            });
            yield output.build();
            assert.deepEqual(output.read(), {
                'out.js': `var add = x => x + x;

var minus = x => x - x;

var index = { a: add(1), b: minus(1) };

export default index;
`,
            });
            assert.deepEqual(output.changes(), {
                'out.js': 'change',
            });
            input.write({ 'minus.js': null });
            let errorWasThrown = false;
            try {
                yield output.build();
            }
            catch (e) {
                errorWasThrown = true;
                assert.ok(e.message.startsWith('Could not load'));
            }
            assert.ok(errorWasThrown);
            input.write({
                'index.js': 'import add from "./add"; export default add(1);',
            });
            yield output.build();
            assert.deepEqual(output.read(), {
                'out.js': `var add = x => x + x;

var index = add(1);

export default index;
`,
            });
            assert.deepEqual(output.changes(), {
                'out.js': 'change',
            });
            // NOOP
            yield output.build();
            assert.deepEqual(output.changes(), {});
        }));
    }));
    describe('targets', (hooks) => {
        let input;
        hooks.beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            input = yield broccoli_test_helper_1.createTempDir();
            input.write({
                'add.js': 'export default x => x + x;',
                'index.js': 'import add from "./add"; const two = add(1); export default two;'
            });
        }));
        hooks.afterEach(() => __awaiter(this, void 0, void 0, function* () {
            yield input.dispose();
        }));
        // supports multiple targets
        it('works with one explicit target', (assert) => __awaiter(this, void 0, void 0, function* () {
            const node = new Rollup(input.path(), {
                rollup: {
                    input: 'index.js',
                    output: [{
                            file: 'dist/out.umd.js',
                            format: 'umd',
                            name: 'thing',
                        }],
                },
            });
            const output = broccoli_test_helper_1.createBuilder(node);
            try {
                yield output.build();
                assert.deepEqual(output.read(), {
                    dist: {
                        'out.umd.js': `(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.thing = factory());
}(this, (function () { 'use strict';

var add = x => x + x;

const two = add(1);

return two;

})));\n`
                    }
                });
            }
            finally {
                yield output.dispose();
            }
        }));
        it('works with many targets', (assert) => __awaiter(this, void 0, void 0, function* () {
            const node = new Rollup(input.path(), {
                rollup: {
                    input: 'index.js',
                    output: [{
                            file: 'dist/out.umd.js',
                            format: 'umd',
                            name: 'thing',
                        }, {
                            file: 'dist/out.js',
                            format: 'es',
                            sourcemap: true,
                        }],
                },
            });
            const output = broccoli_test_helper_1.createBuilder(node);
            try {
                yield output.build();
                assert.deepEqual(output.read(), {
                    dist: {
                        'out.js': `var add = x => x + x;

const two = add(1);

export default two;
//# sourceMappingURL=out.js.map`,
                        'out.js.map': '{"version":3,"file":"out.js","sources":["../add.js","../index.js"],"sourcesContent":["export default x => x + x;","import add from \\"./add\\"; const two = add(1); export default two;"],"names":[],"mappings":"AAAA,UAAe,CAAC,IAAI,CAAC,GAAG,CAAC;;qBAAC,rBCAD,MAAM,GAAG,GAAG,GAAG,CAAC,CAAC,CAAC;;;;"}',
                        'out.umd.js': `(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.thing = factory());
}(this, (function () { 'use strict';

var add = x => x + x;

const two = add(1);

return two;

})));\n`,
                    }
                });
            }
            finally {
                yield output.dispose();
            }
        }));
    });
    describe('passing nodeModulesPath', () => {
        it('should throw if nodeModulesPath is relative', (assert) => {
            assert.throws(() => new Rollup('lib', {
                nodeModulesPath: './',
                rollup: {
                    input: 'index.js',
                    output: {
                        file: 'out.js',
                        format: 'es',
                    },
                },
            }), new Error('nodeModulesPath must be fully qualified and you passed a relative path'));
        });
    });
    describe('tree shaking', () => {
        it('can code split', (assert) => __awaiter(this, void 0, void 0, function* () {
            yield using((use) => __awaiter(this, void 0, void 0, function* () {
                const input = use(yield broccoli_test_helper_1.createTempDir());
                const subject = new Rollup(input.path(), {
                    rollup: {
                        experimentalCodeSplitting: true,
                        input: ['a.js', 'b.js'],
                        output: {
                            dir: 'chunks',
                            format: 'es',
                        },
                    },
                });
                const output = use(broccoli_test_helper_1.createBuilder(subject));
                input.write({
                    'a.js': 'import c from "./c"; import e from "./e"; export const out = c + e;',
                    'b.js': 'import d from "./d";import e from "./e"; export const out = d + e;',
                    'c.js': 'const num1 = 1; export default num1;',
                    'd.js': 'const num2 = 2; export default num2;',
                    'e.js': 'const num3 = 3; export default num3;',
                });
                yield output.build();
                assert.deepEqual(output.read(), {
                    chunks: {
                        'a.js': `import { e as num3 } from './chunk1.js';

const num1 = 1;

const out = num1 + num3;

export { out };
`,
                        'b.js': `import { e as num3 } from './chunk1.js';

const num2 = 2;

const out = num2 + num3;

export { out };
`,
                        'chunk1.js': `const num3 = 3;

export { num3 as e };
`,
                    },
                });
            }));
        }));
    });
});
// tslint:disable:no-conditional-assignment
function using(body) {
    return __awaiter(this, void 0, void 0, function* () {
        const disposables = [];
        const use = (disposable) => {
            disposables.push(disposable);
            return disposable;
        };
        try {
            yield body(use);
        }
        finally {
            let disposable;
            while (disposable = disposables.pop()) {
                yield disposable.dispose();
            }
        }
    });
}
//# sourceMappingURL=index.js.map