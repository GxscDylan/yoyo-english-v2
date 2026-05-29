<template>
  <div id="app-root" class="app-container">
    <!-- 全局趣味 Loading -->
    <LoadingOverlay :visible="isLoading" @timeout="isLoading = false" />
    
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in" @before-enter="onTransitionStart" @after-enter="onTransitionEnd">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useThemeColorSync } from '@/composables/useThemeColor'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'

// 启用主题色同步到 meta theme-color
useThemeColorSync()

// Loading 状态
const isLoading = ref(false)
let transitionTimer = null

function onTransitionStart() {
  // 页面切换开始时显示 Loading（最多展示 2 秒趣味文案）
  isLoading.value = true
  // 超过 2 秒自动隐藏，防止卡死
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function onTransitionEnd() {
  // 页面切换完成立即隐藏
  clearTimeout(transitionTimer)
  nextTick(() => {
    isLoading.value = false
  })
}
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>