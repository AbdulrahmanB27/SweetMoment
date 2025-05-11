import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/SweetMoment/', // Base path for GitHub Pages with repository name
  build: {
    outDir: 'dist',
  },
});
