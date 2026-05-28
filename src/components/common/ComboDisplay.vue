<template>
  <!-- Combo 计数器：始终固定在右上角 -->
  <Transition name="combo-fade">
    <div v-if="combo >= 2" class="combo-display" :class="comboClass">
      <span class="combo-label">Combo</span>
      <span class="combo-num" :key="combo">×{{ combo }}</span>
      <Transition name="pop">
        <span v-if="combo >= 3" class="combo-fire">🔥</span>
      </Transition>
    </div>
  </Transition>

  <!-- 首次 Combo x3 引导：全屏大型🔥动画 + 呦呦配音 -->
  <Transition name="guide-overlay">
    <div v-if="showGuide" class="combo-guide-overlay">
      <div class="combo-guide-content anim-bounce">
        <span class="guide-fire">🔥</span>
        <h2 class="guide-title">Wow! Combo ×3!</h2>
        <p class="guide-subtitle">连续答对，星星更多！</p>
      </div>
    </div>
  </Transition>

  <!-- Combo x5 金色闪光 -->
  <Transition name="combo-flash">
    <div v-if="showGoldFlash" class="combo-gold-flash"></div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { sfxComplete } from '@/composables/useSfx'
import { useSpeech } from '@/composables/useSpeech'

const store = useLearningStore()
const { playAudio } = useSpeech()
const props = defineProps({
  combo: { type: Number, default: 0 },
  guideKey: { type: String, default: 'match' } // 用于区分不同游戏的首次引导
})

const showGuide = ref(false)
const showGoldFlash = ref(false)
const guideDismissed = ref({})

// 从 localStorage 读取已.dismissed的引导
onMounted(() => {
  try {
    const dismissed = JSON.parse(localStorage.getItem('combo-guide-dismissed') || '{}')
    guideDismissed.value = dismissed
  } catch (e) {
    guideDismissed.value = {}
  }
})

function dismissGuide() {
  showGuide.value = false
  guideDismissed.value[props.guideKey] = true
  try {
    localStorage.setItem('combo-guide-dismissed', JSON.stringify(guideDismissed.value))
  } catch (e) { /* ignore */ }
}

const comboClass = computed(() => {
  if (props.combo >= 5) return 'combo-fire-x5'
  if (props.combo >= 3) return 'combo-fire-x3'
  return 'combo-normal'
})

// 监听 combo 变化，触发特效
let guideTimer = null
let goldTimer = null

watch(() => props.combo, (newVal, oldVal) => {
  if (newVal <= oldVal) return

  // x3：首次引导 + 火焰
  if (newVal === 3) {
    sfxComplete()
    if (store.showComboGuide && !guideDismissed.value[props.guideKey]) {
      showGuide.value = true
      playAudio('/audio/wow.mp3')
      guideTimer = setTimeout(dismissGuide, 2500)
    }
  }

  // x5：金色闪光
  if (newVal === 5) {
    showGoldFlash.value = true
    sfxComplete()
    playAudio('/audio/excellent.mp3')
    goldTimer = setTimeout(() => { showGoldFlash.value = false }, 600)
  }
})

onMounted(() => {
  return () => {
    clearTimeout(guideTimer)
    clearTimeout(goldTimer)
  }
})
</script>

<style scoped>
/* ===== Combo 计数器 ===== */
.combo-display {
  position: fixed; top: 16px; right: 16px;
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 200;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
}

.combo-label {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--text-hint);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.combo-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: #7C5CFC;
  transition: all 0.2s;
}

.combo-fire {
  font-size: 1.3rem;
  animation: firePulse 0.6s ease-in-out infinite;
}

/* 火焰等级 */
.combo-fire-x3 {
  border-color: #FF9800;
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
}
.combo-fire-x3 .combo-num {
  color: #FF9800;
  animation: numPulse 1s ease-in-out infinite;
}

.combo-fire-x5 {
  border-color: #FF5722;
  box-shadow: 0 4px 24px rgba(255, 87, 34, 0.4);
  animation: comboShake 0.5s ease-in-out;
}
.combo-fire-x5 .combo-num {
  color: #FF5722;
  font-size: 1.8rem;
}

@keyframes firePulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(-5deg); }
}

@keyframes numPulse {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 8px rgba(255, 152, 0, 0.5); }
}

@keyframes comboShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px) rotate(-2deg); }
  40% { transform: translateX(3px) rotate(2deg); }
  60% { transform: translateX(-2px) rotate(-1deg); }
  80% { transform: translateX(2px) rotate(1deg); }
}

/* ===== 首次引导 ===== */
.combo-guide-overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 300;
  pointer-events: none;
}

.combo-guide-content {
  text-align: center;
  color: #fff;
}

.guide-fire {
  font-size: 6rem;
  display: block;
  margin-bottom: 16px;
  animation: guideFireSpin 1s ease-in-out;
}

.guide-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 8px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.guide-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

@keyframes guideFireSpin {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  60% { transform: scale(1.3) rotate(10deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ===== 金色闪光 ===== */
.combo-gold-flash {
  position: fixed; inset: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  z-index: 150;
  pointer-events: none;
  animation: goldFlash 0.6s ease-out;
}

@keyframes goldFlash {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}

/* ===== 过渡动画 ===== */
.combo-fade-enter-active { transition: all 0.3s var(--ease-smooth); }
.combo-fade-leave-active { transition: all 0.2s ease; }
.combo-fade-enter-from { opacity: 0; transform: translateY(-10px) scale(0.9); }
.combo-fade-leave-to { opacity: 0; transform: translateY(-10px) scale(0.9); }

.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.guide-overlay-enter-active { transition: all 0.4s var(--ease-bounce); }
.guide-overlay-leave-active { transition: all 0.3s ease; }
.guide-overlay-enter-from { opacity: 0; }
.guide-overlay-leave-to { opacity: 0; }

.combo-flash-enter-active { animation: goldFlash 0.6s ease-out; }
.combo-flash-leave-active { transition: opacity 0.2s; }
.combo-flash-enter-from { opacity: 0; }
.combo-flash-leave-to { opacity: 0; }
</style>
