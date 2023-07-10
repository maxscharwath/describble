import {defineConfig, splitVendorChunkPlugin} from 'vite';
import react from '@vitejs/plugin-react-swc';
import wasm from 'vite-plugin-wasm';
import {fileURLToPath, URL} from 'url';
import topLevelAwait from 'vite-plugin-top-level-await';
import {VitePWA as pwa, type VitePWAOptions} from 'vite-plugin-pwa';

const pwaConfig = {
	registerType: 'autoUpdate',
	manifest: {
		name: 'Describble',
		short_name: 'Describble',
		description: 'An innovative whiteboard application designed to help you collaborate and bring your ideas to life.',
		theme_color: '#ffffff',
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		icons: [
			{
				src: 'pwa-64x64.png',
				sizes: '64x64',
				type: 'image/png',
			},
			{
				src: 'pwa-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: 'pwa-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any',
			},
			{
				src: 'maskable-icon-512x512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'maskable',
			},
		],
	},
} satisfies Partial<VitePWAOptions>;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [pwa(pwaConfig), splitVendorChunkPlugin(), wasm(), topLevelAwait(), react()],
	resolve: {
		alias: [
			{find: '~core', replacement: fileURLToPath(new URL('./src/core', import.meta.url))},
			{find: '~components', replacement: fileURLToPath(new URL('./src/components', import.meta.url))},
			{find: '~utils', replacement: fileURLToPath(new URL('./src/utils', import.meta.url))},
			{find: '~pages', replacement: fileURLToPath(new URL('./src/pages', import.meta.url))},
			{find: '~seeders', replacement: fileURLToPath(new URL('./src/seeders', import.meta.url))},
		],
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
