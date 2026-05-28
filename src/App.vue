<template>
  <div id="app-root" class="app-container">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useThemeColorSync } from '@/composables/useThemeColor'

// 启用主题色同步到 meta theme-color
useThemeColorSync()
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