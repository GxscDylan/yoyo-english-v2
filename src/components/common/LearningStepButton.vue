<!--
  四步学习法按钮组件（v2.0 修复版）
  依据：《四步学习法-按钮交互设计.md》v2.0
  修复：P0 触控区 64px / P1 等待状态 / P2 呦呦联动
-->
<template>
  <button
    class="learning-step-btn"
    :class="buttonClasses"
    :disabled="isDisabled"
    :aria-label="ariaLabel"
    :aria-disabled="isDisabled"
    :style="buttonStyle"
    @click="handleClick"
  >
    <!-- 状态图标（伪元素 fallback） -->
    <span v-if="showIcon" class="lsb-icon" :style="{ animationDelay: iconDelay }">{{ icon }}</span>

    <!-- 按钮文本 -->
    <span class="lsb-text">{{ displayText }}</span>

    <!-- 加载指示器 -->
    <span v-if="showLoading" class="lsb-spinner"></span>
  </button>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['click'])

const props = defineProps({
  // 按钮状态: waiting | playing | active | clicked | scoring | retry | error | record | game-complete | game-perfect
  state: {
    type: String,
    default: 'waiting',
    validator: v => ['waiting', 'playing', 'active', 'clicked', 'scoring', 'retry', 'error', 'record', 'game-complete', 'game-perfect'].includes(v),
  },

  // 按钮文本
  text: { type: String, default: '' },

  // 备用文本映射（根据状态自动选择）
  textMap: {
    type: Object,
    default: () => ({
      waiting: '',
      playing: '正在发音...',
      active: '看懂了！→',
      clicked: '',
      scoring: '评分中...',
      retry: '再试一次？→',
      error: '跳过 →',
      record: '点我录音 🎤',
      'game-complete': '太棒了！→',
      'game-perfect': '⭐⭐⭐ 全对！→',
    }),
  },

  // 图标（可选，状态有默认图标时可覆盖）
  iconOverride: { type: String, default: '' },

  // 是否禁用
  disabled: { type: Boolean, default: false },

  // 是否显示加载中
  showLoading: { type: Boolean, default: false },

  // 自定义最小宽度
  minWidth: { type: String, default: '' },

  // 过渡延迟（用于状态切换动画错峰）
  transitionDelay: { type: Number, default: 0 },
})

// 状态图标映射
const iconMap = {
  waiting: '',
  playing: '🎵',
  active: '✅',
  clicked: '',
  scoring: '⏳',
  retry: '🔄',
  error: '⚠️',
  record: '🎤',
  'game-complete': '',
  'game-perfect': '🎉',
}

const showIcon = computed(() => {
  const custom = props.iconOverride
  if (custom) return true
  return !!iconMap[props.state]
})

const icon = computed(() => {
  return props.iconOverride || iconMap[props.state] || ''
})

const iconDelay = computed(() => {
  if (props.state === 'playing') return '0.5s'
  return '0s'
})

const displayText = computed(() => {
  if (props.text) return props.text
  return props.textMap[props.state] || ''
})

const isDisabled = computed(() => {
  return props.disabled || props.state === 'waiting' || props.state === 'clicked' || props.state === 'scoring'
})

const buttonClasses = computed(() => {
  return {
    [`lsb--${props.state}`]: true,
    'lsb--animate-breathe': props.state === 'playing' || props.state === 'scoring',
    'lsb--animate-pulse': props.state === 'active' || props.state === 'game-perfect',
    'lsb--animate-slide-up': props.state === 'game-complete',
    'lsb--clicked-scale': props.state === 'clicked',
  }
})

const buttonStyle = computed(() => {
  const styles = {}
  if (props.minWidth) styles.minWidth = props.minWidth
  if (props.transitionDelay) styles.transitionDelay = `${props.transitionDelay}ms`
  return Object.keys(styles).length ? styles : undefined
})

const ariaLabel = computed(() => {
  const labels = {
    waiting: '等待中',
    playing: '正在播放发音',
    active: '可以点击继续',
    clicked: '处理中',
    scoring: '评分中，请稍候',
    retry: '再试一次',
    error: '出现错误，可以跳过',
    record: '点击开始录音',
    'game-complete': '游戏完成，点击继续',
    'game-perfect': '满分，点击继续',
  }
  return labels[props.state] || displayText.value
})

function handleClick() {
  if (isDisabled.value) return
  emit('click')
}
</script>

<style scoped>
/* ===== 基础按钮 ===== */
.learning-step-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm, 8px);
  min-height: var(--touch-min, 64px);
  min-width: 180px;
  padding: 14px 28px;
  border: none;
  border-radius: var(--radius-full, 9999px);
  font-family: var(--font-family, 'PingFang SC', sans-serif);
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  transition: transform var(--duration-fast, 150ms) ease,
              background-color var(--duration-normal, 300ms) ease,
              opacity var(--duration-normal, 300ms) ease;
}

.learning-step-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.learning-step-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.lsb-icon {
  font-size: var(--font-size-xl, 1.25rem);
  flex-shrink: 0;
  line-height: 1;
}

.lsb-text {
  white-space: nowrap;
}

.lsb-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: lsb-spin 0.8s linear infinite;
}

/* ===== 状态配色 ===== */

/* 等待 - 灰色 */
.lsb--waiting {
  background-color: var(--bg-card, #FFFFFF);
  color: var(--text-hint, #BFAB95);
  border: 1px solid var(--border-light, #F0E6DA);
}

/* 播放中 - 琥珀色（鹅黄） */
.lsb--playing {
  background-color: #FFEAA7;
  color: var(--text-primary, #3D2C1E);
}

/* 就绪可点击 - 薄荷绿 */
.lsb--active {
  background-color: #B8E6C8;
  color: #1B5E20;
}

/* 已点击 - 薄荷绿缩小 */
.lsb--clicked {
  background-color: #B8E6C8;
  color: #1B5E20;
  transform: scale(0.95);
  opacity: 0.8;
}

/* 评分中 - 灰色 */
.lsb--scoring {
  background-color: var(--bg-card, #FFFFFF);
  color: var(--text-hint, #BFAB95);
  border: 1px solid var(--border-light, #F0E6DA);
}

/* 重试 - 白色 + 琥珀边框 */
.lsb--retry {
  background-color: var(--bg-card, #FFFFFF);
  color: var(--text-primary, #3D2C1E);
  border: 2px solid #FFEAA7;
}

/* 异常 - 珊瑚粉 */
.lsb--error {
  background-color: #FFB3B3;
  color: var(--text-primary, #3D2C1E);
}

/* 录音 - 珊瑚粉边框 */
.lsb--record {
  background-color: var(--bg-card, #FFFFFF);
  color: var(--text-primary, #3D2C1E);
  border: 2px solid #FFB3B3;
}

.lsb--record.recording {
  background-color: #FFB3B3;
  border-color: #FF6B6B;
}

/* 游戏完成 - 天空蓝 */
.lsb--game-complete {
  background-color: #87CEEB;
  color: #1B5E20;
}

/* 满分 - 薄荷绿 + 🎉 */
.lsb--game-perfect {
  background-color: #B8E6C8;
  color: #1B5E20;
  position: relative;
}

/* ===== 动画 ===== */
.lsb--animate-breathe {
  animation: lsb-breathe 3s ease-in-out infinite;
}

.lsb--animate-pulse {
  animation: lsb-pulse 2s ease-in-out infinite;
}

.lsb--animate-slide-up {
  animation: lsb-slide-up 400ms var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
}

@keyframes lsb-breathe {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes lsb-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(184, 230, 200, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(184, 230, 200, 0); }
}

@keyframes lsb-slide-up {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes lsb-spin {
  to { transform: rotate(360deg); }
}

/* ===== 响应式 ===== */
@media (max-width: 767px) {
  .learning-step-btn {
    min-width: 160px;
    padding: 12px 24px;
    font-size: var(--font-size-lg, 1.125rem);
  }
}

@media (min-width: 1024px) {
  .learning-step-btn {
    min-width: 220px;
    padding: 16px 32px;
    font-size: calc(var(--font-size-xl, 1.25rem) + 2px);
  }
}
</style>
