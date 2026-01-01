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
})
