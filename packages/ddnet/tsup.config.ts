import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts', 'src/index.node.ts'],
	format: ['esm'],
	splitting: true,
	sourcemap: false,
	minify: true,
	clean: true,
	dts: true,
});
