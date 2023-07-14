import {defineConfig} from 'vite';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text'],
		},
	},
});
