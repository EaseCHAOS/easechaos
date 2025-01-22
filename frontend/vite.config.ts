import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa';


const pwa = {
  registerType: 'autoUpdate',
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
    runtimeCaching: [
      // Cache API responses from Render
      {
        urlPattern: /^https:\/\/easechaos\.onrender\.com\/.*$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          // Add headers for CORS
          fetchOptions: {
            mode: 'cors',
            credentials: 'same-origin'
          }
        }
      },
      // Cache static assets
      {
        urlPattern: /\.(js|css|png|jpg|jpeg|svg|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      }
    ],
    // Ensure offline functionality
    navigateFallback: '/index.html',
    navigateFallbackAllowlist: [/^(?!\/__)/], // Exclude service worker paths
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
