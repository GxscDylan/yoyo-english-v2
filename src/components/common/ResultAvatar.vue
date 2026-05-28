<template>
  <div class="result-avatar-wrapper">
    <!-- 头像外框 -->
    <div class="result-avatar">
      <!-- 金色光环装饰 -->
      <div class="avatar-halo"></div>
      <!-- 宝贝头像 -->
      <div class="avatar-inner">
        <img v-if="avatarSrc" :src="avatarSrc" alt="宝贝" />
        <div v-else class="avatar-placeholder">👶</div>
      </div>
    </div>
    <!-- 庆祝气泡 -->
    <div class="result-bubble">
      <p>{{ bubbleText }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  bubbleText: { type: String, default: 'Amazing!' },
  avatarSrc: { type: String, default: '' }
})
</script>

<style scoped>
.result-avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  position: relative;
}

/* 头像外框 */
.result-avatar {
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 金色光环 */
.avatar-halo {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 3px solid #FFC107;
  box-shadow: 0 0 16px rgba(255, 193, 7, 0.4);
  animation: haloPulse 2s ease-in-out infinite;
}

@keyframes haloPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* 头像内层 */
.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-card);
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.avatar-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-inner .avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

/* 庆祝气泡 */
.result-bubble {
  position: relative;
  background: #FFF8E1;
  border: 2px solid #FFD54F;
  border-radius: var(--radius-lg);
  padding: 10px var(--space-md) 12px;
  max-width: 200px;
  box-shadow: var(--shadow-card);
  animation: bubblePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
}

.result-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #FFD54F;
}

.result-bubble::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #FFF8E1;
}

.result-bubble p {
  font-size: var(--font-size-sm);
  color: #5D4037;
  line-height: 1.4;
  margin: 0;
  font-weight: 600;
}

@keyframes bubblePop {
  0% { transform: scale(0) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
