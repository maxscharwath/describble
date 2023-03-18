import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from '@samrum/vite-plugin-web-extension';
import {fileURLToPath, URL} from 'url';
import {getManifest} from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig(() => ({
	plugins: [
		react(),
		webExtension({
			manifest: getManifest(3),
		}),
	],
	resolve: {
		alias: [
			{find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url))},
		],
	},
}));
