import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'Molins Dansa 2026',
        short_name: 'Molins Dansa',
        description: 'Concurs de vídeos de dansa a Molins de Rei. Participa, vota i descobreix les actuacions al mapa interactiu.',
        lang: 'ca',
        theme_color: '#e11d48',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Lectures de Firestore i autenticació: la xarxa mana, però cau si no hi ha connexió.
            urlPattern: ({ url }) =>
              url.hostname === 'firestore.googleapis.com' || url.hostname === 'identitytoolkit.googleapis.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'molins-dansa-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            // Miniatures de YouTube: canvien poques vegades, val la pena servir-les de cau.
            urlPattern: ({ url }) => url.hostname === 'img.youtube.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'molins-dansa-thumbnails',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
