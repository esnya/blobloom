import { createRequire } from 'node:module';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const require = createRequire(import.meta.url);
const eslintrc = require('./.eslintrc.json');

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended
});

export default compat.config(eslintrc);
