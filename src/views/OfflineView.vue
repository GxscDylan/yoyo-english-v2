<template>
  <div class="offline-page">
    <HomeAvatar 
      mood="comfort" 
      bubble-text="别担心，我们继续复习吧！💪"
      :show-stars="false"
      class="offline-avatar"
    />

    <h1 class="offline-title">哎呀，网络跑掉啦！</h1>
    <p class="offline-sub">Oops! The internet ran away~</p>

    <div class="offline-message">
      <p>别担心，我们已经学过的内容还在这里哦！</p>
      <p class="sub-text">Don't worry, your lessons are still here!</p>
    </div>

    <div class="offline-actions">
      <button class="action-btn action-primary" @click="goHome">
        <span class="action-icon">{{ EMOJI.HOME }}</span>
        <span>回首页继续学</span>
      </button>
      <button class="action-btn action-secondary" @click="goReview">
        <span class="action-icon">{{ EMOJI.BOOK }}</span>
        <span>复习已学单词</span>
      </button>
    </div>

    <div class="offline-tips">
      <p class="tip">{{ EMOJI.LIGHTBULB }} 小提示：检查一下 WiFi 连接，或者问问家长帮忙~</p>
    </div>

    <span class="deco deco-1">{{ EMOJI.STAR }}</span>
    <span class="deco deco-2">{{ EMOJI.RAINBOW }}</span>
    <span class="deco deco-3">{{ EMOJI.SPARKLE }}</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import HomeAvatar from '@/components/common/HomeAvatar.vue'

const EMOJI = {
  HOME: '\uD83C\uDFE0',
  BOOK: '\uD83D\uDCDA',
  LIGHTBULB: '\uD83D\uDCA1',
  STAR: '\u2B50',
  RAINBOW: '\uD83C\uDF08',
  SPARKLE: '\uD83D\uDCAB'
}

const router = useRouter()

function goHome() { router.push('/') }
function goReview() { router.push('/review') }
</script>

<style scoped>
.offline-page {
  width: 100vw;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #FFF8F0 0%, #FFF0E0 100%);
  padding: var(--space-xl, 24px);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.offline-avatar {
  margin-bottom: var(--space-lg, 24px);
  animation: avatarFloat 3s ease-in-out infinite;
}

@keyframes avatarFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.offline-title {
  font-size: var(--font-size-2xl, 1.75rem);
  color: var(--text-primary, #2D2A32);
  margin-bottom: var(--space-xs, 4px);
  font-weight: 800;
}

.offline-sub {
  font-size: var(--font-size-base, 0.9rem);
  color: var(--text-hint, #999);
  margin-bottom: var(--space-lg, 24px);
  font-style: italic;
}

.offline-message {
  background: var(--bg-card, #fff);
  border-radius: var(--radius-xl, 16px);
  padding: var(--space-lg, 24px) var(--space-xl, 32px);
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0,0,0,0.08));
  max-width: 400px;
  margin-bottom: var(--space-xl, 32px);
}

.offline-message p {
  font-size: var(--font-size-base, 0.9rem);
  color: var(--text-primary, #2D2A32);
  margin: 0;
  line-height: 1.6;
}

.offline-message .sub-text {
  font-size: var(--font-size-sm, 0.8rem);
  color: var(--text-hint, #999);
  margin-top: var(--space-xs, 4px);
}

.offline-actions {
  display: flex;
  gap: var(--space-md, 16px);
  margin-bottom: var(--space-xl, 32px);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs, 4px);
  padding: var(--space-md, 16px) var(--space-lg, 24px);
  border-radius: var(--radius-xl, 16px);
  transition: transform 0.2s var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
  cursor: pointer;
}

.action-btn:active { transform: scale(0.95); }

.action-primary {
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
}

.action-secondary {
  background: var(--bg-card, #fff);
  color: var(--text-primary, #2D2A32);
  border: 2px solid var(--border-light, #eee);
}

.action-icon { font-size: 2rem; }

.action-btn span:last-child {
  font-size: var(--font-size-sm, 0.8rem);
  font-weight: 700;
}

.offline-tips .tip {
  font-size: var(--font-size-sm, 0.8rem);
  color: var(--text-hint, #999);
  max-width: 320px;
}

.deco {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.4;
  pointer-events: none;
}

.deco-1 { top: 10%; left: 10%; animation: decoFloat 3s ease-in-out infinite; }
.deco-2 { top: 15%; right: 15%; animation: decoFloat 3.5s ease-in-out infinite 0.5s; }
.deco-3 { bottom: 15%; left: 20%; animation: decoFloat 4s ease-in-out infinite 1s; }

@keyframes decoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(10deg); }
}
</style>
