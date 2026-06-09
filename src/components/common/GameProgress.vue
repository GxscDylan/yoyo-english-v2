<!--
  四步学习法 - 游戏进度组件（步骤4专用）
  显示答题进度圆点和星级评价
-->
<template>
  <div class="game-progress" :class="{ 'game-progress--done': isDone }">
    <!-- 进度圆点 -->
    <div class="game-progress__dots">
      <span
        v-for="i in total"
        :key="i"
        class="game-progress__dot"
        :class="dotClass(i - 1)"
      ></span>
    </div>

    <!-- 计数器 -->
    <span class="game-progress__counter" :class="counterColorClass">
      {{ correct }}/{{ total }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 总题数
  total: { type: Number, default: 5 },

  // 答对数
  correct: { type: Number, default: 0 },

  // 游戏是否已完成
  isDone: { type: Boolean, default: false },
})

function dotClass(index) {
  if (index < props.correct) return 'game-progress__dot--correct'
  if (index === props.correct && !props.isDone) return 'game-progress__dot--current'
  return 'game-progress__dot--pending'
}

const counterColorClass = computed(() => {
  const ratio = props.correct / props.total
  if (ratio === 1) return 'game-progress__counter--perfect'
  if (ratio >= 0.6) return 'game-progress__counter--good'
  return 'game-progress__counter--low'
})
</script>

<style scoped>
.game-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm, 8px);
  padding: var(--space-sm, 8px) var(--space-md, 16px);
  background: var(--bg-card, #FFFFFF);
  border-radius: var(--radius-full, 9999px);
  box-shadow: var(--shadow-card, 0 4px 16px rgba(139, 115, 85, 0.12));
  transition: all var(--duration-normal, 300ms) ease;
}

.game-progress--done {
  background: var(--color-warning, #FFC107);
}

.game-progress__dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.game-progress__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--border-light, #F0E6DA);
  transition: background-color var(--duration-normal, 300ms) ease,
              transform var(--duration-fast, 150ms) var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
}

.game-progress__dot--correct {
  background: var(--color-success, #4CAF50);
  transform: scale(1.15);
}

.game-progress__dot--current {
  border: 2px solid var(--color-warning, #FFC107);
  background: transparent;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

.game-progress__counter {
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 600;
  color: var(--text-secondary, #8B7355);
  min-width: 36px;
  text-align: center;
}

.game-progress__counter--perfect {
  color: var(--color-success, #4CAF50);
}

.game-progress__counter--low {
  color: var(--color-danger, #F44336);
}

@keyframes dot-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

@media (max-width: 767px) {
  .game-progress__dot {
    width: 12px;
    height: 12px;
  }
}
</style>
