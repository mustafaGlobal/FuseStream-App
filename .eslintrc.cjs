/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  extends: [
    'plugin:vue/strongly-recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'vue/no-multiple-template-root': 'off'
  }
};
