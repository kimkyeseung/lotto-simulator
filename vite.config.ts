import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import devServer from '@hono/vite-dev-server'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    devServer({
      entry: 'src/server/index.ts',
      exclude: [
        /.*\.tsx?($|\?)/,
        /.*\.css($|\?)/,
        /.*\.js($|\?)/,
        /.*\.json($|\?)/,
        /.*\.svg($|\?)/,
        /.*\.png($|\?)/,
        /.*\.ico($|\?)/,
        /^\/@.*/,
        /^\/node_modules\/.*/,
        /^\/src\/.*/,
        /^\/($|\?)/,
      ],
      injectClientScript: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
          ],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-clerk': ['@clerk/clerk-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    sourcemap: false,
  },
})
