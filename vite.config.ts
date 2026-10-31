
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/ArabPromptdawAi/';

export default defineConfig(() => {
  return {
    base,

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon.png',
          'apple-touch-icon.png',
          'icon.svg',
        ],
        manifestFilename: 'manifest.webmanifest',

        manifest: {
          id: base,
          name: 'Arabiprompt AI Studio',
          short_name: 'Arabiprompt',
          description:
            'منصتك الذكية لإنشاء الصور والفيديوهات بالذكاء الاصطناعي وهندسة الأوامر الرقمية',

          lang: 'ar',
          dir: 'rtl',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',

          start_url: base,
          scope: base,

          categories: [
            'business',
            'education',
            'entertainment',
            'graphics',
            'productivity',
            'utilities',
          ],

          display_override: [
            'standalone',
            'minimal-ui',
            'browser',
          ],

          icons: [
            {
              src: `${base}icons/icon-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}icons/icon-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}icons/icon-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: `${base}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],

          screenshots: [
            {
              src: `${base}icons/screenshot-mobile.png`,
              sizes: '1080x1920',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Arabiprompt Mobile App',
            },
            {
              src: `${base}icons/screenshot-desktop.png`,
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Arabiprompt Studio Workspace',
            },
          ],
        },

        workbox: {
          maximumFileSizeToCacheInBytes:
            5 * 1024 * 1024,

          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,woff,woff2}',
          ],

          navigateFallback: `${base}index.html`,

          runtimeCaching: [
            {
              urlPattern:
                /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds:
                    60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern:
                /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds:
                    60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },

        devOptions: {
          enabled: false,
        },
      }),
    ],

    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
      ],
    },

    build: {
      target: 'esnext',
      cssMinify: true,
      minify: 'esbuild',

      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')
            ) {
              return 'vendor-react';
            }

            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }

            if (
              id.includes('node_modules/prismjs') ||
              id.includes('node_modules/react-markdown')
            ) {
              return 'vendor-syntax';
            }

            if (id.includes('node_modules/motion')) {
              return 'vendor-motion';
            }

            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-lucide';
            }
          },
        },
      },

      chunkSizeWarningLimit: 800,
    },

    server: {
      // Preserve Google AI Studio HMR behavior.
      hmr: process.env.DISABLE_HMR !== 'true',

      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});
