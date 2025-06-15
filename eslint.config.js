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
    'react-hooks/exhaustive-deps': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: "JSXAttribute[name.name='ref']",
        message: 'React ref props are disallowed'
      },
      {
        selector: "Identifier[name='useRef']",
        message: 'useRef is prohibited'
      },
      {
        selector: "Identifier[name='createRef']",
        message: 'createRef is prohibited'
      },
      {
        selector: "Identifier[name='forwardRef']",
        message: 'forwardRef is prohibited'
      }
    ]
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
