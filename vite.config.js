import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Repository names are case-sensitive on GitHub Pages.
  base: '/Artwin/',
  build: {
    // Three + the embedded Rapier WASM are intentionally sizeable local assets.
    chunkSizeWarningLimit: 2500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'physics', test: /rapier3d-compat/ },
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
          ],
        },
      },
    },
  },
});
