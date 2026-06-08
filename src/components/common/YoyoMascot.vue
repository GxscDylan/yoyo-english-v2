<template>
  <div class="yoyo-wrapper" :class="{ 'yoyo-flipped': showBack }">
    <!-- 3D翻转容器 -->
    <div class="yoyo-mascot" @click="handleClick">
      <!-- 正面：卡通小老虎 -->
      <div class="yoyo-face-side">
        <div class="yoyo-body"
          :class="[`anim-yoyo-${animationMap[mood]}`, { 'anim-breathe': mood === 'idle' }, `mood-${mood}`]">

          <!-- CSS 绘制的卡通小老虎 -->
          <div class="tiger-face">
            <!-- 虎纹条纹 -->
            <span class="stripe stripe-l1"></span>
            <span class="stripe stripe-l2"></span>
            <span class="stripe stripe-r1"></span>
            <span class="stripe stripe-r2"></span>

            <!-- 耳朵 -->
            <span class="ear ear-left"></span>
            <span class="ear ear-right"></span>

            <!-- 眼睛 -->
            <span class="tiger-eye eye-left">
              <span class="eye-pupil"></span>
              <span class="eye-shine"></span>
            </span>
            <span class="tiger-eye eye-right">
              <span class="eye-pupil"></span>
              <span class="eye-shine"></span>
            </span>

            <!-- 鼻子 -->
            <span class="tiger-nose"></span>

            <!-- 嘴巴 -->
            <span class="tiger-mouth"></span>

            <!-- 腮红 -->
            <span class="blush blush-left"></span>
            <span class="blush blush-right"></span>

            <!-- 配饰：帽子 -->
            <span v-if="showHat" class="yoyo-hat"></span>
            <!-- 配饰：翅膀 -->
            <span v-if="showWings" class="yoyo-wings">🪽</span>
            <!-- 配饰：眼镜（CSS绘制） -->
            <span v-if="showGlasses" class="yoyo-glasses">
              <span class="glass-frame glass-left"></span>
              <span class="glass-frame glass-right"></span>
              <span class="glass-bridge"></span>
            </span>
            <!-- 配饰：皇冠 -->
            <span v-if="showCrown" class="yoyo-crown">👑</span>
            <!-- 配饰：光环 -->
            <span v-if="showHalo" class="yoyo-halo"></span>
          </div>

          <!-- 说话嘴部动画 -->
          <span v-if="isSpeaking" class="yoyo-mouth-anim"></span>
        </div>

        <!-- 状态指示器 -->
        <span v-if="moodStateIcon" class="yoyo-status-badge" :class="`status--${mood}`">
          {{ moodStateIcon }}
        </span>

        <!-- 正面气泡 -->
        <div v-if="bubbleText && !showBack" class="yoyo-bubble" :class="`bubble--${mood}`">
          <div class="bubble-shine"></div>
          <div class="bubble-sparkle sparkle-1"></div>
          <div class="bubble-sparkle sparkle-2"></div>
          <p>{{ bubbleText }}</p>
        </div>

        <!-- 星星粒子 -->
        <span v-if="showStars && !showBack" v-for="i in 3" :key="i"
          class="yoyo-star" :style="{ animationDelay: `${i * 0.15}s`, left: `${30 + i * 20}%` }"></span>
      </div>

      <!-- 背面：宝贝头像 + 气泡 -->
      <div class="yoyo-back-side">
        <div class="yoyo-avatar-back">
          <img v-if="avatarSrc" :src="avatarSrc" alt="宝贝" />
          <div v-else class="avatar-placeholder"></div>
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
  showHat: { type: Boolean, default: false },
  showGlasses: { type: Boolean, default: false },
  showWings: { type: Boolean, default: false },
  showCrown: { type: Boolean, default: false },
  showHalo: { type: Boolean, default: false }
})

function handleClick() {
  showBack.value = !showBack.value
  if (!showBack.value) {
    emit('click')
  }
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

const moodStateIcon = computed(() => {
  const icons = {
    happy: '😊',
    celebrate: '🎉',
    encourage: '💪',
    sleepy: '💤',
    summon: '👋',
    excited: '✨',
    proud: '😎',
    cheer: '📣',
    comfort: '💕',
    idle: '',
    thinking: '🤔'
  }
  return icons[props.mood] || ''
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
  padding: var(--space-md) var(--space-md) 8px;
  position: relative;
  width: 120px;
  min-height: 200px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
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

/* ===== 老虎身体（渐变圆球 + 光影 + 3D立体） ===== */
.yoyo-body {
  width: 95px;
  height: 95px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #FFC060 0%, #FF9500 40%, #F57C00 80%, #E65100 100%);
  border-radius: 50%;
  box-shadow:
    0 10px 30px rgba(255, 140, 66, 0.5),
    0 4px 15px rgba(255, 140, 66, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.15),
    inset 0 -6px 12px rgba(0, 0, 0, 0.15),
    inset 0 6px 12px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.3s var(--ease-smooth);
  position: relative;
}

/* 呼吸动效 — 增强幅度 */
.yoyo-body.anim-breathe {
  animation: yoyoBreathe 2.5s ease-in-out infinite;
}

@keyframes yoyoBreathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.04) translateY(-3px); }
}

/* ===== 老虎脸部容器 ===== */
.tiger-face {
  position: relative;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 虎纹条纹 */
.stripe {
  position: absolute;
  background: #E65100;
  border-radius: 2px;
  opacity: 0.6;
}
.stripe-l1 {
  width: 3px; height: 12px;
  top: 14px; left: 16px;
  transform: rotate(-20deg);
}
.stripe-l2 {
  width: 3px; height: 10px;
  top: 22px; left: 12px;
  transform: rotate(-10deg);
}
.stripe-r1 {
  width: 3px; height: 12px;
  top: 14px; right: 16px;
  transform: rotate(20deg);
}
.stripe-r2 {
  width: 3px; height: 10px;
  top: 22px; right: 12px;
  transform: rotate(10deg);
}

/* 耳朵 */
.ear {
  position: absolute;
  width: 22px;
  height: 22px;
  background: linear-gradient(145deg, #FFB74D, #FF8F00);
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 0;
}
.ear::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px;
  width: 14px; height: 14px;
  background: #FFCC80;
  border-radius: 50%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}
.ear-left { top: -4px; left: 8px; }
.ear-right { top: -4px; right: 8px; }

/* 眼睛 */
.tiger-eye {
  position: absolute;
  top: 22px;
  width: 14px;
  height: 14px;
  background: #333;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s;
}
.eye-left { left: 16px; }
.eye-right { right: 16px; }

.eye-pupil {
  position: absolute;
  top: 3px; left: 4px;
  width: 6px; height: 6px;
  background: #111;
  border-radius: 50%;
}

.eye-shine {
  position: absolute;
  top: 2px; left: 7px;
  width: 5px; height: 5px;
  background: #FFF;
  border-radius: 50%;
  opacity: 0.9;
}

/* 鼻子 */
.tiger-nose {
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 6px;
  background: #5D4037;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

/* 嘴巴 */
.tiger-mouth {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  border-bottom: 2.5px solid #5D4037;
  border-radius: 0 0 16px 16px;
}

/* 腮红 */
.blush {
  position: absolute;
  bottom: 20px;
  width: 12px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 138, 101, 0.45);
  transition: opacity 0.3s;
}
.blush-left { left: 6px; }
.blush-right { right: 6px; }

/* ===== 配饰：CSS 眼镜 ===== */
.yoyo-glasses {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  z-index: 10;
  pointer-events: none;
}
.glass-frame {
  position: absolute;
  top: 0;
  width: 22px;
  height: 18px;
  border: 2.5px solid #42A5F5;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}
.glass-left { left: 4px; }
.glass-right { right: 4px; }
.glass-bridge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 2px;
  background: #42A5F5;
  border-radius: 1px;
}

/* 交互反馈增强 - 点击效果 */
.yoyo-mascot {
  cursor: pointer;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.yoyo-mascot:active {
  transform: scale(0.95);
}

/* 状态指示器 - 悬浮在头像右上角 */
.yoyo-status-badge {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 14px;
  line-height: 1;
  z-index: 50;
  pointer-events: none;
  animation: badgePop 0.4s var(--ease-bounce);
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

@keyframes badgePop {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* 配饰动画增强 - 帽子摇摆效果 */
.yoyo-hat {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: hatBounceEnhanced 0.6s var(--ease-bounce), hatSway 2s ease-in-out infinite 0.6s;
  pointer-events: none;
  z-index: 20;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  transform-origin: center bottom;
}

@keyframes hatBounceEnhanced {
  0% { transform: translateX(-50%) translateY(-15px) rotate(-15deg) scale(0.5); opacity: 0; }
  60% { transform: translateX(-50%) translateY(2px) rotate(5deg) scale(1.1); }
  100% { transform: translateX(-50%) translateY(0) rotate(0deg) scale(1); opacity: 1; }
}

@keyframes hatSway {
  0%, 100% { transform: translateX(-50%) rotate(-3deg); }
  50% { transform: translateX(-50%) rotate(3deg); }
}

/* 配饰动画增强 - 翅膀振动 — 左移+缩小，避免遮挡头像 */
.yoyo-wings {
  position: absolute;
  top: 45%;
  left: -12px;
  transform: translateX(-50%);
  font-size: 1.2rem;
  animation: wingsFlutter 0.8s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));
  opacity: 0.5;
}

@keyframes wingsFlutter {
  0%, 100% { 
    transform: translateX(-50%) translateY(0) scaleX(0.85) scaleY(0.9); 
    opacity: 0.4;
  }
  50% { 
    transform: translateX(-50%) translateY(-3px) scaleX(1.05) scaleY(0.95); 
    opacity: 0.6;
  }
}

/* 配饰动画增强 - 皇冠闪耀 */
.yoyo-crown {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: crownGleam 2.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 20;
  filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4));
}

@keyframes crownGleam {
  0%, 100% { 
    transform: translateX(-50%) translateY(0) scale(1); 
    filter: drop-shadow(0 2px 6px rgba(255, 215, 0, 0.4)) brightness(1);
  }
  25% {
    transform: translateX(-50%) translateY(-5px) scale(1.05); 
    filter: drop-shadow(0 4px 8px rgba(255, 215, 0, 0.6)) brightness(1.1);
  }
  50% { 
    transform: translateX(-50%) translateY(-3px) scale(1); 
    filter: drop-shadow(0 2px 10px rgba(255, 215, 0, 0.8)) brightness(1.2);
  }
  75% {
    transform: translateX(-50%) translateY(-5px) scale(1.05); 
    filter: drop-shadow(0 4px 8px rgba(255, 215, 0, 0.6)) brightness(1.1);
  }
}

/* 配饰动画增强 - 光环脉动 */
.yoyo-halo {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.7) 0%, transparent 70%);
  animation: haloPulse 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes haloPulse {
  0%, 100% { 
    opacity: 0.6; 
    transform: translateX(-50%) scaleX(0.9) scaleY(0.8); 
  }
  50% { 
    opacity: 1; 
    transform: translateX(-50%) scaleX(1.15) scaleY(1); 
  }
}

/* 配饰动画增强 - 眼镜反光 */
.yoyo-glasses {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  z-index: 10;
  pointer-events: none;
  animation: glassesShine 3s ease-in-out infinite;
}

.glass-frame {
  position: absolute;
  top: 0;
  width: 22px;
  height: 18px;
  border: 2.5px solid #42A5F5;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
}
.glass-frame::after {
  content: '';
  position: absolute;
  top: 2px;
  left: -10px;
  width: 10px;
  height: 14px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: rotate(25deg);
  animation: lensFlare 4s ease-in-out infinite;
}
.glass-left::after { animation-delay: 0s; }
.glass-right::after { animation-delay: 2s; }

@keyframes lensFlare {
  0%, 100% { left: -10px; opacity: 0; }
  10%, 30% { opacity: 1; }
  40% { left: 32px; opacity: 0; }
}

@keyframes glassesShine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.1); }
}

@keyframes hatBounce {
  0% { transform: translateX(-50%) translateY(-10px) rotate(-10deg); opacity: 0; }
  100% { transform: translateX(-50%) translateY(0) rotate(0deg); opacity: 1; }
}

/* ===== 配饰：翅膀 ===== */
.yoyo-wings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: wingsFloat 2s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));
}
@keyframes wingsFloat {
  0%, 100% { transform: translateX(-50%) translateY(0) rotate(-5deg); }
  50% { transform: translateX(-50%) translateY(-6px) rotate(5deg); }
}

/* ===== 配饰：皇冠 ===== */
.yoyo-crown {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: crownFloat 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 20;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
@keyframes crownFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

/* ===== 配饰：光环 ===== */
.yoyo-halo {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
  animation: haloGlow 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}
@keyframes haloGlow {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(0.9); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1.1); }
}

/* 气泡 - 紧凑设计，位于头像下方居中 */
.yoyo-bubble {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 2px solid #FFD93D;
  border-radius: 16px 16px 16px 4px;
  padding: 8px 12px 11px;
  max-width: 130px;
  box-shadow: 
    0 3px 12px rgba(255, 217, 61, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.08);
  animation: bubblePop 0.35s var(--ease-bounce);
  text-align: center;
  z-index: 100;
}

/* 气泡三角箭头 - 向上指向头像 */
.yoyo-bubble::before {
  content: '';
  position: absolute;
  top: -9px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  width: 0; 
  height: 0; 
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 9px solid #FFD93D;
}

.yoyo-bubble::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
  width: 0; 
  height: 0; 
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #FFF9E6;
}

/* 气泡文字 */
.yoyo-bubble p {
  font-size: 11px;
  color: #5D4E37;
  line-height: 1.45;
  margin: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

/* 气泡高光效果 */
.bubble-shine {
  position: absolute;
  top: 4px;
  left: 8px;
  width: 28px;
  height: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0));
  border-radius: 50%;
  transform: rotate(-12deg);
  pointer-events: none;
}

/* 气泡闪烁星星 - 缩小版 */
.bubble-sparkle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #FFD93D;
  border-radius: 50%;
  pointer-events: none;
  animation: sparkle 2s ease-in-out infinite;
}

.bubble-sparkle.sparkle-1 {
  top: 5px;
  right: 10px;
  animation-delay: 0s;
}

.bubble-sparkle.sparkle-2 {
  bottom: 8px;
  right: 6px;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 不同心情的气泡样式 */
.bubble--happy {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF8E1 100%);
  border-color: #FFD54F;
  box-shadow: 
    0 6px 20px rgba(255, 213, 79, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.bubble--celebrate {
  background: linear-gradient(180deg, #FFF9C4 0%, #FFEB3B 100%);
  border-color: #FFC107;
  box-shadow: 
    0 8px 24px rgba(255, 193, 7, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.15);
}

.bubble--encourage {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF3E0 100%);
  border-color: #FFAB91;
  box-shadow: 
    0 6px 20px rgba(255, 171, 145, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.bubble--idle {
  background: linear-gradient(180deg, #FFFFFF 0%, #F3E5F5 100%);
  border-color: #CE93D8;
  box-shadow: 
    0 6px 20px rgba(206, 147, 216, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 气泡弹出动画 */
@keyframes bubblePop {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(8px) scale(0.6);
  }
  60% {
    transform: translateX(-50%) translateY(-2px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* 星星飞出 */
.yoyo-star {
  position: absolute;
  font-size: 1.2rem;
  animation: starFly 0.8s var(--ease-bounce) forwards;
  opacity: 0;
  pointer-events: none;
}

/* ===== 背面头像 ===== */
.yoyo-avatar-back {
  width: 90px;
  height: 90px;
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

/* ===== 说话嘴部动画 ===== */
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

/* ===== 情绪状态 ===== */

/* happy — 眼睛变弯 + 大嘴微笑 */
.mood-happy .tiger-eye {
  height: 6px;
  border-radius: 14px 14px 0 0;
  background: transparent;
  border-top: 3px solid #333;
}
.mood-happy .eye-pupil,
.mood-happy .eye-shine { display: none; }
.mood-happy .tiger-mouth {
  height: 12px;
  border-bottom-width: 3px;
  background: #E53935;
  border: none;
  border-radius: 0 0 16px 16px;
}
.mood-happy .blush { opacity: 1; }
.mood-happy .yoyo-body {
  animation: happyBounce 0.4s var(--ease-bounce);
}
@keyframes happyBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* celebrate — 星星眼 */
.mood-celebrate .tiger-eye {
  background: #FFC107;
  width: 12px; height: 12px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.mood-celebrate .eye-pupil,
.mood-celebrate .eye-shine { display: none; }
.mood-celebrate .tiger-mouth {
  height: 14px;
  border-bottom-width: 3px;
  background: #E53935;
  border: none;
  border-radius: 0 0 14px 14px;
}
.mood-celebrate .blush { opacity: 1; }

/* sleepy — 闭眼 */
.mood-sleepy .tiger-eye {
  height: 3px;
  border-radius: 3px;
  background: #333;
}
.mood-sleepy .eye-pupil,
.mood-sleepy .eye-shine { display: none; }
.mood-sleepy .tiger-mouth {
  width: 10px;
  height: 4px;
  border: none;
  border-radius: 0 0 10px 10px;
  border-bottom: 2px solid #5D4037;
}
.mood-sleepy .yoyo-body {
  animation: sleepyTilt 3s ease-in-out infinite;
}
@keyframes sleepyTilt {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(5deg); }
}

/* thinking — 一只眼闭 */
.mood-thinking .eye-right {
  height: 3px;
  border-radius: 3px;
  background: #333;
}
.mood-thinking .eye-right .eye-pupil,
.mood-thinking .eye-right .eye-shine { display: none; }

/* encourage — 温暖微笑 */
.mood-encourage .tiger-mouth {
  width: 20px;
  height: 10px;
  border-bottom-width: 2.5px;
}
.mood-encourage .blush { opacity: 0.7; }

/* summon — 招手动画 */
.mood-summon .yoyo-body {
  animation: summonWave 0.6s var(--ease-bounce);
}
@keyframes summonWave {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-8deg) scale(1.05); }
  75% { transform: rotate(8deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

/* excited — 星星眼 */
.mood-excited .tiger-eye {
  background: #FFC107;
  width: 12px; height: 12px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.mood-excited .eye-pupil,
.mood-excited .eye-shine { display: none; }
.mood-excited .tiger-mouth {
  height: 14px;
  background: #E53935;
  border: none;
  border-radius: 0 0 14px 14px;
}
.mood-excited .blush { opacity: 1; }
.mood-excited .yoyo-body {
  animation: excitedBounce 0.5s ease-in-out infinite alternate;
}
@keyframes excitedBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

/* proud — 月牙眼 + 金色光晕 */
.mood-proud .tiger-eye {
  height: 5px;
  border-radius: 14px 14px 0 0;
  background: transparent;
  border-top: 3px solid #333;
}
.mood-proud .eye-pupil,
.mood-proud .eye-shine { display: none; }
.mood-proud .tiger-mouth {
  width: 20px;
  height: 10px;
  border: none;
  border-bottom: 3px solid #333;
  border-radius: 0 0 20px 20px;
}
.mood-proud .yoyo-body {
  animation: proudGlow 1.5s ease-in-out infinite alternate;
}
@keyframes proudGlow {
  0% { box-shadow: 0 4px 16px rgba(255, 140, 66, 0.35); }
  100% { box-shadow: 0 4px 24px rgba(255, 215, 0, 0.6); }
}

/* cheer — 眯眼 + 喊叫嘴 + 音符 */
.mood-cheer .tiger-eye.eye-left {
  width: 10px; height: 10px;
  background: transparent;
  clip-path: none;
  border-right: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(45deg);
  border-radius: 0 0 2px 0;
}
.mood-cheer .tiger-eye.eye-right {
  width: 10px; height: 10px;
  background: transparent;
  clip-path: none;
  border-left: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(-45deg);
  border-radius: 0 0 0 2px;
}
.mood-cheer .eye-pupil,
.mood-cheer .eye-shine { display: none; }
.mood-cheer .tiger-mouth {
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
  content: '\266A';
  position: absolute;
  top: -16px;
  right: -8px;
  font-size: 14px;
  color: #FF7043;
  animation: noteFloat 1.2s ease-out infinite;
}
@keyframes noteFloat {
  0% { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(-24px) rotate(20deg); }
}

/* comfort — 温暖大眼 + 粉色光晕 */
.mood-comfort .tiger-eye {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #333;
  box-shadow: inset -3px -2px 0 2px rgba(255, 255, 255, 0.7);
}
.mood-comfort .eye-pupil {
  top: 2px; left: 3px;
  width: 5px; height: 5px;
}
.mood-comfort .eye-shine {
  top: 1px; left: 6px;
  width: 4px; height: 4px;
}
.mood-comfort .tiger-mouth {
  width: 16px;
  height: 6px;
  border: none;
  border-bottom: 2px solid #666;
  border-radius: 0 0 16px 16px;
}
.mood-comfort .blush {
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

/* ===== 基础动画 ===== */
@keyframes starFly {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
