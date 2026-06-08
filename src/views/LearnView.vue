<template>
  <div class="learn-page" :style="{ '--scene-color': sceneColor }">
    <!-- 背景浮动装饰 -->
    <div class="bg-deco" aria-hidden="true">
      <span class="deco-item deco-1">✨</span>
      <span class="deco-item deco-2"></span>
      <span class="deco-item deco-3">⭐</span>
      <span class="deco-item deco-4"></span>
    </div>

    <!-- 顶部导航 -->
    <header class="learn-header">
      <button class="btn-back" @click="handleBack">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-info">
        <span class="category-emoji">{{ category?.emoji }}</span>
        <span class="category-name">{{ category?.name }}</span>
        <span class="word-progress">{{ progressLabel }}</span>
      </div>
      <button v-if="showSkipBtn" class="btn-skip" @click="skipStep">跳过此步 →</button>
    </header>

    <!-- 进度条 — 按组展示 -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      <div class="progress-nodes">
        <div v-for="(grp, gi) in groups" :key="gi" class="node"
          :class="{ done: gi < currentGroupIndex, active: gi === currentGroupIndex, pending: gi > currentGroupIndex }">
          <span class="node-icon">{{ gi < currentGroupIndex ? '✓' : grp[0]?.emoji }}</span>
        </div>
      </div>
    </div>

    <!-- 场景动态插图 -->
    <div class="scene-decorations" :data-scene="category?.scene">
      <template v-if="category?.scene === 'forest'">
        <span class="scene-tree tree-1">🌲</span>
        <span class="scene-tree tree-2">🌳</span>
        <span class="scene-leaf leaf-1">🍃</span>
        <span class="scene-leaf leaf-2">🍃</span>
        <span class="scene-animal animal-1">🐰</span>
        <span class="scene-animal animal-2">🐦</span>
      </template>
      <template v-else-if="category?.scene === 'orchard'">
        <span class="scene-tree tree-1">🍊</span>
        <span class="scene-sun">☀️</span>
        <span class="scene-leaf leaf-1">🍃</span>
        <span class="scene-leaf leaf-2">🍂</span>
      </template>
      <template v-else-if="category?.scene === 'rainbow'">
        <span class="scene-rainbow">🌈</span>
        <span class="scene-cloud cloud-1">☁️</span>
        <span class="scene-cloud cloud-2">☁️</span>
        <span class="scene-cloud cloud-3">☁️</span>
      </template>
      <template v-else-if="category?.scene === 'mirror'">
        <span class="scene-mirror">🪞</span>
        <span class="scene-sparkle sparkle-1">✨</span>
        <span class="scene-sparkle sparkle-2">✨</span>
      </template>
      <template v-else-if="category?.scene === 'home'">
        <span class="scene-house">🏠</span>
        <span class="scene-clock">🕰️</span>
        <span class="scene-sofa">🛋️</span>
      </template>
      <template v-else-if="category?.scene === 'kitchen'">
        <span class="scene-pot pot-1">🍳</span>
        <span class="scene-pot pot-2">🥄</span>
        <span class="scene-steam steam-1">💨</span>
        <span class="scene-steam steam-2">💨</span>
        <span class="scene-plate">🍽️</span>
      </template>
      <template v-else-if="category?.scene === 'city'">
        <span class="scene-building bld-1">🏢</span>
        <span class="scene-building bld-2">🏬</span>
        <span class="scene-traffic-light">🚦</span>
        <span class="scene-car car-1">🚗</span>
        <span class="scene-car car-2">🚌</span>
      </template>
      <template v-else-if="category?.scene === 'outdoor'">
        <span class="scene-sun">☀️</span>
        <span class="scene-cloud cloud-1">☁️</span>
        <span class="scene-cloud cloud-2">⛅</span>
        <span class="scene-umbrella">☂️</span>
        <span class="scene-snowflake snow-1">❄️</span>
        <span class="scene-snowflake snow-2">❄️</span>
      </template>
      <template v-else-if="category?.scene === 'classroom'">
        <span class="scene-blackboard">📋</span>
        <span class="scene-pencil">✏️</span>
        <span class="scene-book book-1">📚</span>
        <span class="scene-book book-2">📖</span>
        <span class="scene-bell">🔔</span>
      </template>
      <template v-else-if="category?.scene === 'playground'">
        <span class="scene-slide">🛝</span>
        <span class="scene-balloon balloon-1">🎈</span>
        <span class="scene-balloon balloon-2">🎈</span>
        <span class="scene-ferris">🎡</span>
        <span class="scene-star star-1">⭐</span>
      </template>
      <template v-else-if="category?.scene === 'bedroom'">
        <span class="scene-bed">🛏️</span>
        <span class="scene-lamp">💡</span>
        <span class="scene-hanger hanger-1">👕</span>
        <span class="scene-hanger hanger-2">👗</span>
        <span class="scene-moon">🌙</span>
      </template>
      <template v-else-if="category?.scene === 'heart'">
        <span class="scene-heart heart-1">❤️</span>
        <span class="scene-heart heart-2">💛</span>
        <span class="scene-heart heart-3">💙</span>
        <span class="scene-smiley smiley-1">😊</span>
        <span class="scene-smiley smiley-2">🥰</span>
      </template>
    </div>

    <!-- 主要内容区 -->
    <main class="learn-main">
      <!-- 步骤翻页过渡包装 -->
      <Transition :name="stepTransitionName" mode="out-in">
      <div :key="'step-' + currentRound">
      <!-- Step 0: 分类介绍 -->
      <div v-if="currentRound === 'intro'" class="step-intro anim-fade-up">
        <div class="intro-scene">
          <span class="intro-emoji">{{ category?.emoji }}</span>
          <h2 class="intro-title">{{ category?.name }}</h2>
          <p class="intro-subtitle">{{ category?.nameEn }}</p>
        </div>
        <button class="btn-start" @click="startLearning">
          🐯 开始探险！
        </button>
      </div>

      <!-- ===== L1 & L2 通用：Round 0 集体输入 ===== -->
      <div v-else-if="currentRound === 0" class="step-input-phase anim-fade-up">
        <div class="step-badge">第 1 步 · 看一看 听一听</div>
        <div class="input-carousel">
          <Transition name="card-slide" mode="out-in">
            <div :key="inputWordIndex" class="input-card" @click="advanceInputWord">
              <button class="btn-favorite" :class="{ active: isFavorite(currentInputWord?.id) }"
                @click.stop="handleFavorite(currentInputWord)" :aria-label="isFavorite(currentInputWord?.id) ? '取消收藏' : '收藏'">
                {{ isFavorite(currentInputWord?.id) ? '❤️' : '🤍' }}
              </button>
              <span class="input-emoji">{{ currentInputWord?.emoji }}</span>
              <span class="input-zh" v-if="showChinese">{{ currentInputWord?.zh }}</span>
            </div>
          </Transition>
        </div>
        <div class="input-nav">
          <button class="btn-speaker" :class="{ active: isSpeaking }" @click="playInputWord">
            🔊 <span>{{ isSpeaking ? '朗读中...' : '点我听' }}</span>
          </button>
          <button class="btn-hint" @click="showChinese = !showChinese">
            💡 <span>{{ showChinese ? currentInputWord?.zh : '中文提示' }}</span>
          </button>
        </div>
        <div class="input-dots">
          <span v-for="(w, i) in groupWords" :key="w.id" class="input-dot"
            :class="{ active: i === inputWordIndex, done: i < inputWordIndex }">
            {{ w.emoji }}
          </span>
        </div>
        <button class="btn-next" @click="nextRound">听懂了！→</button>
      </div>

      <!-- ===== L1 & L2 通用：Round 1 听力测试 ===== -->
      <div v-else-if="currentRound === 1" class="step-test anim-fade-up">
        <div class="step-badge">第 2 步 · 找一找</div>
        <p class="test-prompt">
          <span class="prompt-icon"></span>
          <span class="prompt-text">哪个是…</span>
        </p>
        <div class="test-grid" :class="testGridClass">
          <button v-for="opt in testOptions" :key="opt.id" class="test-option"
            :class="{
              correct: answeredId === opt.id && opt.id === testTargetWord?.id,
              wrong: answeredId === opt.id && opt.id !== testTargetWord?.id,
              dimmed: answeredId && opt.id !== answeredId && opt.id !== testTargetWord?.id
            }"
            :disabled="!!answeredId"
            @click="handleTestAnswer(opt)">
            <span class="opt-emoji">{{ opt.emoji }}</span>
          </button>
        </div>
        <div v-if="feedbackText" class="test-feedback" :class="testFeedbackClass">
          <span>{{ feedbackText }}</span>
        </div>
        <div class="test-progress">
          <span v-for="(w, i) in groupWords" :key="'tp-' + w.id" class="test-dot"
            :class="{ done: i < testRoundIndex, active: i === testRoundIndex }">
            {{ i < testRoundIndex ? '✓' : w.emoji }}
          </span>
        </div>
      </div>

      <!-- ===== L2 only: Round 2 集体跟读 ===== -->
      <div v-else-if="currentRound === 2 && !isL1" class="step-speak-phase anim-fade-up">
        <div class="step-badge">第 3 步 · 跟我读</div>
        <div class="speak-carousel">
          <Transition name="card-slide" mode="out-in">
            <div :key="speakWordIndex" class="speak-card-item">
              <span class="speak-emoji">{{ currentSpeakWord?.emoji }}</span>
              <span class="speak-word">{{ currentSpeakWord?.en }}</span>
              <span class="speak-zh">{{ currentSpeakWord?.zh }}</span>
            </div>
          </Transition>
        </div>
        <div class="speak-mic" :class="{ recording: isRecording, done: speakRoundDone }" @click="toggleRecord">
          <span class="mic-icon">{{ speakRoundDone ? '✅' : '🎤' }}</span>
          <span class="mic-label">{{ isRecording ? '正在听…' : (speakRoundDone ? '读得棒！' : '点我读一读') }}</span>
          <div class="mic-waves" v-if="isRecording">
            <span v-for="i in 4" :key="i" :style="{ animationDelay: i * 0.15 + 's' }"></span>
          </div>
        </div>
        <Transition name="pop">
          <div v-if="speakFeedback" class="step-feedback" :class="speakFeedbackClass">
            {{ speakFeedback }}
          </div>
        </Transition>
        <div class="speak-actions">
          <button class="btn-replay" @click="playCurrentSpeakWord">🔊 再听一次</button>
        </div>
        <div class="speak-dots">
          <span v-for="(w, i) in groupWords" :key="'sp-' + w.id" class="speak-dot"
            :class="{ active: i === speakWordIndex, done: i < speakWordIndex }">
            {{ w.emoji }}
          </span>
        </div>
      </div>

      <!-- ===== L2 only: Round 3 独立回忆（抽测） ===== -->
      <div v-else-if="currentRound === 3 && !isL1" class="step-recall-phase anim-fade-up">
        <div class="step-badge">第 4 步 · 自己说</div>
        <div class="recall-card">
          <span class="recall-emoji">{{ recallTarget?.emoji }}</span>
          <div v-if="recallPhase === 'waiting'" class="recall-timer">
            <span class="timer-dots">
              <span class="dot" :class="{ active: waitDot >= 0 }"></span>
              <span class="dot" :class="{ active: waitDot >= 1 }"></span>
              <span class="dot" :class="{ active: waitDot >= 2 }"></span>
              <span class="dot" :class="{ active: waitDot >= 3 }"></span>
              <span class="dot" :class="{ active: waitDot >= 4 }"></span>
            </span>
            <span class="timer-text">试着说出来？</span>
          </div>
          <div v-else class="recall-answered">
            <span class="recall-word">{{ recallTarget?.en }}</span>
            <button class="btn-replay" @click="playRecallWord">🔊</button>
          </div>
        </div>
        <Transition name="pop">
          <div v-if="recallFeedback" class="step-feedback" :class="recallFeedbackClass">
            {{ recallFeedback }}
          </div>
        </Transition>
        <div class="recall-actions">
          <button class="btn-speak-done" :disabled="isRecallTransitioning" @click="handleRecallDone">
            ⭐ 我说出来了！
          </button>
          <button class="btn-skip-say" :disabled="isRecallTransitioning" @click="handleRecallSkip">跳过 →</button>
        </div>
        <div class="recall-progress">
          <span>抽测 {{ recallIndex + 1 }} / {{ recallTargets.length }}</span>
        </div>
      </div>
      </div>
      </Transition>

      <!-- 宠物学习伴侣气泡 -->
      <PetCompanion
        :show-bubble="companion.showPetBubble"
        :reaction="companion.activeReaction"
      />

      <!-- 完成弹窗 -->
      <div v-if="showComplete" class="complete-overlay anim-fade-in" @click.self="goHome">
        <div class="complete-modal anim-bounce">
          <span class="complete-icon">🏆</span>
          <h2 class="complete-title">太厉害了！</h2>
          <p class="complete-text">"{{ category?.name }}" 的秘密都被你发现啦！</p>
          <div class="complete-stars">
            <span v-for="i in starRating" :key="i" class="star star-active anim-fade-up"
              :style="{ animationDelay: i * 0.2 + 's' }">⭐</span>
            <span v-for="i in (3 - starRating)" :key="'e' + i" class="star star-empty">☆</span>
          </div>
          <div class="complete-actions">
            <button class="btn-complete-home" @click="goHome">🏠 回到首页</button>
            <button class="btn-complete-again" @click="restart">🔄 再学一次</button>
          </div>
        </div>
      </div>
    </main>

    <!-- 呦呦吉祥物 -->
    <footer class="learn-footer">
      <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showYoyoStars" :is-speaking="isRecording" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete, sfxFavorite } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import { playFeedback, triggerPerfectClear, triggerMilestone } from '@/composables/useFeedback'
import { getCategoryById, ALL_WORDS, ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import { useYoyoCopy } from '@/composables/useYoyoCopy'
import { generateAIBubble, getDynamicTone, generateReviewFeedback } from '@/composables/useYoyoAI'
import { useThumbsUp } from '@/composables/useThumbsUp'
import { usePetCompanion } from '@/composables/usePetCompanion.js'
import PetCompanion from '@/components/PetCompanion.vue'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()
const { speak, isSpeaking, stop, playAudio } = useSpeech()
const yoyoCopy = useYoyoCopy(store)
const { toggleFavorite, isFavorite, recordWordLearned, triggerAutoLike } = useThumbsUp()
const companion = usePetCompanion()

// ============ 数据初始化 ============
const categoryId = computed(() => route.params.categoryId || store.unlockedCategoryList[0]?.id)
const category = computed(() => getCategoryById(categoryId.value))
const words = computed(() => category.value?.words || [])
const isL1 = computed(() => category.value?.level === 1)

const sceneColor = computed(() => {
  const map = {
    forest: '#A8D8B9', orchard: '#FFD4A3', rainbow: '#D4C5F0', mirror: '#B5E4E8', home: '#FFF0D4',
    kitchen: '#FFCCBC', city: '#B0BEC5', outdoor: '#C8E6C9', classroom: '#F3E5F5',
    playground: '#FFF9C4', bedroom: '#E1D5E7', heart: '#FFCDD2'
  }
  return map[category.value?.scene] || '#FFF8F0'
})

// ============ 分组模型 ============
const GROUP_SIZE_L1 = 3
const GROUP_SIZE_L2 = 4

const groups = computed(() => {
  const size = isL1.value ? GROUP_SIZE_L1 : GROUP_SIZE_L2
  const result = []
  for (let i = 0; i < words.value.length; i += size) {
    result.push(words.value.slice(i, i + size))
  }
  return result
})

// ============ 状态 ============
const currentGroupIndex = ref(0)
const currentRound = ref('intro') // 'intro' | 0 | 1 | 2 | 3
const previousRound = ref('intro') // 用于步骤翻页过渡方向判断

// 步骤过渡方向：前进 slide-forward，后退 slide-backward
const stepTransitionName = computed(() => {
  const order = ['intro', 0, 1, 2, 3]
  const fromIdx = order.indexOf(previousRound.value)
  const toIdx = order.indexOf(currentRound.value)
  return toIdx >= fromIdx ? 'step-forward' : 'step-backward'
})

// Round 0: 集体输入
const inputWordIndex = ref(0)
const showChinese = ref(false)

// Round 1: 听力测试
const testRoundIndex = ref(0)
const answeredId = ref(null)
const feedbackText = ref('')
const testFeedbackClass = ref('')

// Round 2: 集体跟读 (L2 only)
const speakWordIndex = ref(0)
const speakRoundDone = ref(false)
const isRecording = ref(false)
const speakFeedback = ref('')
const speakFeedbackClass = ref('')

// Round 3: 独立回忆 (L2 only)
const recallTargets = ref([])
const recallIndex = ref(0)
const recallPhase = ref('waiting')
const isRecallTransitioning = ref(false)
const waitDot = ref(0)
const recallFeedback = ref('')
const recallFeedbackClass = ref('')

const showComplete = ref(false)
const showYoyoStars = ref(false)
const yoyoMood = ref('idle')
const yoyoBubble = ref('')

// 连击追踪（用于反馈分级 L2→L3→L4→L5）
const testCombo = ref(0)
const testWrongCount = ref(0) // P3-3: 答错计数（用于动态难度调节）
const groupCorrectCount = ref(0) // 当前组内答对总数

// 自动重读定时器
let autoReplayTimer = null
let autoReplayCount = 0
const AUTO_REPLAY_MAX = 10

// ============ Computed ============
const groupWords = computed(() => groups.value[currentGroupIndex.value] || [])
const currentInputWord = computed(() => groupWords.value[inputWordIndex.value])
const testTargetWord = computed(() => groupWords.value[testRoundIndex.value])
const currentSpeakWord = computed(() => groupWords.value[speakWordIndex.value])
const recallTarget = computed(() => recallTargets.value[recallIndex.value])

const progressPercent = computed(() => {
  const totalGroups = groups.value.length
  if (currentRound.value === 'intro') return 0
  if (typeof currentRound.value === 'number') {
    const roundsPerGroup = isL1.value ? 2 : 4
    const base = currentGroupIndex.value * roundsPerGroup
    return Math.min(((base + currentRound.value) / (totalGroups * roundsPerGroup)) * 100, 100)
  }
  return 0
})

const progressLabel = computed(() => {
  if (currentRound.value === 'intro') return `准备开始`
  const done = currentGroupIndex.value
  const total = groups.value.length
  return `第 ${done + 1} / ${total} 组`
})

const showSkipBtn = computed(() => {
  if (!isL1.value) {
    return currentRound.value === 2 || currentRound.value === 3
  }
  return false
})

// L1 前2轮用 1x2 网格，之后 2x2
const useSimpleGrid = computed(() => {
  const totalTested = currentGroupIndex.value * groupWords.value.length + testRoundIndex.value
  return totalTested < 2
})
const testGridClass = computed(() => useSimpleGrid.value ? 'grid-1x2' : 'grid-2x2')

// 测试选项
const testOptions = computed(() => {
  if (!testTargetWord.value) return []
  const correct = testTargetWord.value
  const count = useSimpleGrid.value ? 2 : 4
  const pool = category.value?.level === 2 ? ALL_L2_WORDS : ALL_L1_WORDS
  const others = pool.filter(w => w.id !== correct.id)
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, count - 1)
  const options = [correct, ...shuffled]
  return options.sort(() => Math.random() - 0.5)
})

const starRating = computed(() => {
  if (!category.value) return 3
  const totalWords = words.value.length
  const mastered = words.value.filter(w => {
    const record = store.getWordRecord(w.id)
    return (record?.stepComplete?.length || 0) >= 2
  }).length
  const ratio = mastered / totalWords
  if (ratio >= 0.8) return 3
  if (ratio >= 0.4) return 2
  return 1
})

// ============ 方法 ============
function playWord(word) {
  if (!word) return
  speak(word.en, { rate: 0.7 })
}

function playInputWord() {
  playWord(currentInputWord.value)
}

function playCurrentSpeakWord() {
  playWord(currentSpeakWord.value)
}

function playRecallWord() {
  playWord(recallTarget.value)
}

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text
  showYoyoStars.value = stars
}

// 开始学习
function startLearning() {
  resetAutoReplay()
  previousRound.value = 'intro'
  currentRound.value = 0
  inputWordIndex.value = 0
  showChinese.value = false
  setYoyo('idle', `今天我们来认识 ${category.value?.name}！`)
  setTimeout(() => {
    if (currentRound.value === 0 && currentInputWord.value) {
      playInputWord()
      setYoyo('idle', yoyoCopy.getLearnStepBubble(0, 0))
    }
  }, 500)
}

// 下一轮
function nextRound() {
  const maxRound = isL1.value ? 1 : 3

  previousRound.value = currentRound.value

  if (currentRound.value === 0) {
    // 集体输入 → 听力测试
    currentRound.value = 1
    testRoundIndex.value = 0
    answeredId.value = null
    feedbackText.value = ''
    testFeedbackClass.value = ''
    handleRoundEntry()
  } else if (currentRound.value === 1) {
    if (isL1.value) {
      // L1: 测试完 → 下一组或完成
      completeGroup()
    } else {
      // L2: 测试 → 跟读
      currentRound.value = 2
      speakWordIndex.value = 0
      speakRoundDone.value = false
      speakFeedback.value = ''
      speakFeedbackClass.value = ''
      handleRoundEntry()
    }
  } else if (currentRound.value === 2) {
    // L2: 跟读 → 回忆
    currentRound.value = 3
    // 随机选 2-3 个词抽测
    const count = groupWords.value.length >= 3 ? 3 : 2
    const shuffled = [...groupWords.value].sort(() => Math.random() - 0.5)
    recallTargets.value = shuffled.slice(0, count)
    recallIndex.value = 0
    recallPhase.value = 'waiting'
    isRecallTransitioning.value = false
    recallFeedback.value = ''
    recallFeedbackClass.value = ''
    handleRoundEntry()
  } else if (currentRound.value === 3) {
    // L2: 回忆完 → 下一组或完成
    completeGroup()
  }
}

function handleRoundEntry() {
  clearAutoReplayTimer()

  if (currentRound.value === 0) {
    // 集体输入：播放当前词
    setYoyo('idle', '看一看，听一听~')
    setTimeout(() => playInputWord(), 300)
  } else if (currentRound.value === 1) {
    // 听力测试 — 情境化文案
    setYoyo('thinking', yoyoCopy.getLearnStepBubble(1, 0))
    startAutoReplayTimer()
    setTimeout(() => {
      speak(`Which one is ${testTargetWord.value.en}?`, { rate: 0.8 })
    }, 300)
  } else if (currentRound.value === 2) {
    // L2 集体跟读 — 情境化文案
    setYoyo('encourage', yoyoCopy.getLearnStepBubble(2, 0))
    setTimeout(() => {
      speak('跟我一起读！', { rate: 0.9 })
      setTimeout(() => playCurrentSpeakWord(), 800)
    }, 400)
  } else if (currentRound.value === 3) {
    // L2 独立回忆 — 情境化文案
    setYoyo('thinking', yoyoCopy.getLearnStepBubble(3, 0))
    startRecallWaitTimer()
  }
}

// 收藏/取消收藏单词
function handleFavorite(word) {
  if (!word?.id) return
  const result = toggleFavorite(word.id, { en: word.en, emoji: word.emoji })
  setYoyo(result.favorited ? 'excited' : 'comfort', result.favorited ? '❤️ 收藏啦！' : '已取消收藏')
  sfxFavorite()
}

// 集体输入：点击卡片切换下一个词
function advanceInputWord() {
  if (inputWordIndex.value < groupWords.value.length - 1) {
    stop() // 停止当前TTS
    inputWordIndex.value++
    // 新词的TTS 由 watch 自动触发
  }
}

// Round 1: 测试答案处理（v5.0 反馈分级集成）
function handleTestAnswer(opt) {
  if (answeredId.value) return
  answeredId.value = opt.id
  clearAutoReplayTimer()

  const isCorrect = opt.id === testTargetWord.value?.id

  if (isCorrect) {
    testCombo.value++
    groupCorrectCount.value++

    // 计算反馈级别：L2基线 → L3(连击3) → L4(连击5+) → L5(全对通关)
    const groupSize = groupWords.value.length
    const allCorrectInGroup = groupCorrectCount.value >= groupSize && testCombo.value >= groupSize
    let level = 2
    if (testCombo.value >= 5) level = 4
    else if (testCombo.value >= 3) level = 3
    if (allCorrectInGroup && groupSize >= 3) level = Math.max(level, 4)

    playFeedback(level, {
      mascot: yoyoMood,
      isCorrect: true,
      combo: testCombo.value,
      container: document.body
    })

    // 宠物学习伴侣：答对反馈
    companion.onAnswerCorrect()

    // P3-3: 动态难度调节 — 根据表现调整呦呦语气
    const accuracy = testCombo.value / Math.max(1, testCombo.value + testWrongCount.value)
    const tone = getDynamicTone(accuracy, testCombo.value, store.masteredWordCount || 0)
    yoyoMood.value = tone.yoyoMood

    // 文案跟随动态级别
    feedbackText.value = tone.level >= 4 ? '🔥 AMAZING!' : (tone.level >= 3 ? '🌟 Excellent!' : 'Great!')
    testFeedbackClass.value = 'feedback-correct'

    store.completeWordStep(testTargetWord.value?.id, 2)
    store.addStars(1)

    // 里程碑检测（全局已学词数）
    const todayLearned = store.todayLearnedCount || 0
    if (todayLearned > 0 && [5, 10, 20, 30, 34].includes(todayLearned)) {
      // 30/34 词里程碑额外奖励星星
      if (todayLearned >= 30) store.addStars(5)
      if (todayLearned === 34) {
        store.addStars(10) // 超级学霸额外 10 星
      }
      // 触发点赞奖励（通过 useThumbsUp 系统）
      try { recordWordLearned() } catch(e) {}
      setTimeout(() => triggerMilestone(todayLearned, { mascot: yoyoMood }), 600)
      // 宠物学习伴侣：里程碑庆祝
      companion.onMilestone({ text: `🎉 ${todayLearned} words learned!` })
    }

    setTimeout(() => {
      answeredId.value = null
      feedbackText.value = ''
      testFeedbackClass.value = ''
      if (testRoundIndex.value < groupWords.value.length - 1) {
        testRoundIndex.value++
        handleRoundEntry()
      } else {
        groupCorrectCount.value = 0 // 重置组内计数
        nextRound()
      }
    }, 1200)
  } else {
    testCombo.value = 0 // 答错重置连击
    testWrongCount.value++ // P3-3: 累计答错次数
    playFeedback(1, { mascot: yoyoMood, isCorrect: false })

    // 宠物学习伴侣：答错安慰
    companion.onAnswerWrong()

    // P3-3: 动态难度调节 — 根据表现调整呦呦语气
    const tone = getDynamicTone(0.3, 0, store.masteredWordCount || 0)
    yoyoMood.value = tone.yoyoMood

    feedbackText.value = 'Try again!'
    testFeedbackClass.value = 'feedback-wrong'
    setTimeout(() => {
      answeredId.value = null
      feedbackText.value = ''
      testFeedbackClass.value = ''
      startAutoReplayTimer()
    }, 1500)
  }
}

// 自动重读
function startAutoReplayTimer() {
  clearAutoReplayTimer()
  if (autoReplayCount >= AUTO_REPLAY_MAX) return
  autoReplayTimer = setTimeout(() => {
    if (currentRound.value === 1 && !answeredId.value) {
      autoReplayCount++
      if (testTargetWord.value) playWord(testTargetWord.value)
      startAutoReplayTimer()
    }
  }, 4000)
}

function clearAutoReplayTimer() {
  if (autoReplayTimer) {
    clearTimeout(autoReplayTimer)
    autoReplayTimer = null
  }
}

function resetAutoReplay() {
  autoReplayCount = 0
  clearAutoReplayTimer()
}

// Round 2: 跟读
function toggleRecord() {
  if (isRecording.value || speakRoundDone.value) return
  isRecording.value = true
  setYoyo('thinking', '我在听你说…')

  setTimeout(() => {
    isRecording.value = false
    speakRoundDone.value = true
    playFeedback(2, { mascot: yoyoMood, isCorrect: true, container: document.body })
    speakFeedback.value = '读得真棒！'
    speakFeedbackClass.value = 'feedback-correct'
    store.completeWordStep(currentSpeakWord.value?.id, 3)
    store.addStars(1)
  }, 2000)
}

// Round 3: 回忆等待计时器
let waitTimer = null
function startRecallWaitTimer() {
  recallPhase.value = 'waiting'
  waitDot.value = 0
  waitTimer = setInterval(() => {
    waitDot.value++
    if (waitDot.value >= 5) {
      clearInterval(waitTimer)
      waitTimer = null
      recallPhase.value = 'feedback'
      isRecallTransitioning.value = true
      if (recallTarget.value) playWord(recallTarget.value)
      recallFeedback.value = recallTarget.value?.zh || ''
      recallFeedbackClass.value = 'feedback-reveal'
      setTimeout(() => setYoyo('encourage', yoyoCopy.getWrongBubble()), 400)
      setTimeout(() => advanceRecall(false), 1500)
    }
  }, 1000)
}

function handleRecallDone() {
  if (recallPhase.value !== 'waiting') return
  isRecallTransitioning.value = true
  recallPhase.value = 'feedback'
  clearInterval(waitTimer)
  waitTimer = null
  playFeedback(3, { mascot: yoyoMood, isCorrect: true, combo: 0, container: document.body })
  recallFeedback.value = '太棒了！'
  recallFeedbackClass.value = 'feedback-correct'
  advanceRecall(true)
}

function handleRecallSkip() {
  if (recallPhase.value !== 'waiting') return
  isRecallTransitioning.value = true
  recallPhase.value = 'feedback'
  clearInterval(waitTimer)
  waitTimer = null
  recallFeedback.value = '好的，我们继续！'
  recallFeedbackClass.value = 'feedback-reveal'
  setTimeout(() => setYoyo('idle', '没关系，下次再来！'), 400)
  advanceRecall(false)
}

let isAdvancing = false
function advanceRecall(earnedStars) {
  if (isAdvancing) return
  // 额外保护：如果 recallPhase 已不是 waiting/feedback 说明被 skip 覆盖了
  if (recallPhase.value !== 'waiting' && recallPhase.value !== 'feedback') return
  isAdvancing = true

  store.completeWordStep(recallTarget.value?.id, 4)
  if (earnedStars) store.addStars(2)

  if (recallIndex.value < recallTargets.value.length - 1) {
    setTimeout(() => {
      recallIndex.value++
      recallPhase.value = 'waiting'
      isRecallTransitioning.value = false
      recallFeedback.value = ''
      recallFeedbackClass.value = ''
      isAdvancing = false
      handleRoundEntry()
    }, 1500)
  } else {
    // 本轮组完成
    setTimeout(() => {
      isAdvancing = false
      completeGroup()
    }, 800)
  }
}

// 完成一组
function completeGroup() {
  // 标记组内所有词已完成 Step 2（听力测试）
  groupWords.value.forEach(w => {
    store.completeWordStep(w.id, 2)
  })

  if (currentGroupIndex.value < groups.value.length - 1) {
    setTimeout(() => {
      resetAutoReplay()
      currentGroupIndex.value++
      currentRound.value = 0
      inputWordIndex.value = 0
      testRoundIndex.value = 0
      speakWordIndex.value = 0
      speakRoundDone.value = false
      showChinese.value = false
      store.incrementTodayLearned()
      handleRoundEntry()
    }, 1500)
  } else {
    // 全部分组完成
    triggerPerfectClear({ container: document.body, mascot: yoyoMood })
    setTimeout(() => {
      words.value.forEach(w => store.markWordMastered(w.id))
      store.unlockNextCategory()
      showComplete.value = true
      setYoyo('celebrate', yoyoCopy.getCompleteBubble(category.value?.name || '本节'), true)
      // 宠物学习伴侣：课程完成庆祝
      companion.onLessonComplete({ category: category.value?.name })
    }, 800)
  }
}

// 跳过（L2 的 Step 3/4）
function skipStep() {
  if (currentRound.value === 2) {
    // 跳过跟读 → 回忆
    // 清除 watch 可能触发的自动切换
    speakRoundDone.value = false
    speakFeedback.value = ''
    speakFeedbackClass.value = ''
    nextRound()
  } else if (currentRound.value === 3) {
    // 跳过回忆 → 下一组
    // 清理所有计时器
    clearInterval(waitTimer)
    waitTimer = null
    isRecallTransitioning.value = false
    recallFeedback.value = '好的，我们继续！'
    recallFeedbackClass.value = 'feedback-reveal'
    setYoyo('idle', '没关系，下次再来！')

    // 直接调用 completeGroup，避免与 timer 回调中的 advanceRecall 冲突
    completeGroup()
  }
}

function restart() {
  currentGroupIndex.value = 0
  currentRound.value = 'intro'
  inputWordIndex.value = 0
  testRoundIndex.value = 0
  speakWordIndex.value = 0
  speakRoundDone.value = false
  showComplete.value = false
  answeredId.value = null
  feedbackText.value = ''
  showChinese.value = false
  recallTargets.value = []
  recallIndex.value = 0
  setYoyo('idle', '准备好了吗？我们再学一次！')
}

function goHome() {
  stop()
  router.push('/')
}

function handleBack() {
  stop()
  router.back()
}

onMounted(() => {
  store.loadFromDB()
  setYoyo('summon', `嘿！今天呦呦带你去${category.value?.name}探险，准备好了吗？`)
})

onUnmounted(() => {
  stop()
  clearInterval(waitTimer)
  clearAutoReplayTimer()
})

// Watch: 集体输入自动前进（每词播完后自动切下一个）
watch(inputWordIndex, (newIdx) => {
  if (currentRound.value === 0) {
    // 切换新词后自动播放TTS
    setTimeout(() => {
      if (currentRound.value !== 0 || inputWordIndex.value !== newIdx) return
      playInputWord()
    }, 300)
    // 不是最后一个词时，播完后自动切下一个
    if (newIdx < groupWords.value.length - 1) {
      setTimeout(() => {
        if (currentRound.value !== 0 || inputWordIndex.value !== newIdx) return
        inputWordIndex.value++
      }, 2200)
    }
  }
})

// Watch: 跟读完自动前进到下一个词
watch(speakRoundDone, (done) => {
  if (done && currentRound.value === 2) {
    if (speakWordIndex.value < groupWords.value.length - 1) {
      // 还有下一个词：自动切换
      setTimeout(() => {
        // 保护：可能用户已经跳到下一轮了
        if (currentRound.value !== 2) return
        speakWordIndex.value++
        speakRoundDone.value = false
        speakFeedback.value = ''
        speakFeedbackClass.value = ''
        setTimeout(() => {
          if (currentRound.value !== 2) return
          playCurrentSpeakWord()
          setYoyo('encourage', yoyoCopy.getLearnStepBubble(2, 0))
        }, 400)
      }, 1500)
    } else {
      // 组内所有词都跟读完了，自动进入 Round 3
      setTimeout(() => {
        if (currentRound.value !== 2) return
        nextRound()
      }, 1500)
    }
  }
})
</script>

<style scoped>
.learn-page {
  width: 100vw; height: 100dvh;
  display: flex; flex-direction: column;
  background: linear-gradient(180deg, var(--scene-color) 0%, var(--bg-main) 60%);
  overflow: hidden;
}

/* ===== 顶部栏 ===== */
.learn-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  z-index: 10;
}

.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover { background: var(--color-primary-light); transform: scale(1.05); }
.btn-back .back-icon { font-size: 1.3rem; }

.btn-skip {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-hint);
  background: none; border: none;
  cursor: pointer; transition: all 0.2s;
}
.btn-skip:hover { background: var(--border-light); }

.header-info {
  display: flex; align-items: center; gap: var(--space-sm);
  font-size: var(--font-size-lg); font-weight: 700; color: var(--text-primary);
}
.category-emoji { font-size: 1.5rem; }
.word-progress { font-size: var(--font-size-sm); color: var(--text-hint); font-weight: 400; }

/* ===== 进度条 ===== */
.progress-track {
  height: 64px;
  position: relative;
  margin: 0 var(--space-2xl) 0;
  display: flex;
  align-items: center;
}
.progress-fill {
  height: 12px;
  background: linear-gradient(90deg, var(--color-primary), #FF6B2B);
  border-radius: 6px;
  transition: width 0.5s var(--ease-smooth);
  position: absolute;
  left: 20px;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(255, 140, 66, 0.3);
  z-index: 0;
}
.progress-nodes {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 4px;
  z-index: 1;
}
.node {
  width: clamp(32px, 8vw, 48px);
  height: clamp(32px, 8vw, 48px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  border: 3px solid transparent;
  box-shadow: 0 3px 12px rgba(0,0,0,0.15);
  flex-shrink: 0;
}
.node.pending {
  background: rgba(255,255,255,0.7);
  border-color: rgba(255,255,255,0.8);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.node.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-color: #fff;
  box-shadow: 0 0 24px var(--color-primary), 0 6px 20px rgba(0,0,0,0.25);
  transform: scale(1.2);
  animation: nodePulse 2s ease-in-out infinite;
}
.node.done {
  background: linear-gradient(135deg, var(--color-success), #43A047);
  border-color: #fff;
  box-shadow: 0 3px 12px rgba(76,175,80,0.35);
}
.node-icon {
  font-size: clamp(14px, 3.5vw, 22px);
  font-weight: 700;
  color: rgba(0,0,0,0.3);
  transition: all 0.3s;
}
.node.done .node-icon {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.node.active .node-icon {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  animation: iconBounce 1.5s ease-in-out infinite;
}
@keyframes nodePulse {
  0%, 100% { box-shadow: 0 0 24px var(--color-primary), 0 6px 20px rgba(0,0,0,0.25); }
  50% { box-shadow: 0 0 36px var(--color-primary), 0 8px 28px rgba(0,0,0,0.35); }
}
@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* ===== 主要内容区 ===== */
.learn-main {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: var(--space-xl); padding-top: var(--space-2xl); overflow: auto;
}

/* ===== Step 0: 分类介绍 ===== */
.step-intro { text-align: center; position: relative; z-index: 1; }
.intro-scene { margin-bottom: var(--space-2xl); position: relative; }
.intro-emoji { 
  font-size: 5rem; display: block; margin-bottom: var(--space-lg); 
  animation: introEmojiFloat 3s ease-in-out infinite;
}
@keyframes introEmojiFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-3deg); }
  75% { transform: translateY(-5px) rotate(3deg); }
}
.intro-title { 
  font-size: var(--font-size-3xl); color: var(--text-primary); margin-bottom: var(--space-sm); 
  position: relative;
}
.intro-title::after {
  content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
  width: 60%; height: 3px; border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}
.intro-subtitle { font-size: var(--font-size-lg); color: var(--text-secondary); }
.btn-start {
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; font-size: var(--font-size-xl); font-weight: 700;
  border-radius: var(--radius-full); box-shadow: 0 4px 20px rgba(255, 140, 66, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-start::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
}
.btn-start:hover::after { animation: shimmer 1.5s infinite; }
.btn-start:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(255, 140, 66, 0.5); }
.btn-start:active { transform: scale(0.98); }

/* ===== Step 徽章 ===== */
.step-badge {
  display: inline-block; padding: var(--space-xs) var(--space-lg);
  background: rgba(255,255,255,0.9); border-radius: var(--radius-full);
  font-size: var(--font-size-sm); font-weight: 700; color: var(--color-primary-dark);
  margin-bottom: var(--space-xl); box-shadow: var(--shadow-card);
  animation: badgeFloat 2.5s ease-in-out infinite;
}
@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ===== Round 0: 集体输入 ===== */
.step-input-phase { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); position: relative; z-index: 1; }
.input-carousel {
  width: 240px; height: 240px;
  display: flex; align-items: center; justify-content: center;
}
.input-card {
  width: 240px; height: 240px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: var(--space-md);
  background: var(--bg-card); border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  position: relative; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.6);
}
/* 收藏按钮 */
.btn-favorite {
  position: absolute; top: 12px; right: 12px;
  width: 40px; height: 40px; border-radius: 50%;
  border: none; background: rgba(255,255,255,0.9);
  font-size: 1.2rem; cursor: pointer; z-index: 2;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, background 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.btn-favorite:hover { transform: scale(1.15); }
.btn-favorite:active { transform: scale(0.9); }
.btn-favorite.active {
  background: rgba(255, 182, 193, 0.9);
  animation: heartPop 0.4s ease-out;
}
@keyframes heartPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
.input-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(255,140,66,0.08), transparent 60%);
  pointer-events: none;
}
.input-emoji { 
  font-size: 5rem; 
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}
.input-card:hover .input-emoji { transform: scale(1.15) rotate(-5deg); }
.input-zh { font-size: var(--font-size-lg); color: var(--text-secondary); }
.input-nav { display: flex; gap: var(--space-md); }
.input-dots { display: flex; gap: var(--space-sm); }
.input-dot {
  font-size: 1.5rem;
  opacity: 0.3;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.input-dot.active {
  opacity: 1;
  transform: scale(1.3);
  animation: dotPop 0.3s var(--ease-bounce);
}
.input-dot.done {
  opacity: 0.6;
  filter: grayscale(0.5);
}

/* ===== Round 1: 听力测试 ===== */
.step-test { display: flex; flex-direction: column; align-items: center; gap: var(--space-lg); position: relative; z-index: 1; }
.test-prompt { 
  font-size: var(--font-size-2xl); color: var(--text-primary); 
  display: flex; align-items: center; gap: var(--space-sm);
}
.prompt-icon { font-size: 2rem; animation: promptWiggle 2s ease-in-out infinite; }
@keyframes promptWiggle {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-10deg); }
  30% { transform: rotate(10deg); }
  45% { transform: rotate(-5deg); }
  60% { transform: rotate(5deg); }
}
.test-grid { display: grid; gap: var(--space-md); width: 400px; }
.grid-1x2 { grid-template-columns: repeat(2, 1fr); }
.grid-2x2 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); }
.test-option {
  min-height: 140px; display: flex; align-items: center; justify-content: center;
  background: var(--bg-card); border: 3px solid var(--border-light);
  border-radius: var(--radius-xl); cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 3.5rem; position: relative; overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.test-option::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,140,66,0.08), transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.test-option:hover:not(:disabled)::before { opacity: 1; }
.test-option:hover:not(:disabled) { 
  border-color: var(--color-primary); 
  transform: translateY(-4px) scale(1.03); 
  box-shadow: 0 8px 24px rgba(255,140,66,0.15);
}
.test-option:active:not(:disabled) { transform: scale(0.97); }
.test-option .opt-emoji { 
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.1));
}
.test-option:hover:not(:disabled) .opt-emoji { transform: scale(1.15) rotate(-5deg); }
.test-option.correct { 
  border-color: var(--color-success); background: linear-gradient(135deg, #E8F5E9, #C8E6C9); 
  animation: optionCorrectBounce 0.5s var(--ease-bounce); 
  box-shadow: 0 6px 24px rgba(76,175,80,0.25);
}
.test-option.correct .opt-emoji { animation: emojiCelebrate 0.6s var(--ease-bounce); }
.test-option.wrong { border-color: var(--color-danger); background: #FFEBEE; animation: shake 0.4s ease; }
.test-option.dimmed { opacity: 0.3; transform: scale(0.95); }

@keyframes optionCorrectBounce {
  0% { transform: scale(0.95); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes emojiCelebrate {
  0% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.4) rotate(10deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.test-feedback { 
  font-size: var(--font-size-xl); font-weight: 700; padding: var(--space-sm) var(--space-xl); 
  border-radius: var(--radius-full); 
  animation: feedbackBounce 0.4s var(--ease-bounce);
}
.feedback-correct { color: var(--color-success); background: #E8F5E9; }
.feedback-wrong { color: var(--color-danger); background: #FFEBEE; animation: shake 0.4s ease; }
@keyframes feedbackBounce {
  0% { transform: scale(0.5) translateY(10px); opacity: 0; }
  60% { transform: scale(1.1) translateY(-2px); }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.test-progress { display: flex; gap: var(--space-sm); margin-top: var(--space-md); }
.test-dot {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem;
  background: rgba(255,255,255,0.7);
  border: 2px solid rgba(255,255,255,0.8);
  transition: all 0.3s;
}
.test-dot.done {
  background: linear-gradient(135deg, var(--color-success), #43A047);
  border-color: #fff;
  color: #fff;
}
.test-dot.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-color: #fff;
  transform: scale(1.2);
  animation: nodePulse 2s ease-in-out infinite;
  color: #fff;
}

/* ===== Round 2: 集体跟读 (L2) ===== */
.step-speak-phase { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); position: relative; z-index: 1; }
.speak-carousel {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px;
}
.speak-card-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); }
.speak-emoji { 
  font-size: 4rem; 
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.1));
}
.speak-card-item:hover .speak-emoji { transform: scale(1.1) rotate(-5deg); }
.speak-word { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary); }
.speak-zh { font-size: var(--font-size-base); color: var(--text-hint); }
.speak-mic {
  width: 160px; height: 160px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-xs); cursor: pointer;
  background: var(--bg-card); border: 3px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.speak-mic::before {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px dashed rgba(255,140,66,0.2);
  animation: micRingRotate 8s linear infinite;
}
@keyframes micRingRotate { 100% { transform: rotate(360deg); } }
.speak-mic.recording { 
  border-color: var(--color-danger); background: #FFF5F5;
  animation: micRecordPulse 1.5s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(220,53,69,0.3);
}
@keyframes micRecordPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,53,69,0.4); transform: scale(1); }
  50% { box-shadow: 0 0 0 16px rgba(220,53,69,0); transform: scale(1.03); }
}
.speak-mic:hover { 
  border-color: var(--color-primary); 
  transform: translateY(-4px); 
  box-shadow: 0 8px 24px rgba(255,140,66,0.15);
}
.mic-icon { font-size: 2.5rem; }
.mic-label { font-size: var(--font-size-xs); color: var(--text-hint); }
.mic-waves { position: absolute; inset: -8px; border-radius: 50%; pointer-events: none; }
.mic-waves span {
  position: absolute; inset: 0; border-radius: 50%;
  border: 2px solid var(--color-danger);
  animation: micWave 1.5s ease-in-out infinite;
}
.mic-waves span:nth-child(2) { animation-delay: 0.3s; }
.mic-waves span:nth-child(3) { animation-delay: 0.6s; }
.mic-waves span:nth-child(4) { animation-delay: 0.9s; }
@keyframes micWave {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}
.speak-actions { display: flex; gap: var(--space-md); }
.speak-mic.done { border-color: var(--color-success); background: #E8F5E9; pointer-events: none; }
.speak-mic.done::before { border-color: rgba(76,175,80,0.3); }
.speak-dots { display: flex; gap: var(--space-sm); }
.speak-dot {
  font-size: 1.5rem;
  opacity: 0.3;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.speak-dot.active {
  opacity: 1;
  transform: scale(1.3);
  animation: dotPop 0.3s var(--ease-bounce);
}
.speak-dot.done {
  opacity: 0.6;
  filter: grayscale(0.5);
}

/* ===== Round 3: 独立回忆 (L2) ===== */
.step-recall-phase {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xl);
  position: relative; z-index: 1;
  min-height: 420px;
}
.recall-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-lg);
  min-height: 180px;
}
.recall-emoji { 
  font-size: 5rem; 
  animation: sayEmojiFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
@keyframes sayEmojiFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.recall-word { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary); }
.recall-timer { display: flex; flex-direction: column; align-items: center; min-height: 60px; justify-content: center; }
.timer-dots { display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm); }
.dot { 
  width: 12px; height: 12px; border-radius: 50%; background: var(--border-light); 
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}
.dot.active { 
  background: var(--color-primary); 
  animation: dotPop 0.3s var(--ease-bounce);
  box-shadow: 0 2px 8px rgba(255,140,66,0.3);
}
@keyframes dotPop {
  0% { transform: scale(0.6); }
  60% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
.timer-text { font-size: var(--font-size-lg); color: var(--text-hint); }
.recall-answered { display: flex; flex-direction: column; align-items: center; gap: var(--space-md); animation: fadeUp 0.5s var(--ease-smooth); min-height: 80px; }
.recall-actions { display: flex; gap: var(--space-md); min-height: 56px; }
.recall-progress { font-size: var(--font-size-sm); color: var(--text-hint); }

/* ===== 共享反馈 ===== */
.step-feedback {
  font-size: var(--font-size-xl); font-weight: 700;
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
  text-align: center;
  animation: feedbackBounce 0.4s var(--ease-bounce);
}
.feedback-correct { color: var(--color-success); background: #E8F5E9; }
.feedback-reveal { color: var(--color-primary-dark); background: #FFF3E0; }
.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ===== 通用按钮 ===== */
.btn-speaker, .btn-hint {
  padding: var(--space-sm) var(--space-xl); border-radius: var(--radius-full);
  font-size: var(--font-size-base); font-weight: 600;
  display: flex; align-items: center; gap: var(--space-xs);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-speaker { background: var(--color-primary); color: #fff; }
.btn-speaker::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: translateX(-100%);
}
.btn-speaker:hover::after { animation: shimmer 1.2s infinite; }
.btn-speaker.active { background: var(--color-primary-dark); animation: speakerPulse 1.5s ease-in-out infinite; }
.btn-speaker:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(255,140,66,0.3); }
.btn-hint { background: var(--border-light); color: var(--text-primary); }
.btn-hint:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
@keyframes speakerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,66,0.4); }
  50% { box-shadow: 0 0 0 10px rgba(255,140,66,0); }
}

.btn-next {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; font-size: var(--font-size-lg); font-weight: 700;
  border-radius: var(--radius-full); box-shadow: 0 4px 16px rgba(255, 140, 66, 0.25);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); margin-top: var(--space-xl);
  position: relative; overflow: hidden;
}
.btn-next::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: translateX(-100%);
}
.btn-next:hover::after { animation: shimmer 1.2s infinite; }
.btn-next:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 24px rgba(255, 140, 66, 0.35); }
.btn-next:active { transform: scale(0.97); }
.btn-replay {
  padding: var(--space-sm) var(--space-lg);
  background: var(--border-light); color: var(--text-primary);
  border-radius: var(--radius-full); font-weight: 600;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-replay:hover { background: var(--color-primary-light); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.btn-speak-done {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, #FFD54F, #FF8C42);
  color: #fff; font-size: var(--font-size-lg); font-weight: 700;
  border-radius: var(--radius-full); box-shadow: 0 4px 16px rgba(255, 140, 66, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-speak-done:disabled {
  opacity: 0.6; cursor: not-allowed; pointer-events: none;
}
.btn-speak-done::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
}
.btn-speak-done:hover::after { animation: shimmer 1.5s infinite; }
.btn-speak-done:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 28px rgba(255, 140, 66, 0.4); }
.btn-speak-done:active { transform: scale(0.97); }
.btn-skip-say { 
  padding: var(--space-md) var(--space-lg); 
  color: var(--text-hint); font-size: var(--font-size-sm); 
  transition: all 0.2s; border-radius: var(--radius-full);
}
.btn-skip-say:disabled {
  opacity: 0.4; cursor: not-allowed; pointer-events: none;
}
.btn-skip-say:hover { color: var(--text-secondary); background: var(--border-light); }

/* ===== 完成弹窗 ===== */
.complete-overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-overlay);
}
.complete-modal {
  background: var(--bg-card); border-radius: var(--radius-xl);
  padding: var(--space-2xl); text-align: center;
  max-width: 420px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  position: relative; overflow: hidden;
}
.complete-modal::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,140,66,0.08), transparent 70%);
  pointer-events: none;
}
.complete-icon { 
  font-size: 4rem; display: block; margin-bottom: var(--space-md); 
  animation: trophySpin 2s ease-in-out infinite;
}
@keyframes trophySpin {
  0%, 100% { transform: rotateY(0deg) scale(1); }
  25% { transform: rotateY(10deg) scale(1.05); }
  75% { transform: rotateY(-10deg) scale(1.05); }
}
.complete-title { 
  font-size: var(--font-size-2xl); color: var(--color-primary-dark); margin-bottom: var(--space-sm); 
  position: relative;
}
.complete-title::after {
  content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
  width: 50%; height: 3px; border-radius: 2px;
  background: linear-gradient(90deg, transparent, #FFD54F, transparent);
}
.complete-text { color: var(--text-secondary); margin-bottom: var(--space-xl); font-size: var(--font-size-lg); }
.complete-stars { display: flex; justify-content: center; gap: var(--space-md); margin-bottom: var(--space-xl); }
.star { font-size: 2rem; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.star-active { opacity: 1; animation: starPop 0.5s var(--ease-bounce) both; }
.star-empty { opacity: 0.25; }
.complete-actions { display: flex; gap: var(--space-md); justify-content: center; }
.btn-complete-home, .btn-complete-again {
  padding: var(--space-md) var(--space-xl); border-radius: var(--radius-full);
  font-size: var(--font-size-base); font-weight: 700; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-complete-home { background: var(--color-primary); color: #fff; }
.btn-complete-home::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
}
.btn-complete-home:hover::after { animation: shimmer 1.2s infinite; }
.btn-complete-again { background: var(--border-light); color: var(--text-primary); }
.btn-complete-home:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 20px rgba(255,140,66,0.3); }
.btn-complete-again:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
@keyframes starPop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* ===== 卡片切换动画 ===== */
.card-slide-enter-active { transition: all 0.3s var(--ease-smooth); }
.card-slide-leave-active { transition: all 0.2s var(--ease-smooth); }
.card-slide-enter-from { opacity: 0; transform: translateX(30px); }
.card-slide-leave-to { opacity: 0; transform: translateX(-30px); }

/* ===== 背景浮动装饰 ===== */
.bg-deco { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.deco-item {
  position: absolute; font-size: 2rem; opacity: 0.2;
  animation: decoFloat 8s ease-in-out infinite;
}
.deco-item:nth-child(odd) { font-size: 1.5rem; }
.deco-item:nth-child(even) {
  width: 50px; height: 50px; border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,140,66,0.08), rgba(255,213,79,0.05));
}
.deco-1 { top: 12%; left: 6%; animation-delay: 0s; }
.deco-2 { top: 28%; right: 10%; animation-delay: 2.5s; width: 70px; height: 70px; }
.deco-3 { bottom: 35%; left: 12%; animation-delay: 1.5s; }
.deco-4 { bottom: 20%; right: 7%; animation-delay: 4s; }
@keyframes decoFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(5deg); }
  50% { transform: translateY(-8px) rotate(-3deg); }
  75% { transform: translateY(-20px) rotate(2deg); }
}

/* ===== 底部呦呦 ===== */
.learn-footer {
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-md) var(--space-xl); background: rgba(255,255,255,0.9);
  backdrop-filter: blur(8px);
}

/* ===== P1: 场景动态插图 ===== */
.scene-decorations {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
}
.scene-decorations > span {
  position: absolute; font-size: 2rem; opacity: 0.35;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* 森林 */
.scene-decorations .tree-1 { bottom: 15%; left: 5%; font-size: 3rem; animation: swayTree 4s ease-in-out infinite; }
.scene-decorations .tree-2 { bottom: 12%; right: 8%; font-size: 2.5rem; animation: swayTree 5s ease-in-out infinite 1s; }
.scene-decorations .leaf-1 { top: 20%; left: 15%; animation: leafFall 6s ease-in-out infinite; }
.scene-decorations .leaf-2 { top: 30%; right: 20%; animation: leafFall 7s ease-in-out infinite 2s; }
.scene-decorations .animal-1 { bottom: 18%; left: 25%; animation: animalBounce 3s ease-in-out infinite; }
.scene-decorations .animal-2 { top: 15%; right: 12%; animation: animalFly 4s ease-in-out infinite; }

/* 果园 */
.scene-decorations .scene-sun { top: 8%; right: 10%; font-size: 2.5rem; animation: sunPulse 5s ease-in-out infinite; }
.scene-decorations .scene-sofa { bottom: 15%; right: 15%; }

/* 彩虹 */
.scene-decorations .scene-rainbow { top: 5%; left: 50%; transform: translateX(-50%); font-size: 3rem; }
.scene-decorations .cloud-1 { top: 15%; left: 10%; animation: cloudDrift 12s ease-in-out infinite; }
.scene-decorations .cloud-2 { top: 25%; left: 60%; animation: cloudDrift 15s ease-in-out infinite 3s; }
.scene-decorations .cloud-3 { top: 10%; right: 15%; animation: cloudDrift 10s ease-in-out infinite 6s; }

/* 镜子 */
.scene-decorations .scene-mirror { top: 10%; left: 8%; font-size: 2.5rem; }
.scene-decorations .scene-sparkle { animation: sparkle 2s ease-in-out infinite; }
.scene-decorations .sparkle-1 { top: 20%; right: 15%; }
.scene-decorations .sparkle-2 { bottom: 25%; left: 20%; animation-delay: 1s; }

/* 家庭 */
.scene-decorations .scene-house { top: 8%; left: 5%; font-size: 2.5rem; }
.scene-decorations .scene-clock { top: 10%; right: 12%; animation: clockSwing 3s ease-in-out infinite; }

/* 厨房 */
.scene-decorations .pot-1 { bottom: 18%; left: 8%; font-size: 2.5rem; animation: potBubble 3s ease-in-out infinite; }
.scene-decorations .pot-2 { bottom: 15%; right: 12%; font-size: 2rem; }
.scene-decorations .steam-1 { bottom: 35%; left: 12%; animation: steamRise 4s ease-out infinite; }
.scene-decorations .steam-2 { bottom: 32%; left: 18%; animation: steamRise 5s ease-out infinite 1s; }
.scene-decorations .scene-plate { bottom: 12%; left: 45%; font-size: 2rem; }

/* 城市 */
.scene-decorations .bld-1 { bottom: 10%; left: 5%; font-size: 3rem; }
.scene-decorations .bld-2 { bottom: 12%; right: 8%; font-size: 2.5rem; }
.scene-decorations .scene-traffic-light { top: 15%; left: 50%; animation: trafficBlink 4s steps(1) infinite; }
.scene-decorations .car-1 { bottom: 8%; left: 35%; animation: carDrive 8s linear infinite; }
.scene-decorations .car-2 { bottom: 5%; right: 25%; animation: carDrive 10s linear infinite 3s; }

/* 户外 */
.scene-decorations .scene-umbrella { bottom: 15%; right: 15%; font-size: 2.5rem; animation: umbrellaSway 5s ease-in-out infinite; }
.scene-decorations .snow-1 { top: 20%; left: 25%; animation: snowFall 6s linear infinite; }
.scene-decorations .snow-2 { top: 15%; right: 30%; animation: snowFall 8s linear infinite 2s; }

/* 教室 */
.scene-decorations .scene-blackboard { top: 8%; left: 5%; font-size: 2.5rem; }
.scene-decorations .scene-pencil { bottom: 20%; right: 10%; animation: pencilWrite 2s ease-in-out infinite; }
.scene-decorations .book-1 { bottom: 15%; left: 15%; font-size: 2rem; }
.scene-decorations .book-2 { bottom: 18%; left: 30%; font-size: 1.8rem; animation: bookFlip 6s ease-in-out infinite; }
.scene-decorations .scene-bell { top: 10%; right: 8%; font-size: 2rem; animation: bellRing 3s ease-in-out infinite; }

/* 游乐场 */
.scene-decorations .scene-slide { bottom: 12%; left: 8%; font-size: 2.5rem; }
.scene-decorations .balloon-1 { top: 12%; right: 15%; animation: balloonFloat 5s ease-in-out infinite; }
.scene-decorations .balloon-2 { top: 18%; right: 25%; animation: balloonFloat 6s ease-in-out infinite 1.5s; }
.scene-decorations .scene-ferris { top: 8%; left: 50%; transform: translateX(-50%); font-size: 3rem; animation: ferrisSpin 12s linear infinite; }
.scene-decorations .star-1 { top: 5%; right: 8%; animation: starTwinkle 2s ease-in-out infinite; }

/* 卧室 */
.scene-decorations .scene-bed { bottom: 12%; left: 8%; font-size: 2.5rem; }
.scene-decorations .scene-lamp { top: 10%; right: 10%; font-size: 2rem; animation: lampGlow 4s ease-in-out infinite; }
.scene-decorations .hanger-1 { top: 20%; left: 15%; animation: hangerSwing 4s ease-in-out infinite; }
.scene-decorations .hanger-2 { top: 22%; left: 30%; animation: hangerSwing 5s ease-in-out infinite 1s; }
.scene-decorations .scene-moon { top: 5%; right: 5%; font-size: 2.5rem; animation: moonGlow 6s ease-in-out infinite; }

/* 心灵 */
.scene-decorations .heart-1 { top: 15%; left: 10%; animation: heartBeat 2s ease-in-out infinite; }
.scene-decorations .heart-2 { top: 25%; right: 15%; animation: heartBeat 2.5s ease-in-out infinite 0.5s; }
.scene-decorations .heart-3 { bottom: 20%; left: 50%; animation: heartBeat 3s ease-in-out infinite 1s; }
.scene-decorations .smiley-1 { bottom: 25%; left: 20%; animation: smileyBounce 3s ease-in-out infinite; }
.scene-decorations .smiley-2 { bottom: 22%; right: 20%; animation: smileyBounce 4s ease-in-out infinite 1s; }

/* 场景动画 keyframes */
@keyframes swayTree {
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
}
@keyframes leafFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.35; }
  50% { transform: translateY(20px) rotate(180deg); opacity: 0.2; }
  100% { transform: translateY(0) rotate(360deg); opacity: 0.35; }
}
@keyframes animalBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes animalFly {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5px, -10px); }
  75% { transform: translate(5px, -5px); }
}
@keyframes sunPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.1); opacity: 0.6; }
}
@keyframes cloudDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30px); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
@keyframes clockSwing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
@keyframes potBubble {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05) translateY(-2px); }
}
@keyframes steamRise {
  0% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-15px) scale(1.2); opacity: 0.15; }
  100% { transform: translateY(-30px) scale(0.8); opacity: 0; }
}
@keyframes trafficBlink {
  0%, 33% { opacity: 0.6; }
  34%, 66% { opacity: 0.3; }
  67%, 100% { opacity: 0.6; }
}
@keyframes carDrive {
  0% { transform: translateX(0); }
  100% { transform: translateX(40px); }
}
@keyframes umbrellaSway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes snowFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
  100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
}
@keyframes pencilWrite {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg) translateX(-2px); }
  75% { transform: rotate(5deg) translateX(2px); }
}
@keyframes bookFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(15deg); }
}
@keyframes bellRing {
  0%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
  50% { transform: rotate(0deg); }
}
@keyframes balloonFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes ferrisSpin {
  0% { transform: translateX(-50%) rotate(0deg); }
  100% { transform: translateX(-50%) rotate(360deg); }
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 0.7; transform: scale(1.2); }
}
@keyframes lampGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
@keyframes hangerSwing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
@keyframes moonGlow {
  0%, 100% { opacity: 0.35; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.05); }
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
}
@keyframes smileyBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>