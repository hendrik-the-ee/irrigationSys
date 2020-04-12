import Plugin from 'broccoli-plugin';
import { Packager } from './packager';
import Stage from './stage';
interface BroccoliPackager<Options> {
    new (stage: Stage, options?: Options): Plugin;
}
export default function toBroccoliPlugin<Options>(packagerClass: Packager<Options>): BroccoliPackager<Options>;
export {};
