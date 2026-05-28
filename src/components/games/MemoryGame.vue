<template>
  <div class="memory-game" :class="`phase--${phase}`">
    <header class="game-header">
      <button class="btn-back" @click="$router.push('/')">← Home</button>
      <div class="header-title">
        <span class="game-badge">🃏 Memory Match</span>
        <span class="game-difficulty" :class="`diff-${store.gameDifficulty}`">{{ store.gameDifficulty === 'simple' ? 'Easy' : store.gameDifficulty === 'hard' ? 'Hard' : 'Medium' }}</span>
        <span class="round-info" v-if="phase === 'playing'">Pairs {{ matchedPairs }}/{{ currentConfig.pairs }}</span>
      </div>
      <div class="header-stats">
        <span class="stat-flips">Flips: {{ flipCount }}</span>
      </div>
    </header>

    <!-- Combo 连击显示 -->
    <ComboDisplay :combo="store.gameCombo" guide-key="memory" />

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
        <span class="ready-icon">🃏</span>
        <h2>Memory Match</h2>
        <p>Flip the cards, match the emoji with its English word!</p>
        <p class="ready-tip">Let's test your memory!</p>
        <button class="btn-play" @click="prepareGame">Start! 🎮</button>
      </div>

      <div v-if="phase === 'countdown'" class="phase-countdown">
        <span class="countdown-num anim-bounce">{{ countdownNum }}</span>
      </div>

      <div v-if="phase === 'playing' || phase === 'complete'" class="phase-playing anim-fade-up">
        <div class="cards-grid" :class="`diff-${store.gameDifficulty}`">
          <button v-for="card in cards" :key="card.index" class="memory-card"
            :class="{ flipped: card.flipped || card.matched, matched: card.matched, 'match-flash': card.flashAnim, shaking: card.shaking }"
            :disabled="card.flipped || card.matched || checkingPair"
            @click="flipCard(card)">
            <div class="card-inner">
              <div class="card-front"><span class="card-paw">🐾</span></div>
              <div class="card-back" :class="card.type">
                <span class="card-content" v-if="card.type === 'emoji'">{{ card.emoji }}</span>
                <span class="card-content card-word" v-else>{{ card.en }}</span>
              </div>
            </div>
          </button>
        </div>

        <Transition name="pop">
          <div v-if="feedbackText" class="feedback-bar" :class="feedbackClass">{{ feedbackText }}</div>
        </Transition>

        <div v-if="phase === 'complete'" class="complete-card anim-fade-up">
          <!-- 撒花粒子 -->
          <div class="confetti-container">
            <span v-for="i in 30" :key="i" class="confetti" :style="{ left: Math.random()*100+'%', animationDelay: Math.random()*2+'s', animationDuration: (1.5+Math.random()*1.5)+'s' }">🎉</span>
          </div>
          <!-- 奖杯动画 -->
          <div class="trophy-wrapper">
            <span class="complete-trophy">{{ starLevel >= 3 ? '🏆' : starLevel >= 2 ? '🥈' : '🎖️' }}</span>
          </div>
          <h2 class="complete-title">All Matched!</h2>
          <p class="complete-flips">{{ flipCount }} flips</p>
          <!-- 星星依次弹出 -->
          <div class="complete-stars">
            <span v-for="i in 3" :key="i" class="star" :class="i <= starLevel ? 'star-active' : 'star-empty'" :style="{ animationDelay: (0.8 + i * 0.3) + 's' }">⭐</span>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxMatch, sfxWrong, sfxComplete, sfxFlip } from '@/composables/useSfx'
import { ALL_CATEGORIES, ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import ResultAvatar from '@/components/common/ResultAvatar.vue'
import ComboDisplay from '@/components/common/ComboDisplay.vue'

const store = useLearningStore()
const emit = defineEmits(['game-complete'])
const { speak, stop, playAudio } = useSpeech()

// 确保 store 已初始化
onMounted(() => {
  if (!store.unlockedCategoryList?.length) {
    console.warn('unlockedCategoryList 为空，使用默认动物分类')
  }
})

// 难度配置（根据 difficulty 调整对数和网格）
const difficultyConfig = {
  simple: { pairs: 2, cols: 2, rows: 2, label: 'Easy' },
  medium: { pairs: 3, cols: 3, rows: 2, label: 'Medium' },
  hard: { pairs: 4, cols: 4, rows: 2, label: 'Hard' }
}

const phase = ref('ready')
const countdownNum = ref(3)
const cards = ref([])
const flipCount = ref(0)
const matchedPairs = ref(0)
const checkingPair = ref(false)

const feedbackText = ref('')
const feedbackClass = ref('')

const yoyoMood = ref('idle')
const yoyoBubble = ref("Let's find the pairs!")
const showStars = ref(false)

// 当前难度配置
const currentConfig = computed(() => difficultyConfig[store.gameDifficulty] || difficultyConfig.medium)

const starLevel = computed(() => {
  if (flipCount.value <= currentConfig.value.pairs * 2) return 3
  if (flipCount.value <= currentConfig.value.pairs * 3) return 2
  return 1
})
const starMessage = computed(() => {
  if (starLevel.value >= 3) return 'Super memory!'
  if (starLevel.value >= 2) return 'Great memory!'
  return 'Practice makes perfect!'
})

const correctMsgs = ['Match!', 'Found it!', 'Great!']
const wrongMsgs = ['Not a pair', 'Try again', 'Almost!']

let countdownTimer = null

function prepareGame() {
  phase.value = 'countdown'
  countdownNum.value = 3
  feedbackText.value = ''
  feedbackClass.value = ''
  store.resetCombo() // 新游戏重置连击
  generateCards()

  // 链式播放：等一个音效播完再切下一个数字
  function playNext(num) {
    if (num <= 0) {
      phase.value = 'playing'
      setYoyo('thinking', 'Go! 🎮')
      return
    }
    countdownNum.value = num
    playAudio(`/audio/countdown-${num}.mp3`, () => {
      countdownTimer = setTimeout(() => playNext(num - 1), 200)
    })
  }
  playNext(3)
}

function generateCards() {
  const config = currentConfig.value
  const categoryList = store.unlockedCategoryList?.length ? store.unlockedCategoryList : ALL_CATEGORIES.slice(0, store.unlockedCategories || 1)
  const pool = categoryList.flatMap(c => c.words)
  if (!pool.length) {
    console.error('单词池为空，无法生成卡片')
    return
  }
  const selected = pool.sort(() => Math.random() - 0.5).slice(0, config.pairs)
  const cardList = []
  selected.forEach((word, i) => {
    cardList.push({ index: i * 2, pairId: word.id, type: 'emoji', emoji: word.emoji, en: word.en, flipped: false, matched: false, flashAnim: false, shaking: false })
    cardList.push({ index: i * 2 + 1, pairId: word.id, type: 'word', emoji: word.emoji, en: word.en, flipped: false, matched: false, flashAnim: false, shaking: false })
  })
  cards.value = cardList.sort(() => Math.random() - 0.5)
}

let flippedCards = []

function flipCard(card) {
  if (checkingPair.value) return
  card.flipped = true
  flipCount.value++
  sfxFlip()
  speak(card.en, { rate: 0.75 })

  if (flippedCards.length === 0) { flippedCards = [card]; return }

  flippedCards.push(card)
  checkingPair.value = true

  const [a, b] = flippedCards
  if (a.pairId === b.pairId) {
    setTimeout(() => {
      sfxMatch()
      // 随机表扬音频
      const praises = ['/audio/great.mp3', '/audio/good-job.mp3', '/audio/excellent.mp3']
      playAudio(praises[Math.floor(Math.random() * praises.length)])
      a.matched = true; b.matched = true
      a.flashAnim = true; b.flashAnim = true
      matchedPairs.value++
      feedbackText.value = correctMsgs[Math.floor(Math.random() * correctMsgs.length)]
      feedbackClass.value = 'feedback-correct'
      setYoyo('happy', feedbackText.value, true)
      store.addCombo()
      const comboBonus = store.getComboBonus()
      store.addStars(comboBonus)
      // 配对后朗读单词
      setTimeout(() => speak(a.en, { rate: 0.7 }), 300)
      setTimeout(() => {
        a.flashAnim = false; b.flashAnim = false
        checkingPair.value = false; flippedCards = []
        feedbackText.value = ''; feedbackClass.value = ''
        if (matchedPairs.value >= currentConfig.value.pairs) {
          setTimeout(() => {
            sfxComplete()
            phase.value = 'complete'
            setYoyo('celebrate', 'You found them all!', true)
            store.updateGameScore('memory', starLevel.value)
            emit('game-complete')
          }, 600)
        }
      }, 800)
    }, 400)
    } else {
    setTimeout(() => {
      sfxWrong()
      a.shaking = true; b.shaking = true
      feedbackText.value = wrongMsgs[Math.floor(Math.random() * wrongMsgs.length)]
      feedbackClass.value = 'feedback-wrong'
      setYoyo('encourage', feedbackText.value)
      store.resetCombo() // 配对失败重置连击
      setTimeout(() => {
        a.flipped = false; b.flipped = false; a.shaking = false; b.shaking = false
        checkingPair.value = false; flippedCards = []
        feedbackText.value = ''; feedbackClass.value = ''
      }, 800)
    }, 600)
  }
}

function resetGame() {
  phase.value = 'ready'; cards.value = []; flipCount.value = 0; matchedPairs.value = 0
  flippedCards = []; checkingPair.value = false
  feedbackText.value = ''; feedbackClass.value = ''
}

function setYoyo(m, t, s = false) { yoyoMood.value = m; yoyoBubble.value = t; showStars.value = s }
onUnmounted(() => { stop(); clearTimeout(countdownTimer) })
</script>

<style scoped>
.memory-game { width: 100vw; height: 100dvh; display: flex; flex-direction: column; background: linear-gradient(180deg, #EDE7F6, var(--bg-main)); overflow: hidden; }
.game-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-xl); background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); }
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
.round-info { font-size: var(--font-size-sm); color: var(--text-hint); }
.stat-flips { font-size: var(--font-size-sm); color: var(--text-secondary); font-weight: 600; }

.game-main {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: var(--space-xl); gap: var(--space-xl); position: relative;
}

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
.ready-icon { font-size: 5rem; display: block; margin-bottom: var(--space-lg); animation: cardSwing 2s ease-in-out infinite; }
@keyframes cardSwing {
  0%, 100% { transform: rotate(0deg) scale(1); }
  15% { transform: rotate(-8deg) scale(1.05); }
  30% { transform: rotate(8deg) scale(1); }
  45% { transform: rotate(-5deg) scale(1.03); }
  60% { transform: rotate(3deg) scale(1); }
}
.phase-ready h2 { font-size: var(--font-size-2xl); color: #7C5CFC; margin-bottom: var(--space-sm); }
.phase-ready p { color: var(--text-secondary); margin-bottom: var(--space-sm); }
.ready-tip { font-size: var(--font-size-sm); color: var(--text-hint); }
.btn-play {
  padding: var(--space-md) var(--space-2xl); background: linear-gradient(135deg, #7C5CFC, #A78BFA);
  color: #fff; font-size: var(--font-size-xl); font-weight: 700; border-radius: var(--radius-full);
  margin-top: var(--space-lg); box-shadow: 0 4px 16px rgba(124,92,252,0.3);
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

.cards-grid {
  display: grid; gap: var(--space-md); margin: 0 auto; justify-content: center; position: relative; z-index: 1;
  grid-template-columns: repeat(2, 120px); grid-template-rows: repeat(2, 120px);
}
.cards-grid.diff-simple { grid-template-columns: repeat(2, 120px); grid-template-rows: repeat(2, 120px); }
.cards-grid.diff-medium { grid-template-columns: repeat(3, 120px); grid-template-rows: repeat(2, 120px); }
.cards-grid.diff-hard { grid-template-columns: repeat(4, 120px); grid-template-rows: repeat(2, 120px); }
.memory-card { width: 120px; height: 120px; perspective: 600px; cursor: pointer; background: transparent; border: none; padding: 0; }
.memory-card:disabled { cursor: default; }
.card-inner { width: 120px; height: 120px; position: relative; transform-style: preserve-3d; transition: transform 0.5s var(--ease-smooth); }
.memory-card.flipped .card-inner { transform: rotateY(180deg); }
.card-front, .card-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; }
.card-front { background: linear-gradient(135deg, #7C5CFC, #A78BFA); box-shadow: 0 4px 12px rgba(124,92,252,0.3), 0 0 16px rgba(124,92,252,0.1); }
.card-paw { font-size: 2rem; opacity: 0.6; animation: pawPulse 2s ease-in-out infinite; }
@keyframes pawPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
.card-back { transform: rotateY(180deg); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-back.emoji { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); }
.card-back.word { background: linear-gradient(135deg, #EDE7F6, #D1C4E9); }
.card-content { font-size: 2.5rem; }
.card-word { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); }

.memory-card.match-flash .card-inner { animation: matchFlash 0.6s var(--ease-bounce); }
@keyframes matchFlash { 0% { filter: brightness(1); } 50% { filter: brightness(1.4) drop-shadow(0 0 8px gold); } 100% { filter: brightness(1); } }
.memory-card.matched .card-inner { opacity: 0.3; transform: rotateY(180deg) scale(0.9); pointer-events: none; }
.memory-card.shaking .card-inner { animation: cardShake 0.4s ease; }
@keyframes cardShake { 0%,100% { transform: rotateY(180deg) translateX(0); } 25% { transform: rotateY(180deg) translateX(-6px); } 75% { transform: rotateY(180deg) translateX(6px); } }

/* emoji 庆祝动画 */
.memory-card.matched .card-content { animation: emojiCelebrate 0.6s var(--ease-bounce); }
@keyframes emojiCelebrate {
  0% { transform: scale(1); }
  30% { transform: scale(1.4) rotate(10deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}

.complete-card {
  background: var(--bg-card); border-radius: var(--radius-2xl);
  padding: var(--space-2xl); text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  position: relative; overflow: hidden;
  border: 3px solid transparent;
  max-width: 400px; width: 100%;
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

.complete-title { font-size: var(--font-size-xl); color: #7C5CFC; margin-bottom: var(--space-sm); position: relative; z-index: 1; }
.complete-flips { color: var(--text-hint); margin-bottom: var(--space-lg); position: relative; z-index: 1; }

.complete-stars { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-md); position: relative; z-index: 1; }
.star { font-size: 2.2rem; transition: all 0.3s; }
.star-active { opacity: 1; animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.star-empty { opacity: 0.2; transform: scale(0.8); }
@keyframes starPop { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }

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

.game-footer { display: flex; align-items: center; justify-content: center; padding: var(--space-md) var(--space-xl); background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); }

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

/* pop 过渡动画 */
.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>