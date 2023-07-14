import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	treeshake: true,
	splitting: true,
	sourcemap: false,
	minify: true,
	clean: true,
	dts: true,
});
