import {defineConfig} from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		node: 'src/node.ts',
		sw: 'src/keys/sw.ts',
	},
	format: ['esm', 'cjs'],
	treeshake: true,
	splitting: true,
	sourcemap: false,
	minify: true,
	clean: true,
	dts: true,
});
