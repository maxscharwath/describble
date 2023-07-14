import {defineConfig} from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
export default defineConfig({
	plugins: [wasm(), topLevelAwait()],
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text'],
		},
		browser: {
			name: 'chrome',
			headless: true,
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			supported: {
				bigint: true,
			},
		},
	},
});
