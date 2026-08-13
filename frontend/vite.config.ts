import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';
import path from 'path';


const pwa = {
  registerType: 'prompt',
  includeAssets: ['assets/easechaos.png'],
  manifest: {
    name: 'EaseCHAOS',
    short_name: 'EaseCHAOS',
    description: 'UMaT Timetable & Exam Schedule Viewer',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#000000',
    icons: [
      {
        src: 'assets/easechaos.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'assets/easechaos.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  },
  workbox: {
    cacheId: 'easechaos-v1',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/easechaos\.(xyz|adjarnor\.live)\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          fetchOptions: {
            mode: 'cors',
            credentials: 'same-origin'
          }
        }
      },
      {
        urlPattern: /\.(js|css|png|jpg|jpeg|svg|ico)$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60
          }
        }
      }
    ],
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigateFallback: '/index.html',
    navigateFallbackAllowlist: [/^(?!\/__)/], 
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    VitePWA(pwa as Partial<VitePWAOptions>),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'date': ['date-fns'],
        }
      }
    }
  }
});
