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
      <button class="btn-back" @click="handleBack">← 返回</button>
      <div class="header-info">
        <span class="category-emoji">{{ category?.emoji }}</span>
        <span class="category-name">{{ category?.name }}</span>
        <span class="word-progress">{{ currentWordIndex + 1 }} / {{ words.length }}</span>
      </div>
      <button v-if="currentStep > 1 && currentStep <= 4" class="btn-skip" @click="skipStep">跳过此步 →</button>
    </header>

    <!-- 进度条 -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      <div class="progress-nodes">
        <div v-for="(w, i) in words" :key="w.id" class="node"
          :class="{ done: i < currentWordIndex, active: i === currentWordIndex, pending: i > currentWordIndex }">
          <span class="node-icon">{{ i < currentWordIndex ? '✓' : w.emoji }}</span>
        </div>
      </div>
    </div>

    <!-- 场景动态插图 -->
    <div class="scene-decorations" :data-scene="category?.scene">
      <!-- 森林场景 -->
      <template v-if="category?.scene === 'forest'">
        <span class="scene-tree tree-1">🌲</span>
        <span class="scene-tree tree-2">🌳</span>
        <span class="scene-leaf leaf-1">🍃</span>
        <span class="scene-leaf leaf-2">🍃</span>
        <span class="scene-animal animal-1">🐰</span>
        <span class="scene-animal animal-2">🐦</span>
      </template>
      <!-- 果园场景 -->
      <template v-else-if="category?.scene === 'orchard'">
        <span class="scene-tree tree-1">🍊</span>
        <span class="scene-sun">☀️</span>
        <span class="scene-leaf leaf-1">🍃</span>
        <span class="scene-leaf leaf-2">🍂</span>
      </template>
      <!-- 彩虹场景 -->
      <template v-else-if="category?.scene === 'rainbow'">
        <span class="scene-rainbow">🌈</span>
        <span class="scene-cloud cloud-1">☁️</span>
        <span class="scene-cloud cloud-2">☁️</span>
        <span class="scene-cloud cloud-3">☁️</span>
      </template>
      <!-- 镜子场景 -->
      <template v-else-if="category?.scene === 'mirror'">
        <span class="scene-mirror">🪞</span>
        <span class="scene-sparkle sparkle-1">✨</span>
        <span class="scene-sparkle sparkle-2">✨</span>
      </template>
      <!-- 家庭场景 -->
      <template v-else-if="category?.scene === 'home'">
        <span class="scene-house">🏠</span>
        <span class="scene-clock">🕰️</span>
        <span class="scene-sofa">🛋️</span>
      </template>
      <!-- 🍽️ 厨房场景 (food) -->
      <template v-else-if="category?.scene === 'kitchen'">
        <span class="scene-pot pot-1">🍳</span>
        <span class="scene-pot pot-2">🥄</span>
        <span class="scene-steam steam-1">💨</span>
        <span class="scene-steam steam-2">💨</span>
        <span class="scene-plate">🍽️</span>
      </template>
      <!-- 🚦 城市场景 (transport) -->
      <template v-else-if="category?.scene === 'city'">
        <span class="scene-building bld-1">🏢</span>
        <span class="scene-building bld-2">🏬</span>
        <span class="scene-traffic-light">🚦</span>
        <span class="scene-car car-1">🚗</span>
        <span class="scene-car car-2">🚌</span>
      </template>
      <!-- 🌤️ 户外场景 (weather) -->
      <template v-else-if="category?.scene === 'outdoor'">
        <span class="scene-sun">☀️</span>
        <span class="scene-cloud cloud-1">☁️</span>
        <span class="scene-cloud cloud-2">⛅</span>
        <span class="scene-umbrella">☂️</span>
        <span class="scene-snowflake snow-1">❄️</span>
        <span class="scene-snowflake snow-2">❄️</span>
      </template>
      <!-- 🎒 教室场景 (numbers/school) -->
      <template v-else-if="category?.scene === 'classroom'">
        <span class="scene-blackboard">📋</span>
        <span class="scene-pencil">✏️</span>
        <span class="scene-book book-1">📚</span>
        <span class="scene-book book-2">📖</span>
        <span class="scene-bell">🔔</span>
      </template>
      <!-- 🎠 游乐场场景 (toys/actions) -->
      <template v-else-if="category?.scene === 'playground'">
        <span class="scene-slide">🛝</span>
        <span class="scene-balloon balloon-1">🎈</span>
        <span class="scene-balloon balloon-2">🎈</span>
        <span class="scene-ferris">🎡</span>
        <span class="scene-star star-1">⭐</span>
      </template>
      <!-- 🧺 卧室场景 (clothes) -->
      <template v-else-if="category?.scene === 'bedroom'">
        <span class="scene-bed">🛏️</span>
        <span class="scene-lamp">💡</span>
        <span class="scene-hanger hanger-1">👕</span>
        <span class="scene-hanger hanger-2">👗</span>
        <span class="scene-moon">🌙</span>
      </template>
      <!-- ❤️ 心灵场景 (emotions) -->
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
      <!-- Step 0: 分类介绍 -->
      <div v-if="currentStep === 0" class="step-intro anim-fade-up">
        <div class="intro-scene">
          <span class="intro-emoji">{{ category?.emoji }}</span>
          <h2 class="intro-title">{{ category?.name }}</h2>
          <p class="intro-subtitle">{{ category?.nameEn }}</p>
        </div>
        <button class="btn-start" @click="startLearning">
          🐯 开始探险！
        </button>
      </div>

      <!-- Step 1: 听力理解 -->
      <div v-else-if="currentStep === 1" class="step-listen anim-fade-up">
        <div class="step-badge">第 1 步 · 听一听</div>
        <div class="listen-card anim-blink-border">
          <span class="listen-emoji">{{ currentWord?.emoji }}</span>
          <span class="listen-zh">{{ currentWord?.zh }}</span>
        </div>
        <div class="listen-actions">
          <button class="btn-speaker" :class="{ active: isSpeaking }" @click="playWord">
            🔊 <span>{{ isSpeaking ? '朗读中...' : '点我听' }}</span>
          </button>
          <button class="btn-hint" @click="showChinese = !showChinese">
            💡 <span>{{ showChinese ? currentWord?.zh : '中文提示' }}</span>
          </button>
        </div>
        <button class="btn-next" @click="nextStep">听懂了！→</button>
      </div>

      <!-- Step 2: 听力测试 -->
      <div v-else-if="currentStep === 2" class="step-test anim-fade-up">
        <div class="step-badge">第 2 步 · 找一找</div>
        <p class="test-prompt">
          <span class="prompt-icon"></span>
          <span class="prompt-text">Which one is...</span>
        </p>
        <div class="test-grid" :class="testGridClass">
          <button v-for="opt in testOptions" :key="opt.id" class="test-option"
            :class="{
              correct: answeredId === opt.id && opt.id === currentWord?.id,
              wrong: answeredId === opt.id && opt.id !== currentWord?.id,
              dimmed: answeredId && opt.id !== answeredId && opt.id !== currentWord?.id
            }"
            :disabled="!!answeredId"
            @click="handleTestAnswer(opt)">
            <span class="opt-emoji">{{ opt.emoji }}</span>
          </button>
        </div>
        <div v-if="feedbackText" class="test-feedback" :class="testFeedbackClass">
          <span>{{ feedbackText }}</span>
        </div>
      </div>

      <!-- Step 3: 跟读模仿 -->
      <div v-else-if="currentStep === 3" class="step-speak anim-fade-up">
        <div class="step-badge">第 3 步 · 说一说</div>
        <div class="speak-card">
          <span class="speak-emoji">{{ currentWord?.emoji }}</span>
          <span class="speak-word">{{ currentWord?.en }}</span>
          <span class="speak-zh">{{ currentWord?.zh }}</span>
        </div>
        <div class="speak-mic" :class="{ recording: isRecording, done: step3Done }" @click="toggleRecord">
          <span class="mic-icon">{{ step3Done ? '✅' : '🎤' }}</span>
          <span class="mic-label">{{ isRecording ? 'Listening...' : (step3Done ? 'Great job!' : 'Tap & Speak') }}</span>
          <div class="mic-waves" v-if="isRecording">
            <span v-for="i in 4" :key="i" :style="{ animationDelay: i * 0.15 + 's' }"></span>
          </div>
        </div>
        <Transition name="pop">
          <div v-if="step3Feedback" class="step-feedback" :class="step3FeedbackClass">
            {{ step3Feedback }}
          </div>
        </Transition>
        <div class="speak-actions">
          <button class="btn-replay" @click="playWord">🔊 Listen again</button>
        </div>
      </div>

      <!-- Step 4: 独立说出 -->
      <div v-else-if="currentStep === 4" class="step-say anim-fade-up">
        <div class="step-badge">第 4 步 · 自己说</div>
        <div class="say-card">
          <span class="say-emoji">{{ currentWord?.emoji }}</span>
          <div v-if="step4Phase === 'waiting'" class="say-timer">
            <span class="timer-dots">
              <span class="dot" :class="{ active: waitDot >= 0 }"></span>
              <span class="dot" :class="{ active: waitDot >= 1 }"></span>
              <span class="dot" :class="{ active: waitDot >= 2 }"></span>
              <span class="dot" :class="{ active: waitDot >= 3 }"></span>
              <span class="dot" :class="{ active: waitDot >= 4 }"></span>
            </span>
            <span class="timer-text">Can you say it?</span>
          </div>
          <div v-else class="say-answered">
            <span class="say-word">{{ currentWord?.en }}</span>
            <button class="btn-replay" @click="playWord">🔊</button>
          </div>
        </div>
        <Transition name="pop">
          <div v-if="step4Feedback" class="step-feedback" :class="step4FeedbackClass">
            {{ step4Feedback }}
          </div>
        </Transition>
        <div class="say-actions">
          <button class="btn-speak-done" :disabled="isStep4Transitioning" @click="handleSayDone">
            ⭐ I said it!
          </button>
          <button class="btn-skip-say" :disabled="isStep4Transitioning" @click="handleSaySkip">Skip →</button>
        </div>
      </div>

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
      <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showYoyoStars" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import { getCategoryById, ALL_WORDS, ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()
const { speak, isSpeaking, stop, playAudio } = useSpeech()

// ============ 数据初始化 ============
const categoryId = computed(() => route.params.categoryId || store.unlockedCategoryList[0]?.id)
const category = computed(() => getCategoryById(categoryId.value))
const words = computed(() => category.value?.words || [])

const sceneColor = computed(() => {
  const map = {
    // L1
    forest: '#A8D8B9', orchard: '#FFD4A3', rainbow: '#D4C5F0', mirror: '#B5E4E8', home: '#FFF0D4',
    // L2
    kitchen: '#FFCCBC', city: '#B0BEC5', outdoor: '#C8E6C9', classroom: '#F3E5F5',
    playground: '#FFF9C4', bedroom: '#E1D5E7', heart: '#FFCDD2'
  }
  return map[category.value?.scene] || '#FFF8F0'
})

// ============ 状态 ============
const currentWordIndex = ref(0)
const currentStep = ref(0) // 0=intro, 1=listen, 2=test, 3=speak, 4=say
const showChinese = ref(false)
const answeredId = ref(null)
const feedbackText = ref('')
const testFeedbackClass = ref('')
const isRecording = ref(false)
const waitingForAnswer = ref(true) // kept for Step 2 compatibility
const step4Phase = ref('waiting') // 'waiting' | 'feedback' | 'done'
const isStep4Transitioning = ref(false)
const waitDot = ref(0)
const showComplete = ref(false)
const showYoyoStars = ref(false)

// Step 3 专用
const step3Done = ref(false)
const step3Feedback = ref('')
const step3FeedbackClass = ref('')

// Step 4 专用
const step4Feedback = ref('')
const step4FeedbackClass = ref('')

// Step 2 专用：自动重读定时器
let autoReplayTimer = null

const currentWord = computed(() => words.value[currentWordIndex.value])

const progressPercent = computed(() => {
  const total = words.value.length * 4 // 4 steps per word
  const done = currentWordIndex.value * 4 + currentStep.value
  return Math.min((done / total) * 100, 100)
})

// 呦呦状态
const yoyoMood = ref('idle')
const yoyoBubble = ref('')

// L1 前5词使用 1×2 网格
const useSimpleGrid = computed(() => currentWordIndex.value < 5)
const testGridClass = computed(() => useSimpleGrid.value ? 'grid-1x2' : 'grid-2x2')

// 测试选项生成（根据当前分类级别选择干扰项池）
const testOptions = computed(() => {
  if (!currentWord.value) return []
  const correct = currentWord.value
  const count = useSimpleGrid.value ? 2 : 4
  const pool = category.value?.level === 2 ? ALL_L2_WORDS : ALL_L1_WORDS
  const others = pool.filter(w => w.id !== correct.id)
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, count - 1)
  const options = [correct, ...shuffled]
  return options.sort(() => Math.random() - 0.5)
})

const starRating = computed(() => {
  const record = store.getWordRecord(currentWord.value?.id)
  const steps = record?.stepComplete?.length || 0
  if (steps >= 4) return 3
  if (steps >= 2) return 2
  return 1
})

// ============ 方法 ============
function playWord() {
  if (!currentWord.value) return
  speak(currentWord.value.en, { rate: 0.7 })
}

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text
  showYoyoStars.value = stars
}

// 开始学习
function startLearning() {
  currentStep.value = 1
  setYoyo('idle', `今天我们来认识 ${category.value?.name}！`)
  // 延迟自动播放
  setTimeout(() => {
    if (currentStep.value === 1 && currentWord.value) {
      playWord()
      setYoyo('idle', `看，这是什么呀？`)
    }
  }, 500)
}

function nextStep() {
  if (currentStep.value < 4) {
    currentStep.value++
    handleStepEntry()
  } else {
    // 完成当前词
    completeWord()
  }
}

function handleStepEntry() {
  answeredId.value = null
  feedbackText.value = ''
  testFeedbackClass.value = ''
  showChinese.value = false
  waitingForAnswer.value = true
  step4Phase.value = 'waiting'
  isStep4Transitioning.value = false
  clearAutoReplayTimer()

  // 重置 Step 3/4 状态
  step3Done.value = false
  step3Feedback.value = ''
  step3FeedbackClass.value = ''
  step4Feedback.value = ''
  step4FeedbackClass.value = ''

  if (currentStep.value === 1) {
    setYoyo('idle', `看，这是什么呀？`)
    setTimeout(() => playWord(), 300)
  } else if (currentStep.value === 2) {
    setYoyo('thinking', 'Listen and find!')
    // 链式播放：Which one is... → 单词音频
    startAutoReplayTimer()
    setTimeout(() => {
      playAudio('/audio/which-one-is.mp3', () => {
        // "Which one is" 播放完毕后播放单词
        playWord()
      })
    }, 400)
  } else if (currentStep.value === 3) {
    setYoyo('encourage', 'Repeat after me!')
    // 链式播放：Repeat after me → 单词音频
    setTimeout(() => {
      playAudio('/audio/repeat-after-me.mp3', () => {
        playWord()
      })
    }, 400)
  } else if (currentStep.value === 4) {
    setYoyo('thinking', 'Can you say it?')
    // 链式播放：Can you say it → 等待
    setTimeout(() => {
      playAudio('/audio/can-you-say-it.mp3', () => {
        startWaitTimer()
      })
    }, 400)
  }
}

// Step 2 答案处理
function handleTestAnswer(opt) {
  if (answeredId.value) return
  answeredId.value = opt.id
  clearAutoReplayTimer() // 清除自动重读定时器

  const isCorrect = opt.id === currentWord.value?.id

  if (isCorrect) {
    feedbackText.value = 'Great!'
    testFeedbackClass.value = 'feedback-correct'
    sfxCorrect() // 音效
    // 随机播放 Great / Good job / Excellent
    const praises = ['/audio/great.mp3', '/audio/good-job.mp3', '/audio/excellent.mp3']
    playAudio(praises[Math.floor(Math.random() * praises.length)])
    setYoyo('happy', '', true)
    store.completeWordStep(currentWord.value?.id, 2)
    store.addStars(1)

    // 1.2秒后自动进入下一步（复用 nextStep 确保状态完整切换）
    setTimeout(() => nextStep(), 1200)
  } else {
    feedbackText.value = 'Try again!'
    testFeedbackClass.value = 'feedback-wrong'
    sfxWrong() // 音效
    playAudio('/audio/try-again.mp3')
    setYoyo('encourage', 'Try again~')
    // 不惩罚，短暂显示后清除，允许重试
    setTimeout(() => {
      answeredId.value = null
      feedbackText.value = ''
      testFeedbackClass.value = ''
      startAutoReplayTimer() // 重新开始自动重读
    }, 1500)
  }
}

// Step 2 自动重读：4秒无操作重读单词
function startAutoReplayTimer() {
  clearAutoReplayTimer()
  autoReplayTimer = setTimeout(() => {
    if (currentStep.value === 2 && !answeredId.value) {
      playWord() // 重读单词
      startAutoReplayTimer() // 递归设置下一个
    }
  }, 4000)
}

function clearAutoReplayTimer() {
  if (autoReplayTimer) {
    clearTimeout(autoReplayTimer)
    autoReplayTimer = null
  }
}

// Step 3 录音模拟 + 音效反馈 + 自动前进
function toggleRecord() {
  if (isRecording.value || step3Done.value) return
  isRecording.value = true
  setYoyo('thinking', 'I\'m listening...')

  setTimeout(() => {
    isRecording.value = false
    step3Done.value = true
    // 音效 + 英文表扬 + 自动前进
    sfxCorrect()
    const praises = ['/audio/great.mp3', '/audio/good-job.mp3', '/audio/excellent.mp3']
    playAudio(praises[Math.floor(Math.random() * praises.length)])
    step3Feedback.value = 'Great speaking!'
    step3FeedbackClass.value = 'feedback-correct'
    setYoyo('happy', '', true)
    store.completeWordStep(currentWord.value?.id, 3)
    store.addStars(1)
    // 1.5秒后自动进入 Step 4
    setTimeout(() => nextStep(), 1500)
  }, 2000)
}

// Step 4 等待计时器（5秒，给小朋友更多时间）
let waitTimer = null
function startWaitTimer() {
  step4Phase.value = 'waiting'
  waitingForAnswer.value = true
  waitDot.value = 0
  waitTimer = setInterval(() => {
    waitDot.value++
    if (waitDot.value >= 5) {
      clearInterval(waitTimer)
      waitTimer = null
      step4Phase.value = 'feedback'
      isStep4Transitioning.value = true
      // 5秒后自动揭示答案 + 播放单词
      playWord()
      step4Feedback.value = currentWord.value?.en || ''
      step4FeedbackClass.value = 'feedback-reveal'
      setTimeout(() => setYoyo('encourage', 'That\'s okay! Listen and remember~'), 400)
      // 延迟后自动推进
      setTimeout(() => advanceFromStep4(false), 1500)
    }
  }, 1000)
}

// Step 4: "I said it!" — 主动完成
function handleSayDone() {
  if (step4Phase.value !== 'waiting') return // 状态锁：仅 waiting 可触发
  isStep4Transitioning.value = true
  step4Phase.value = 'feedback'
  clearInterval(waitTimer)
  waitTimer = null
  sfxCorrect()
  const praises = ['/audio/great.mp3', '/audio/good-job.mp3', '/audio/excellent.mp3']
  playAudio(praises[Math.floor(Math.random() * praises.length)])
  step4Feedback.value = 'Awesome!'
  step4FeedbackClass.value = 'feedback-correct'
  // 延迟切换吉祥物表情，让反馈动画先稳定
  setTimeout(() => setYoyo('celebrate', '', true), 400)
  advanceFromStep4(true)
}

// Step 4: "Skip" — 跳过
function handleSaySkip() {
  if (step4Phase.value !== 'waiting') return // 状态锁：仅 waiting 可触发
  isStep4Transitioning.value = true
  step4Phase.value = 'feedback'
  clearInterval(waitTimer)
  waitTimer = null
  step4Feedback.value = 'OK, let\'s move on!'
  step4FeedbackClass.value = 'feedback-reveal'
  // 延迟切换吉祥物表情，让反馈动画先稳定
  setTimeout(() => setYoyo('idle', 'No worries, next time!'), 400)
  advanceFromStep4(false)
}

// Step 4 统一的推进逻辑（等待揭示后也会调用）
let isAdvancing = ref(false) // 状态锁：防止重复推进
function advanceFromStep4(earnedStars) {
  if (isAdvancing.value) return // 已在推进中，忽略
  isAdvancing.value = true
  
  store.completeWordStep(currentWord.value?.id, 4)
  if (earnedStars) store.addStars(2)

  if (currentWordIndex.value < words.value.length - 1) {
    setTimeout(() => {
      currentWordIndex.value++
      currentStep.value = 1
      store.incrementTodayLearned()
      handleStepEntry()
      isAdvancing.value = false // 重置锁
    }, 1500)
  } else {
    // 全部完成 — 先撒星星庆祝，再弹窗
    triggerConfetti(50)
    sfxComplete()
    setTimeout(() => {
      store.markWordMastered(currentWord.value?.id)
      store.unlockNextCategory()
      showComplete.value = true
      setYoyo('celebrate', 'You did it! All words mastered!', true)
      isAdvancing.value = false // 重置锁
    }, 800)
  }
}

function completeWord() {
  store.markWordMastered(currentWord.value?.id)
}

// 跳过当前步骤（L1 允许跳 Step 3/4）
function skipStep() {
  if (currentStep.value === 1 || currentStep.value === 2) {
    // Step 1/2 不能跳过
    return
  }
  if (currentStep.value === 4 && isStep4Transitioning.value) return // 防抖
  clearInterval(waitTimer)
  waitTimer = null
  isStep4Transitioning.value = true
  setYoyo('idle', 'No worries, let\'s move on!')
  store.completeWordStep(currentWord.value?.id, currentStep.value)
  setTimeout(() => {
    if (currentStep.value < 4) {
      currentStep.value++
      handleStepEntry()
    } else {
      advanceFromStep4(false)
    }
  }, 400)
}

function restart() {
  currentWordIndex.value = 0
  currentStep.value = 0
  showComplete.value = false
  answeredId.value = null
  feedbackText.value = ''
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

.btn-back, .btn-skip {
  padding: var(--space-xs) var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all 0.2s;
}
.btn-back { color: var(--text-secondary); }
.btn-skip { color: var(--text-hint); }
.btn-back:hover, .btn-skip:hover { background: var(--border-light); }

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

/* ===== Step 1: 听力理解 ===== */
.step-listen { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); position: relative; z-index: 1; }
.listen-card {
  width: 240px; height: 240px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: var(--space-md);
  background: var(--bg-card); border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  position: relative; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.6);
}
.listen-card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(255,140,66,0.08), transparent 60%);
  pointer-events: none;
}
.listen-emoji { 
  font-size: 5rem; 
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}
.listen-card:hover .listen-emoji { transform: scale(1.15) rotate(-5deg); }
.listen-zh { font-size: var(--font-size-lg); color: var(--text-secondary); }
.listen-actions { display: flex; gap: var(--space-md); }
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

/* ===== Step 2: 听力测试 ===== */
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

/* ===== Step 3: 跟读模仿 ===== */
.step-speak { display: flex; flex-direction: column; align-items: center; gap: var(--space-xl); position: relative; z-index: 1; }
.speak-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); }
.speak-emoji { 
  font-size: 4rem; 
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.1));
}
.speak-card:hover .speak-emoji { transform: scale(1.1) rotate(-5deg); }
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

/* ===== Step 3/4 共享反馈 ===== */
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

/* ===== Step 4: 独立说出 ===== */
.step-say {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xl);
  position: relative; z-index: 1;
  min-height: 420px; /* 稳定布局，防止反馈弹出时容器高度变化 */
}
.say-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-lg);
  min-height: 180px; /* 保持卡片高度稳定 */
}
.say-emoji { 
  font-size: 5rem; 
  animation: sayEmojiFloat 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
}
@keyframes sayEmojiFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.say-word { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-primary); }
.say-timer { display: flex; flex-direction: column; align-items: center; min-height: 60px; justify-content: center; }
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
.say-answered { display: flex; flex-direction: column; align-items: center; gap: var(--space-md); animation: fadeUp 0.5s var(--ease-smooth); min-height: 80px; }
.say-actions { display: flex; gap: var(--space-md); min-height: 56px; /* 保持按钮区高度稳定 */ }
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

/* ===== 通用按钮 ===== */
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