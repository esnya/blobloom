import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const eslintrc = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    '@typescript-eslint/no-unused-vars': ['error']
  }
};

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
});

export default compat.config(eslintrc);
