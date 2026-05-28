// vite.config.js
import { defineConfig } from "file:///D:/WorkBuddySpace/2026-05-25-11-14-21/yoyo-english-v2/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/WorkBuddySpace/2026-05-25-11-14-21/yoyo-english-v2/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///D:/WorkBuddySpace/2026-05-25-11-14-21/yoyo-english-v2/node_modules/vite-plugin-pwa/dist/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///D:/WorkBuddySpace/2026-05-25-11-14-21/yoyo-english-v2/vite.config.js";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // PWA 仅在 production build 时启用，dev 模式禁用以避免 SW 缓存干扰
    ...mode === "production" ? [VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "\u5466\u5466\u82F1\u8BED\u542F\u8499",
        short_name: "\u5466\u5466\u82F1\u8BED",
        description: "\u6700\u53CB\u597D\u76843-8\u5C81\u514D\u8D39\u82F1\u8BED\u542F\u8499\u5DE5\u5177",
        theme_color: "#FF8C42",
        background_color: "#FFF8F0",
        display: "standalone",
        orientation: "landscape-primary",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3,json}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })] : []
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    allowedHosts: [".cpolar.top", "localhost"]
  },
  preview: {
    allowedHosts: [".cpolar.top", "localhost"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxXb3JrQnVkZHlTcGFjZVxcXFwyMDI2LTA1LTI1LTExLTE0LTIxXFxcXHlveW8tZW5nbGlzaC12MlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcV29ya0J1ZGR5U3BhY2VcXFxcMjAyNi0wNS0yNS0xMS0xNC0yMVxcXFx5b3lvLWVuZ2xpc2gtdjJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1dvcmtCdWRkeVNwYWNlLzIwMjYtMDUtMjUtMTEtMTQtMjEveW95by1lbmdsaXNoLXYyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgLy8gUFdBIFx1NEVDNVx1NTcyOCBwcm9kdWN0aW9uIGJ1aWxkIFx1NjVGNlx1NTQyRlx1NzUyOFx1RkYwQ2RldiBcdTZBMjFcdTVGMEZcdTc5ODFcdTc1MjhcdTRFRTVcdTkwN0ZcdTUxNEQgU1cgXHU3RjEzXHU1QjU4XHU1RTcyXHU2MjcwXG4gICAgLi4uKG1vZGUgPT09ICdwcm9kdWN0aW9uJyA/IFtWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLnN2ZycsICdpY29uLTE5Mi5wbmcnLCAnaWNvbi01MTIucG5nJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnXHU1NDY2XHU1NDY2XHU4MkYxXHU4QkVEXHU1NDJGXHU4NDk5JyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ1x1NTQ2Nlx1NTQ2Nlx1ODJGMVx1OEJFRCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnXHU2NzAwXHU1M0NCXHU1OTdEXHU3Njg0My04XHU1QzgxXHU1MTREXHU4RDM5XHU4MkYxXHU4QkVEXHU1NDJGXHU4NDk5XHU1REU1XHU1MTc3JyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjRkY4QzQyJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNGRkY4RjAnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIG9yaWVudGF0aW9uOiAnbGFuZHNjYXBlLXByaW1hcnknLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHsgc3JjOiAnaWNvbi0xOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3BuZycgfSxcbiAgICAgICAgICB7IHNyYzogJ2ljb24tNTEyLnBuZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9wbmcnIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLG1wMyxqc29ufSddLFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHsgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzJywgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0gfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pXSA6IFtdKVxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBhbGxvd2VkSG9zdHM6IFsnLmNwb2xhci50b3AnLCAnbG9jYWxob3N0J11cbiAgfSxcbiAgcHJldmlldzoge1xuICAgIGFsbG93ZWRIb3N0czogWycuY3BvbGFyLnRvcCcsICdsb2NhbGhvc3QnXVxuICB9XG59KSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlWLFNBQVMsb0JBQW9CO0FBQ3RYLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFDeEIsU0FBUyxlQUFlLFdBQVc7QUFIc0wsSUFBTSwyQ0FBMkM7QUFLMVEsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUE7QUFBQSxJQUVKLEdBQUksU0FBUyxlQUFlLENBQUMsUUFBUTtBQUFBLE1BQ25DLGNBQWM7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLGdCQUFnQixjQUFjO0FBQUEsTUFDN0QsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0wsRUFBRSxLQUFLLGdCQUFnQixPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQUEsVUFDM0QsRUFBRSxLQUFLLGdCQUFnQixPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQUEsUUFDN0Q7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMseUNBQXlDO0FBQUEsUUFDeEQsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUyxFQUFFLFdBQVcsZ0JBQWdCLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFBQSxVQUMxRztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLGNBQWMsQ0FBQyxlQUFlLFdBQVc7QUFBQSxFQUMzQztBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsY0FBYyxDQUFDLGVBQWUsV0FBVztBQUFBLEVBQzNDO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
