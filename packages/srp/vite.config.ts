import {defineConfig} from 'vite';

export default defineConfig({
	test: {
		globals: true,
		browser: {
			name: 'chrome',
			headless: true,
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext',
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis',
			},
			supported: {
				bigint: true,
			},
		},
	},
	build: {
		target: ['esnext'],
	},
});
