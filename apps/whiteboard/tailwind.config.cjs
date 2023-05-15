/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      height: {
        'screen': '100dvh',
      },
      screens: {
        'standalone': {'raw': '(display-mode: standalone)'},
      },
      fontFamily: {
        'caveat': ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}
