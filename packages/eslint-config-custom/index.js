module.exports = {
  extends: ['xo', 'xo-typescript', 'turbo', 'plugin:react/recommended', 'plugin:tailwindcss/recommended'],
  settings: {
    react: {
      version: 'detect',
    }
  },
  rules: {
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'signature',

          'public-decorated-field',
          'public-instance-field',
          'public-abstract-field',
          'public-field',

          'protected-decorated-field',
          'protected-instance-field',
          'protected-abstract-field',
          'protected-field',

          'private-decorated-field',
          'private-instance-field',
          'private-field',

          'instance-field',
          'abstract-field',
          'decorated-field',
          'field',

          'public-constructor',
          'protected-constructor',
          'private-constructor',
          'constructor',

          'public-decorated-method',
          'public-instance-method',
          'public-abstract-method',
          'public-method',

          'protected-decorated-method',
          'protected-instance-method',
          'protected-abstract-method',
          'protected-method',

          'private-decorated-method',
          'private-instance-method',
          'private-method',

          'instance-method',
          'abstract-method',
          'decorated-method',
          'method',

          'public-static-field',
          'public-static-method',

          'protected-static-field',
          'protected-static-method',

          'private-static-field',
          'private-static-method',

          'static-field',
          'static-method',
        ]
      }
    ],
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/naming-convention': 'off',
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    'react/prop-types': 'off',
    'no-bitwise': 'off',
  },
}
