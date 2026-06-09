<!--
  呦呦气泡组件（四步学习法联动版）
  与 LearningStepButton 状态联动，根据学习步骤和按钮状态切换文案和表情
-->
<template>
  <Transition name="yoyo-bubble-fade" appear>
    <div v-if="text" class="yoyo-bubble-wrapper" :class="`yoyo-bubble--${mood}`">
      <!-- 呦呦小老虎 -->
      <LearnAvatar
        :mood="mood"
        :bubble-text="''"
        :show-stars="showStars"
        :is-speaking="isSpeaking"
        @click="handleYoyoClick"
      />

      <!-- 独立气泡（与呦呦组件的气泡不同，这里用更大更清晰的气泡） -->
      <div class="yoyo-speech-bubble" :class="`bubble--${mood}`">
        <p>{{ text }}</p>
        <!-- 气泡三角箭头 -->
        <div class="bubble-arrow"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import LearnAvatar from './LearnAvatar.vue'

const emit = defineEmits(['yoyo-click'])

const props = defineProps({
  // 当前步骤: 1=看一看, 2=听一听, 3=读一读, 4=玩一玩
  step: { type: Number, default: 1 },

  // 当前子状态: waiting | playing | active | record | playback | game-done
  subState: { type: String, default: 'waiting' },

  // 游戏得分（步骤4用）
  gameScore: { type: Number, default: 0 },
  gameTotal: { type: Number, default: 5 },

  // 自定义文案（覆盖自动生成的）
  customText: { type: String, default: '' },
})

// 自动文案生成
const text = computed(() => {
  if (props.customText) return props.customText

  const messages = {
    1: { // 看一看
      waiting: '看看这是什么~',
      playing: '仔细听发音哦~',
      active: '看明白了吗？点下面继续~',
    },
    2: { // 听一听
      waiting: '竖起小耳朵~',
      playing: '仔细听发音哦~',
      active: '听出来了吗？点下面继续~',
    },
    3: { // 读一读
      waiting: '先听听标准的怎么读~',
      playing: '注意听哦~',
      record: '准备好了吗？试试看~',
      playback: '来听听自己读的~',
      active: '读得真好听！点下面继续~',
    },
    4: { // 玩一玩
      waiting: '准备好了吗？开始吧~',
      playing: '加油！',
      active: '', // 游戏完成后由游戏得分决定
    },
  }

  const stepMessages = messages[props.step] || messages[1]

  // 步骤4根据得分决定文案
  if (props.step === 4 && props.subState === 'active') {
    const ratio = props.gameScore / props.gameTotal
    if (ratio === 1) return '太厉害了！全对！'
    if (ratio >= 0.6) return '不错哦~'
    return '差一点点！再试试？'
  }

  return stepMessages[props.subState] || ''
})

// 呦呦心情
const mood = computed(() => {
  if (props.step === 4 && props.subState === 'active') {
    const ratio = props.gameScore / props.gameTotal
    if (ratio === 1) return 'celebrate'
    if (ratio >= 0.6) return 'happy'
    return 'encourage'
  }

  const moodMap = {
    waiting: 'idle',
    playing: 'thinking',
    active: 'happy',
    record: 'excited',
    playback: 'proud',
    'game-done': 'celebrate',
  }

  return moodMap[props.subState] || 'idle'
})

const showStars = computed(() => props.subState === 'active' || props.subState === 'game-done')
const isSpeaking = computed(() => props.subState === 'playing')
const showCrown = computed(() => props.step === 4 && props.gameScore === props.gameTotal)

function handleYoyoClick() {
  emit('yoyo-click')
}
</script>

<style scoped>
.yoyo-bubble-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-sm, 8px);
  position: relative;
  padding-bottom: var(--space-md, 16px);
}

/* 独立气泡 - 比呦呦自带的气泡更大更清晰 */
.yoyo-speech-bubble {
  position: relative;
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 2px solid #FFD93D;
  border-radius: 16px;
  padding: 10px 16px 12px;
  max-width: 220px;
  box-shadow:
    0 3px 12px rgba(255, 217, 61, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.08);
  animation: bubble-pop 0.35s var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
}

.yoyo-speech-bubble p {
  font-size: var(--font-size-sm, 0.875rem);
  color: #5D4E37;
  line-height: 1.5;
  margin: 0;
  font-weight: 600;
  word-break: break-word;
}

/* 气泡三角箭头 - 指向呦呦 */
.bubble-arrow {
  position: absolute;
  left: -8px;
  bottom: 16px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #FFD93D;
}

.bubble-arrow::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 2px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #FFF9E6;
}

/* 心情变体 */
.bubble--celebrate {
  background: linear-gradient(180deg, #FFF9C4 0%, #FFEB3B 100%);
  border-color: #FFC107;
  box-shadow:
    0 8px 24px rgba(255, 193, 7, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.15);
}
.bubble--celebrate .bubble-arrow { border-right-color: #FFC107; }
.bubble--celebrate .bubble-arrow::after { border-right-color: #FFF9C4; }

.bubble--encourage {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF3E0 100%);
  border-color: #FFAB91;
  box-shadow:
    0 6px 20px rgba(255, 171, 145, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}
.bubble--encourage .bubble-arrow { border-right-color: #FFAB91; }
.bubble--encourage .bubble-arrow::after { border-right-color: #FFF3E0; }

/* 弹出动画 */
@keyframes bubble-pop {
  0% { opacity: 0; transform: translateX(-8px) scale(0.8); }
  60% { transform: translateX(2px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}

/* Vue Transition */
.yoyo-bubble-fade-enter-active {
  animation: bubble-pop 0.35s var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1));
}
.yoyo-bubble-fade-leave-active {
  transition: opacity var(--duration-fast, 150ms) ease;
}
.yoyo-bubble-fade-enter-from,
.yoyo-bubble-fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 767px) {
  .yoyo-speech-bubble {
    max-width: 180px;
    padding: 8px 12px 10px;
  }
  .yoyo-speech-bubble p {
    font-size: var(--font-size-xs, 0.75rem);
  }
}
</style>
