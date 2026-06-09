<template>
  <div class="learn-avatar">
    <!-- 学习进度环 -->
    <div v-if="showProgress" class="learn-progress-ring">
      <svg class="progress-svg" viewBox="0 0 100 100">
        <circle class="progress-bg" cx="50" cy="50" r="45" />
        <circle class="progress-fill" cx="50" cy="50" r="45"
          :style="{ strokeDasharray: `${progressPercent * 2.83} 283` }" />
      </svg>
      <span class="progress-text">{{ progressPercent }}%</span>
    </div>
    
    <!-- 宠物头像 -->
    <div class="learn-pet" :class="`learn-mood-${mood}`">
      <div class="learn-pet-body" :style="{ background: petBackground }">
        <!-- 宠物显示：使用 emoji 或自定义脸部 -->
        <div v-if="useEmojiPet" class="learn-emoji-pet">{{ store.currentPetType.emoji }}</div>
        <template v-else>
          <!-- 老虎脸部 -->
          <div class="learn-face">
            <!-- 条纹 -->
            <span class="learn-stripe learn-stripe-l1"></span>
            <span class="learn-stripe learn-stripe-l2"></span>
            <span class="learn-stripe learn-stripe-r1"></span>
            <span class="learn-stripe learn-stripe-r2"></span>
            
            <!-- 耳朵 -->
            <span class="learn-ear learn-ear-left"></span>
            <span class="learn-ear learn-ear-right"></span>
            
            <!-- 眼睛 -->
            <span class="learn-eye learn-eye-left">
              <span class="learn-pupil"></span>
              <span class="learn-shine"></span>
            </span>
            <span class="learn-eye learn-eye-right">
              <span class="learn-pupil"></span>
              <span class="learn-shine"></span>
            </span>
            
            <!-- 鼻子 -->
            <span class="learn-nose"></span>
            
            <!-- 嘴巴 -->
            <span class="learn-mouth"></span>
            
            <!-- 腮红 -->
            <span class="learn-blush learn-blush-left"></span>
            <span class="learn-blush learn-blush-right"></span>
          </div>
        </template>
        
        <!-- 说话嘴部动画 -->
        <span v-if="isSpeaking" class="learn-mouth-anim"></span>
        
        <!-- 跟读麦克风动画 -->
        <div v-if="isRecording" class="learn-mic-ring">
          <span class="mic-wave mic-wave-1"></span>
          <span class="mic-wave mic-wave-2"></span>
          <span class="mic-wave mic-wave-3"></span>
        </div>
      </div>
      
      <!-- 学习步骤指示 -->
      <div v-if="showStep" class="learn-step-indicator">
        <span class="step-num">{{ currentStep }}</span>
        <span class="step-total">/{{ totalSteps }}</span>
      </div>
    </div>
    
    <!-- 气泡 -->
    <div v-if="bubbleText" class="learn-bubble" :class="`learn-bubble--${mood}`">
      <div class="learn-bubble-shine"></div>
      <p>{{ bubbleText }}</p>
    </div>
    
    <!-- 星星粒子 -->
    <template v-if="showStars">
      <span v-for="i in 5" :key="i" class="learn-star"
        :style="{ animationDelay: `${i * 0.1}s`, left: `${15 + i * 15}%` }"></span>
    </template>
    
    <!-- 学习特效：闪光 -->
    <div v-if="showSparkle" class="learn-sparkle">
      <span v-for="i in 6" :key="i" class="sparkle-dot"
        :style="{ animationDelay: `${i * 0.15}s` }"></span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useLearningStore } from '@/stores/learning'

const store = useLearningStore()

const props = defineProps({
  mood: {
    type: String,
    default: 'idle',
    validator: v => ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy', 'focused', 'proud', 'comfort', 'excited'].includes(v)
  },
  bubbleText: { type: String, default: '' },
  showStars: { type: Boolean, default: false },
  showSparkle: { type: Boolean, default: false },
  isSpeaking: { type: Boolean, default: false },
  isRecording: { type: Boolean, default: false },
  showProgress: { type: Boolean, default: false },
  progressPercent: { type: Number, default: 0 },
  showStep: { type: Boolean, default: false },
  currentStep: { type: Number, default: 1 },
  totalSteps: { type: Number, default: 4 }
})

const useEmojiPet = computed(() => {
  const tigerTypes = ['tiger']
  return !tigerTypes.includes(store.settings?.petType)
})

const petBackground = computed(() => {
  return store.currentPetType?.color || '#FFB74D'
})

onMounted(() => {
  console.log('[AVATAR][LearnAvatar] onMounted - component initialized')
  console.log('[AVATAR][LearnAvatar] onMounted - initial props:', {
    mood: props.mood,
    bubbleText: props.bubbleText,
    showStars: props.showStars,
    showSparkle: props.showSparkle,
    isSpeaking: props.isSpeaking,
    isRecording: props.isRecording,
    showProgress: props.showProgress,
    progressPercent: props.progressPercent,
    showStep: props.showStep,
    currentStep: props.currentStep,
    totalSteps: props.totalSteps
  })
})

watch(() => props.mood, (newMood, oldMood) => {
  console.log('[AVATAR][LearnAvatar] mood changed:', { from: oldMood, to: newMood })
})

watch(() => props.isSpeaking, (newVal, oldVal) => {
  console.log('[AVATAR][LearnAvatar] isSpeaking changed:', { from: oldVal, to: newVal })
})

watch(() => props.isRecording, (newVal, oldVal) => {
  console.log('[AVATAR][LearnAvatar] isRecording changed:', { from: oldVal, to: newVal })
})

watch(() => props.progressPercent, (newVal, oldVal) => {
  console.log('[AVATAR][LearnAvatar] progressPercent changed:', { from: oldVal, to: newVal })
})

watch(() => props.currentStep, (newVal, oldVal) => {
  console.log('[AVATAR][LearnAvatar] currentStep changed:', { from: oldVal, to: newVal })
})
</script>

<style scoped>
.learn-avatar {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding: 8px 0;
  width: 80px;
  background: transparent;
  border: none;
}

/* ===== 学习进度环 ===== */
.learn-progress-ring {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  pointer-events: none;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: rgba(255, 140, 66, 0.1);
  stroke-width: 6;
}

.progress-fill {
  fill: none;
  stroke: url(#progressGradient);
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-svg defs {
  position: absolute;
  width: 0;
  height: 0;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: #FF9500;
}

/* ===== 宠物身体 ===== */
.learn-pet {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.learn-pet-body {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(255, 140, 66, 0.3),
    inset 0 -2px 5px rgba(0, 0, 0, 0.07),
    inset 0 2px 5px rgba(255, 255, 255, 0.15);
  position: relative;
  transition: transform 0.3s ease;
}

.learn-mood-idle .learn-pet-body {
  animation: learnBreathe 2.8s ease-in-out infinite;
}

@keyframes learnBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* ===== Emoji 宠物 ===== */
.learn-emoji-pet {
  font-size: 2.5rem;
  line-height: 1;
  animation: learnBreathe 2.8s ease-in-out infinite;
}

.learn-mood-happy .learn-emoji-pet,
.learn-mood-celebrate .learn-emoji-pet,
.learn-mood-excited .learn-emoji-pet {
  animation: learnHappyBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.learn-mood-thinking .learn-emoji-pet {
  animation: learnTilt 2s ease-in-out infinite;
}

.learn-mood-encourage .learn-emoji-pet {
  animation: learnNod 1.2s ease-in-out infinite;
}

@keyframes learnHappyBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.09); }
  100% { transform: scale(1); }
}

@keyframes learnTilt {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(4deg); }
}

@keyframes learnNod {
  0%, 100% { transform: translateY(0) rotate(0); }
  30% { transform: translateY(-3px) rotate(-2deg); }
  60% { transform: translateY(0) rotate(2deg); }
}

/* ===== 老虎脸部 ===== */
.learn-face {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 条纹 */
.learn-stripe {
  position: absolute;
  background: #E65100;
  border-radius: 2px;
  opacity: 0.55;
}
.learn-stripe-l1 { width: 2.5px; height: 9px; top: 10px; left: 12px; transform: rotate(-20deg); }
.learn-stripe-l2 { width: 2.5px; height: 7px; top: 16px; left: 8px; transform: rotate(-10deg); }
.learn-stripe-r1 { width: 2.5px; height: 9px; top: 10px; right: 12px; transform: rotate(20deg); }
.learn-stripe-r2 { width: 2.5px; height: 7px; top: 16px; right: 8px; transform: rotate(10deg); }

/* 耳朵 */
.learn-ear {
  position: absolute;
  width: 17px;
  height: 17px;
  background: linear-gradient(145deg, #FFB74D, #FF8F00);
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.28);
  z-index: 0;
}
.learn-ear::after {
  content: '';
  position: absolute;
  top: 3px; left: 3px;
  width: 10px; height: 10px;
  background: #FFCC80;
  border-radius: 50%;
}
.learn-ear-left { top: -3px; left: 6px; }
.learn-ear-right { top: -3px; right: 6px; }

/* 眼睛 */
.learn-eye {
  position: absolute;
  top: 17px;
  width: 12px;
  height: 12px;
  background: #333;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}
.learn-eye-left { left: 12px; }
.learn-eye-right { right: 12px; }

.learn-pupil {
  position: absolute;
  top: 2px; left: 3px;
  width: 5px; height: 5px;
  background: #111;
  border-radius: 50%;
}

.learn-shine {
  position: absolute;
  top: 1px; left: 6px;
  width: 4px; height: 4px;
  background: #FFF;
  border-radius: 50%;
  opacity: 0.9;
}

/* 鼻子 */
.learn-nose {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 5px;
  background: #5D4037;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

/* 嘴巴 */
.learn-mouth {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 13px;
  height: 6px;
  border-bottom: 2px solid #5D4037;
  border-radius: 0 0 13px 13px;
}

/* 腮红 */
.learn-blush {
  position: absolute;
  bottom: 15px;
  width: 9px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 138, 101, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
}
.learn-blush-left { left: 5px; }
.learn-blush-right { right: 5px; }

/* ===== 说话嘴部动画 ===== */
.learn-mouth-anim {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  animation: learnMouthOpen 0.3s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes learnMouthOpen {
  0% { height: 4px; width: 10px; }
  100% { height: 10px; width: 14px; }
}

/* ===== 跟读麦克风动画 ===== */
.learn-mic-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 20;
}

.mic-wave {
  position: absolute;
  inset: 4px;
  border: 2px solid #FF5252;
  border-radius: 50%;
  animation: micWaveExpand 1.5s ease-out infinite;
  opacity: 0;
}

.mic-wave-1 { animation-delay: 0s; }
.mic-wave-2 { animation-delay: 0.5s; }
.mic-wave-3 { animation-delay: 1s; }

@keyframes micWaveExpand {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ===== 学习步骤指示 ===== */
.learn-step-indicator {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: linear-gradient(135deg, #66BB6A, #43A047);
  border-radius: 14px;
  padding: 2px 10px;
  display: flex;
  align-items: baseline;
  gap: 1px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.step-num {
  font-size: 0.9rem;
  font-weight: 800;
  color: #FFF;
}

.step-total {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== 情绪状态 ===== */
.learn-mood-happy .learn-pet-body {
  animation: learnHappyBounce 0.4s ease-out;
}

@keyframes learnHappyBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.learn-mood-happy .learn-eye {
  height: 4px;
  border-radius: 10px 10px 0 0;
  background: transparent;
  border-top: 2.5px solid #333;
}
.learn-mood-happy .learn-pupil,
.learn-mood-happy .learn-shine { display: none; }
.learn-mood-happy .learn-mouth {
  height: 9px;
  background: #E53935;
  border: none;
  border-radius: 0 0 13px 13px;
}
.learn-mood-happy .learn-blush { opacity: 1; }

.learn-mood-celebrate .learn-pet-body {
  animation: learnCelebrate 0.5s ease-in-out infinite;
}

@keyframes learnCelebrate {
  0%, 100% { transform: scale(1) rotate(-3deg); }
  50% { transform: scale(1.05) rotate(3deg); }
}

.learn-mood-celebrate .learn-eye {
  background: #FFC107;
  width: 10px; height: 10px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.learn-mood-celebrate .learn-pupil,
.learn-mood-celebrate .learn-shine { display: none; }
.learn-mood-celebrate .learn-mouth {
  height: 10px;
  background: #E53935;
  border: none;
  border-radius: 0 0 10px 10px;
}
.learn-mood-celebrate .learn-blush { opacity: 1; }

.learn-mood-focus .learn-pet-body {
  animation: learnFocus 2s ease-in-out infinite;
}

@keyframes learnFocus {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
.learn-mood-focus .learn-pupil { top: 3px; left: 4px; }

.learn-mood-thinking .learn-pet-body {
  animation: learnTilt 2.5s ease-in-out infinite;
}

@keyframes learnTilt {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(3deg); }
}
.learn-mood-thinking .learn-eye-right {
  height: 3px;
  border-radius: 3px;
  background: #333;
}
.learn-mood-thinking .learn-eye-right .learn-pupil,
.learn-mood-thinking .learn-eye-right .learn-shine { display: none; }

.learn-mood-encourage .learn-pet-body {
  animation: learnNod 1.5s ease-in-out infinite;
}

@keyframes learnNod {
  0%, 100% { transform: translateY(0) rotate(0); }
  30% { transform: translateY(-4px) rotate(-2deg); }
  60% { transform: translateY(0) rotate(2deg); }
}
.learn-mood-encourage .learn-mouth {
  width: 16px;
  height: 8px;
}
.learn-mood-encourage .learn-blush { opacity: 0.7; }

.learn-mood-proud .learn-eye {
  height: 4px;
  border-radius: 10px 10px 0 0;
  background: transparent;
  border-top: 2.5px solid #333;
}
.learn-mood-proud .learn-pupil,
.learn-mood-proud .learn-shine { display: none; }
.learn-mood-proud .learn-mouth {
  width: 16px;
  height: 8px;
  border: none;
  border-bottom: 2.5px solid #333;
  border-radius: 0 0 16px 16px;
}
.learn-mood-proud .learn-pet-body {
  animation: learnProudGlow 2s ease-in-out infinite alternate;
}

@keyframes learnProudGlow {
  0% { box-shadow: 0 6px 20px rgba(255, 140, 66, 0.35); }
  100% { box-shadow: 0 6px 28px rgba(255, 215, 0, 0.5); }
}

.learn-mood-comfort .learn-eye {
  width: 11px; height: 11px;
  box-shadow: inset -2.5px -1.5px 0 2px rgba(255, 255, 255, 0.7);
}
.learn-mood-comfort .learn-pupil { top: 2px; left: 3px; width: 4px; height: 4px; }
.learn-mood-comfort .learn-shine { top: 1px; left: 5px; width: 3px; height: 3px; }
.learn-mood-comfort .learn-blush {
  opacity: 1;
  background: rgba(255, 183, 197, 0.35);
}
.learn-mood-comfort .learn-pet-body {
  animation: learnComfortTilt 2s ease-in-out infinite alternate;
}

@keyframes learnComfortTilt {
  0% { transform: rotate(-2deg); }
  100% { transform: rotate(2deg); }
}

.learn-mood-excited .learn-eye {
  background: #FFC107;
  width: 10px; height: 10px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.learn-mood-excited .learn-pupil,
.learn-mood-excited .learn-shine { display: none; }
.learn-mood-excited .learn-mouth {
  height: 10px;
  background: #E53935;
  border: none;
  border-radius: 0 0 10px 10px;
}
.learn-mood-excited .learn-blush { opacity: 1; }
.learn-mood-excited .learn-pet-body {
  animation: learnExcitedBounce 0.4s ease-in-out infinite alternate;
}

@keyframes learnExcitedBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}

.learn-mood-sleepy .learn-eye {
  height: 2px;
  border-radius: 2px;
  background: #333;
}
.learn-mood-sleepy .learn-pupil,
.learn-mood-sleepy .learn-shine { display: none; }
.learn-mood-sleepy .learn-mouth {
  width: 8px;
  height: 4px;
  border: none;
  border-bottom: 1.5px solid #5D4037;
  border-radius: 0 0 8px 8px;
}

/* ===== 气泡 ===== */
.learn-bubble {
  position: absolute;
  bottom: 50%;
  right: calc(100% + 12px);
  transform: translateY(50%);
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 1.5px solid #FFD93D;
  border-radius: 16px 16px 16px 4px;
  padding: 10px 16px 12px;
  max-width: 220px;
  min-width: 80px;
  animation: learnBubblePop 0.35s ease-out;
  text-align: left;
  z-index: 100;
}

@keyframes learnBubblePop {
  0% { opacity: 0; transform: translateY(50%) translateX(10px) scale(0.9); }
  100% { opacity: 1; transform: translateY(50%) translateX(0) scale(1); }
}

.learn-bubble::before {
  content: '';
  position: absolute;
  top: 50%;
  right: -8px;
  transform: translateY(-50%);
  width: 0; height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid #FFD93D;
}

.learn-bubble::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -6px;
  transform: translateY(-50%);
  width: 0; height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #FFF9E6;
}

.learn-bubble-shine {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 11px;
  height: 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
  pointer-events: none;
}

.learn-bubble p {
  font-size: 11px;
  color: #5D4E37;
  line-height: 1.45;
  margin: 0;
  font-weight: 600;
  word-break: break-word;
}

.learn-bubble--happy { border-color: #FFD93D; }
.learn-bubble--celebrate { 
  border-color: #FFC107; 
  background: linear-gradient(180deg, #FFF9C4, #FFEB3B);
}
.learn-bubble--encourage { border-color: #FFAB40; background: linear-gradient(180deg, #FFFFFF, #FFF3E0); }
.learn-bubble--focused { border-color: #42A5F5; }
.learn-bubble--comfort { border-color: #F48FB1; background: linear-gradient(180deg, #FFFFFF, #FCE4EC); }

/* ===== 星星粒子 ===== */
.learn-star {
  position: absolute;
  top: 0;
  font-size: 1rem;
  animation: learnStarFly 0.9s ease-out forwards;
  opacity: 0;
  pointer-events: none;
}

@keyframes learnStarFly {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  100% { transform: translateY(-35px) scale(1.3); opacity: 0; }
}

/* ===== 闪光特效 ===== */
.learn-sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  pointer-events: none;
  z-index: 20;
}

.sparkle-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #FFD700;
  border-radius: 50%;
  animation: sparklePop 0.6s ease-out forwards;
  opacity: 0;
}

.sparkle-dot:nth-child(1) { top: 10%; left: 50%; }
.sparkle-dot:nth-child(2) { top: 30%; right: 10%; }
.sparkle-dot:nth-child(3) { bottom: 20%; right: 25%; }
.sparkle-dot:nth-child(4) { bottom: 15%; left: 30%; }
.sparkle-dot:nth-child(5) { top: 40%; left: 5%; }
.sparkle-dot:nth-child(6) { top: 60%; right: 35%; }

@keyframes sparklePop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(var(--sx, 10px), var(--sy, 10px));
  }
}

.sparkle-dot:nth-child(1) { --sx: 0; --sy: -20px; }
.sparkle-dot:nth-child(2) { --sx: 15px; --sy: -5px; }
.sparkle-dot:nth-child(3) { --sx: 10px; --sy: 15px; }
.sparkle-dot:nth-child(4) { --sx: -15px; --sy: 10px; }
.sparkle-dot:nth-child(5) { --sx: -20px; --sy: -10px; }
.sparkle-dot:nth-child(6) { --sx: 5px; --sy: 5px; }
</style>