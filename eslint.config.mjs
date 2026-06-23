import { defineConfig } from '@vben/eslint-config';

export default defineConfig([
  {
    files: ['apps/*/src/plugins/**/*'],
    rules: {
      'n/no-extraneous-import': 'off',
    },
  },
  {
    files: ['apps/*/src/plugins/**/package.json'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
    },
  },
]);
