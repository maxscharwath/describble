import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	treeshake: true,
	format: ['esm', 'cjs'],
	splitting: false,
	minify: true,
	clean: true,
	dts: true,
	sourcemap: false,
	external: [
		'react',
	],
});
