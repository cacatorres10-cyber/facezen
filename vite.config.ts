/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json' with { type: 'json' }

// BASE_PATH permite publicar em subpasta (ex.: GitHub Pages em /facezen/).
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'FaceZen — Yoga Facial & Skincare',
        short_name: 'FaceZen',
        description: 'Yoga facial e skincare consciente em 10 minutos, personalizado para você.',
        lang: 'pt-BR',
        theme_color: '#1F5A4E',
        background_color: '#EEF2EF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Só as fontes do alfabeto latino entram no cache offline.
        globIgnores: ['**/*cyrillic*', '**/*vietnamese*', '**/*greek*'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Fotos do Unsplash ficam em cache para funcionar offline depois da 1ª visita.
            urlPattern: ({ url }) => url.hostname.endsWith('unsplash.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'facezen-fotos',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
