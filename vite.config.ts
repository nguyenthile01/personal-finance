import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true, // keep sourcemaps for your code
  },
  // suppress warnings about missing source maps in dependencies
  esbuild: {
    sourcemap: true,
    legalComments: 'none', // optional, can reduce noise
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**'], // prevents watching node_modules
    },
  },
  logLevel: 'info', // optional: can be 'warn' or 'error' to hide warnings
})
