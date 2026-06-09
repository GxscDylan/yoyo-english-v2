<!--
  四步学习法 - 学习步骤视图（v2.0 修复版）
  整合：LearningStepButton + YoyoBubble + StepIndicator + GameProgress
  对应四步：看一看 → 听一听 → 读一读 → 玩一玩
-->
<template>
  <div class="learning-steps-view">
    <!-- 顶部状态栏 -->
    <header class="learning-header">
      <div class="learning-header__stars">⭐ {{ starCount }}</div>
      <div class="learning-header__likes">👍 {{ likeCount }}</div>
    </header>

    <!-- 步骤指示器 -->
    <StepIndicator
      :active="currentStep"
      :total="4"
      :step-names="stepNames"
    />

    <!-- 主内容区 -->
    <main class="learning-content">
      <!-- 步骤 1 & 2：看一看 / 听一听 -->
      <template v-if="currentStep === 0 || currentStep === 1">
        <WordCard
          :word="currentWord"
          :auto-play="autoPlayEnabled"
          @played="onAudioPlayed"
          @click="playWordAudio"
        />
      </template>

      <!-- 步骤 3：读一读 -->
      <template v-if="currentStep === 2">
        <WordCard
          :word="currentWord"
          :auto-play="autoPlayEnabled"
          @played="onAudioPlayed"
          @click="playWordAudio"
        />
        <!-- 录音按钮（阶段B） -->
        <LearningStepButton
          v-if="readPhase === 'record'"
          :state="recordState"
          :text="recordButtonText"
          class="learning-steps__record-btn"
          @click="handleRecordClick"
        />
      </template>

      <!-- 步骤 4：玩一玩 -->
      <template v-if="currentStep === 3">
        <!-- 游戏进度 -->
        <GameProgress
          :total="gameTotal"
          :correct="gameScore"
          :is-done="gameDone"
          class="learning-steps__game-progress"
        />

        <!-- 游戏区域（占位，实际由具体游戏组件渲染） -->
        <div class="learning-steps__game-area">
          <slot name="game-area">
            <div class="game-placeholder">
              <span class="game-placeholder__icon">🎮</span>
              <p class="game-placeholder__text">{{ gamePlaceholderText }}</p>
            </div>
          </slot>
        </div>
      </template>

      <!-- 呦呦气泡（与步骤状态联动） -->
      <YoyoBubble
        :step="currentStep + 1"
        :sub-state="subState"
        :game-score="gameScore"
        :game-total="gameTotal"
        class="learning-steps__yoyo"
        @yoyo-click="handleYoyoClick"
      />

      <!-- 底部按钮区 -->
      <div class="learning-steps__button-area">
        <!-- 步骤 1 & 2 & 3：下一步按钮 -->
        <LearningStepButton
          v-if="currentStep < 3"
          :state="buttonState"
          :text-map="buttonTextMap"
          class="learning-steps__next-btn"
          @click="handleNextClick"
        />

        <!-- 步骤 4：游戏完成按钮 -->
        <template v-if="currentStep === 3 && gameDone">
          <!-- 星级展示 -->
          <div class="learning-steps__stars">
            <span
              v-for="i in 3"
              :key="i"
              class="star"
              :class="{ 'star--filled': i <= gameStarCount }"
              :style="{ '--star-delay': `${(i - 1) * 150}ms` }"
            >⭐</span>
          </div>

          <LearningStepButton
            :state="gameButtonState"
            :text="gameButtonText"
            class="learning-steps__next-btn"
            @click="handleGameNextClick"
          />

          <!-- 重试按钮（非满分时） -->
          <LearningStepButton
            v-if="gameStarCount < 3"
            state="retry"
            text="再试一次？→"
            class="learning-steps__retry-btn"
            @click="handleRetryClick"
          />
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTTS } from '@/composables/useTTS'
import StepIndicator from '@/components/common/StepIndicator.vue'
import LearningStepButton from '@/components/common/LearningStepButton.vue'
import YoyoBubble from '@/components/common/YoyoBubble.vue'
import GameProgress from '@/components/common/GameProgress.vue'
import WordCard from '@/components/common/WordCard.vue'

const props = defineProps({
  // 当前单词
  currentWord: {
    type: Object,
    default: () => ({ en: 'dog', cn: '狗', emoji: '🐶' }),
  },

  // 总步骤数
  totalSteps: { type: Number, default: 4 },

  // 自动播放
  autoPlayEnabled: { type: Boolean, default: false },

  // 星星/点赞计数
  starCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'next',
  'prev',
  'step-complete',
  'record-start',
  'record-stop',
  'game-retry',
  'yoyo-click',
])

// ─── 状态管理 ─────────────────────────

// 当前大步骤（0-3）
const currentStep = ref(0)
const stepNames = ['看一看', '听一听', '读一读', '玩一玩']

// 步骤 1 & 2 状态：waiting | playing | active
const audioState = ref('waiting')

// 步骤 3 子阶段：listen | record | playback | confirm
const readPhase = ref('listen')
const recordState = ref('record') // record | recording

// 步骤 4 游戏状态
const gameScore = ref(0)
const gameTotal = ref(5)
const gameDone = ref(false)
const gameStarCount = computed(() => {
  if (!gameDone.value) return 0
  const ratio = gameScore.value / gameTotal.value
  if (ratio === 1) return 3
  if (ratio >= 0.6) return 2
  return 1
})

// ─── 计算属性 ─────────────────────────

const subState = computed(() => {
  if (currentStep.value === 3) {
    return gameDone.value ? 'active' : 'waiting'
  }
  return audioState.value
})

const buttonState = computed(() => {
  switch (audioState.value) {
    case 'waiting': return 'waiting'
    case 'playing': return 'playing'
    case 'active': return 'active'
    default: return 'waiting'
  }
})

const recordButtonText = computed(() => {
  switch (recordState.value) {
    case 'record': return '点我录音 🎤'
    case 'recording': return '录音中...'
    default: return '点我录音'
  }
})

const gameButtonState = computed(() => {
  if (gameStarCount.value === 3) return 'game-perfect'
  return 'game-complete'
})

const gameButtonText = computed(() => {
  if (gameStarCount.value === 3) return '⭐⭐⭐ 全对！→'
  if (gameStarCount.value === 2) return '⭐⭐ 真不错！→'
  return '⭐ 继续加油！→'
})

const gamePlaceholderText = computed(() => {
  const texts = [
    '听音选图',
    '听音选图',
    '听音选图',
    '找朋友',
  ]
  return texts[currentStep.value] || '游戏中'
})

// 按钮文案映射
const buttonTextMap = computed(() => {
  const maps = {
    0: { active: '看懂了！→', playing: '正在发音...' },
    1: { active: '听懂了！→', playing: '正在发音...' },
    2: { active: '读完了！→', playing: '正在发音...' },
  }
  return maps[currentStep.value] || { active: '下一步 →', playing: '加载中...' }
})

// ─── 方法 ─────────────────────────────

const { speak } = useTTS()

function playWordAudio() {
  if (props.currentWord?.en) {
    audioState.value = 'playing'
    speak(props.currentWord.en, { rate: 0.8 })
      .then(() => {
        setTimeout(() => {
          audioState.value = 'active'
        }, 300)
      })
  }
}

function onAudioPlayed() {
  audioState.value = 'playing'
  setTimeout(() => {
    audioState.value = 'active'
  }, 1500)
}

function handleNextClick() {
  if (audioState.value !== 'active') return
  audioState.value = 'clicked'
  emit('step-complete', { step: currentStep.value + 1 })
  setTimeout(() => {
    if (currentStep.value < 3) {
      currentStep.value++
      resetStepState()
    } else {
      emit('next')
    }
  }, 300)
}

function handleRecordClick() {
  if (recordState.value === 'record') {
    recordState.value = 'recording'
    emit('record-start')
    // 模拟录音 3 秒
    setTimeout(() => {
      recordState.value = 'record'
      emit('record-stop')
      // 录音完成后自动进入回放确认
      readPhase.value = 'playback'
      audioState.value = 'active'
    }, 3000)
  }
}

function handleGameNextClick() {
  emit('step-complete', { step: 4 })
  setTimeout(() => emit('next'), 300)
}

function handleRetryClick() {
  gameScore.value = 0
  gameDone.value = false
  emit('game-retry')
}

function handleYoyoClick() {
  emit('yoyo-click')
}

function resetStepState() {
  audioState.value = 'waiting'
  readPhase.value = 'listen'
  recordState.value = 'record'

  // 如果是自动播放，自动触发音频
  if (props.autoPlayEnabled && (currentStep.value === 0 || currentStep.value === 1)) {
    setTimeout(() => playWordAudio(), 500)
  }
}

function resetGame() {
  gameScore.value = 0
  gameDone.value = false
}

function updateGameScore(score) {
  gameScore.value = score
}

function finishGame() {
  gameDone.value = true
}

// 暴露给父组件
defineExpose({
  currentStep,
  resetStepState,
  resetGame,
  updateGameScore,
  finishGame,
})
</script>

<style scoped>
.learning-steps-view {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg-main, #FFF8F0);
}

/* 顶部状态栏 */
.learning-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-md, 16px);
  padding: var(--space-sm, 8px) var(--space-lg, 24px);
  background: var(--color-primary, #FF8C42);
  color: #FFFFFF;
  font-size: var(--font-size-sm, 0.875rem);
  font-weight: 600;
}

/* 主内容区 */
.learning-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg, 24px);
  gap: var(--space-lg, 24px);
}

/* 游戏进度 */
.learning-steps__game-progress {
  width: 100%;
  max-width: 400px;
}

/* 游戏区域 */
.learning-steps__game-area {
  width: 100%;
  max-width: 600px;
  min-height: 250px;
}

.game-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl, 48px);
  background: var(--bg-card, #FFFFFF);
  border-radius: var(--radius-lg, 16px);
  box-shadow: var(--shadow-card, 0 4px 16px rgba(139, 115, 85, 0.12));
}

.game-placeholder__icon {
  font-size: var(--font-size-3xl, 2.75rem);
  margin-bottom: var(--space-sm, 8px);
}

.game-placeholder__text {
  font-size: var(--font-size-lg, 1.25rem);
  color: var(--text-secondary, #8B7355);
  margin: 0;
}

/* 呦呦气泡 */
.learning-steps__yoyo {
  align-self: center;
}

/* 按钮区 */
.learning-steps__button-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm, 8px);
  width: 100%;
  max-width: 400px;
}

.learning-steps__next-btn {
  width: 100%;
}

.learning-steps__retry-btn {
  width: 100%;
}

.learning-steps__record-btn {
  margin-top: var(--space-sm, 8px);
}

/* 星级展示 */
.learning-steps__stars {
  display: flex;
  gap: 4px;
  margin-bottom: var(--space-sm, 8px);
}

.star {
  font-size: 2rem;
  animation: star-pop 400ms var(--ease-bounce, cubic-bezier(0.34, 1.56, 0.64, 1)) forwards;
  animation-delay: var(--star-delay, 0ms);
  opacity: 0;
}

.star--filled {
  filter: none;
}

.star:not(.star--filled) {
  opacity: 0.3;
  animation: none;
  opacity: 0.3;
}

@keyframes star-pop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

/* 响应式 */
@media (max-width: 767px) {
  .learning-content {
    padding: var(--space-md, 16px);
    gap: var(--space-md, 16px);
  }
}

@media (min-width: 1024px) {
  .learning-content {
    padding: var(--space-2xl, 48px);
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
