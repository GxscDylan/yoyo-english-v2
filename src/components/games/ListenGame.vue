<template>
  <div class="listen-game" :class="`phase--${phase}`">
    <header class="game-header">
      <button class="btn-back" @click="$router.push('/')">← Home</button>
      <div class="header-title">
        <span class="game-badge">👂 Listen & Choose</span>
        <span class="game-difficulty" :class="`diff-${store.gameDifficulty}`">{{ store.gameDifficulty === 'simple' ? 'Easy' : store.gameDifficulty === 'hard' ? 'Hard' : 'Medium' }}</span>
        <span class="round-info" v-if="phase === 'playing' || phase === 'feedback'">Round {{ currentRound }}/{{ totalRounds }}</span>
      </div>
      <div class="header-spacer"></div>
    </header>

    <!-- Combo 连击显示 -->
    <ComboDisplay :combo="store.gameCombo" guide-key="listen" />

    <!-- 进度条 -->
    <div class="progress-bar" v-if="phase !== 'ready' && phase !== 'countdown' && phase !== 'complete'">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: ((currentRound - 1) / totalRounds * 100) + '%' }"></div>
      </div>
      <span v-for="r in totalRounds" :key="r" class="progress-node"
        :class="{
          done: r < currentRound,
          current: r === currentRound && (phase === 'playing' || phase === 'feedback'),
          upcoming: r > currentRound
        }"
        :style="{ left: ((r - 1) / (totalRounds - 1) * 100) + '%' }">
        <span class="node-dot">{{ r < currentRound ? '⭐' : '' }}</span>
      </span>
    </div>

    <main class="game-main">
      <!-- 浮动装饰元素 -->
      <div class="bg-decorations" aria-hidden="true">
        <span class="deco-star deco-1">⭐</span>
        <span class="deco-bubble deco-2"></span>
        <span class="deco-star deco-3">✨</span>
        <span class="deco-bubble deco-4"></span>
        <span class="deco-star deco-5"></span>
      </div>

      <div v-if="phase === 'ready'" class="phase-ready anim-fade-up">
        <span class="ready-icon">👂</span>
        <h2>Listen & Choose</h2>
        <p>Listen carefully, then pick the right word!</p>
        <p class="ready-tip">This time you'll see the text~</p>
        <button class="btn-play" @click="startCountdown">Start! 🎮</button>
      </div>

      <div v-if="phase === 'countdown'" class="phase-countdown">
        <span class="countdown-num anim-bounce">{{ countdownNum }}</span>
      </div>

      <div v-if="phase === 'playing' || phase === 'feedback'" class="phase-playing anim-fade-up">
        <div class="target-word">
          <button class="btn-replay" @click="playTarget" :class="{ active: isSpeaking }">
            🔊 Listen again
          </button>
        </div>
        <div class="options-grid" :class="store.gameDifficulty">
          <button v-for="opt in options" :key="opt.id" class="option-card"
            :class="{
              correct: feedbackId === opt.id && opt.id === targetWord.id,
              wrong: feedbackId === opt.id && opt.id !== targetWord.id,
              dimmed: feedbackId && opt.id !== feedbackId
            }"
            :disabled="!!feedbackId"
            @click="handleSelect(opt)">
            <span v-if="store.unlockedCategories <= 5" class="card-emoji">{{ opt.emoji }}</span>
            <span class="card-word">{{ opt.en }}</span>
            <span v-if="feedbackId && opt.id === targetWord.id" class="card-zh">{{ opt.zh }}</span>
          </button>
        </div>
        <Transition name="pop">
          <div v-if="feedbackText && feedbackClass !== 'feedback-correct'" class="feedback-bar" :class="feedbackClass">{{ feedbackText }}</div>
        </Transition>
      </div>

      <!-- 正确反馈：覆盖层（不占位，不跳动页面） -->
      <Transition name="pop">
        <div v-if="phase === 'feedback' && feedbackClass === 'feedback-correct' && targetWord" class="correct-overlay">
          <div class="correct-reinforcement anim-fade-up">
            <span class="correct-emoji">{{ targetWord.emoji }}</span>
            <span class="correct-en">{{ targetWord.en }}</span>
            <span class="correct-phonetic">{{ targetWord.phonetic }}</span>
            <span class="correct-zh">{{ targetWord.zh }}</span>
          </div>
        </div>
      </Transition>

      <div v-if="phase === 'complete'" class="phase-complete anim-fade-up">
        <!-- 撒花粒子 -->
        <div class="confetti-container">
          <span v-for="i in 30" :key="i" class="confetti" :style="{ left: Math.random()*100+'%', animationDelay: Math.random()*2+'s', animationDuration: (1.5+Math.random()*1.5)+'s' }">🎉</span>
        </div>
        <div class="complete-card" :class="`complete-${starLevel >= 3 ? 'gold' : starLevel >= 2 ? 'silver' : 'bronze'}`">
          <!-- 奖杯动画 -->
          <div class="trophy-wrapper">
            <span class="complete-trophy anim-bounce">{{ starLevel === 3 ? '🏆' : starLevel === 2 ? '🥈' : '🎖️' }}</span>
          </div>
          <!-- 分数滚动显示 -->
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
          <div class="complete-buttons">
            <button class="btn-retry" @click="resetGame">🔄 Play again</button>
            <button class="btn-home" @click="$router.push('/')">🏠 Home</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="game-footer" v-if="phase !== 'complete'">
      <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete } from '@/composables/useSfx'
import { ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'
import ComboDisplay from '@/components/common/ComboDisplay.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, isSpeaking, stop, playAudio } = useSpeech()

// 自动重读定时器
let autoReplayTimer = null

const totalRounds = 5
// 同局去重：记录本局已选过的目标词 ID
let usedWordIds = new Set()
const phase = ref('ready')
const difficultyConfig = {
  simple: { options: 4, cols: 2, label: 'Easy' },
  medium: { options: 6, cols: 3, label: 'Medium' },
  hard: { options: 8, cols: 4, label: 'Hard' }
}
const countdownNum = ref(3)
const currentRound = ref(1)
const targetWord = ref(null)
const options = ref([])
const feedbackId = ref(null)
const feedbackText = ref('')
const feedbackClass = ref('')
const score = ref({ correct: 0, total: totalRounds })

const yoyoMood = ref('idle')
const yoyoBubble = ref("Let's do the listening challenge!")
const showStars = ref(false)

const starLevel = computed(() => {
  const r = score.value.correct / totalRounds
  if (r >= 0.8) return 3
  if (r >= 0.5) return 2
  return 1
})
const starMessage = computed(() => ['Keep listening, you\'ll get it!', 'Getting better!', 'Listening champion!'][starLevel.value - 1])

let countdownTimer = null

function startCountdown() {
  usedWordIds.clear() // 新游戏清空去重记录
  store.resetCombo() // 新游戏重置连击
  phase.value = 'countdown'
  countdownNum.value = 3

  // 链式播放：等一个音效播完再切下一个数字
  function playNext(num) {
    if (num <= 0) {
      startRound()
      return
    }
    countdownNum.value = num
    playAudio(`/audio/countdown-${num}.mp3`, () => {
      // 音频播完后短暂停顿再播下一个
      countdownTimer = setTimeout(() => playNext(num - 1), 200)
    })
  }
  playNext(3)
}

function startRound() {
  generateRound()
  phase.value = 'playing'
  feedbackId.value = null
  feedbackText.value = ''
  feedbackClass.value = ''
  clearAutoReplay()
  setYoyo('thinking', 'Listen carefully...')
  // 链式播放：Which one is... → 单词音频
  startAutoReplay()
  setTimeout(() => {
    playAudio('/audio/which-one-is.mp3', () => { playTarget() })
  }, 400)
}

function generateRound() {
  const pool = store.unlockedCategoryList.flatMap(c => c.words)
  const available = pool.filter(w => !usedWordIds.has(w.id))

  if (available.length === 0) {
    // 词全部用完了，重置去重记录继续使用
    usedWordIds.clear()
  }

  const effectivePool = available.length > 0 ? available : pool
  const shuffled = [...effectivePool].sort(() => Math.random() - 0.5)
  targetWord.value = shuffled[0]
  usedWordIds.add(targetWord.value.id)
  
  // 根据难度动态生成选项
  const config = difficultyConfig[store.gameDifficulty] || difficultyConfig.medium
  const distractorCount = config.options - 1
  const poolWords = store.gameDifficulty === 'hard' ? ALL_L1_WORDS.concat(ALL_L2_WORDS || []) : ALL_L1_WORDS
  const others = poolWords.filter(w => w.id !== targetWord.value.id)
  const distractors = others.sort(() => Math.random() - 0.5).slice(0, distractorCount)
  options.value = [targetWord.value, ...distractors].sort(() => Math.random() - 0.5)
}

function playTarget() {
  if (!targetWord.value) return
  speak(targetWord.value.en, { rate: 0.7 })
}

function handleSelect(opt) {
  if (feedbackId.value) return
  feedbackId.value = opt.id
  clearAutoReplay()
  const isCorrect = opt.id === targetWord.value.id

  if (isCorrect) {
    sfxCorrect()
    const praises = ['/audio/great.mp3', '/audio/good-job.mp3', '/audio/excellent.mp3']
    playAudio(praises[Math.floor(Math.random() * praises.length)])
    feedbackText.value = 'Great!'
    feedbackClass.value = 'feedback-correct'
    score.value.correct++
    setYoyo('happy', '', true)
    store.addCombo()
    const comboBonus = store.getComboBonus()
    store.addStars(comboBonus)
    store.updateGameScore('listen', score.value.correct)
  } else {
    sfxWrong()
    playAudio('/audio/try-again.mp3')
    feedbackText.value = 'Try again!'
    feedbackClass.value = 'feedback-wrong'
    setYoyo('encourage', 'Try again~')
    // 自动播放正确单词提示
    setTimeout(() => speak(targetWord.value.en, { rate: 0.65 }), 500)
    store.addStars(1) // still give +1 for encouragement
    store.resetCombo()
    setTimeout(() => {
      feedbackId.value = null; feedbackText.value = ''; feedbackClass.value = ''
      startAutoReplay()
    }, 1500)
    return
  }

  phase.value = 'feedback'
  setTimeout(() => {
    if (currentRound.value < totalRounds) { currentRound.value++; startRound() }
    else finishGame()
  }, isCorrect ? 2500 : 1200)
}

// 自动重读：4秒无操作重读单词
function startAutoReplay() {
  clearAutoReplay()
  autoReplayTimer = setTimeout(() => {
    if (phase.value === 'playing' && !feedbackId.value) {
      playTarget()
      startAutoReplay()
    }
  }, 4000)
}
function clearAutoReplay() {
  if (autoReplayTimer) { clearTimeout(autoReplayTimer); autoReplayTimer = null }
}

function finishGame() {
  clearAutoReplay()
  sfxComplete()
  phase.value = 'complete'
  const msg = score.value.correct >= 4 ? 'Amazing job!' : score.value.correct >= 3 ? 'Well done!' : 'Keep practicing!'
  setYoyo('celebrate', msg, true)
  store.updateGameScore('listen', score.value.correct)
  if (score.value.correct >= 3) {
    emit('game-complete', { stars: starLevel.value })
  }
}

function resetGame() {
  clearAutoReplay()
  currentRound.value = 1; score.value.correct = 0
  feedbackId.value = null; feedbackText.value = ''
  startCountdown()
}

function setYoyo(m, t, s = false) { yoyoMood.value = m; yoyoBubble.value = t; showStars.value = s }
onUnmounted(() => { stop(); clearAutoReplay(); clearTimeout(countdownTimer) })
</script>

<style scoped>
.listen-game {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #EDE7F6, var(--bg-main));
  overflow: hidden;
}
.game-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
}
.btn-back { padding: var(--space-xs) var(--space-md); border-radius: var(--radius-full); font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: 600; }
.header-title { display: flex; align-items: center; gap: var(--space-sm); }
.game-badge { padding: var(--space-xs) var(--space-lg); background: linear-gradient(135deg, #7C5CFC, #A78BFA); color: #fff; font-size: var(--font-size-sm); font-weight: 700; border-radius: var(--radius-full); }
.game-difficulty {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-xs); font-weight: 700; border-radius: var(--radius-full);
  text-transform: uppercase; letter-spacing: 0.5px;
}
.game-difficulty.diff-simple { background: #C8E6C9; color: #2E7D32; }
.game-difficulty.diff-medium { background: #FFF9C4; color: #F57F17; }
.game-difficulty.diff-hard { background: #FFCDD2; color: #C62828; }
.game-level { padding: 2px 10px; background: #FFD54F; color: #5D4037; font-size: 0.7rem; font-weight: 700; border-radius: var(--radius-full); }
.round-info { font-size: var(--font-size-sm); color: var(--text-hint); }
.header-spacer { width: 60px; }

.progress-bar {
  height: 40px; position: relative; margin: 0 var(--space-xl);
  display: flex; align-items: center;
}
.progress-track {
  height: 10px; background: rgba(0,0,0,0.08); border-radius: 5px;
  width: 100%; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #7C5CFC, #A78BFA);
  border-radius: 5px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(124,92,252,0.3);
}
.progress-node {
  position: absolute; top: 50%; left: 0; width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  transform: translate(-50%, -50%); z-index: 2;
}
.node-dot {
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 3px solid rgba(0,0,0,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.55rem; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
.progress-node.done .node-dot {
  background: #FFD54F; border-color: #FFC107;
  box-shadow: 0 2px 10px rgba(255,193,7,0.5);
}
.progress-node.current .node-dot {
  background: #7C5CFC; border-color: #5A3FD6;
  box-shadow: 0 3px 12px rgba(124,92,252,0.5);
  animation: nodePulse 1.5s infinite;
}
.progress-node.upcoming .node-dot {
  background: #fff; border-color: rgba(0,0,0,0.12);
}
@keyframes nodePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}
@keyframes emojiCelebrate {
  0% { transform: scale(1); }
  30% { transform: scale(1.4) rotate(10deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}

.game-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: var(--space-xl); position: relative; }

/* 背景装饰元素 */
.bg-decorations { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.deco-star {
  position: absolute; font-size: 2rem; opacity: 0.3;
  animation: decoFloat 6s ease-in-out infinite;
}
.deco-bubble {
  position: absolute; width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(124,92,252,0.08), rgba(167,139,250,0.05));
  animation: decoFloat 8s ease-in-out infinite;
}
.deco-1 { top: 8%; left: 5%; animation-delay: 0s; }
.deco-2 { top: 25%; right: 8%; animation-delay: 2s; width: 60px; height: 60px; }
.deco-3 { bottom: 35%; left: 10%; animation-delay: 1s; font-size: 1.5rem; }
.deco-4 { bottom: 15%; right: 5%; animation-delay: 3s; }
.deco-5 { top: 50%; left: 3%; animation-delay: 4s; font-size: 1rem; }
@keyframes decoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(5deg); }
  50% { transform: translateY(-6px) rotate(-3deg); }
  75% { transform: translateY(-18px) rotate(2deg); }
}

.phase-ready { text-align: center; position: relative; z-index: 1; }
.ready-icon { font-size: 5rem; display: block; margin-bottom: var(--space-lg); animation: earWiggle 2s ease-in-out infinite; }
@keyframes earWiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-8deg); }
  30% { transform: rotate(8deg); }
  45% { transform: rotate(-5deg); }
  60% { transform: rotate(3deg); }
}
.phase-ready h2 { font-size: var(--font-size-2xl); color: #7C5CFC; margin-bottom: var(--space-sm); }
.phase-ready p { color: var(--text-secondary); margin-bottom: var(--space-sm); }
.ready-tip { font-size: var(--font-size-sm); color: var(--text-hint); }
.btn-play { padding: var(--space-md) var(--space-2xl); background: linear-gradient(135deg, #7C5CFC, #A78BFA); color: #fff; font-size: var(--font-size-xl); font-weight: 700; border-radius: var(--radius-full); margin-top: var(--space-lg); box-shadow: 0 4px 16px rgba(124,92,252,0.3); transition: transform 0.2s; position: relative; overflow: hidden; }
.btn-play::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
}
.btn-play:hover::after { animation: shimmer 1.5s infinite; }
.btn-play:hover { transform: scale(1.05); }
@keyframes shimmer { 100% { transform: translateX(100%); } }

.phase-countdown { display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
.countdown-num {
  font-size: 8rem; font-weight: 900; color: #7C5CFC;
  text-shadow: 0 4px 20px rgba(124,92,252,0.3);
  position: relative;
}
.countdown-num::before {
  content: ''; position: absolute; inset: -20px;
  background: radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%);
  border-radius: 50%; animation: countdownPulse 1s ease-out;
}
@keyframes countdownPulse {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.phase-playing { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); width: 100%; max-width: 500px; position: relative; z-index: 1; }
.target-word { display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-replay {
  padding: var(--space-sm) var(--space-xl); background: var(--bg-card); border: 2px solid #7C5CFC;
  border-radius: var(--radius-full); font-size: var(--font-size-lg); font-weight: 700;
  color: #7C5CFC; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(124,92,252,0.1); position: relative; overflow: hidden;
}
.btn-replay::before {
  content: ''; position: absolute; inset: 0; border-radius: var(--radius-full);
  background: radial-gradient(circle at center, rgba(124,92,252,0.2), transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.btn-replay:hover { border-color: #5A3FD6; transform: scale(1.05); box-shadow: 0 4px 16px rgba(124,92,252,0.2); }
.btn-replay:hover::before { opacity: 1; }
.btn-replay.active {
  background: #7C5CFC; color: #fff;
  animation: soundWave 1.2s ease-in-out infinite;
}
@keyframes soundWave {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,92,252,0.4); }
  50% { box-shadow: 0 0 0 12px rgba(124,92,252,0); }
}

.options-grid { display: grid; gap: var(--space-md); width: 100%; max-width: 500px; }
.options-grid.simple { grid-template-columns: repeat(2, 1fr); }
.options-grid.medium { grid-template-columns: repeat(3, 1fr); }
.options-grid.hard { grid-template-columns: repeat(4, 1fr); }
.option-card {
  min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--bg-card); border: 3px solid #E0E0E0; border-radius: var(--radius-xl);
  cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: hidden; position: relative;
}
.option-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(124,92,252,0.05), rgba(167,139,250,0.08));
  opacity: 0; transition: opacity 0.3s; border-radius: var(--radius-xl);
}
.option-card:hover:not(:disabled)::before { opacity: 1; }
.option-card:hover:not(:disabled) {
  border-color: #7C5CFC; transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(124,92,252,0.2);
}
.option-card:active:not(:disabled) { transform: scale(0.97); }
.card-emoji { font-size: 3rem; display: block; margin-bottom: 4px; transition: transform 0.3s; }
.option-card:hover .card-emoji { transform: scale(1.15) rotate(-5deg); }
.card-word { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); position: relative; z-index: 1; }
.card-zh { font-size: var(--font-size-sm); color: var(--color-success); font-weight: 600; position: relative; z-index: 1; }
.option-card.correct { border-color: var(--color-success); background: linear-gradient(135deg, #E8F5E9, #C8E6C9); box-shadow: 0 6px 24px rgba(76,175,80,0.25); }
.option-card.correct .card-emoji { animation: emojiCelebrate 0.6s var(--ease-bounce); }
.option-card.wrong { border-color: var(--color-danger); background: #FFEBEE; animation: shake 0.4s ease; }
.option-card.dimmed { opacity: 0.2; transform: scale(0.95); }

.feedback-bar {
  font-size: var(--font-size-xl); font-weight: 700; padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full); animation: feedbackBounce 0.4s var(--ease-bounce);
}
.feedback-correct { color: var(--color-success); background: #E8F5E9; }
.feedback-wrong { color: var(--color-danger); background: #FFEBEE; }
@keyframes feedbackBounce {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* 正确反馈：固定覆盖层（不占位不跳动） */
.correct-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.5); backdrop-filter: blur(4px);
  z-index: 100; pointer-events: none;
}
.correct-reinforcement {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border: 3px solid var(--color-success); border-radius: var(--radius-xl);
  padding: var(--space-lg) var(--space-2xl); box-shadow: 0 12px 40px rgba(76,175,80,0.3);
  animation: correctPop 0.5s var(--ease-bounce);
  pointer-events: auto;
}
.correct-emoji { font-size: 3.5rem; animation: bounce 0.6s var(--ease-bounce); }
.correct-en { font-size: 2.2rem; font-weight: 900; color: #2E7D32; }
.correct-phonetic { font-size: var(--font-size-sm); color: #66BB6A; font-weight: 600; }
.correct-zh { font-size: var(--font-size-lg); color: #4CAF50; font-weight: 700; }

@keyframes correctPop {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* pop 过渡动画 */
.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.phase-complete { width: 100%; max-width: 460px; position: relative; overflow: hidden; }
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

/* 撒花粒子 */
.confetti-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 0; }
.confetti {
  position: absolute; top: -20px; font-size: 1.2rem;
  animation: confettiFall 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  opacity: 0;
}
@keyframes confettiFall {
  0% { transform: translateY(-20px) rotate(0deg) scale(0.5); opacity: 0; }
  20% { opacity: 1; transform: translateY(40px) rotate(120deg) scale(1); }
  80% { opacity: 1; }
  100% { transform: translateY(350px) rotate(360deg) scale(0.8); opacity: 0; }
}

.trophy-wrapper { position: relative; z-index: 1; }
.complete-trophy { font-size: 4.5rem; display: block; animation: trophyBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.complete-title { font-size: var(--font-size-2xl); color: #7C5CFC; margin-bottom: var(--space-lg); position: relative; z-index: 1; }
.score-num { font-size: 3rem; font-weight: 900; color: #7C5CFC; animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards; }
.score-divider { color: var(--text-hint); font-weight: 400; margin: 0 2px; }
.score-total { color: var(--text-hint); font-weight: 600; }

.complete-stars { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); position: relative; z-index: 1; }
.star { font-size: 2.2rem; transition: all 0.3s; }
.star-active { opacity: 1; animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.star-empty { opacity: 0.2; transform: scale(0.8); }
@keyframes starPop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

.complete-msg { color: var(--text-primary); margin-bottom: var(--space-lg); font-size: var(--font-size-lg); font-weight: 600; position: relative; z-index: 1; }

.complete-yoyo { margin-bottom: 80px; position: relative; z-index: 1; }

.complete-buttons { display: flex; gap: var(--space-md); justify-content: center; position: relative; z-index: 1; }
.btn-retry, .btn-home {
  padding: var(--space-md) var(--space-xl); border-radius: var(--radius-full);
  font-size: var(--font-size-base); font-weight: 700; transition: all 0.2s;
  border: none; cursor: pointer;
}
.btn-retry { background: linear-gradient(135deg, #7C5CFC, #A78BFA); color: #fff; box-shadow: 0 4px 16px rgba(124,92,252,0.3); }
.btn-home { background: var(--border-light); color: var(--text-primary); }
.btn-retry:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 20px rgba(124,92,252,0.4); }
.btn-home:hover { transform: translateY(-2px); }

.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

.game-footer { display: flex; align-items: center; justify-content: center; padding: var(--space-md) var(--space-xl); background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); }
</style>