import {defineConfig} from 'vite';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'c8',
			reporter: ['text'],
		},
	},
});
