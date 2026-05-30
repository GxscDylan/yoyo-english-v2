<template>
  <div class="pet-stats-panel" v-if="petState">
    <!-- 今日统计 -->
    <div class="pet-stats-row">
      <span>👍 今日获赞</span>
      <span class="pet-stats-val">{{ petState.todayLikeCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>🍎 喂食</span>
      <span class="pet-stats-val">{{ petState.todayFeedCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>🛁 洗澡</span>
      <span class="pet-stats-val">{{ petState.todayBathCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>🎵 唱歌</span>
      <span class="pet-stats-val">{{ petState.todaySingCount }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="pet-actions-row">
      <button
        v-for="(action, key) in ACTIONS"
        :key="key"
        class="pet-action-btn"
        :class="{ disabled: !canDo(key) }"
        @click.stop="handleAction(key)"
      >
        <span class="action-emoji">{{ action.emoji }}</span>
        <span class="action-label">{{ action.label }}</span>
        <span class="action-cost">{{ action.cost }}⭐</span>
        <!-- 冷却覆盖 -->
        <span v-if="cooldowns[key] > 0" class="cooldown-overlay">
          {{ formatCooldown(cooldowns[key]) }}
        </span>
      </button>
    </div>

    <!-- 换装选择器（仅 Lv.5 破壳后可用） -->
    <div v-if="petLevel >= 5 && availableDresses.length > 0" class="dress-picker">
      <span class="dress-label">换装 👗</span>
      <div class="dress-options">
        <button
          v-for="dress in availableDresses"
          :key="dress.id"
          class="dress-option"
          :class="{ active: petState.currentDress === dress.id, disabled: dressDisabled }"
          :title="dressDisabled ? `换装冷却中~ 还需 ${formatCooldown(getActionCooldown('dress'))}` : `${dress.label}`"
          @click.stop="handleDress(dress.id)"
        >
          {{ dress.emoji }}
        </button>
        <button
          v-if="petState.currentDress"
          class="dress-option remove"
          :class="{ disabled: dressDisabled }"
          title="脱下装扮"
          @click.stop="handleDress(null)"
        >
          ❌
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePetStore } from '@/composables/usePetStore.js'
import { useLearningStore } from '@/stores/learning.js'

const emit = defineEmits(['action', 'error'])

const {
  petState, petLevel, ACTIONS, availableDresses,
  getActionCooldown, doAction, setDress,
} = usePetStore()

const learningStore = useLearningStore()

// 换装按钮是否不可用（冷却中）
const dressDisabled = computed(() => getActionCooldown('dress') > 0)

// ===== 冷却倒计时 =====
const cooldowns = ref({ feed: 0, bath: 0, sing: 0, dress: 0 })
let cooldownTimer = null

function updateCooldowns() {
  for (const key of Object.keys(ACTIONS)) {
    cooldowns.value[key] = getActionCooldown(key)
  }
}

onMounted(() => {
  updateCooldowns()
  cooldownTimer = setInterval(updateCooldowns, 1000)
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

// ===== 操作可用性 =====
function canDo(actionKey) {
  const cd = cooldowns.value[actionKey]
  if (cd > 0) return false
  const cost = ACTIONS[actionKey]?.cost || 0
  return learningStore.totalStars >= cost
}

// ===== 执行操作 =====
function handleAction(actionKey) {
  if (!canDo(actionKey)) {
    const cd = cooldowns.value[actionKey]
    if (cd > 0) {
      emit('error', '冷却中~')
    } else {
      emit('error', '星星不够啦！')
    }
    return
  }

  const result = doAction(actionKey, learningStore.totalStars)
  if (result.success) {
    // 扣减星星
    learningStore.spendStars(result.cost)
    emit('action', actionKey)
  } else if (result.reason === 'cooldown') {
    emit('error', '冷却中~')
  } else if (result.reason === 'stars') {
    emit('error', '星星不够啦！')
  }
}

// ===== 换装 =====
function handleDress(dressId) {
  if (petLevel.value < 5) return

  // 检查换装冷却
  const cd = getActionCooldown('dress')
  if (cd > 0) {
    emit('error', `换装冷却中~ 还需 ${formatCooldown(cd)}`)
    return
  }

  // 换装消耗检查（仅在首次穿戴时）
  if (dressId && dressId !== petState.value?.currentDress) {
    const cost = ACTIONS.dress.cost
    if (learningStore.totalStars < cost) {
      emit('error', '星星不够啦！')
      return
    }
    // 执行换装操作
    const result = doAction('dress', learningStore.totalStars)
    if (!result.success) {
      if (result.reason === 'cooldown') {
        emit('error', '换装冷却中~')
        return
      }
      emit('error', '星星不够啦！')
      return
    }
    learningStore.spendStars(result.cost)
  }
  setDress(dressId)
  emit('action', 'dress')
}

// ===== 冷却格式化 =====
function formatCooldown(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return min > 0 ? `${min}m${sec}s` : `${sec}s`
}
</script>

<style scoped>
.dress-picker {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.dress-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 6px;
}
.dress-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.dress-option {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dress-option:hover {
  transform: scale(1.1);
  border-color: var(--color-primary);
}
.dress-option.active {
  border-color: #FF8C42;
  background: #FFF3E0;
  box-shadow: 0 2px 8px rgba(255, 140, 66, 0.2);
}
.dress-option.remove {
  font-size: 0.9rem;
  opacity: 0.6;
}
.dress-option.remove:hover {
  opacity: 1;
}
.dress-option.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
