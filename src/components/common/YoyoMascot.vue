<template>
  <div class="yoyo-wrapper" :class="{ 'yoyo-flipped': showBack }">
    <!-- 3D翻转容器 -->
    <div class="yoyo-mascot" @click="handleClick">
      <!-- 正面：小老虎 -->
      <div class="yoyo-face-side">
        <div class="yoyo-body"
          :class="[`anim-yoyo-${animationMap[mood]}`, { 'anim-breathe': mood === 'idle' }, `mood-${mood}`]">
          <span class="yoyo-face">{{ faceMap[mood] }}</span>
          <!-- 说话嘴部动画 -->
          <span v-if="isSpeaking" class="yoyo-mouth-anim"></span>
          <!-- 养成系统：成就装扮叠加层 -->
          <span v-if="showHat" class="yoyo-hat">🎩</span>
          <span v-if="showGlasses" class="yoyo-glasses">👓</span>
          <span v-if="showCrown" class="yoyo-crown">👑</span>
          <span v-if="showHalo" class="yoyo-halo"></span>
        </div>
        <!-- 正面气泡 -->
        <div v-if="bubbleText && !showBack" class="yoyo-bubble" :class="`bubble--${mood}`">
          <p>{{ bubbleText }}</p>
        </div>
        <!-- 星星粒子 -->
        <span v-if="showStars && !showBack" v-for="i in 3" :key="i"
          class="yoyo-star" :style="{ animationDelay: `${i * 0.15}s`, left: `${30 + i * 20}%` }">⭐</span>
      </div>
      <!-- 背面：宝贝头像 + 气泡 -->
      <div class="yoyo-back-side">
        <div class="yoyo-avatar-back">
          <img v-if="avatarSrc" :src="avatarSrc" alt="宝贝" />
          <div v-else class="avatar-placeholder">👤</div>
        </div>
        <!-- 背面气泡 -->
        <div v-if="bubbleText && showBack" class="yoyo-bubble" :class="`bubble--${mood}`">
          <p>{{ bubbleText }}</p>
        </div>
        <div class="back-hint">点击翻回</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['click'])
const showBack = ref(false)

const props = defineProps({
  mood: {
    type: String,
    default: 'idle',
    validator: v => ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy', 'summon'].includes(v)
  },
  bubbleText: { type: String, default: '' },
  showStars: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
  avatarSrc: { type: String, default: '' },
  // P3: 养成系统 — 成就装扮
  showHat: { type: Boolean, default: false },
  showGlasses: { type: Boolean, default: false },
  showCrown: { type: Boolean, default: false },
  showHalo: { type: Boolean, default: false }
})

function handleClick() {
  showBack.value = !showBack.value
  if (!showBack.value) {
    emit('click')
  }
}

const faceMap = {
  idle: '🐯',
  thinking: '🤔',
  happy: '😊',
  encourage: '🐯',
  celebrate: '🎉',
  sleepy: '💤',
  summon: '👋'
}

const animationMap = {
  idle: 'idle',
  thinking: 'think',
  happy: 'happy',
  encourage: 'encourage',
  celebrate: 'celebrate',
  sleepy: 'sleepy',
  summon: 'summon'
}
</script>

<style scoped>
.yoyo-wrapper {
  perspective: 600px;
}
.yoyo-mascot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  position: relative;
  width: 120px;
  min-height: 140px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.yoyo-wrapper.yoyo-flipped .yoyo-mascot {
  transform: rotateY(180deg);
}

/* 正面 / 背面 */
.yoyo-face-side, .yoyo-back-side {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  backface-visibility: hidden;
}
.yoyo-back-side {
  transform: translateX(-50%) rotateY(180deg);
}

.yoyo-body {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.35);
  flex-shrink: 0;
  transition: all 0.3s var(--ease-smooth);
  position: relative;
}

.yoyo-face {
  font-size: 2.5rem;
  line-height: 1;
}

.yoyo-bubble {
  position: relative;
  background: var(--bg-card);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 10px var(--space-md) 12px;
  max-width: 260px;
  box-shadow: var(--shadow-card);
  animation: fadeUp 0.3s var(--ease-smooth);
  text-align: center;
}

.yoyo-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--border-light);
}

.yoyo-bubble::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--bg-card);
}

.yoyo-bubble p {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
  white-space: pre-line;
  margin: 0;
}

/* 正确时的金色气泡 */
.bubble--happy {
  background: #FFF8E1;
  border-color: #FFD54F;
}
.bubble--celebrate {
  background: #FFF8E1;
  border-color: #FFD54F;
}

/* 鼓励时的温暖气泡 */
.bubble--encourage {
  background: #FFF3E0;
  border-color: #FFCC80;
}

/* 星星飞出 */
.yoyo-star {
  position: absolute;
  font-size: 1.2rem;
  animation: starFly 0.8s var(--ease-bounce) forwards;
  opacity: 0;
  pointer-events: none;
}

/* 表情切换过渡 — mascot--xxx 和 mood-xxx class 直接绑在 .yoyo-body 上 */
.yoyo-body.mascot--thinking, .yoyo-body.mood-thinking { background: #B0BEC5; }
.yoyo-body.mascot--happy, .yoyo-body.mood-happy { background: #66BB6A; }
.yoyo-body.mascot--celebrate, .yoyo-body.mood-celebrate { background: #FFC107; }
.yoyo-body.mascot--encourage, .yoyo-body.mood-encourage { background: #FF8C42; }
.yoyo-body.mascot--sleepy, .yoyo-body.mood-sleepy { background: #78909C; }
.yoyo-body.mascot--summon, .yoyo-body.mood-summon { background: #FF7043; }

/* 点击互动弹跳 */
.yoyo-body.mascot--happy {
  animation: yoyoHappy 0.4s var(--ease-bounce);
}

/* ===== 背面头像 ===== */
.yoyo-avatar-back {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.35);
  background: var(--bg-card);
}
.yoyo-avatar-back img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.yoyo-avatar-back .avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}
.back-hint {
  font-size: var(--font-size-xs);
  color: var(--text-hint);
  margin-top: var(--space-xs);
}

/* ===== P1: 说话嘴部动画 ===== */
.yoyo-mouth-anim {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  animation: mouthOpen 0.3s ease-in-out infinite alternate;
  pointer-events: none;
}
@keyframes mouthOpen {
  0% { height: 4px; width: 12px; }
  100% { height: 12px; width: 16px; }
}

/* ===== P3: 养成系统 — 成就装扮 ===== */
.yoyo-hat {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  animation: hatBounce 0.5s var(--ease-bounce);
  pointer-events: none;
}
@keyframes hatBounce {
  0% { transform: translateX(-50%) translateY(-10px) rotate(-10deg); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0) rotate(0deg); opacity: 1; }
}

.yoyo-glasses {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.8rem;
  pointer-events: none;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.yoyo-wings {
  position: absolute;
  top: 55%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.8rem;
  animation: wingsFloat 2s ease-in-out infinite;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}
@keyframes wingsFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

.yoyo-crown {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: crownFloat 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes crownFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

.yoyo-halo {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
  animation: haloGlow 2s ease-in-out infinite;
  pointer-events: none;
}
@keyframes haloGlow {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(0.9); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1.1); }
}
</style>