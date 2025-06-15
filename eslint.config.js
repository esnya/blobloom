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
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
    '@typescript-eslint/no-unused-vars': ['error'],
    // TODO: change to 'error' after resolving legacy issues
    'react/display-name': 'warn',
    // TODO: change to 'error' after resolving legacy issues
    'react/jsx-uses-react': 'warn',
    // TODO: change to 'error' after resolving legacy issues
    'react/react-in-jsx-scope': 'warn',
    // TODO: change to 'error' after verifying hook usage
    'react-hooks/rules-of-hooks': 'warn',
    // TODO: change to 'error' after verifying dependencies
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
});

export default compat.config(eslintrc);
