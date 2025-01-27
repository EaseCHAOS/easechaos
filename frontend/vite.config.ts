import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';


const pwa = {
  registerType: 'prompt',
  includeAssets: ['assets/easechaos.png'],
  manifest: {
    name: 'EaseCHAOS',
    short_name: 'EaseCHAOS',
    description: 'UMaT Timetable Viewer',
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
        type: 'image/png'
      }
    ]
  },
  workbox: {
    cacheId: 'easechaos-v1',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/easechaos\.onrender\.com\/.*$/,
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
  plugins: [react(), VitePWA(pwa as Partial<VitePWAOptions>)],
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
