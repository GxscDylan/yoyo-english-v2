import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // PWA 仅在 production build 时启用，dev 模式禁用以避免 SW 缓存干扰
    ...(mode === 'production' ? [VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: '呦呦英语启蒙',
        short_name: '呦呦英语',
        description: '最友好的3-8岁免费英语启蒙工具',
        theme_color: '#FF8C42',
        background_color: '#FFF8F0',
        display: 'standalone',
        orientation: 'landscape-primary',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    allowedHosts: ['.cpolar.top', 'localhost']
  },
  preview: {
    allowedHosts: ['.cpolar.top', 'localhost']
  }
}))