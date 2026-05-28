<template>
  <div class="sort-it-game">
    <!-- 准备 -->
    <div v-if="phase === 'ready'" class="phase-ready anim-fade-up">
      <h1>🗂️ 快分类</h1>
      <p class="desc">把单词放到正确的分类篮子里！</p>
      <YoyoMascot :mood="'idle'" :bubble-text="'Let\'s sort them!'" :show-stars="false" />
      <button class="btn-start" @click="startCountdown">🚀 Start!</button>
    </div>

    <!-- 倒计时 -->
    <div v-if="phase === 'countdown'" class="phase-countdown">
      <span class="countdown-num anim-bounce">{{ countdownNum }}</span>
    </div>

    <!-- 游戏进行中 -->
    <div v-if="phase === 'playing' || phase === 'feedback'" class="phase-playing">
      <!-- 进度 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (currentIdx / totalWords) * 100 + '%' }"></div>
      </div>

      <!-- 计时器（Medium/Hard 模式） -->
      <div v-if="store.gameDifficulty !== 'simple'" class="timer-text">
        ⏱️ {{ Math.ceil(timeLeft) }}s
      </div>

      <!-- 得分 -->
      <div class="score-display">
        ✅ <strong>{{ score.correct }}</strong> / {{ totalWords }}
      </div>

      <!-- 当前单词 -->
      <div class="word-display" v-if="currentWord">
        <span class="word-emoji">{{ currentWord.emoji }}</span>
        <span class="word-en">{{ currentWord.en }}</span>
        <span class="word-zh">{{ currentWord.zh }}</span>
      </div>

      <!-- 分类篮子 -->
      <div class="baskets-grid" :class="`baskets-${baskets.length}`">
        <button v-for="basket in baskets" :key="basket.id" class="basket-card"
          @click="handleSort(basket)"
          :class="{ 'basket-correct': feedbackResult === 'correct' && feedbackBasket === basket.id,
                     'basket-wrong': feedbackResult === 'wrong' && feedbackBasket === basket.id }">
          <span class="basket-emoji">{{ basket.emoji }}</span>
          <span class="basket-label">{{ basket.label }}</span>
        </button>
      </div>
    </div>

    <!-- 结算 -->
    <div v-if="phase === 'complete'" class="phase-complete anim-fade-up">
      <div class="complete-card">
        <span class="trophy anim-bounce">{{ starLevel >= 3 ? '🏆' : starLevel >= 2 ? '🥈' : '🎖️' }}</span>
        <h2>分类完成！</h2>
        <div class="final-score">
          答对了 <strong>{{ score.correct }}</strong> / {{ totalWords }} 题
        </div>
        <div class="stars-display">
          <span v-for="i in 3" :key="i" class="star"
            :class="i <= starLevel ? 'star-active' : 'star-empty'"
            :style="{ animationDelay: (0.5 + i * 0.3) + 's' }">⭐</span>
        </div>
        <p class="complete-msg">{{ starMessage }}</p>
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
import { sfxCorrect, sfxWrong, sfxComplete } from '@/composables/useSfx'
import { ALL_CATEGORIES } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, playAudio } = useSpeech()

const totalWords = 10

// 主题场景分组（减少认知冲突）
const THEME_GROUPS = [
  { id: 'animal-fruit', categories: ['animal', 'fruit'], baskets: [
    { id: 'animal', emoji: '🐾', label: '动物' },
    { id: 'fruit', emoji: '🍎', label: '水果' }
  ]},
  { id: 'color-body', categories: ['color', 'body'], baskets: [
    { id: 'color', emoji: '🎨', label: '颜色' },
    { id: 'body', emoji: '🦶', label: '身体' }
  ]},
  { id: 'number-food', categories: ['number', 'food'], baskets: [
    { id: 'number', emoji: '🔢', label: '数字' },
    { id: 'food', emoji: '🍽️', label: '食物' }
  ]},
  { id: 'transport-clothes', categories: ['transport', 'clothes'], baskets: [
    { id: 'transport', emoji: '🚗', label: '交通工具' },
    { id: 'clothes', emoji: '👕', label: '衣服' }
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
      id: c.id, emoji: c.emoji, label: c.nameZh
    }))
  } else if (diff === 'medium') {
    // 中等模式：优先用主题组，不够就用前 3 个
    if (matchingGroups.length > 0) {
      const group = matchingGroups[0]
      baskets.value = group.baskets
    } else {
      baskets.value = store.unlockedCategoryList.slice(0, 3).map(c => ({
        id: c.id, emoji: c.emoji, label: c.nameZh
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
        id: c.id, emoji: c.emoji, label: c.nameZh
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

  // 补充到 10 个词
  while (words.value.length < totalWords) {
    const randomCat = store.unlockedCategoryList[Math.floor(Math.random() * store.unlockedCategoryList.length)]
    if (randomCat) {
      const word = randomCat.words[Math.floor(Math.random() * randomCat.words.length)]
      if (word && !words.value.find(w => w.id === word.id)) {
        words.value.push(word)
      }
    } else {
      break
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

  function playNext(num) {
    if (num <= 0) {
      startGame()
      return
    }
    countdownNum.value = num
    playAudio(`/audio/countdown-${num}.mp3`, () => {
      setTimeout(() => playNext(num - 1), 200)
    })
  }
  playNext(3)
}

function startGame() {
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
    finishGame()
    return
  }
  currentWord.value = words.value[currentIdx.value]
  // 自动朗读
  speak(currentWord.value.en, { rate: 0.7 })
}

function handleSort(basket) {
  if (!currentWord.value) return

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
    nextWord()
  }, 800)
}

function finishGame() {
  clearInterval(gameTimer)
  sfxComplete()
  phase.value = 'complete'
  store.updateGameScore('sort-it', score.value.correct)

  if (score.value.correct >= 8) {
    setYoyo('celebrate', starMessages[2])
  } else if (score.value.correct >= 5) {
    setYoyo('happy', starMessages[1])
  } else {
    setYoyo('encourage', starMessages[0])
  }

  if (score.value.correct >= 8) {
    emit('game-complete')
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
})
</script>

<style scoped>
.sort-it-game {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #E8F5E9, var(--bg-main));
  overflow: hidden; position: relative;
}

/* 进度条 */
.progress-bar {
  width: 100%; height: 8px; background: rgba(0,0,0,0.1);
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
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
  display: flex; flex-direction: column; align-items: center;
  padding: 24px; background: white; border-radius: 20px;
  margin: 16px auto; max-width: 300px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.word-emoji { font-size: 4rem; }
.word-en { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin-top: 8px; }
.word-zh { font-size: 1rem; color: var(--text-secondary); margin-top: 4px; }

/* 篮子网格 */
.baskets-grid {
  display: grid; gap: 16px; padding: 16px; max-width: 600px; margin: 0 auto;
}
.baskets-2 { grid-template-columns: repeat(2, 1fr); }
.baskets-3 { grid-template-columns: repeat(3, 1fr); }
.baskets-4 { grid-template-columns: repeat(2, 1fr); }

.basket-card {
  padding: 24px; border-radius: 20px;
  background: white; border: 3px solid transparent;
  text-align: center; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.basket-card:active { transform: scale(0.95); }
.basket-card.basket-correct { border-color: #4CAF50; background: #E8F5E9; }
.basket-card.basket-wrong { border-color: #FF5252; background: #FFEBEE; animation: shake 0.4s ease; }
.basket-emoji { font-size: 3rem; display: block; }
.basket-label { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 8px; }

/* 结算 */
.complete-card {
  text-align: center; background: white; padding: 32px;
  border-radius: 24px; max-width: 400px; margin: auto;
}
.trophy { font-size: 5rem; display: block; }
.final-score { font-size: 1.3rem; margin: 16px 0; }
.final-score strong { font-size: 2rem; color: #4CAF50; }
.stars-display { font-size: 2.5rem; margin: 16px 0; display: flex; justify-content: center; gap: 8px; }
.star-active { animation: starPop 0.5s ease forwards; }
.star-empty { opacity: 0.3; }
.complete-msg { font-size: 1rem; color: var(--text-secondary); margin: 12px 0; }
.complete-buttons { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }
.btn-retry, .btn-home {
  padding: 12px 24px; border-radius: 24px; border: none;
  font-size: 1rem; font-weight: 600; cursor: pointer;
}
.btn-retry { background: #4CAF50; color: white; }
.btn-home { background: #F5F5F5; color: var(--text-primary); }

/* 准备/倒计时 */
.phase-ready, .phase-countdown {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; text-align: center;
}
.phase-ready h1 { font-size: 2.5rem; margin-bottom: 8px; }
.phase-ready .desc { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 24px; }
.btn-start {
  padding: 16px 48px; font-size: 1.5rem; border-radius: 32px;
  border: none; background: linear-gradient(135deg, #4CAF50, #8BC34A);
  color: white; font-weight: 700; cursor: pointer;
}
.countdown-num { font-size: 8rem; font-weight: 900; color: #4CAF50; }

.game-footer {
  position: absolute; bottom: 0; width: 100%;
  padding: var(--space-sm);
}

@keyframes starPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.pop-enter-active, .pop-leave-active { transition: all 0.3s ease; }
.pop-enter-from { opacity: 0; transform: scale(0.8); }
.pop-leave-to { opacity: 0; transform: scale(0.8); }
</style>
