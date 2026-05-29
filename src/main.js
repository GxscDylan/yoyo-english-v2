import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/variables.css'
import './assets/styles/base.css'
import './assets/styles/animations.css'
import './assets/styles/transitions.css'
import './assets/css/seasonal.css'
import { initHoverSfx } from '@/composables/useSfx'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// 全局初始化 IndexedDB 数据
import { useLearningStore } from '@/stores/learning'
const store = useLearningStore()
store.loadFromDB().then(() => {
  // 初始化主题色
  document.documentElement.setAttribute('data-theme', store.themeColor || 'orange')
  // 初始化悬停音效
  initHoverSfx()
})

// 存储空间满检测
window.addEventListener('quotaexceedederror', () => {
  alert('⚠️ 存储空间已满！学习进度可能无法保存。请在家长中心导出备份，或清理浏览器缓存后重试。')
})
