import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import sass from 'sass';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    preprocessorOptions: {
      scss: {
        implementation: sass,
        logger: {
          warn: (message) => {
            if (
              !message.includes('Deprecation Warning') &&
              !message.includes('@import rules are deprecated') &&
              !message.includes('Global built-in functions are deprecated and will be removed') &&
              !message.includes('The legacy JS API is deprecated and will be removed') &&
              !message.includes('https://sass-lang.com/d/color-functions') &&
              !message.includes('repetitive deprecation warnings omitted')
            ) {
              console.warn(message); // Only log non-deprecation warnings
            }
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/views': path.resolve(__dirname, './src/views'),
      '@/redux': path.resolve(__dirname, './src/redux'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      moment: 'moment/moment.js',
    },
  },
})