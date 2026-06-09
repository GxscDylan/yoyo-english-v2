<template>
  <div class="home-avatar-wrapper" :class="{ 'home-avatar-flipped': showBack }">
    <div class="home-avatar" @click="handleClick">
      <!-- 正面：卡通小老虎 -->
      <div class="home-avatar-front">
        <div class="home-tiger-body" :class="[`mood-${mood}`, { 'anim-breathe': mood === 'idle' }]">
          <!-- 配饰：光环 -->
          <span v-if="showHalo" class="home-halo"></span>
          <!-- 配饰：皇冠 -->
          <span v-if="showCrown" class="home-crown">👑</span>
          <!-- 配饰：帽子 -->
          <span v-if="showHat" class="home-hat">🎩</span>
          
          <!-- 老虎脸部 -->
          <div class="home-tiger-face">
            <!-- 条纹 -->
            <span class="home-stripe home-stripe-l1"></span>
            <span class="home-stripe home-stripe-l2"></span>
            <span class="home-stripe home-stripe-r1"></span>
            <span class="home-stripe home-stripe-r2"></span>
            
            <!-- 耳朵 -->
            <span class="home-ear home-ear-left"></span>
            <span class="home-ear home-ear-right"></span>
            
            <!-- 眼睛 -->
            <span class="home-eye home-eye-left">
              <span class="home-pupil"></span>
              <span class="home-shine"></span>
            </span>
            <span class="home-eye home-eye-right">
              <span class="home-pupil"></span>
              <span class="home-shine"></span>
            </span>
            
            <!-- 配饰：眼镜 -->
            <span v-if="showGlasses" class="home-glasses">
              <span class="home-glass home-glass-left"></span>
              <span class="home-glass home-glass-right"></span>
              <span class="home-glass-bridge"></span>
            </span>
            
            <!-- 鼻子 -->
            <span class="home-nose"></span>
            
            <!-- 嘴巴 -->
            <span class="home-mouth"></span>
            
            <!-- 腮红 -->
            <span class="home-blush home-blush-left"></span>
            <span class="home-blush home-blush-right"></span>
          </div>
          
          <!-- 配饰：翅膀 -->
          <span v-if="showWings" class="home-wings">🪽</span>
          
          <!-- 说话嘴部动画 -->
          <span v-if="isSpeaking" class="home-mouth-anim"></span>
        </div>
        
        <!-- 状态指示器 -->
        <span v-if="moodStateIcon" class="home-status-badge">{{ moodStateIcon }}</span>
        
        <!-- 星星粒子 -->
        <span v-if="showStars" v-for="i in 5" :key="i"
          class="home-star" :style="{ animationDelay: `${i * 0.1}s`, left: `${20 + i * 12}%` }"></span>
      </div>
      
      <!-- 背面：用户头像 -->
      <div class="home-avatar-back">
        <div class="home-user-avatar">
          <img v-if="avatarSrc" :src="avatarSrc" alt="宝贝" />
          <div v-else class="home-avatar-placeholder">👶</div>
        </div>
        <span class="home-back-hint">点击翻回</span>
      </div>
    </div>
    
    <!-- 气泡 -->
    <div v-if="bubbleText" class="home-bubble" :class="`bubble--${mood}`">
      <div class="home-bubble-shine"></div>
      <div class="home-bubble-sparkle sparkle-1"></div>
      <div class="home-bubble-sparkle sparkle-2"></div>
      <p>{{ bubbleText }}</p>
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
.home-avatar-wrapper {
  perspective: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
}

.home-avatar {
  position: relative;
  width: 110px;
  height: 110px;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.home-avatar-wrapper.home-avatar-flipped .home-avatar {
  transform: rotateY(180deg);
}

.home-avatar-front,
.home-avatar-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home-avatar-back {
  transform: rotateY(180deg);
}

/* ===== 老虎身体 ===== */
.home-tiger-body {
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
    inset 0 6px 12px rgba(255, 255, 255, 0.3);
  position: relative;
  transition: all 0.3s;
}

.home-tiger-body.anim-breathe {
  animation: homeBreathe 2.5s ease-in-out infinite;
}

@keyframes homeBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

/* ===== 老虎脸部 ===== */
.home-tiger-face {
  position: relative;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 条纹 */
.home-stripe {
  position: absolute;
  background: #E65100;
  border-radius: 2px;
  opacity: 0.6;
}
.home-stripe-l1 { width: 3px; height: 12px; top: 14px; left: 16px; transform: rotate(-20deg); }
.home-stripe-l2 { width: 3px; height: 10px; top: 22px; left: 12px; transform: rotate(-10deg); }
.home-stripe-r1 { width: 3px; height: 12px; top: 14px; right: 16px; transform: rotate(20deg); }
.home-stripe-r2 { width: 3px; height: 10px; top: 22px; right: 12px; transform: rotate(10deg); }

/* 耳朵 */
.home-ear {
  position: absolute;
  width: 22px;
  height: 22px;
  background: linear-gradient(145deg, #FFB74D, #FF8F00);
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  z-index: 0;
}
.home-ear::after {
  content: '';
  position: absolute;
  top: 4px; left: 4px;
  width: 14px; height: 14px;
  background: #FFCC80;
  border-radius: 50%;
}
.home-ear-left { top: -4px; left: 8px; }
.home-ear-right { top: -4px; right: 8px; }

/* 眼睛 */
.home-eye {
  position: absolute;
  top: 22px;
  width: 14px;
  height: 14px;
  background: #333;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s;
}
.home-eye-left { left: 16px; }
.home-eye-right { right: 16px; }

.home-pupil {
  position: absolute;
  top: 3px; left: 4px;
  width: 6px; height: 6px;
  background: #111;
  border-radius: 50%;
}

.home-shine {
  position: absolute;
  top: 2px; left: 7px;
  width: 5px; height: 5px;
  background: #FFF;
  border-radius: 50%;
  opacity: 0.9;
}

/* 鼻子 */
.home-nose {
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
.home-mouth {
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
.home-blush {
  position: absolute;
  bottom: 20px;
  width: 12px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 138, 101, 0.45);
}
.home-blush-left { left: 6px; }
.home-blush-right { right: 6px; }

/* ===== 配饰 ===== */
.home-halo {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(255, 215, 0, 0.7) 0%, transparent 70%);
  animation: homeHaloPulse 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 5;
}

@keyframes homeHaloPulse {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) scaleX(0.9); }
  50% { opacity: 1; transform: translateX(-50%) scaleX(1.15); }
}

.home-crown {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: homeCrownFloat 2s ease-in-out infinite;
  pointer-events: none;
  z-index: 20;
}

@keyframes homeCrownFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-4px); }
}

.home-hat {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.6rem;
  animation: homeHatBounce 0.6s ease-out, homeHatSway 2s ease-in-out infinite 0.6s;
  pointer-events: none;
  z-index: 20;
}

@keyframes homeHatBounce {
  0% { transform: translateX(-50%) translateY(-15px) rotate(-15deg) scale(0.5); opacity: 0; }
  60% { transform: translateX(-50%) translateY(2px) rotate(5deg) scale(1.1); }
  100% { transform: translateX(-50%) translateY(0) rotate(0deg) scale(1); opacity: 1; }
}

@keyframes homeHatSway {
  0%, 100% { transform: translateX(-50%) rotate(-3deg); }
  50% { transform: translateX(-50%) rotate(3deg); }
}

.home-glasses {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 20px;
  z-index: 10;
  pointer-events: none;
}
.home-glass {
  position: absolute;
  top: 0;
  width: 22px;
  height: 18px;
  border: 2.5px solid #42A5F5;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}
.home-glass-left { left: 4px; }
.home-glass-right { right: 4px; }
.home-glass-bridge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 2px;
  background: #42A5F5;
  border-radius: 1px;
}

.home-wings {
  position: absolute;
  top: 45%;
  left: -12px;
  font-size: 1.2rem;
  animation: homeWingsFlutter 0.8s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
  opacity: 0.5;
}

@keyframes homeWingsFlutter {
  0%, 100% { transform: translateX(-50%) translateY(0) scaleX(0.85); opacity: 0.4; }
  50% { transform: translateX(-50%) translateY(-3px) scaleX(1.05); opacity: 0.6; }
}

/* 说话嘴部动画 */
.home-mouth-anim {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  animation: homeMouthOpen 0.3s ease-in-out infinite alternate;
  pointer-events: none;
}
@keyframes homeMouthOpen {
  0% { height: 4px; width: 12px; }
  100% { height: 12px; width: 16px; }
}

/* ===== 状态指示器 ===== */
.home-status-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 16px;
  animation: homeBadgePop 0.4s ease-out;
}

@keyframes homeBadgePop {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ===== 星星粒子 ===== */
.home-star {
  position: absolute;
  font-size: 1rem;
  animation: homeStarFly 0.8s ease-out forwards;
  opacity: 0;
  pointer-events: none;
}

@keyframes homeStarFly {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
}

/* ===== 背面用户头像 ===== */
.home-user-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #FF9500;
  box-shadow: 0 4px 16px rgba(255, 140, 66, 0.35);
  background: #FFF8F0;
}
.home-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.home-avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}
.home-back-hint {
  font-size: 10px;
  color: #999;
  margin-top: 8px;
}

/* ===== 气泡 ===== */
.home-bubble {
  position: relative;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 2px solid #FFD93D;
  border-radius: 16px 16px 4px 16px;
  padding: 8px 14px 11px;
  max-width: 200px;
  box-shadow: 0 3px 12px rgba(255, 217, 61, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08);
  animation: homeBubblePop 0.35s ease-out;
  text-align: center;
  z-index: 100;
}

.home-bubble::before {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 20px;
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 9px solid #FFD93D;
}

.home-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 20px;
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #FFF9E6;
}

.home-bubble p {
  font-size: 13px;
  color: #5D4E37;
  line-height: 1.45;
  margin: 0;
  font-weight: 600;
  word-break: break-word;
}

.home-bubble-shine {
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

.home-bubble-sparkle {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #FFD93D;
  border-radius: 50%;
  pointer-events: none;
  animation: homeSparkle 2s ease-in-out infinite;
}
.home-bubble-sparkle.sparkle-1 { top: 5px; right: 10px; }
.home-bubble-sparkle.sparkle-2 { bottom: 8px; right: 6px; animation-delay: 1s; }

@keyframes homeSparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes homeBubblePop {
  0% { opacity: 0; transform: translateY(8px) scale(0.6); }
  60% { transform: translateY(-2px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== 情绪状态 ===== */
.mood-happy .home-eye {
  height: 6px;
  border-radius: 14px 14px 0 0;
  background: transparent;
  border-top: 3px solid #333;
}
.mood-happy .home-pupil,
.mood-happy .home-shine { display: none; }
.mood-happy .home-mouth {
  height: 12px;
  border-bottom-width: 3px;
  background: #E53935;
  border: none;
  border-radius: 0 0 16px 16px;
}
.mood-happy .home-blush { opacity: 1; }

.mood-celebrate .home-eye {
  background: #FFC107;
  width: 12px; height: 12px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.mood-celebrate .home-pupil,
.mood-celebrate .home-shine { display: none; }
.mood-celebrate .home-mouth {
  height: 14px;
  background: #E53935;
  border: none;
  border-radius: 0 0 14px 14px;
}
.mood-celebrate .home-blush { opacity: 1; }
.mood-celebrate .home-tiger-body { animation: homeCelebrateBounce 0.4s ease-out; }

@keyframes homeCelebrateBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.mood-sleepy .home-eye {
  height: 3px;
  border-radius: 3px;
  background: #333;
}
.mood-sleepy .home-pupil,
.mood-sleepy .home-shine { display: none; }
.mood-sleepy .home-mouth {
  width: 10px;
  height: 4px;
  border: none;
  border-bottom: 2px solid #5D4037;
  border-radius: 0 0 10px 10px;
}

.mood-thinking .home-eye-right {
  height: 3px;
  border-radius: 3px;
  background: #333;
}
.mood-thinking .home-eye-right .home-pupil,
.mood-thinking .home-eye-right .home-shine { display: none; }

.mood-encourage .home-mouth {
  width: 20px;
  height: 10px;
}
.mood-encourage .home-blush { opacity: 0.7; }

.mood-summon .home-tiger-body {
  animation: homeSummonWave 0.6s ease-out;
}

@keyframes homeSummonWave {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-8deg) scale(1.05); }
  75% { transform: rotate(8deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

.mood-excited .home-eye {
  background: #FFC107;
  width: 12px; height: 12px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.mood-excited .home-pupil,
.mood-excited .home-shine { display: none; }
.mood-excited .home-mouth {
  height: 14px;
  background: #E53935;
  border: none;
  border-radius: 0 0 14px 14px;
}
.mood-excited .home-blush { opacity: 1; }
.mood-excited .home-tiger-body { animation: homeExcitedBounce 0.5s ease-in-out infinite alternate; }

@keyframes homeExcitedBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}

.mood-proud .home-eye {
  height: 5px;
  border-radius: 14px 14px 0 0;
  background: transparent;
  border-top: 3px solid #333;
}
.mood-proud .home-pupil,
.mood-proud .home-shine { display: none; }
.mood-proud .home-mouth {
  width: 20px;
  height: 10px;
  border: none;
  border-bottom: 3px solid #333;
  border-radius: 0 0 20px 20px;
}

.mood-cheer .home-eye.eye-left {
  width: 10px; height: 10px;
  background: transparent;
  border-right: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(45deg);
  border-radius: 0 0 2px 0;
}
.mood-cheer .home-eye.eye-right {
  width: 10px; height: 10px;
  background: transparent;
  border-left: 3px solid #333;
  border-bottom: 3px solid #333;
  transform: rotate(-45deg);
  border-radius: 0 0 0 2px;
}
.mood-cheer .home-pupil,
.mood-cheer .home-shine { display: none; }
.mood-cheer .home-mouth {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #E53935;
  border: 2px solid #C62828;
  animation: homeCheerShout 0.4s ease-in-out infinite alternate;
}

@keyframes homeCheerShout {
  0% { transform: translateX(-50%) scale(1); }
  100% { transform: translateX(-50%) scale(1.15); }
}

.mood-comfort .home-eye {
  width: 12px; height: 12px;
  box-shadow: inset -3px -2px 0 2px rgba(255, 255, 255, 0.7);
}
.mood-comfort .home-pupil { top: 2px; left: 3px; width: 5px; height: 5px; }
.mood-comfort .home-shine { top: 1px; left: 6px; width: 4px; height: 4px; }
.mood-comfort .home-blush {
  opacity: 1;
  background: rgba(255, 183, 197, 0.35);
}
</style>