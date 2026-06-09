<!--
  四步学习法步骤指示器
  显示当前进度，已完成步骤显示 ✓，当前步骤高亮
-->
<template>
  <div class="step-indicator" :class="{ 'step-indicator--vertical': vertical }">
    <template v-for="(step, index) in steps" :key="index">
      <!-- 步骤圆点 -->
      <div
        class="step-dot"
        :class="dotClasses(index)"
        :aria-label="`步骤${index + 1}${stepName(index)}`"
        :aria-current="index === active ? 'step' : undefined"
      >
        <span v-if="index < active" class="step-dot__check">✓</span>
        <span v-else class="step-dot__num">{{ index + 1 }}</span>
      </div>

      <!-- 连接线 -->
      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ 'step-line--done': index < active }"
      ></div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 总步骤数
  total: { type: Number, default: 4 },

  // 当前激活的步骤（0-based）
  active: { type: Number, default: 0 },

  // 垂直排列（手机竖屏用）
  vertical: { type: Boolean, default: false },

  // 步骤名称（可选）
  stepNames: {
    type: Array,
    default: () => ['看一看', '听一听', '读一读', '玩一玩'],
  },
})

const steps = computed(() => Array.from({ length: props.total }, (_, i) => i))

function dotClasses(index) {
  return {
    'step-dot--done': index < props.active,
    'step-dot--active': index === props.active,
    'step-dot--pending': index > props.active,
  }
}

function stepName(index) {
  return props.stepNames[index] || ''
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 4px);
  padding: var(--space-md, 16px);
  background: var(--bg-card, #FFFFFF);
  border-bottom: 1px solid var(--border-light, #F0E6DA);
}

.step-indicator--vertical {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid var(--border-light, #F0E6DA);
  padding: var(--space-lg, 24px) var(--space-sm, 8px);
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  transition: all var(--duration-normal, 300ms) var(--ease-smooth, cubic-bezier(0.4, 0, 0.2, 1));
  flex-shrink: 0;
}

.step-dot--done {
  background: var(--color-success, #4CAF50);
  color: #FFFFFF;
}

.step-dot--active {
  background: var(--color-warning, #FFC107);
  color: var(--text-primary, #3D2C1E);
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(255, 193, 7, 0.3);
}

.step-dot--pending {
  background: var(--border-light, #F0E6DA);
  color: var(--text-hint, #BFAB95);
}

.step-dot__check {
  line-height: 1;
}

.step-line {
  width: 28px;
  height: 2px;
  background: var(--border-light, #F0E6DA);
  border-radius: 1px;
  transition: background-color var(--duration-normal, 300ms) ease;
  flex-shrink: 0;
}

.step-line--done {
  background: var(--color-success, #4CAF50);
}

/* 竖排连接线 */
.step-indicator--vertical .step-line {
  width: 2px;
  height: 28px;
}

/* 响应式 */
@media (max-width: 767px) {
  .step-dot {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  .step-line {
    width: 20px;
  }
}
</style>
