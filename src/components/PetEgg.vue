<template>
  <div
    class="pet-egg-wrap"
    :class="[levelClass, moodClass, animClass]"
    @click="$emit('tap')"
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
          <span class="creature-face">{{ speciesEmoji }}</span>
          <!-- 装扮叠加 -->
          <span v-if="dressEmoji" class="pet-dress-overlay">{{ dressEmoji }}</span>
        </div>
      </div>
    </template>

    <!-- 心情气泡 -->
    <span v-if="moodBubbleEmoji" :key="bubbleKey" class="pet-mood-bubble">{{ moodBubbleEmoji }}</span>

    <!-- 睡觉 Zzz -->
    <template v-if="mood === 'sleeping'">
      <span class="pet-zzz">💤</span>
      <span class="pet-zzz">💤</span>
      <span class="pet-zzz">💤</span>
    </template>

    <!-- 进度条 -->
    <div class="pet-progress-bar">
      <div class="pet-progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
    </div>

    <!-- 名称 & 等级 -->
    <span class="pet-name-tag">{{ displayName }}</span>
    <span class="pet-level-tag">{{ levelName }}</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePetStore } from '@/composables/usePetStore.js'

const {
  petState, petLevel, currentLevelConfig, levelProgress,
  currentSpecies, currentDressItem, PET_MOODS,
} = usePetStore()

const emit = defineEmits(['tap'])

// ===== 等级 =====
const level = petLevel
const progress = levelProgress
const levelName = currentLevelConfig.value?.name || '小蛋蛋'

const levelClass = computed(() => `pet-egg-lv${level.value}`)

// ===== 心情 =====
const mood = computed(() => petState.value?.petMood || 'happy')

const moodClass = computed(() => {
  if (mood.value === 'hungry') return 'pet-mood-hungry'
  return ''
})

// 蛋蛋表情 — 根据等级显示不同的蛋面
const eggFace = computed(() => {
  const faces = { 1: '🥚', 2: '✨', 3: '🌈', 4: '💫' }
  return faces[level.value] || '🥚'
})

// 心情气泡 — 非开心/睡觉状态时短暂显示
const moodBubbleEmoji = ref('')
const bubbleKey = ref(0)

watch(mood, (val) => {
  if (val === 'excited') {
    moodBubbleEmoji.value = '🎉'
    bubbleKey.value++
  } else if (val === 'curious') {
    moodBubbleEmoji.value = '❓'
    bubbleKey.value++
  } else if (val === 'hungry') {
    moodBubbleEmoji.value = '😢'
    bubbleKey.value++
  } else {
    moodBubbleEmoji.value = ''
  }
}, { immediate: true })

// ===== 精灵 =====
const speciesEmoji = computed(() => currentSpecies.value?.emoji || '🐱')
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
  // actionClass: 'feed-bounce' / 'bubble-float' / 'creature-bounce'
  // CSS 选择器: .pet-anim-feed / .pet-anim-bubble / .pet-anim-creature
  const prefix = actionClass.split('-')[0] // feed / bubble / creature
  animClass.value = `pet-anim-${prefix}`
  setTimeout(() => { animClass.value = '' }, 700)
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
/* 组件级补充样式，主体样式在 pet.css */
</style>
