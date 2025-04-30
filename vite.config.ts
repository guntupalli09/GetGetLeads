import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react']
    },
    server: {
      host: true,
      port: 3000
    },
    preview: {
      host: true,
      port: 3000
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'recharts'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    define: {
      'process.env': Object.keys(env).reduce((prev, key) => {
        return {
          ...prev,
          [key]: JSON.stringify(env[key])
        };
      }, {})
    }
  };
});