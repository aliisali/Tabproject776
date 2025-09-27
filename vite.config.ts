import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/blindscloud-platform/',
  define: {
    global: 'window',
    'process.env': {},
    process: {
      env: {}
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
