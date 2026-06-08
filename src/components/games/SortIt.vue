<template>
  <div class="sort-it-game">
    <!-- 顶部栏 -->
    <header class="game-header">
      <button class="btn-back" @click="$router.push('/playground')">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-title">
        <span class="game-badge">🗂️ Sort It</span>
        <span class="game-difficulty" :class="`diff-${store.gameDifficulty}`">{{ difficultyLabel }}</span>
        <span class="round-info" v-if="phase === 'playing' || phase === 'feedback'">
          Word {{ currentIdx + 1 }}/{{ totalWords }}
        </span>
      </div>
      <div class="header-spacer"></div>
    </header>

    <!-- Combo 连击显示 -->
    <ComboDisplay :combo="store.gameCombo" guide-key="sort-it" />

    <!-- 主内容 -->
    <main class="game-main">
      <!-- 浮动装饰元素 -->
      <div class="bg-decorations" aria-hidden="true">
        <span class="deco-star deco-1">⭐</span>
        <span class="deco-bubble deco-2"></span>
        <span class="deco-star deco-3">✨</span>
        <span class="deco-bubble deco-4"></span>
        <span class="deco-star deco-5"></span>
      </div>

      <!-- 解锁检测 -->
      <div v-if="!isUnlocked" class="phase-locked anim-fade-up" style="position: relative; z-index: 1;">
        <span class="lock-icon">🔒</span>
        <h1>快分类</h1>
        <p class="lock-desc">先学完 1 个新分类再来玩分类游戏吧！</p>
        <p class="lock-hint">当前解锁：{{ store.unlockedCategories }} / 2</p>
        <button class="btn-home" @click="$router.push('/playground')">🏠 Playground</button>
      </div>

      <!-- 准备 -->
      <div v-else-if="phase === 'ready'" class="phase-ready anim-fade-up">
        <span class="ready-icon">🗂️</span>
        <h2>Sort It</h2>
        <p>把单词放到正确的分类篮子里！</p>
        <button class="btn-play" @click="startCountdown">🚀 Start!</button>
      </div>

      <!-- 倒计时 -->
      <div v-if="phase === 'countdown'" class="phase-countdown">
        <span class="countdown-num anim-bounce">{{ countdownNum }}</span>
      </div>

      <!-- 游戏进行中 -->
      <div v-if="phase === 'playing' || phase === 'feedback'" class="phase-playing anim-fade-up">
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: (currentIdx / totalWords) * 100 + '%' }"></div>
          </div>
          <span v-for="w in totalWords" :key="w" class="progress-node"
            :class="{
              done: w <= currentIdx,
              current: w === currentIdx + 1
            }"
            :style="{ left: ((w - 1) / (totalWords - 1) * 100) + '%' }">
            <span class="node-dot">{{ w <= currentIdx ? '⭐' : '' }}</span>
          </span>
        </div>

        <!-- 计时器（Medium/Hard 模式） -->
        <div v-if="store.gameDifficulty !== 'simple'" class="timer-text">
          ⏱️ {{ Math.ceil(timeLeft) }}s
        </div>

        <!-- 得分 -->
        <div class="score-display">
          <div class="score-card">
            <span class="score-icon">⭐</span>
            <span class="score-num">{{ score.correct }}</span>
            <span class="score-divider">/</span>
            <span class="score-total">{{ totalWords }}</span>
          </div>
        </div>

        <!-- 当前单词 -->
        <div class="word-display" v-if="currentWord">
          <div class="word-card-inner">
            <span class="word-emoji">{{ currentWord.emoji }}</span>
            <span class="word-en">{{ currentWord.en }}</span>
            <span class="word-zh">{{ currentWord.zh }}</span>
          </div>
          <!-- 发光边框效果 -->
          <div class="word-glow"></div>
        </div>

        <!-- 分类篮子 -->
        <div class="baskets-grid" :class="`baskets-${baskets.length}`">
          <button v-for="basket in baskets" :key="basket.id" class="basket-card"
            @click="handleSort(basket)"
            :class="{ 'basket-correct': feedbackResult === 'correct' && feedbackBasket === basket.id,
                       'basket-wrong': feedbackResult === 'wrong' && feedbackBasket === basket.id,
                       'basket-shake': feedbackResult === 'wrong' && feedbackBasket === basket.id }">
            <div class="basket-inner">
              <span class="basket-emoji">{{ basket.emoji }}</span>
              <span class="basket-label">{{ basket.label }}</span>
            </div>
            <!-- 反馈动画层 -->
            <div v-if="feedbackResult && feedbackBasket === basket.id" class="basket-feedback">
              <span v-if="feedbackResult === 'correct'" class="feedback-icon">✅</span>
              <span v-else class="feedback-icon">❌</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 结算 -->
      <div v-if="phase === 'complete'" class="phase-complete anim-fade-up">
        <!-- 全局 confetti 由 useConfetti 管理 -->
        <div class="complete-card" :class="`complete-${starLevel >= 3 ? 'gold' : starLevel >= 2 ? 'silver' : 'bronze'}`">
          <div class="trophy-wrapper">
            <span class="complete-trophy anim-bounce">{{ starLevel === 3 ? '🏆' : starLevel === 2 ? '🥈' : '🎖️' }}</span>
          </div>
          <h2 class="complete-title">Sorted!</h2>
          <h2 class="complete-title">
            <span class="score-num" :style="{ animationDelay: '0.5s' }">{{ score.correct }}</span>
            <span class="score-divider">/</span>
            <span class="score-total">{{ totalWords }}</span>
          </h2>
          <div class="complete-stars">
            <span v-for="i in 3" :key="i" class="star"
              :class="i <= starLevel ? 'star-active' : 'star-empty'"
              :style="{ animationDelay: (0.8 + i * 0.3) + 's' }">⭐</span>
          </div>
          <p class="complete-msg">{{ starMessage }}</p>
          <ResultAvatar :bubble-text="yoyoBubble" :avatar-src="store.avatar" class="complete-yoyo" />
          <LikeButton :source="'sort'" class="complete-like" />
          <div class="complete-buttons">
            <button class="btn-retry" @click="resetGame"><span class="btn-icon">🔄</span><span class="btn-text">Play again</span></button>
            <button class="btn-home" @click="$router.push('/playground')"><span class="btn-icon">🏠</span><span class="btn-text">Playground</span></button>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部吉祥物 -->
    <footer class="game-footer" v-if="phase !== 'complete'">
      <GameMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete, sfxCheer, sfxApplause, sfxFanfare } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import { triggerPerfectClear } from '@/composables/useFeedback'
import { ALL_CATEGORIES } from '@/data/words'
import GameMascot from '@/components/common/GameMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'
import LikeButton from '@/components/common/LikeButton.vue'
import ComboDisplay from '@/components/common/ComboDisplay.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, playAudio } = useSpeech()

const totalWords = 10

// 难度标签
const difficultyLabel = computed(() => {
  const map = { simple: 'Easy', medium: 'Medium', hard: 'Hard' }
  return map[store.gameDifficulty] || 'Medium'
})

// 主题场景分组（减少认知冲突）
const THEME_GROUPS = [
  { id: 'animal-fruit', categories: ['animal', 'fruit'], baskets: [
    { id: 'animal', emoji: '🐾', label: '动物' },
    { id: 'fruit', emoji: '', label: '水果' }
  ]},
  { id: 'color-body', categories: ['color', 'body'], baskets: [
    { id: 'color', emoji: '🎨', label: '颜色' },
    { id: 'body', emoji: '🦶', label: '身体' }
  ]},
  { id: 'number-food', categories: ['number', 'food'], baskets: [
    { id: 'number', emoji: '🔢', label: '数字' },
    { id: 'food', emoji: '️', label: '食物' }
  ]},
  { id: 'transport-clothes', categories: ['transport', 'clothes'], baskets: [
    { id: 'transport', emoji: '🚗', label: '交通工具' },
    { id: 'clothes', emoji: '', label: '衣服' }
  ]},
]

// 按难度选择篮子数量
const DIFFICULTY_CONFIG = {
  simple:   { groups: 1, timeLimit: null },  // 2 篮子，不限时
  medium:   { groups: 2, timeLimit: 75 },    // 3-4 篮子，75 秒
  hard:     { groups: 3, timeLimit: 60 }     // 4 篮子，60 秒
}

const config = computed(() => {
  const diff = store.gameDifficulty || 'medium'
  return DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium
})

/** 解锁检测：至少 2 个分类才能玩分类游戏 */
const isUnlocked = computed(() => store.unlockedCategories >= 2)

const phase = ref('ready')
const countdownNum = ref(3)
const timeLeft = ref(config.value.timeLimit || 0)
const currentIdx = ref(0)
const currentWord = ref(null)
const baskets = ref([])
const words = ref([])
const score = ref({ correct: 0 })
const feedbackResult = ref(null)
const feedbackBasket = ref(null)

const yoyoMood = ref('idle')
const yoyoBubble = ref('Let\'s sort!')
const showStars = ref(false)

const starLevel = computed(() => {
  const ratio = score.value.correct / totalWords
  if (ratio >= 0.8) return 3
  if (ratio >= 0.5) return 2
  return 1
})

const starMessages = [
  'Good try! Keep sorting! 📦',
  'Nice work! Getting better! 🎯',
  'Amazing! Sorting expert! 🌟'
]
const starMessage = computed(() => starMessages[starLevel.value - 1])

let gameTimer = null

function prepareBaskets() {
  // 从已解锁分类中动态选择篮子
  const unlocked = store.unlockedCategoryList.map(c => c.id)
  // 优先使用预设主题组
  const matchingGroups = THEME_GROUPS.filter(g =>
    g.categories.every(c => unlocked.includes(c))
  )

  const diff = store.gameDifficulty
  if (diff === 'simple') {
    // 简单模式：取前 2 个解锁的分类
    baskets.value = store.unlockedCategoryList.slice(0, 2).map(c => ({
      id: c.id, emoji: c.emoji, label: c.name
    }))
  } else if (diff === 'medium') {
    // 中等模式：优先用主题组，不够就用前 3 个
    if (matchingGroups.length > 0) {
      const group = matchingGroups[0]
      baskets.value = group.baskets
    } else {
      baskets.value = store.unlockedCategoryList.slice(0, 3).map(c => ({
        id: c.id, emoji: c.emoji, label: c.name
      }))
    }
  } else {
    // 困难模式：4 个篮子
    if (matchingGroups.length >= 2) {
      const allBaskets = matchingGroups.slice(0, 2).flatMap(g => g.baskets)
      const unique = [...new Map(allBaskets.map(b => [b.id, b])).values()]
      baskets.value = unique.slice(0, 4)
    } else {
      baskets.value = store.unlockedCategoryList.slice(0, 4).map(c => ({
        id: c.id, emoji: c.emoji, label: c.name
      }))
    }
  }
}

function prepareWords() {
  const basketIds = baskets.value.map(b => b.id)
  words.value = []

  // 从每个篮子的分类中选词
  for (const catId of basketIds) {
    const cat = ALL_CATEGORIES.find(c => c.id === catId)
    if (cat) {
      const catWords = [...cat.words].sort(() => Math.random() - 0.5).slice(0, 3)
      words.value.push(...catWords)
    }
  }

  // 补充到 10 个词（只从当前篮子的分类中选词，避免死局）
  const basketCategories = baskets.value
    .map(b => ALL_CATEGORIES.find(c => c.id === b.id))
    .filter(Boolean)
  
  // 安全退出：最多尝试 200 次，防止词库不足导致死循环
  let attempts = 0
  while (words.value.length < totalWords && basketCategories.length > 0 && attempts < 200) {
    attempts++
    const randomCat = basketCategories[Math.floor(Math.random() * basketCategories.length)]
    const word = randomCat.words[Math.floor(Math.random() * randomCat.words.length)]
    if (word && !words.value.find(w => w.id === word.id)) {
      words.value.push(word)
    }
  }

  words.value = words.value.slice(0, totalWords).sort(() => Math.random() - 0.5)
}

function startCountdown() {
  prepareBaskets()
  prepareWords()
  store.resetCombo()
  phase.value = 'countdown'
  countdownNum.value = 3

  // 纯定时器推进（不依赖音频 onended 回调，避免短音频 race condition）
  let cdTimer = null
  function tick(num) {
    if (num <= 0) {
      clearTimeout(cdTimer)
      startGame()
      return
    }
    countdownNum.value = num
    playAudio(`/audio/countdown-${num}.mp3`) // 仅作播放，不依赖回调
    cdTimer = setTimeout(() => tick(num - 1), 1000)
  }
  tick(3)
}

function startGame() {
  phase.value = 'playing'
  currentIdx.value = 0
  score.value.correct = 0
  timeLeft.value = config.value.timeLimit || 999

  if (config.value.timeLimit) {
    gameTimer = setInterval(() => {
      timeLeft.value -= 1
      if (timeLeft.value <= 0) {
        finishGame()
      }
    }, 1000)
  }

  nextWord()
}

function nextWord() {
  if (currentIdx.value >= totalWords) {
    // 所有词已分完，立即停止计时器避免空转和重复调用
    clearInterval(gameTimer)
    finishGame()
    return
  }
  currentWord.value = words.value[currentIdx.value]
  // 自动朗读
  speak(currentWord.value.en, { rate: 0.7 })
}

// 防重入锁：800ms 反馈期间禁止再次点击
let isHandling = false

function handleSort(basket) {
  if (!currentWord.value || isHandling) return
  isHandling = true

  // 找到单词所属的正确分类
  const correctCat = ALL_CATEGORIES.find(c => c.words.find(w => w.id === currentWord.value.id))

  if (correctCat && basket.id === correctCat.id) {
    // 正确
    sfxCorrect()
    score.value.correct++
    store.addCombo()
    store.addStars(store.getComboBonus())
    feedbackResult.value = 'correct'
    feedbackBasket.value = basket.id
    setYoyo('happy', 'Correct!', true)
  } else {
    // 错误
    sfxWrong()
    store.resetCombo()
    feedbackResult.value = 'wrong'
    feedbackBasket.value = basket.id
    setYoyo('encourage', 'Try again!')
  }

  // 短暂反馈后进入下一个
  setTimeout(() => {
    feedbackResult.value = null
    feedbackBasket.value = null
    currentIdx.value++
    isHandling = false
    nextWord()
  }, 800)
}

function finishGame() {
  // 防重入：已被调用过则跳过
  if (phase.value === 'complete') return
  clearInterval(gameTimer)
  sfxComplete()
  // 结算欢呼：凯旋号角 + 高分时追加掌声
  sfxFanfare()
  if (score.value.correct >= 8) {
    setTimeout(() => sfxApplause(), 600)
  }
  phase.value = 'complete'
  store.updateGameScore('sort-it', score.value.correct)

  if (score.value.correct >= 8) {
    setYoyo('celebrate', starMessages[2])
  } else if (score.value.correct >= 5) {
    setYoyo('happy', starMessages[1])
  } else {
    setYoyo('encourage', starMessages[0])
  }

  if (score.value.correct >= 5) {
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
  currentIdx.value = 0
  score.value.correct = 0
  feedbackResult.value = null
  feedbackBasket.value = null
  startCountdown()
}

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text
  showStars.value = stars
}

onUnmounted(() => {
  clearInterval(gameTimer)
  // 清理倒计时安全超时
  if (window._sortCountdownTimeout) {
    clearTimeout(window._sortCountdownTimeout)
  }
})
</script>

<style scoped>
.sort-it-game {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #E8F5E9, var(--bg-main));
  overflow: hidden; position: relative;
}

/* ===== 顶部栏 ===== */
.game-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
}
.btn-back {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: var(--bg-card); border: 2px solid var(--border-light);
  border-radius: 50%; font-size: var(--font-size-lg); cursor: pointer;
  transition: all 0.2s; padding: 0;
}
.btn-back:hover { border-color: #4CAF50; transform: scale(1.08); }
.btn-back:active { transform: scale(0.95); }
.header-title { display: flex; align-items: center; gap: var(--space-sm); }
.game-badge {
  padding: var(--space-xs) var(--space-lg);
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
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
.round-info { font-size: var(--font-size-sm); color: var(--text-hint); }
.header-spacer { width: 60px; }

/* ===== 进度条 ===== */
.progress-bar {
  height: 40px; position: relative; margin: 0 var(--space-xl);
  display: flex; align-items: center;
}
.progress-track {
  height: 10px; background: rgba(0,0,0,0.08); border-radius: 5px;
  width: 100%; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A);
  border-radius: 5px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(76,175,80,0.3);
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
  background: #4CAF50; border-color: #388E3C;
  box-shadow: 0 3px 12px rgba(76,175,80,0.5);
  animation: nodePulse 1.5s infinite;
}
@keyframes nodePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

/* ===== 主内容 ===== */
.game-main {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: var(--space-xl); position: relative;
}

/* 背景装饰元素 */
.bg-decorations { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.deco-star {
  position: absolute; font-size: 2rem; opacity: 0.3;
  animation: decoFloat 6s ease-in-out infinite;
}
.deco-bubble {
  position: absolute; width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(76,175,80,0.08), rgba(139,195,74,0.05));
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

/* 计时器 */
.timer-text {
  position: absolute; top: 16px; right: 16px;
  font-size: 1.1rem; font-weight: 700; color: #333;
  background: rgba(255,255,255,0.9); padding: 4px 12px;
  border-radius: 12px; z-index: 10;
}

/* 得分 */
.score-display {
  text-align: center; padding: 8px;
  font-size: 1.1rem; color: var(--text-primary);
}
.score-display strong {
  font-size: 1.5rem; color: #4CAF50;
}

/* 单词显示 */
.word-display {
  position: relative;
  padding: 8px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 24px;
  margin: 16px auto;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
  overflow: hidden;
}
.word-glow {
  position: absolute; inset: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(76,175,80,0.08), rgba(139,195,74,0.05), rgba(76,175,80,0.08));
  opacity: 0;
  animation: wordGlow 3s ease-in-out infinite;
}
@keyframes wordGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
.word-card-inner {
  position: relative;
  z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  padding: 20px;
}
.word-emoji {
  font-size: 4.5rem;
  animation: wordFloat 3s ease-in-out infinite;
}
@keyframes wordFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.word-en {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-top: 12px;
  letter-spacing: 0.5px;
}
.word-zh {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-top: 6px;
  font-weight: 500;
}

/* 篮子网格 */
.baskets-grid {
  display: grid; gap: 16px; padding: 16px; max-width: 600px; margin: 0 auto;
}
.baskets-2 { grid-template-columns: repeat(2, 1fr); }
.baskets-3 { grid-template-columns: repeat(3, 1fr); }
.baskets-4 { grid-template-columns: repeat(2, 1fr); }

.basket-card {
  position: relative; overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  border: 4px solid rgba(255,255,255,0.8);
  text-align: center;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06);
  cursor: pointer;
  min-height: 140px;
  display: flex; align-items: center; justify-content: center;
}
.basket-inner {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.basket-card:hover .basket-inner { transform: translateY(-4px); }
.basket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
  border-color: rgba(76,175,80,0.3);
}
.basket-card:active { transform: scale(0.95); }
.basket-card.basket-correct {
  border-color: #4CAF50;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  box-shadow: 0 6px 24px rgba(76,175,80,0.25);
  animation: basketPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.basket-card.basket-wrong {
  border-color: #FF5252;
  background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
  box-shadow: 0 6px 24px rgba(255,82,82,0.2);
  animation: basketShake 0.5s ease;
}
@keyframes basketPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes basketShake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-6px) rotate(-1deg); }
  30% { transform: translateX(6px) rotate(1deg); }
  45% { transform: translateX(-4px) rotate(-0.5deg); }
  60% { transform: translateX(4px) rotate(0.5deg); }
  75% { transform: translateX(-2px); }
}
.basket-emoji {
  font-size: 3.2rem;
  display: block;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.basket-card:hover .basket-emoji { transform: scale(1.1); }
.basket-label {
  font-size: 1.2rem; font-weight: 700; color: var(--text-primary);
  margin-top: 4px;
  transition: color 0.25s;
}

/* 反馈动画层 */
.basket-feedback {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(4px);
  border-radius: 24px;
  animation: feedbackFade 0.6s ease-out forwards;
}
.feedback-icon {
  font-size: 3.5rem;
  animation: feedbackPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes feedbackFade {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes feedbackPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}
/* ===== 准备/倒计时/锁定 ===== */
.phase-ready, .phase-countdown, .phase-locked {
  text-align: center; position: relative; z-index: 1;
}
.phase-ready .ready-icon { font-size: 5rem; display: block; margin-bottom: var(--space-lg); animation: basketBounce 2s ease-in-out infinite; }
@keyframes basketBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.phase-ready h2 { font-size: var(--font-size-2xl); color: #4CAF50; margin-bottom: var(--space-sm); }
.phase-ready p { color: var(--text-secondary); margin-bottom: var(--space-xl); font-size: var(--font-size-lg); }
.phase-locked .lock-icon { font-size: 5rem; display: block; margin-bottom: 16px; }
.phase-locked h1 { font-size: 2rem; margin-bottom: 12px; }
.phase-locked .lock-desc { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 8px; }
.phase-locked .lock-hint { font-size: 0.95rem; color: var(--text-hint); margin-bottom: 24px; }
.btn-play {
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: #fff; font-size: var(--font-size-xl); font-weight: 700;
  border-radius: var(--radius-full); box-shadow: 0 4px 16px rgba(76,175,80,0.3);
  transition: transform 0.2s; position: relative; overflow: hidden;
}
.btn-play::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
}
.btn-play:hover::after { animation: shimmer 1.5s infinite; }
.btn-play:hover { transform: scale(1.05); }
@keyframes shimmer { 100% { transform: translateX(100%); } }
.countdown-num { font-size: 8rem; font-weight: 900; color: #4CAF50; }

/* ===== 结算 ===== */
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

.trophy-wrapper { position: relative; z-index: 1; }
.complete-trophy { font-size: 4.5rem; display: block; animation: trophyBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes trophyBounce {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.complete-title { font-size: var(--font-size-xl); color: #4CAF50; margin-bottom: var(--space-sm); position: relative; z-index: 1; }
.final-score { font-size: 1.3rem; margin: 16px 0; position: relative; z-index: 1; }
.final-score strong { font-size: 2rem; color: #4CAF50; }
.complete-stars { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); position: relative; z-index: 1; }
.star { font-size: 2.2rem; transition: all 0.3s; }
.star-active { opacity: 1; animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.star-empty { opacity: 0.2; transform: scale(0.8); }
@keyframes starPop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
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
.btn-retry { background: linear-gradient(135deg, #4CAF50, #8BC34A); color: #fff; box-shadow: 0 4px 16px rgba(76,175,80,0.3); }
.btn-retry:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 6px 20px rgba(76,175,80,0.4); }
.btn-home { background: var(--border-light); color: var(--text-primary); }
.btn-home:hover { transform: translateY(-2px); }

/* ===== 底部 ===== */
.game-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px var(--space-xl) 12px;
  background: transparent;
  overflow: visible;
  position: relative;
}

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from { opacity: 0; transform: scale(0.8); }
.pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
