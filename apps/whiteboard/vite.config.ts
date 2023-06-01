import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import {fileURLToPath, URL} from 'url';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), wasm(), topLevelAwait()],
	resolve: {
		alias: [
			{find: '~core', replacement: fileURLToPath(new URL('./src/core', import.meta.url))},
			{find: '~components', replacement: fileURLToPath(new URL('./src/components', import.meta.url))},
			{find: '~utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url))},
		],
	},
	optimizeDeps: {
		exclude: ['@automerge/automerge-wasm'],
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
		globals: true,
		coverage: {
			provider: 'c8',
			reporter: ['text'],
		},
	},
});
