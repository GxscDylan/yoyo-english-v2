<template>
  <div class="speed-rush-game">
    <!-- 准备 -->
    <div v-if="phase === 'ready'" class="phase-ready anim-fade-up">
      <h1>⚡ 速度大挑战</h1>
      <p class="desc">听音选图，越快越好！答对能加时间哦~</p>
      <YoyoMascot :mood="'idle'" :bubble-text="'Ready to race?'" :show-stars="false" />
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
        <button class="btn-replay" @click="playTarget" :class="{ active: isSpeaking }">
          🔊 Listen
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
      <div class="complete-card">
        <span class="trophy anim-bounce">🏆</span>
        <h2>时间到！</h2>
        <div class="final-score">
          答对了 <strong>{{ score.correct }}</strong> 题！
        </div>
        <div class="stars-display">
          <span v-for="i in starLevel" :key="i" class="star" style="animation: starPop 0.5s ease forwards;">⭐</span>
        </div>
        <ResultAvatar :bubble-text="yoyoBubble" :avatar-src="store.avatar" />
        <div class="complete-buttons">
          <button class="btn-retry" @click="resetGame">🔄 再来一次</button>
          <button class="btn-home" @click="$router.push('/')">🏠 首页</button>
        </div>
      </div>
    </div>

    <!-- 呦呦（非结算时） -->
    <footer class="game-footer" v-if="phase !== 'complete'">
      <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete, sfxTick } from '@/composables/useSfx'
import { ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'
import ComboDisplay from '@/components/common/ComboDisplay.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, isSpeaking, stop, playAudio } = useSpeech()

// 难度配置（选项数 + 时间 + 时间奖励）
const DIFFICULTY_CONFIG = {
  simple: { options: 2, initial: 50, max: 90, bonus: 4 },
  medium: { options: 3, initial: 35, max: 90, bonus: 3 },
  hard: { options: 4, initial: 25, max: 90, bonus: 2 }
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
      countdownTimer = setTimeout(() => playNext(num - 1), 200)
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

  // 自动播放
  setTimeout(() => {
    playTarget()
  }, 300)
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
  }, isCorrect ? 1200 : 800)
}

function finishGame() {
  clearInterval(gameTimer)
  clearTimeout(countdownTimer)
  sfxComplete()
  phase.value = 'complete'
  store.updateGameScore('speed-rush', score.value.correct)

  // 动态阈值与 starLevel 一致
  const diff = store.gameDifficulty || 'medium'
  const thresholds = {
    simple: { three: 10, two: 5, pass: 4 },
    medium: { three: 15, two: 8, pass: 6 },
    hard: { three: 20, two: 12, pass: 8 }
  }
  const t = thresholds[diff] || thresholds.medium

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
}

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
  position: absolute; top: 16px; right: 16px;
  font-size: 1.2rem; font-weight: 700; color: #333;
  background: rgba(255,255,255,0.9); padding: 4px 12px;
  border-radius: 12px; z-index: 10;
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

/* 结算 */
.complete-card {
  text-align: center; background: white; padding: 32px;
  border-radius: 24px; max-width: 400px; margin: 0 auto;
}
.trophy { font-size: 5rem; display: block; }
.final-score {
  font-size: 1.5rem; margin: 16px 0;
}
.final-score strong {
  font-size: 2.5rem; color: #4CAF50;
}
.stars-display { font-size: 2.5rem; margin: 16px 0; }
.complete-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn-retry, .btn-home {
  padding: 12px 24px; border-radius: 24px; border: none;
  font-size: 1rem; font-weight: 600; cursor: pointer;
}
.btn-retry { background: #7C5CFC; color: white; }
.btn-home { background: #F5F5F5; color: var(--text-primary); }

/* 准备页 */
.phase-ready, .phase-countdown {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; text-align: center;
}
.phase-ready h1 { font-size: 2.5rem; margin-bottom: 8px; }
.phase-ready .desc { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 24px; }
.btn-start {
  padding: 16px 48px; font-size: 1.5rem; border-radius: 32px;
  border: none; background: linear-gradient(135deg, #7C5CFC, #A78BFA);
  color: white; font-weight: 700; cursor: pointer;
}
.btn-start:active { transform: scale(0.95); }
.countdown-num { font-size: 8rem; font-weight: 900; color: #7C5CFC; }

.game-footer {
  position: absolute; bottom: 0; width: 100%;
  padding: var(--space-sm);
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
