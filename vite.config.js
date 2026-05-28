import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // PWA 仅在 production build 时启用，dev 模式禁用以避免 SW 缓存干扰
    ...(mode === 'production' ? [VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'icon-48.png', 'icon-72.png', 'icon-96.png',
        'icon-152.png', 'icon-167.png', 'icon-180.png',
        'icon-192.png', 'icon-384.png', 'icon-512.png',
        'icon-maskable-192.png', 'icon-maskable-512.png',
        'splash/*.png'
      ],
      manifest: {
        name: '呦呦英语启蒙',
        short_name: '呦呦英语',
        description: '最友好的3-8岁免费英语启蒙工具，四步科学练，游戏化学习，离线可用',
        theme_color: '#FF8C42',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'landscape-primary',
        lang: 'zh-CN',
        scope: '/',
        start_url: '/#/',
        categories: ['education', 'kids'],
        icons: [
          { src: 'icon-48.png', sizes: '48x48', type: 'image/png' },
          { src: 'icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: 'icon-96.png', sizes: '96x96', type: 'image/png' },
          { src: 'icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icon-167.png', sizes: '167x167', type: 'image/png', purpose: 'any' },
          { src: 'icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          { src: 'splash/splash-1668x2388.png', sizes: '1668x2388', type: 'image/png', form_factor: 'narrow' },
          { src: 'splash/splash-2388x1668.png', sizes: '2388x1668', type: 'image/png', form_factor: 'wide' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,json}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/offline/, /^\/sw\.js$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/audio\/.*\.mp3$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'audio-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    allowedHosts: ['.cpolar.top', 'localhost']
  },
  preview: {
    allowedHosts: ['.cpolar.top', 'localhost']
  }
}))
