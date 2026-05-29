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
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeColorSync } from '@/composables/useThemeColor'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { playBGM, stopBGM } from '@/composables/useBGM'

// 启用主题色同步到 meta theme-color
useThemeColorSync()

// 路由监听 BGM 场景切换
const route = useRoute()

function getBGMScene(name) {
  const map = {
    home: 'home',
    learn: 'learn',
    game: 'game',
    playground: 'game',
    review: 'review',
    sentence: 'learn',
    nursery: 'nursery',
    parent: 'parent'
  }
  return map[name] || 'home'
}

watch(() => route.name, (newName) => {
  if (!newName) return
  const scene = getBGMScene(newName)
  playBGM(scene)
}, { immediate: true })

// Loading 状态
const isLoading = ref(false)
let transitionTimer = null

function onTransitionStart() {
  isLoading.value = true
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

function onTransitionEnd() {
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
