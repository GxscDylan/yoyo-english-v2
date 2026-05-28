import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/variables.css'
import './assets/styles/base.css'
import './assets/styles/animations.css'

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
})