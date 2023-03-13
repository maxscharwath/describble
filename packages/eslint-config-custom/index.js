module.exports = {
  extends: ['xo', 'xo-typescript', 'turbo', 'plugin:react/recommended', 'plugin:tailwindcss/recommended'],
  settings: {
    react: {
      version: 'detect',
    }
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/ban-types': 'off',
  },
}
