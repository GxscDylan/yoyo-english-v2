<template>
  <div class="pet-stats-panel" v-if="petState">
    <!-- 今日统计 -->
    <div class="pet-stats-row">
      <span>今日获赞</span>
      <span class="pet-stats-val">{{ petState.todayLikeCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>喂食</span>
      <span class="pet-stats-val">{{ petState.todayFeedCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>洗澡</span>
      <span class="pet-stats-val">{{ petState.todayBathCount }}</span>
    </div>
    <div class="pet-stats-row">
      <span>唱歌</span>
      <span class="pet-stats-val">{{ petState.todaySingCount }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="pet-actions-row">
      <button
        v-for="(action, key) in ACTIONS"
        :key="key"
        class="pet-action-btn"
        :class="{
          disabled: !canDo(key),
          insufficient: !canDo(key) && cooldowns[key] <= 0,
          'shake-error': shouldShake[key]
        }"
        @click.stop="handleAction(key)"
        @animationend="onShakeEnd(key)"
        role="button"
        :aria-label="`${action.label}，消耗${action.cost}星星，${cooldowns[key] > 0 ? '冷却中' : '可用'}`"
        :aria-disabled="!canDo(key)"
      >
        <span class="action-emoji">{{ action.emoji }}</span>
        <span class="action-label">{{ action.label }}</span>
        <span class="action-cost">{{ action.cost }}</span>
        <!-- 冷却覆盖：进度环 + 倒计时 -->
        <span v-if="cooldowns[key] > 0" class="cooldown-overlay">
          <svg class="cooldown-ring-svg" viewBox="0 0 36 36">
            <circle class="ring-bg" cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/>
            <circle
              class="ring-fill"
              cx="18" cy="18" r="15"
              fill="none"
              stroke="#AB47BC"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="94.2"
              :stroke-dashoffset="getRingOffset(key)"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span class="cooldown-text">{{ formatCooldown(cooldowns[key]) }}</span>
        </span>
      </button>
    </div>

    <!-- 换装选择器（仅 Lv.5 破壳后可用） -->
    <div v-if="petLevel >= 5 && availableDresses.length > 0" class="dress-picker">
      <span class="dress-label">换装</span>
      <div class="dress-options">
        <button
          v-for="dress in availableDresses"
          :key="dress.id"
          class="dress-option"
          :class="{ active: petState.currentDress === dress.id, disabled: dressDisabled }"
          :title="dressDisabled ? `换装冷却中，还需 ${formatCooldown(getActionCooldown('dress'))}` : `${dress.label}`"
          @click.stop="handleDress(dress.id)"
          :aria-label="`换装为${dress.label}`"
        >
          {{ dress.emoji }}
        </button>
        <button
          v-if="petState.currentDress"
          class="dress-option remove"
          :class="{ disabled: dressDisabled }"
          title="脱下装扮"
          @click.stop="handleDress(null)"
          aria-label="脱下当前装扮"
        >
          <span class="remove-icon"></span>
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
const cooldowns = ref({ feed: 0, bath: 0, sing: 0, dress: 0, pet: 0, play: 0, walk: 0, cuddle: 0, explore: 0 })
let cooldownTimer = null

// 抖动状态
const shouldShake = ref({})

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
      // 触发抖动动画
      shouldShake.value[actionKey] = true
      emit('error', '星星不够啦！')
    }
    return
  }

  const result = doAction(actionKey, learningStore.totalStars)
  if (result.success) {
    learningStore.spendStars(result.cost)
    emit('action', actionKey)
  } else if (result.reason === 'cooldown') {
    emit('error', '冷却中~')
  } else if (result.reason === 'stars') {
    shouldShake.value[actionKey] = true
    emit('error', '星星不够啦！')
  }
}

function onShakeEnd(key) {
  shouldShake.value[key] = false
}

// ===== 换装 =====
function handleDress(dressId) {
  if (petLevel.value < 5) return

  const cd = getActionCooldown('dress')
  if (cd > 0) {
    emit('error', `换装冷却中，还需 ${formatCooldown(cd)}`)
    return
  }

  if (dressId && dressId !== petState.value?.currentDress) {
    const cost = ACTIONS.dress.cost
    if (learningStore.totalStars < cost) {
      emit('error', '星星不够啦！')
      return
    }
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
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    return `${h}h${m}m`
  }
  if (totalSec >= 60) {
    const m = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${m}m${sec}s`
  }
  return `${totalSec}s`
}

// ===== 冷却进度环偏移量计算 =====
function getRingOffset(actionKey) {
  const action = ACTIONS[actionKey]
  if (!action) return 0
  const total = action.cooldown
  const remaining = cooldowns.value[actionKey]
  const circumference = 2 * Math.PI * 15 // r=15
  const pct = remaining / total
  return circumference * (1 - pct)
}
</script>

<style scoped>
.pet-stats-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-radius: 16px;
  padding: 12px;
  border: 2px solid #FFE082;
  box-shadow: 0 2px 12px rgba(255, 193, 7, 0.12);
}

.pet-stats-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.pet-stats-val {
  font-weight: 800;
  color: var(--color-primary);
}

.pet-actions-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.pet-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  cursor: pointer;
  transition: transform 0.15s ease;
  min-width: 60px;
  min-height: 56px;
  position: relative;
  overflow: hidden;
}

.pet-action-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pet-action-btn:active {
  transform: scale(0.95);
}

.pet-action-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.pet-action-btn.insufficient {
  border-color: #EF9A9A;
  opacity: 0.6;
}

.pet-action-btn.shake-error {
  animation: btn-shake 0.4s ease 2;
}

@keyframes btn-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

.pet-action-btn .action-emoji {
  font-size: 1.3rem;
}

.pet-action-btn .action-label {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.pet-action-btn .action-cost {
  font-size: 0.5rem;
  color: var(--text-hint);
}

/* 冷却覆盖层 */
.pet-action-btn .cooldown-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.cooldown-ring-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cooldown-overlay .cooldown-text {
  position: relative;
  z-index: 2;
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--text-hint);
  background: rgba(255,255,255,0.7);
  padding: 2px 4px;
  border-radius: 4px;
}

/* 换装区域 */
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
  gap: 8px;
  flex-wrap: wrap;
}

.dress-option {
  min-width: 48px;
  min-height: 48px;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  font-size: 1.3rem;
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
  border-color: #CE93D8;
  background: #F3E5F5;
  box-shadow: 0 2px 8px rgba(206, 147, 216, 0.3);
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

.remove-icon {
  display: block;
  width: 14px;
  height: 14px;
  position: relative;
}

.remove-icon::before,
.remove-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 2px;
  background: #EF9A9A;
  border-radius: 1px;
}

.remove-icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.remove-icon::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

/* 响应式适配 */
@media (max-width: 400px) {
  .pet-actions-row {
    gap: 6px;
  }
  .pet-action-btn {
    min-width: 56px;
    padding: 8px 8px;
  }
  .dress-options {
    gap: 6px;
  }
  .dress-option {
    width: 48px;
    height: 48px;
  }
}

@media (min-width: 640px) {
  .pet-actions-row {
    gap: 12px;
  }
  .pet-action-btn {
    min-width: 72px;
    min-height: 64px;
    padding: 12px 16px;
  }
  .pet-action-btn .action-emoji {
    font-size: 1.5rem;
  }
}

/* 无障碍：减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .pet-action-btn,
  .dress-option {
    transition: none !important;
  }
  .pet-action-btn.shake-error {
    animation: none !important;
  }
}
</style>
