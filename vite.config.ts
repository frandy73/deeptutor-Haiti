import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3006,
      host: true,
      strictPort: false
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icons/icon-192x192.png',
          'icons/icon-512x512.png',
          'favicon.svg',
          'logo.png',
          'offline.html',
        ],
        manifest: {
          name: 'Pwof Ou – AI Tutor Ayisyen',
          short_name: 'Pwof Ou',
          description: 'AI tutor pèsonèl pou elèv ayisyen soti 1ère AF rive NS4. Aprann Kreyòl, Matematik, Fizik, Biyoloji ak plis ankò — menm san entènèt!',
          theme_color: '#2563eb',
          background_color: '#0a0e1a',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          categories: ['education', 'productivity'],
          lang: 'ht',
          dir: 'ltr',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Egzamen Leta',
              short_name: 'Egzamen',
              description: 'Pratike egzamen ofisyèl MENFP',
              url: '/?module=bac-exams',
              icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Flashcards',
              short_name: 'Flashcards',
              description: 'Revize ak kat memwa',
              url: '/?module=flashcards',
              icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Kòmanse Aprann',
              short_name: 'Aprann',
              description: 'Gid aprantisaj pèsonalize',
              url: '/?module=guided-learning',
              icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            // Google Fonts stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Google Fonts webfont files (woff2)
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // KaTeX CDN (CSS + JS)
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/katex.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'katex-cdn-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Gemini API responses — cache for offline review
            {
              urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'gemini-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                networkTimeoutSeconds: 10,
              },
            },
            // Cached exam PDF files — cache on-demand (runtime caching instead of precaching)
            {
              urlPattern: /\/exams\/.*\.pdf$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'exams-pdf-cache',
                expiration: {
                  maxEntries: 40,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
