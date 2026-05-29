<template>
  <div class="yoyo-wrapper" :class="{ 'yoyo-flipped': showBack }">
    <!-- 3D翻转容器 -->
    <div class="yoyo-mascot" @click="handleClick">
      <!-- 正面：小老虎 -->
        <div class="yoyo-face-side">
          <div class="yoyo-body"
            :class="[`anim-yoyo-${animationMap[mood]}`, { 'anim-breathe': mood === 'idle' }, `mood-${mood}`]">
            <!-- 现有 7 mood: 保持 emoji 渲染 -->
            <span v-if="useEmoji" class="yoyo-face">{{ faceMap[mood] }}</span>
            <span v-if="isSpeaking" class="yoyo-mouth-anim"></span>
            <!-- 新增 4 mood: CSS 绘制脸 -->
            <template v-if="!useEmoji">
              <span class="css-eye eye-left"></span>
              <span class="css-eye eye-right"></span>
              <span class="css-mouth"></span>
              <span class="css-cheek cheek-left"></span>
              <span class="css-cheek cheek-right"></span>
            </template>
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
import { ref, computed } from 'vue'

const emit = defineEmits(['click'])
const showBack = ref(false)

const props = defineProps({
  mood: {
    type: String,
    default: 'idle',
    validator: v => ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy', 'summon', 'excited', 'proud', 'cheer', 'comfort'].includes(v)
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
  summon: '👋',
  // CSS 绘制的 mood（不显示 emoji）
  excited: '',
  proud: '',
  cheer: '',
  comfort: ''
}

const animationMap = {
  idle: 'idle',
  thinking: 'think',
  happy: 'happy',
  encourage: 'encourage',
  celebrate: 'celebrate',
  sleepy: 'sleepy',
  summon: 'summon',
  excited: 'happy',
  proud: 'happy',
  cheer: 'happy',
  comfort: 'encourage'
}

// 是否使用 emoji（7 个现有 mood 用 emoji，4 个新增用 CSS 绘制）
const useEmoji = computed(() => {
  return ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy', 'summon'].includes(props.mood)
})
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
/* CSS 绘制脸基础样式（4 个新增 mood 使用） */
.css-eye {
  position: absolute;
  top: 24px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
}
.css-eye.eye-left { left: 18px; }
.css-eye.eye-right { right: 18px; }

.css-mouth {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
}

.css-cheek {
  position: absolute;
  bottom: 22px;
  width: 10px;
  height: 6px;
  border-radius: 50%;
  opacity: 0;
  background: rgba(255, 138, 101, 0.5);
}
.css-cheek.cheek-left { left: 8px; }
.css-cheek.cheek-right { right: 8px; }

/* ===== excited（激动）—— 星星眼 + 大张嘴 + 红晕 ===== */
.mood-excited .css-eye {
  width: 14px;
  height: 14px;
  background: #FFC107;
  border-radius: 0;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: starSpin 1s ease-in-out infinite alternate;
}
@keyframes starSpin {
  0% { transform: rotate(-15deg) scale(1); }
  100% { transform: rotate(15deg) scale(1.15); }
}
.mood-excited .css-mouth {
  width: 24px;
  height: 14px;
  border-radius: 0 0 24px 24px;
  background: #E53935;
  border-top: 2px solid #C62828;
}
.mood-excited .css-cheek {
  opacity: 1;
}
.mood-excited .yoyo-body {
  animation: excitedBounce 0.5s ease-in-out infinite alternate;
}
@keyframes excitedBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

/* ===== proud（自豪）—— 月牙眼 + 自信微笑 + 金色光晕 ===== */
.mood-proud .css-eye {
  width: 14px;
  height: 4px;
  border-radius: 14px 14px 0 0;
  background: #333;
  border-top: 2px solid #333;
}
.mood-proud .css-mouth {
  width: 20px;
  height: 10px;
  border: none;
  border-bottom: 3px solid #333;
  border-radius: 0 0 20px 20px;
}
.mood-proud .yoyo-body {
  transform: translateY(-4px);
  animation: proudGlow 1.5s ease-in-out infinite alternate;
}
@keyframes proudGlow {
  0% { box-shadow: 0 4px 16px rgba(255, 140, 66, 0.35); }
  100% { box-shadow: 0 4px 24px rgba(255, 215, 0, 0.6); }
}

/* ===== cheer（欢呼）—— > < 眯眼 + 圆形喊叫嘴 + 音符飘出 ===== */
.mood-cheer .css-eye.eye-left {
  width: 10px;
  height: 10px;
  background: transparent;
  clip-path: none;
  border-right: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(45deg);
  border-radius: 0 0 2px 0;
}
.mood-cheer .css-eye.eye-right {
  width: 10px;
  height: 10px;
  background: transparent;
  clip-path: none;
  border-left: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(-45deg);
  border-radius: 0 0 0 2px;
}
.mood-cheer .css-mouth {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #E53935;
  border: 2px solid #C62828;
  animation: cheerShout 0.4s ease-in-out infinite alternate;
}
@keyframes cheerShout {
  0% { transform: translateX(-50%) scale(1); }
  100% { transform: translateX(-50%) scale(1.15); }
}
.mood-cheer .yoyo-body::after {
  content: '♪';
  position: absolute;
  top: -16px;
  right: -8px;
  font-size: 16px;
  color: #FF7043;
  animation: noteFloat 1.2s ease-out infinite;
}
@keyframes noteFloat {
  0% { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(-24px) rotate(20deg); }
}

/* ===== comfort（安慰）—— 温暖大眼 + 温柔微笑 + 粉色光晕 ===== */
.mood-comfort .css-eye {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  box-shadow: inset -3px -2px 0 2px rgba(255, 255, 255, 0.7);
}
.mood-comfort .css-mouth {
  width: 16px;
  height: 6px;
  border: none;
  border-bottom: 2px solid #666;
  border-radius: 0 0 16px 16px;
}
.mood-comfort .css-cheek {
  opacity: 1;
  background: rgba(255, 183, 197, 0.35);
  width: 12px;
  height: 8px;
}
.mood-comfort .yoyo-body {
  animation: comfortTilt 2s ease-in-out infinite alternate;
}
@keyframes comfortTilt {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}
.mood-comfort .yoyo-body::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 183, 197, 0.35) 0%, transparent 70%);
  pointer-events: none;
}
</style>