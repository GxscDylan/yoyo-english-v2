<template>
  <div class="page">
    <div class="not-found">
      <HomeAvatar 
        mood="thinking" 
        bubble-text="咦？这里什么都没有~ 跟我回家吧！🏠"
        :show-stars="false"
        class="not-found-avatar"
      />
      <h2>找不到页面</h2>
      <p>呦呦也不知道在哪里...</p>
      <router-link to="/" class="btn-home">回到首页</router-link>
    </div>
  </div>
</template>

<script setup>
import HomeAvatar from '@/components/common/HomeAvatar.vue'
</script>

<style scoped>
.page {
  width: 100vw; height: 100dvh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-main);
}
.not-found { text-align: center; }
.not-found-avatar {
  margin-bottom: var(--space-lg);
  animation: avatarWiggle 2s ease-in-out infinite;
}
@keyframes avatarWiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
h2 { font-size: var(--font-size-2xl); color: var(--text-secondary); margin-bottom: var(--space-md); }
p { color: var(--text-hint); margin-bottom: var(--space-xl); }
.btn-home {
  display: inline-block;
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 600;
}
</style>