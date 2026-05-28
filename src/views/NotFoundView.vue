<template>
  <div class="page">
    <div class="not-found">
      <span class="icon">🔍</span>
      <h2>找不到页面</h2>
      <p>呦呦也不知道在哪里...</p>
      <router-link to="/" class="btn-home">回到首页</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.page {
  width: 100vw; height: 100dvh;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-main);
}
.not-found { text-align: center; }
.icon { font-size: 5rem; display: block; margin-bottom: var(--space-lg); }
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