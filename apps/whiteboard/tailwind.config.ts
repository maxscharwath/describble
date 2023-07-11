import daisyui from 'daisyui';
import {type Config} from 'tailwindcss';

export default {
	darkMode: ['class', '[data-theme="dark"]'],
	content: [
		'./src/**/*.{js,jsx,ts,tsx}',
		'../../packages/ui/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			height: {
				screen: '100dvh',
			},
			screens: {
				standalone: {raw: '(display-mode: standalone)'},
			},
			fontFamily: {
				caveat: ['Caveat', 'cursive'],
			},
			keyframes: {
				'fade-in': {
					'0%': {opacity: '0'},
					'100%': {opacity: '1'},
				},
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
			},
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: true,
	},
} satisfies Config;
