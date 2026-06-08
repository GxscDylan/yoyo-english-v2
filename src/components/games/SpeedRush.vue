<template>
  <div class="speed-rush-game">
    <!-- 顶部栏 -->
    <header class="game-header">
      <button class="btn-back" @click="$router.push('/playground')">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-title">
        <span class="game-badge">⚡ Speed Rush</span>
        <span class="game-difficulty" :class="`diff-${store.gameDifficulty}`">{{ difficultyConfig[store.gameDifficulty]?.label || 'Medium' }}</span>
      </div>
      <div class="header-spacer"></div>
    </header>

    <!-- 准备 -->
    <div v-if="phase === 'ready'" class="phase-ready anim-fade-up">
      <h1>⚡ 速度大挑战</h1>
      <p class="desc">听音选图，越快越好！答对能加时间哦~</p>
      <GameMascot :mood="'idle'" :bubble-text="'Ready to race?'" :show-stars="false" />
      <button class="btn-start" @click="startCountdown">🚀 Start!</button>
    </div>

    <!-- 倒计时 -->
    <div v-if="phase === 'countdown'" class="phase-countdown">
      <span class="countdown-num anim-bounce">{{ countdownNum }}</span>
    </div>

    <!-- 游戏进行中 -->
    <div v-if="phase === 'playing' || phase === 'feedback'" class="phase-playing">
      <!-- 倒计时条 -->
      <div class="timer-bar">
        <div class="timer-fill" :style="{ width: (timeLeft / maxTime) * 100 + '%' }"
          :class="{ 'timer-warning': timeLeft < 10 }"></div>
      </div>
      <div class="timer-text" :class="{ 'timer-warning': timeLeft < 10 }">
        ⏱️ {{ Math.ceil(timeLeft) }}s
      </div>

      <!-- 得分 -->
      <div class="score-display">
        ✅ 答对: <strong>{{ score.correct }}</strong>
      </div>

      <!-- Combo -->
      <ComboDisplay :combo="store.gameCombo" guide-key="speed-rush" />

      <!-- 单词卡片 -->
      <div class="target-section">
        <button class="btn-replay" @click="playTarget" :class="{ active: isSpeaking }" aria-label="Listen again">
          <svg class="replay-icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
          <span class="replay-text">Listen Again</span>
        </button>
      </div>

      <!-- 选项 -->
      <div class="options-grid">
        <button v-for="opt in options" :key="opt.id" class="option-card"
          :class="{
            correct: feedbackId === opt.id && opt.id === targetWord.id,
            wrong: feedbackId === opt.id && opt.id !== targetWord.id,
            dimmed: feedbackId && opt.id !== feedbackId
          }"
          :disabled="!!feedbackId"
          @click="handleSelect(opt)">
          <span class="option-emoji">{{ opt.emoji }}</span>
        </button>
      </div>

      <!-- 正确反馈覆盖层 -->
      <Transition name="pop">
        <div v-if="phase === 'feedback' && feedbackClass === 'feedback-correct' && targetWord" class="correct-overlay">
          <div class="correct-reinforcement anim-fade-up">
            <span class="correct-emoji">{{ targetWord.emoji }}</span>
            <span class="correct-en">{{ targetWord.en }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 结算 -->
    <div v-if="phase === 'complete'" class="phase-complete anim-fade-up">
      <!-- 全局 confetti 由 useConfetti 管理 -->
      <div class="complete-card" :class="`complete-${starLevel >= 3 ? 'gold' : starLevel >= 2 ? 'silver' : 'bronze'}`">
        <!-- 奖杯动画 -->
        <div class="trophy-wrapper">
          <span class="complete-trophy anim-bounce">{{ starLevel === 3 ? '🏆' : starLevel === 2 ? '🥈' : '🎖️' }}</span>
        </div>
        <!-- 分数显示 -->
        <h2 class="complete-title">
            <span class="score-num" :style="{ animationDelay: '0.5s' }">{{ score.correct }}</span>
            <span class="score-divider">/</span>
            <span class="score-total">{{ totalRounds }}</span>
          </h2>
        <!-- 星星依次弹出 -->
        <div class="complete-stars">
          <span v-for="i in 3" :key="i" class="star" :class="i <= starLevel ? 'star-active' : 'star-empty'"
            :style="{ animationDelay: (0.8 + i * 0.3) + 's' }">⭐</span>
        </div>
        <!-- 个性化鼓励语 -->
        <p class="complete-msg">{{ starMessage }}</p>
        <!-- 宝贝头像庆祝 -->
        <ResultAvatar :bubble-text="yoyoBubble" :avatar-src="store.avatar" class="complete-yoyo" />
        <LikeButton :source="'speed'" class="complete-like" />
        <div class="complete-buttons">
          <button class="btn-retry" @click="resetGame"><span class="btn-icon">🔄</span><span class="btn-text">Play again</span></button>
          <button class="btn-home" @click="$router.push('/playground')"><span class="btn-icon">🏠</span><span class="btn-text">Playground</span></button>
        </div>
      </div>
    </div>

    <!-- 呦呦（仅游戏中/反馈阶段显示） -->
    <footer class="game-footer" v-if="phase === 'playing' || phase === 'feedback'">
      <GameMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete, sfxCheer, sfxApplause, sfxFanfare, sfxTick } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import { triggerPerfectClear } from '@/composables/useFeedback'
import { ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import GameMascot from '@/components/common/GameMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'
import LikeButton from '@/components/common/LikeButton.vue'
import ComboDisplay from '@/components/common/ComboDisplay.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, isSpeaking, stop, playAudio } = useSpeech()

// 难度配置（选项数 + 时间 + 时间奖励 + 显示标签）
const DIFFICULTY_CONFIG = {
  simple: { options: 2, initial: 50, max: 90, bonus: 4, label: 'Easy' },
  medium: { options: 3, initial: 35, max: 90, bonus: 3, label: 'Medium' },
  hard: { options: 4, initial: 25, max: 90, bonus: 2, label: 'Hard' }
}

const difficultyConfig = {
  simple: { label: 'Easy' },
  medium: { label: 'Medium' },
  hard: { label: 'Hard' }
}

const config = computed(() => {
  const diff = store.gameDifficulty || 'medium'
  return DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium
})

const phase = ref('ready')
const countdownNum = ref(3)
const timeLeft = ref(config.value.initial)
const maxTime = ref(config.value.max)
const targetWord = ref(null)
const options = ref([])
const feedbackId = ref(null)
const feedbackText = ref('')
const feedbackClass = ref('')
const score = ref({ correct: 0 })
let usedWordIds = new Set()

const yoyoMood = ref('idle')
const yoyoBubble = ref('Ready to race?')
const showStars = ref(false)

const starLevel = computed(() => {
  // 星级阈值按难度适配：simple 更容易拿星，hard 需要更多正确
  const diff = store.gameDifficulty || 'medium'
  const thresholds = {
    simple: { three: 10, two: 5 },
    medium: { three: 15, two: 8 },
    hard: { three: 20, two: 12 }
  }
  const t = thresholds[diff] || thresholds.medium
  if (score.value.correct >= t.three) return 3
  if (score.value.correct >= t.two) return 2
  return 1
})

const starMessages = [
  'Good try! Keep racing! 🏎️',
  'Nice speed! Getting faster! 💨',
  'Amazing! You\'re a speed star! ⚡'
]
const starMessage = computed(() => starMessages[starLevel.value - 1])

const correctMsgs = ['Found it!', 'Awesome!', 'So fast!', 'Great ears!']
const wrongMsgs = ['Look again~', 'So close!', 'Which one is it?']

let countdownTimer = null
let gameTimer = null

function getTimeBonus() {
  const diffBonus = config.value.bonus || 3
  const bonus = store.gameCombo >= 3 ? diffBonus + 2 : diffBonus
  return Math.min(timeLeft.value + bonus, maxTime.value)
}

function startCountdown() {
  usedWordIds.clear()
  store.resetCombo()
  phase.value = 'countdown'
  countdownNum.value = 3

  function playNext(num) {
    if (num <= 0) {
      startGame()
      return
    }
    countdownNum.value = num
    playAudio(`/audio/countdown-${num}.mp3`, () => {
      countdownTimer = setTimeout(() => playNext(num - 1), 100)
    })
  }
  playNext(3)
}

function startGame() {
  timeLeft.value = config.value.initial
  maxTime.value = config.value.max
  phase.value = 'playing'
  generateRound()

  // 启动倒计时
  gameTimer = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 10 && timeLeft.value > 9.9) {
      setYoyo('encourage', '快点！加油！')
    }
    if (timeLeft.value <= 0) {
      finishGame()
    }
  }, 100)
}

function generateRound() {
  const pool = store.unlockedCategoryList.flatMap(c => c.words)
  const available = pool.filter(w => !usedWordIds.has(w.id))

  if (available.length === 0) {
    usedWordIds.clear()
  }

  const effectivePool = available.length > 0 ? available : pool
  const shuffled = [...effectivePool].sort(() => Math.random() - 0.5)
  targetWord.value = shuffled[0]
  usedWordIds.add(targetWord.value.id)

  const distractors = effectivePool.filter(w => w.id !== targetWord.value.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, (config.value.options || 3) - 1)

  const opts = [targetWord.value, ...distractors].sort(() => Math.random() - 0.5)
  options.value = opts

  setTimeout(() => {
    playTarget()
  }, 150)
}

function playTarget() {
  if (targetWord.value) {
    speak(targetWord.value.en, { rate: 0.7 })
  }
}

function handleSelect(opt) {
  if (feedbackId.value) return
  feedbackId.value = opt.id
  const isCorrect = opt.id === targetWord.value.id

  if (isCorrect) {
    sfxCorrect()
    const comboBonus = store.getComboBonus()
    store.addCombo()
    store.addStars(comboBonus)
    score.value.correct++
    timeLeft.value = getTimeBonus()
    feedbackText.value = correctMsgs[Math.floor(Math.random() * correctMsgs.length)]
    feedbackClass.value = 'feedback-correct'
    setYoyo('happy', '', true)
    store.updateGameScore('speed-rush', score.value.correct)
  } else {
    sfxWrong()
    feedbackText.value = wrongMsgs[Math.floor(Math.random() * wrongMsgs.length)]
    feedbackClass.value = 'feedback-wrong'
    setYoyo('encourage', feedbackText.value)
    store.resetCombo()
  }

  phase.value = 'feedback'
  setTimeout(() => {
    feedbackId.value = null
    feedbackText.value = ''
    feedbackClass.value = ''
    if (timeLeft.value > 0) {
      phase.value = 'playing'
      generateRound()
    }
  }, isCorrect ? 1000 : 600)
}

function finishGame() {
  clearInterval(gameTimer)
  clearTimeout(countdownTimer)
  sfxComplete()
  // 结算欢呼：凯旋号角 + 高分时追加掌声
  sfxFanfare()
  const diff = store.gameDifficulty || 'medium'
  const thresholds = {
    simple: { three: 10, two: 5, pass: 4 },
    medium: { three: 15, two: 8, pass: 6 },
    hard: { three: 20, two: 12, pass: 8 }
  }
  const t = thresholds[diff] || thresholds.medium
  if (score.value.correct >= t.three) {
    setTimeout(() => sfxApplause(), 600)
  }
  phase.value = 'complete'
  store.updateGameScore('speed-rush', score.value.correct)

  if (score.value.correct >= t.three) {
    setYoyo('celebrate', starMessages[2])
  } else if (score.value.correct >= t.two) {
    setYoyo('happy', starMessages[1])
  } else {
    setYoyo('encourage', starMessages[0])
  }

  if (score.value.correct >= t.pass) {
    emit('game-complete', { stars: starLevel.value })
  }

  // 全局 confetti 分级
  if (starLevel.value >= 3) {
    triggerPerfectClear({ container: document.body, mascot: yoyoMood })
  } else if (starLevel.value === 2) {
    triggerConfetti(20, 'purple')
  } else if (starLevel.value === 1) {
    triggerConfetti(10, 'default')
  }
}

function resetGame() {
  score.value.correct = 0
  feedbackId.value = null
  feedbackText.value = ''
  feedbackClass.value = ''
  startCountdown()
}

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text || ''
  showStars.value = stars
}

onUnmounted(() => {
  stop()
  clearTimeout(countdownTimer)
  clearInterval(gameTimer)
})
</script>

<style scoped>
.speed-rush-game {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #FFF3E0, var(--bg-main));
  overflow: hidden;
  position: relative;
}

/* ===== 顶部栏 ===== */
.game-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
  flex-shrink: 0;
}
.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none; border-radius: 50%;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: var(--color-primary-light); transform: scale(1.05); }
.btn-back .back-icon { font-size: 1.3rem; }
.header-title { display: flex; align-items: center; gap: var(--space-md); }
.game-badge {
  padding: var(--space-xs) var(--space-lg);
  background: linear-gradient(135deg, #FF6F00, #FFA726);
  color: #fff; font-size: var(--font-size-sm); font-weight: 700; border-radius: var(--radius-full);
}
.game-difficulty {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-xs); font-weight: 700; border-radius: var(--radius-full);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.game-difficulty.diff-simple { background: #C8E6C9; color: #2E7D32; }
.game-difficulty.diff-medium { background: #FFF9C4; color: #F57F17; }
.game-difficulty.diff-hard { background: #FFCDD2; color: #C62828; }
.header-spacer { width: 60px; }

/* 倒计时条 */
.timer-bar {
  width: 100%; height: 8px; background: rgba(0,0,0,0.1);
}
.timer-fill {
  height: 100%; background: linear-gradient(90deg, #FF6B6B, #FFD700);
  transition: width 0.1s linear, background 0.3s;
}
.timer-fill.timer-warning {
  background: linear-gradient(90deg, #FF0000, #FF6B6B);
  animation: pulse 0.5s ease infinite;
}
.timer-text {
  font-size: 1.2rem; font-weight: 700; color: #333;
  text-align: center; padding: 4px 12px;
}
.timer-text.timer-warning {
  color: #FF0000; animation: pulse 0.5s ease infinite;
}

/* 得分显示 */
.score-display {
  font-size: 1.2rem; color: var(--text-primary);
  text-align: center; padding: 8px;
}
.score-display strong {
  font-size: 1.8rem; color: #4CAF50;
}

/* 目标词区域 */
.target-section { text-align: center; }

.btn-replay {
  padding: 16px 32px; 
  background: linear-gradient(180deg, #FFB347 0%, #FF8C00 100%);
  border: none;
  border-radius: 50px;
  box-shadow: 0 6px 0 #CC7000, 0 10px 20px rgba(255,140,0,0.3);
  color: white;
  font-size: var(--font-size-lg);
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.15s ease;
  position: relative;
  overflow: visible;
  min-height: 56px;
}
.replay-icon-svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.btn-replay:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 #CC7000, 0 14px 24px rgba(255,140,0,0.35);
}
.btn-replay:hover .replay-icon-svg {
  transform: rotate(-20deg);
}
.btn-replay:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #CC7000, 0 4px 8px rgba(255,140,0,0.3);
}
.btn-replay.active {
  background: linear-gradient(180deg, #FF8C00 0%, #FF7000 100%);
  box-shadow: 0 6px 0 #CC7000, 0 10px 20px rgba(255,112,0,0.4);
  animation: soundWave3D 1.2s ease-in-out infinite;
}
.btn-replay.active .replay-icon-svg {
  animation: iconPulse 0.6s ease-in-out infinite;
}
@keyframes soundWave3D {
  0%, 100% { 
    box-shadow: 0 6px 0 #CC7000, 0 10px 20px rgba(255,140,0,0.3), 0 0 0 0 rgba(255,140,0,0.4); 
  }
  50% { 
    box-shadow: 0 6px 0 #CC7000, 0 10px 20px rgba(255,140,0,0.3), 0 0 0 16px rgba(255,140,0,0); 
  }
}
@keyframes iconPulse {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(-15deg) scale(1.1); }
}

/* 选项网格 */
.options-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; padding: 16px; max-width: 600px; margin: 0 auto;
}
.option-card {
  aspect-ratio: 1; border-radius: 16px;
  background: white; border: 3px solid transparent;
  font-size: 3rem; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.option-card:active { transform: scale(0.95); }
.option-card.correct { border-color: #4CAF50; background: #E8F5E9; }
.option-card.wrong { border-color: #FF5252; background: #FFEBEE; }
.option-card.dimmed { opacity: 0.4; }
.option-emoji { pointer-events: none; }

/* 反馈 */
.feedback-bar {
  position: fixed; bottom: 20%; left: 50%; transform: translateX(-50%);
  padding: 12px 32px; border-radius: 24px;
  font-size: 1.2rem; font-weight: 700; z-index: 50;
}
.feedback-correct { background: #4CAF50; color: white; }
.feedback-wrong { background: #FF5252; color: white; }

.correct-overlay {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.3); z-index: 40;
}
.correct-reinforcement {
  text-align: center; background: white; padding: 24px 48px;
  border-radius: 24px;
}
.correct-emoji { font-size: 4rem; display: block; }
.correct-en { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }

/* 结算卡片（统一设计） */
.complete-card {
  background: var(--bg-card); border-radius: var(--radius-2xl);
  padding: var(--space-2xl); text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  position: relative; overflow: hidden;
  border: 3px solid transparent;
}
.complete-card.complete-gold { border-color: #FFC107; box-shadow: 0 20px 60px rgba(255,193,7,0.2); }
.complete-card.complete-silver { border-color: #B0BEC5; }
.complete-card.complete-bronze { border-color: #FF8A65; }

.trophy-wrapper { position: relative; z-index: 1; }
.complete-trophy { font-size: 4.5rem; display: block; animation: trophyBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.complete-title { font-size: var(--font-size-2xl); color: #7C5CFC; margin-bottom: var(--space-lg); position: relative; z-index: 1; }
.score-num { font-size: 3rem; font-weight: 900; color: #7C5CFC; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards; }

.complete-stars { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); position: relative; z-index: 1; }
.star { font-size: 2.2rem; transition: all 0.3s; }
.star-active { opacity: 1; animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.star-empty { opacity: 0.2; transform: scale(0.8); }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

.complete-msg { color: var(--text-primary); margin-bottom: var(--space-lg); font-size: var(--font-size-lg); font-weight: 600; position: relative; z-index: 1; }

.complete-yoyo { margin-bottom: 80px; position: relative; z-index: 1; }

.complete-buttons { display: flex; gap: var(--space-md); justify-content: center; position: relative; z-index: 1; }
.btn-retry, .btn-home {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  padding: 10px 24px; border-radius: var(--radius-full);
  font-size: var(--font-size-sm); font-weight: 700; transition: all 0.2s;
  border: none; cursor: pointer; min-width: 100px;
}
.btn-icon { font-size: 1.2rem; line-height: 1; }
.btn-text { line-height: 1.2; white-space: nowrap; }
.btn-retry { background: #7C5CFC; color: white; }
.btn-retry:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(124,92,252,0.3); }
.btn-home { background: #F5F5F5; color: var(--text-primary); }
.btn-home:hover { transform: scale(1.05); }

/* 准备页 */
.phase-ready, .phase-countdown {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; text-align: center;
  gap: var(--space-lg);
}
.phase-ready h1 { font-size: 2.5rem; margin-bottom: 0; }
.phase-ready .desc { font-size: 1.1rem; color: var(--text-secondary); margin: 0; }
.phase-ready :deep(.yoyo-mascot) { margin-bottom: var(--space-md); }
.btn-start {
  padding: 16px 48px; font-size: 1.5rem; border-radius: 32px;
  border: none; background: linear-gradient(135deg, #7C5CFC, #A78BFA);
  color: white; font-weight: 700; cursor: pointer;
  margin-top: var(--space-lg);
}
.btn-start:active { transform: scale(0.95); }
.countdown-num { font-size: 8rem; font-weight: 900; color: #7C5CFC; }

.game-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px var(--space-xl) 12px;
  background: transparent;
  overflow: visible;
  position: relative;
}

@keyframes starPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from { opacity: 0; transform: scale(0.8); }
.pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
