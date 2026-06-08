<template>
  <div
    class="pet-egg-wrap"
    :class="[levelClass, moodClass, animClass, { large }]"
    @click="handleClick"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    role="img"
    :aria-label="`${displayName}，${levelName}，成长进度${Math.round(progress * 100)}%`"
    tabindex="0"
    @keydown.enter="handleClick"
  >
    <!-- Lv.1~4 蛋蛋阶段 -->
    <template v-if="level < 5">
      <div class="pet-egg-body">
        <span class="egg-face">{{ eggFace }}</span>
        <!-- Lv.4 裂缝叠加 -->
        <div v-if="level >= 4" class="pet-egg-crack-overlay"></div>
      </div>
    </template>

    <!-- Lv.5 破壳精灵 -->
    <template v-else>
      <div
        class="pet-creature"
        :class="{ 'pet-creature-hatch-enter': showHatchAnim }"
        :style="{ background: speciesColor }"
      >
        <div class="pet-creature-body" :style="{ background: speciesColor }">
          <span class="creature-face">{{ creatureFace }}</span>
          <!-- 装扮叠加 -->
          <span v-if="dressEmoji" class="pet-dress-overlay">{{ dressEmoji }}</span>
        </div>
      </div>
    </template>

    <!-- 心情气泡 -->
    <span v-if="moodBubbleEmoji" :key="bubbleKey" class="pet-mood-bubble">{{ moodBubbleEmoji }}</span>

    <!-- 睡觉 Zzz -->
    <template v-if="mood === 'sleeping'">
      <span class="pet-zzz"></span>
      <span class="pet-zzz"></span>
      <span class="pet-zzz"></span>
    </template>

    <!-- 进度条 -->
    <div class="pet-progress-bar" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="`成长进度 ${Math.round(progress * 100)}%`">
      <div class="pet-progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
    </div>

    <!-- 名称 & 等级 -->
    <span class="pet-name-tag">{{ displayName }}</span>
    <span class="pet-level-tag">{{ levelName }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePetStore } from '@/composables/usePetStore.js'

const {
  petState, petLevel, currentLevelConfig, levelProgress,
  currentSpecies, currentDressItem, PET_MOODS,
} = usePetStore()

const emit = defineEmits(['tap', 'longPress', 'hover'])

const props = defineProps({
  large: { type: Boolean, default: false },
})

const { large } = props

// ===== 长按检测 =====
let pressTimer = null
const isLongPress = ref(false)

function onTouchStart() {
  isLongPress.value = false
  pressTimer = setTimeout(() => {
    isLongPress.value = true
    emit('longPress')
  }, 1000)
}

function onTouchEnd() {
  clearTimeout(pressTimer)
}

function onMouseEnter() {
  emit('hover', true)
}

function onMouseLeave() {
  emit('hover', false)
}

function handleClick() {
  if (!isLongPress.value) {
    emit('tap')
  }
}

// ===== 等级 =====
const level = petLevel
const progress = levelProgress
const levelName = currentLevelConfig.value?.name || '小蛋蛋'

const levelClass = computed(() => `pet-egg-lv${level.value}`)

// ===== 心情 =====
const mood = computed(() => petState.value?.petMood || 'happy')

const moodClass = computed(() => {
  const m = mood.value
  if (m === 'hungry') return 'pet-mood-hungry'
  if (m === 'excited') return 'pet-mood-excited'
  if (m === 'curious') return 'pet-mood-curious'
  if (m === 'sleeping') return 'pet-mood-sleeping'
  return ''
})

// 蛋蛋表情 — 根据等级显示不同的蛋面
const eggFace = computed(() => {
  const faces = { 1: '', 2: '', 3: '', 4: '' }
  return faces[level.value] || ''
})

// 精灵面部表情 — 根据心情变化
const creatureFace = computed(() => {
  const m = mood.value
  if (m === 'hungry') return ''
  if (m === 'excited') return ''
  if (m === 'curious') return ''
  if (m === 'sleeping') return ''
  return currentSpecies.value?.emoji || ''
})

// 心情气泡 — 非开心/睡觉状态时短暂显示
const moodBubbleEmoji = ref('')
const bubbleKey = ref(0)

watch(mood, (val) => {
  if (val === 'excited') {
    moodBubbleEmoji.value = ''
    bubbleKey.value++
  } else if (val === 'curious') {
    moodBubbleEmoji.value = ''
    bubbleKey.value++
  } else if (val === 'hungry') {
    moodBubbleEmoji.value = ''
    bubbleKey.value++
  } else {
    moodBubbleEmoji.value = ''
  }
}, { immediate: true })

// ===== 精灵 =====
const speciesEmoji = computed(() => currentSpecies.value?.emoji || '')
const speciesColor = computed(() => currentSpecies.value?.color || '#FFE0B2')

// ===== 装扮 =====
const dressEmoji = computed(() => currentDressItem.value?.emoji || '')

// ===== 名称 =====
const displayName = computed(() => {
  const s = petState.value
  if (!s) return ''
  if (level.value >= 5 && s.petName) return s.petName
  if (level.value >= 5) return currentSpecies.value?.name || '精灵'
  return currentLevelConfig.value?.name || '小蛋蛋'
})

// ===== 操作动画 =====
const animClass = ref('')
function playActionAnim(actionClass) {
  const prefix = actionClass.split('-')[0]
  animClass.value = `pet-anim-${prefix}`
  setTimeout(() => { animClass.value = '' }, 800)
}
defineExpose({ playActionAnim })

// ===== 破壳入场动画 =====
const showHatchAnim = ref(false)
watch(level, (val) => {
  if (val >= 5 && petState.value?.showHatchAnim) {
    showHatchAnim.value = true
  }
}, { immediate: true })
</script>

<style scoped>
/* ===== 大图模式（PetView 专用） ===== */
.pet-egg-wrap.large .pet-egg-body {
  width: 160px;
  height: 200px;
}
.pet-egg-wrap.large .pet-egg-body .egg-face {
  font-size: 4rem;
}
.pet-egg-wrap.large .pet-creature-body {
  width: 180px;
  height: 180px;
}
.pet-egg-wrap.large .pet-creature-body .creature-face {
  font-size: 6rem;
}
.pet-egg-wrap.large .pet-progress-bar {
  width: 180px;
  height: 8px;
}
.pet-egg-wrap.large .pet-name-tag {
  font-size: 1.2rem;
}
.pet-egg-wrap.large .pet-level-tag {
  font-size: 0.9rem;
}
.pet-egg-wrap.large .pet-mood-bubble {
  font-size: 2.4rem;
  top: -12px;
  right: -16px;
}
.pet-egg-wrap.large .pet-zzz {
  font-size: 2rem;
}
.pet-egg-wrap.large .pet-dress-overlay {
  font-size: 2.8rem;
  top: -24px;
  right: -12px;
}

/* 大图模式：增强发光效果 */
.pet-egg-wrap.large.pet-egg-lv2 .pet-egg-body {
  box-shadow: 0 0 30px 8px rgba(255, 215, 0, 0.35),
              0 0 60px 16px rgba(255, 215, 0, 0.15);
  animation: egg-breathe 3s ease-in-out infinite, egg-glow-pulse-large 2s ease-in-out infinite;
}
@keyframes egg-glow-pulse-large {
  0%, 100% {
    box-shadow: 0 0 30px 8px rgba(255, 215, 0, 0.35),
                0 0 60px 16px rgba(255, 215, 0, 0.15);
  }
  50% {
    box-shadow: 0 0 40px 16px rgba(255, 215, 0, 0.5),
                0 0 80px 24px rgba(255, 215, 0, 0.25);
  }
}

/* 大图模式：Lv.3 彩虹边框更大 */
.pet-egg-wrap.large.pet-egg-lv3 .pet-egg-body {
  border: 4px solid transparent;
}
.pet-egg-wrap.large.pet-egg-lv3 .pet-egg-body::after {
  inset: -4px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9B59B6, #FF6B6B);
  animation: egg-rainbow-spin 4s linear infinite;
  border-radius: 50%;
}

/* 大图模式：Lv.4 裂缝震动更强 */
.pet-egg-wrap.large.pet-egg-lv4 .pet-egg-body {
  animation: egg-shake-large 2s ease-in-out infinite;
}
@keyframes egg-shake-large {
  0%, 100% { transform: translateX(0) scale(1); }
  10% { transform: translateX(-6px) scale(1.03); }
  20% { transform: translateX(6px) scale(1.03); }
  30% { transform: translateX(-4px) scale(1.02); }
  40% { transform: translateX(4px) scale(1.02); }
  50% { transform: translateX(0) scale(1); }
}

/* 大图模式：精灵弹跳更明显 */
.pet-egg-wrap.large .pet-creature {
  animation: creature-bounce-large 2s ease-in-out infinite;
}
@keyframes creature-bounce-large {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
</style>