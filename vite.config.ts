import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa.svg'],
      manifest: {
        name: 'Offline GPX Navigator',
        short_name: 'GPX Nav',
        description: 'Offline-first GPX route navigation with local maps, GPS, ETA, speed, and elevation data.',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              ['.pmtiles', '.mbtiles', '.mvt', '.pbf', '.geojson'].some((extension) =>
                url.pathname.toLowerCase().endsWith(extension),
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'offline-map-packages',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
