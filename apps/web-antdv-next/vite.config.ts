import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      resolve: {
        alias: {
          '#': fileURLToPath(new URL('src', import.meta.url)),
        },
      },
    },
  };
});
