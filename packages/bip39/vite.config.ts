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
		exclude: ['@noble/hashes'],
	},
});
