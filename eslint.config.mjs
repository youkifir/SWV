import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { FlatCompat } from '@eslint/eslintrc';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
