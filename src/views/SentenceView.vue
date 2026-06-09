<template>
  <div class="sentence-page">
    <!-- 顶部导航 -->
    <header class="sentence-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-info">
        <span class="header-emoji">💬</span>
        <h2>句型练一练</h2>
      </div>
      <div class="header-progress" v-if="!isComplete">
        <span>{{ currentIndex + 1 }} / {{ roundSentences.length }}</span>
      </div>
    </header>

    <!-- 进度条 -->
    <div class="progress-track" v-if="!isComplete">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 场景装饰 -->
    <div class="scene-decorations" :data-scene="currentScene">
      <template v-if="currentScene === 'greeting'">
        <span class="scene-wave wave-1">👋</span>
        <span class="scene-wave wave-2">👋</span>
        <span class="scene-sparkle sparkle-1">✨</span>
      </template>
      <template v-else-if="currentScene === 'color'">
        <span class="scene-rainbow">🌈</span>
        <span class="scene-palette">🎨</span>
      </template>
      <template v-else-if="currentScene === 'number'">
        <span class="scene-abacus">🧮</span>
        <span class="scene-star star-1">⭐</span>
        <span class="scene-star star-2">🌟</span>
      </template>
      <template v-else-if="currentScene === 'action'">
        <span class="scene-runner">🏃</span>
        <span class="scene-music">🎵</span>
      </template>
      <template v-else-if="currentScene === 'weather'">
        <span class="scene-sun">☀️</span>
        <span class="scene-cloud">☁️</span>
        <span class="scene-rain">🌧️</span>
      </template>
      <template v-else-if="currentScene === 'preference'">
        <span class="scene-heart heart-1">❤️</span>
        <span class="scene-heart heart-2">💛</span>
      </template>
      <template v-else-if="currentScene === 'body'">
        <span class="scene-mirror">🪞</span>
        <span class="scene-sparkle sparkle-1">✨</span>
      </template>
    </div>

    <!-- 主要内容 -->
    <main class="sentence-main">
      <!-- 完成庆祝 -->
      <Transition name="celebrate-pop">
        <div v-if="isComplete" class="complete-screen">
          <div class="complete-stars">
            <span v-for="i in earnedStars" :key="i" class="star-pop" :style="{ animationDelay: (i * 0.2) + 's' }">⭐</span>
          </div>
          <h2 class="complete-title">太棒了！</h2>
          <p class="complete-sub">你学会了 {{ roundSentences.length }} 个句型！</p>
          <div class="complete-list">
            <div v-for="s in roundSentences" :key="s.id" class="complete-item">
              <span class="complete-en">{{ s.en }}</span>
              <span class="complete-zh">{{ s.zh }}</span>
            </div>
          </div>
          <div class="complete-actions">
            <button class="btn-again" @click="restart">再来一轮</button>
            <button class="btn-home" @click="goBack">返回首页</button>
          </div>
        </div>
      </Transition>

      <!-- 练习内容 -->
      <div v-if="!isComplete" class="practice-area">
        <!-- 步骤指示器 -->
        <div class="step-indicator">
          <span class="step-dot" :class="{ active: step >= 1, current: step === 1 }">🎧</span>
          <span class="step-line" :class="{ filled: step >= 2 }"></span>
          <span class="step-dot" :class="{ active: step >= 2, current: step === 2 }">👆</span>
          <span class="step-line" :class="{ filled: step >= 3 }"></span>
          <span class="step-dot" :class="{ active: step >= 3, current: step === 3 }">🗣️</span>
        </div>

        <!-- 当前句型卡片 -->
        <div class="sentence-card" :class="'step-' + step">
          <!-- Step 1: 听句型 -->
          <div v-if="step === 1" class="step-listen">
            <div class="listen-label">
              <span class="listen-icon">🎧</span>
              <span>听一听</span>
            </div>
            <div class="sentence-display" @click="playSentence">
              <span class="sentence-en">{{ currentSentence.en }}</span>
              <button class="play-btn" :class="{ playing: isPlaying }">
                <span v-if="!isPlaying">🔊</span>
                <span v-else class="playing-wave">🔊</span>
              </button>
            </div>
            <div class="sentence-zh">
              <span class="zh-text">{{ currentSentence.zh }}</span>
            </div>
            <div class="listen-hint">
              <span>👆 点击卡片可以重听</span>
            </div>
          </div>

          <!-- Step 2: 点词练习 -->
          <div v-if="step === 2" class="step-practice">
            <div class="practice-label">
              <span class="practice-icon">👆</span>
              <span>点一点，学单词</span>
            </div>
            <div class="sentence-words">
              <span v-for="(word, wi) in sentenceWords" :key="wi"
                class="word-chip"
                :class="{ highlighted: tappedWord === wi, 'is-key': word.isKey }"
                @click="tapWord(wi, word)">
                <span class="chip-en">{{ word.text }}</span>
                <Transition name="chip-pop">
                  <span v-if="tappedWord === wi && word.isKey" class="chip-meaning">
                    {{ word.emoji }} {{ word.zh }}
                  </span>
                </Transition>
              </span>
            </div>
            <div class="practice-full" v-if="tappedCount >= keyWordCount">
              <button class="btn-play-full" @click="playSentence">
                🔊 完整听一遍
              </button>
            </div>
          </div>

          <!-- Step 3: 跟读 -->
          <div v-if="step === 3" class="step-speak">
            <div class="speak-label">
              <span class="speak-icon">🗣️</span>
              <span>跟呦呦一起说！</span>
            </div>
            <div class="speak-sentence" @click="playSentence">
              <span class="speak-en">{{ currentSentence.en }}</span>
              <button class="play-btn small" :class="{ playing: isPlaying }">🔊</button>
            </div>
            <div class="speak-zh">{{ currentSentence.zh }}</div>
            <div class="speak-actions">
              <button class="btn-say" @click="handleSay">
                <span class="btn-icon">🎤</span>
                我说好啦
              </button>
              <button class="btn-skip-speak" @click="skipSpeak">
                跳过
              </button>
            </div>
          </div>
        </div>

        <!-- 底部导航按钮 -->
        <div class="bottom-actions" v-if="step < 3">
          <button class="btn-next" @click="nextStep">
            {{ step === 1 ? '点词练习' : '跟读练习' }} →
          </button>
        </div>
      </div>
    </main>

    <!-- 呦呦吉祥物 -->
    <GameAvatar
      :mood="yoyoMood"
      :bubble-text="yoyoBubble"
      class="sentence-yoyo"
      @click="petYoyo"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { L2_SENTENCES } from '@/data/words'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxComplete, sfxStar } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import GameAvatar from '@/components/common/GameAvatar.vue'

const router = useRouter()
const route = useRoute()
const store = useLearningStore()
const { speak, playAudio, stop } = useSpeech()

// ============================================================
// 状态
// ============================================================

const categoryFilter = ref(route.params.categoryId || null)
const currentIndex = ref(0)
const step = ref(1) // 1=listen, 2=practice, 3=speak
const isComplete = ref(false)
const earnedStars = ref(0)
const isPlaying = ref(false)
const yoyoMood = ref('idle')
const yoyoBubble = ref('')

// Step 2 状态
const tappedWord = ref(-1)
const tappedCount = ref(0)

// ============================================================
// 句型数据
// ============================================================

/** 根据关键词映射已学单词 */
const KEYWORD_MAP = {
  // greeting
  'Hello': { zh: '你好', emoji: '👋' },
  'Hi': { zh: '嗨', emoji: '👋' },
  'I': { zh: '我', emoji: '🙋' },
  'am': { zh: '是', emoji: '📌' },
  "I'm": { zh: '我是', emoji: '🙋' },
  'YoYo': { zh: '呦呦', emoji: '🐯' },
  'your': { zh: '你的', emoji: '👤' },
  'name': { zh: '名字', emoji: '📛' },
  'my': { zh: '我的', emoji: '👤' },
  'is': { zh: '是', emoji: '📌' },
  'morning': { zh: '早上', emoji: '🌅' },
  'Good': { zh: '好的', emoji: '👍' },
  'Goodbye': { zh: '再见', emoji: '👋' },
  'Bye': { zh: '拜拜', emoji: '👋' },
  'Nice': { zh: '好的', emoji: '👍' },
  'meet': { zh: '见面', emoji: '🤝' },
  'you': { zh: '你', emoji: '👉' },
  'to': { zh: '到', emoji: '➡️' },
  'too': { zh: '也', emoji: '➕' },
  // color
  'What': { zh: '什么', emoji: '❓' },
  "What's": { zh: '什么是', emoji: '❓' },
  'color': { zh: '颜色', emoji: '🎨' },
  'red': { zh: '红色', emoji: '🔴' },
  'blue': { zh: '蓝色', emoji: '🔵' },
  'green': { zh: '绿色', emoji: '🟢' },
  'yellow': { zh: '黄色', emoji: '🟡' },
  'orange': { zh: '橙色', emoji: '🟠' },
  'purple': { zh: '紫色', emoji: '🟣' },
  'white': { zh: '白色', emoji: '⚪' },
  'black': { zh: '黑色', emoji: '⚫' },
  'pink': { zh: '粉色', emoji: '💗' },
  'brown': { zh: '棕色', emoji: '🟤' },
  'It': { zh: '它', emoji: '👆' },
  // number
  'How': { zh: '多少', emoji: '❓' },
  'many': { zh: '多少', emoji: '❓' },
  'one': { zh: '一', emoji: '1️⃣' },
  'two': { zh: '二', emoji: '2️⃣' },
  'three': { zh: '三', emoji: '3️⃣' },
  'four': { zh: '四', emoji: '4️⃣' },
  'five': { zh: '五', emoji: '5️⃣' },
  'six': { zh: '六', emoji: '6️⃣' },
  'seven': { zh: '七', emoji: '7️⃣' },
  'eight': { zh: '八', emoji: '8️⃣' },
  'nine': { zh: '九', emoji: '9️⃣' },
  'ten': { zh: '十', emoji: '🔟' },
  'fingers': { zh: '手指', emoji: '🖐️' },
  'Count': { zh: '数', emoji: '🔢' },
  'count': { zh: '数', emoji: '🔢' },
  'me': { zh: '我', emoji: '🙋' },
  'can': { zh: '能', emoji: '💪' },
  'see': { zh: '看见', emoji: '👀' },
  'There': { zh: '有', emoji: '👀' },
  'are': { zh: '有', emoji: '📌' },
  'see': { zh: '看见', emoji: '👀' },
  // action
  'run': { zh: '跑', emoji: '🏃' },
  'jump': { zh: '跳', emoji: '🦘' },
  'dance': { zh: '跳舞', emoji: '💃' },
  'swim': { zh: '游泳', emoji: '🏊' },
  'sing': { zh: '唱歌', emoji: '🎤' },
  'draw': { zh: '画画', emoji: '🎨' },
  'read': { zh: '阅读', emoji: '📖' },
  'write': { zh: '写字', emoji: '✏️' },
  'Let': { zh: '让', emoji: '💡' },
  "Let's": { zh: '让我们', emoji: '💡' },
  'go': { zh: '去', emoji: '🚶' },
  // weather
  "don't": { zh: '不要', emoji: '🚫' },
  'weather': { zh: '天气', emoji: '🌤️' },
  'sunny': { zh: '晴天', emoji: '☀️' },
  'raining': { zh: '下雨', emoji: '🌧️' },
  'rainy': { zh: '下雨的', emoji: '🌧️' },
  'snowy': { zh: '下雪', emoji: '🌨️' },
  'cloudy': { zh: '多云', emoji: '☁️' },
  'windy': { zh: '刮风', emoji: '🌬️' },
  'hot': { zh: '热', emoji: '🔥' },
  'cold': { zh: '冷', emoji: '🧊' },
  // preference
  'favorite': { zh: '最喜欢的', emoji: '⭐' },
  'like': { zh: '喜欢', emoji: '❤️' },
  'love': { zh: '爱', emoji: '💕' },
  'apples': { zh: '苹果', emoji: '🍎' },
  'cake': { zh: '蛋糕', emoji: '🎂' },
  'Yes': { zh: '是的', emoji: '✅' },
  'No': { zh: '不', emoji: '❌' },
  'please': { zh: '请', emoji: '🙏' },
  'thank': { zh: '谢谢', emoji: '🙏' },
  'Do': { zh: '做', emoji: '🤔' },
  // body
  'nose': { zh: '鼻子', emoji: '👃' },
  'hand': { zh: '手', emoji: '🖐️' },
  'hands': { zh: '手', emoji: '🖐️' },
  'eyes': { zh: '眼睛', emoji: '👀' },
  'ear': { zh: '耳朵', emoji: '👂' },
  'mouth': { zh: '嘴巴', emoji: '👄' },
  'head': { zh: '头', emoji: '🧑' },
  'Clap': { zh: '拍', emoji: '👏' },
  'Touch': { zh: '摸', emoji: '👆' },
  // animal
  'dog': { zh: '狗', emoji: '🐕' },
  'cat': { zh: '猫', emoji: '🐈' },
  'bird': { zh: '鸟', emoji: '🐦' },
  'fish': { zh: '鱼', emoji: '🐟' },
  'rabbit': { zh: '兔子', emoji: '🐇' },
  'duck': { zh: '鸭子', emoji: '🦆' },
  'lion': { zh: '狮子', emoji: '🦁' },
  'tiger': { zh: '老虎', emoji: '🐅' },
  'elephant': { zh: '大象', emoji: '🐘' },
  'monkey': { zh: '猴子', emoji: '🐒' },
  // food
  'eat': { zh: '吃', emoji: '🍽️' },
  'drink': { zh: '喝', emoji: '🥤' },
  'water': { zh: '水', emoji: '💧' },
  'milk': { zh: '牛奶', emoji: '🥛' },
  'rice': { zh: '米饭', emoji: '🍚' },
  'bread': { zh: '面包', emoji: '🍞' },
  'egg': { zh: '鸡蛋', emoji: '🥚' },
  'meat': { zh: '肉', emoji: '🥩' },
  'fruit': { zh: '水果', emoji: '🍇' },
  'vegetable': { zh: '蔬菜', emoji: '🥬' },
  'Want': { zh: '想要', emoji: '🤩' },
  // daily
  'time': { zh: '时间', emoji: '⏰' },
  'bed': { zh: '床', emoji: '🛏️' },
  'up': { zh: '上', emoji: '⬆️' },
  'Get': { zh: '起来', emoji: '🛏️' },
  'school': { zh: '学校', emoji: '🏫' },
  'go': { zh: '去', emoji: '🚶' },
  'sleep': { zh: '睡觉', emoji: '😴' },
  'night': { zh: '晚上', emoji: '🌙' },
  'today': { zh: '今天', emoji: '📅' },
  'day': { zh: '天', emoji: '📅' },
  "How's": { zh: '怎么样', emoji: '❓' },
  "It's": { zh: '它是', emoji: '👆' },
  // family
  'family': { zh: '家庭', emoji: '👨‍👩‍👧‍👦' },
  'mom': { zh: '妈妈', emoji: '👩' },
  'dad': { zh: '爸爸', emoji: '👨' },
  'sister': { zh: '姐姐/妹妹', emoji: '👧' },
  'brother': { zh: '哥哥/弟弟', emoji: '👦' },
  'grandma': { zh: '奶奶', emoji: '👵' },
  'grandpa': { zh: '爷爷', emoji: '👴' },
  'This': { zh: '这个', emoji: '👉' },
}

/** 本轮练习的句型（按分类过滤或全部） */
const roundSentences = computed(() => {
  if (categoryFilter.value) {
    return L2_SENTENCES.filter(s => s.category === categoryFilter.value)
  }
  // 默认随机取 5 个
  const shuffled = [...L2_SENTENCES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
})

const currentSentence = computed(() => roundSentences.value[currentIndex.value])

const progressPercent = computed(() =>
  roundSentences.value.length > 0
    ? ((currentIndex.value + step.value / 3) / roundSentences.value.length) * 100
    : 0
)

/** 当前场景名（用于装饰） */
const currentScene = computed(() => currentSentence.value?.category || 'greeting')

/** 将句子拆分为单词+标注 */
const sentenceWords = computed(() => {
  if (!currentSentence.value) return []
  const en = currentSentence.value.en
  return en.split(/\s+/).map(text => {
    const clean = text.replace(/[.!?,]/g, '')
    const info = KEYWORD_MAP[clean]
    return {
      text,
      isKey: !!info,
      zh: info?.zh || '',
      emoji: info?.emoji || '',
      clean
    }
  })
})

const keyWordCount = computed(() =>
  sentenceWords.value.filter(w => w.isKey).length || 1
)

// ============================================================
// 方法
// ============================================================

/** 标准化文件名（与生成脚本保持一致） */
function sanitizeFilename(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/'/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function playSentence() {
  if (!currentSentence.value) return
  isPlaying.value = true

  // 优先播放预录句子音频（AnaNeural 音质更好）
  const sentencePath = `/audio/${sanitizeFilename(currentSentence.value.en)}.mp3`
  playAudio(sentencePath, () => {
    isPlaying.value = false
  })
}

function tapWord(index, word) {
  tappedWord.value = index
  if (word.isKey) {
    tappedCount.value++
    // TTS 读这个单词
    speak(word.clean, { rate: 0.7 })
  } else {
    // 非关键词也读一下
    speak(word.clean, { rate: 0.8 })
  }
}

function nextStep() {
  if (step.value < 3) {
    step.value++
    tappedWord.value = -1
    tappedCount.value = 0
    if (step.value === 2) {
      setYoyo('thinking', '点点黄色的单词看看~')
    } else if (step.value === 3) {
      setYoyo('happy', '轮到你啦！')
      // 自动播放一次
      setTimeout(() => playSentence(), 500)
    }
  }
}

function handleSay() {
  sfxCorrect()
  setYoyo('celebrate', '说得太好了！')
  advanceSentence()
}

function skipSpeak() {
  setYoyo('idle', '没关系，下一句~')
  advanceSentence()
}

function advanceSentence() {
  if (currentIndex.value < roundSentences.value.length - 1) {
    currentIndex.value++
    step.value = 1
    tappedWord.value = -1
    tappedCount.value = 0
    // 自动播放新句子
    setTimeout(() => playSentence(), 600)
    setYoyo('idle', '')
  } else {
    // 全部完成
    finishRound()
  }
}

function finishRound() {
  isComplete.value = true
  const stars = Math.min(5, Math.max(2, roundSentences.value.length))
  earnedStars.value = stars
  store.addStars(stars)
  sfxComplete()
  sfxStar()
  triggerConfetti(50)
  setYoyo('celebrate', '你太厉害了！')
}

function restart() {
  currentIndex.value = 0
  step.value = 1
  isComplete.value = false
  earnedStars.value = 0
  tappedWord.value = -1
  tappedCount.value = 0
  setYoyo('idle', '再来一次！')
  setTimeout(() => playSentence(), 500)
}

function setYoyo(mood, bubble) {
  yoyoMood.value = mood
  yoyoBubble.value = bubble
  if (bubble) {
    setTimeout(() => { yoyoBubble.value = '' }, 3000)
  }
}

function petYoyo() {
  const tips = ['加油加油~', '你真棒！', '学英语真好玩~']
  setYoyo('happy', tips[Math.floor(Math.random() * tips.length)])
}

function goBack() {
  stop()
  router.push('/')
}

// ============================================================
// 生命周期
// ============================================================

onMounted(() => {
  // 加载 voices
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
  }
  // 自动播放第一句
  setTimeout(() => playSentence(), 800)
  setYoyo('idle', '听我说~')
})

onUnmounted(() => {
  stop()
})
</script>

<style scoped>
/* ============================================================
   页面布局
   ============================================================ */
.sentence-page {
  min-height: 100dvh;
  background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 40%, #DDD6FE 100%);
  display: flex; flex-direction: column;
  position: relative;
  padding-bottom: 80px;
  overflow-y: auto;
}

.sentence-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px 8px;
  position: relative; z-index: 10;
}
.back-btn {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none; border-radius: 50%;
  cursor: pointer; transition: all 0.2s;
}
.back-btn:hover { background: var(--color-primary-light); transform: scale(1.05); }
.back-btn .back-icon { font-size: 1.3rem; }
.back-btn:focus-visible { outline: 3px solid var(--color-primary); outline-offset: 2px; }
.header-info {
  display: flex; align-items: center; gap: 8px; flex: 1;
}
.header-info h2 {
  font-size: 1.1rem; font-weight: 700; color: #4C1D95; margin: 0;
}
.header-emoji { font-size: 1.3rem; }
.header-progress {
  font-size: 0.85rem; color: #7C3AED; font-weight: 600;
  background: rgba(255,255,255,0.7); padding: 4px 12px; border-radius: 12px;
}

/* 进度条 */
.progress-track {
  height: 6px; background: rgba(255,255,255,0.4);
  margin: 0 20px; border-radius: 3px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: linear-gradient(90deg, #8B5CF6, #A78BFA);
  border-radius: 3px; transition: width 0.5s ease;
}

/* 场景装饰 */
.scene-decorations {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
}
.scene-decorations > span {
  position: absolute; font-size: 2rem; opacity: 0.25;
}
.scene-wave { animation: wave 2s ease-in-out infinite; }
.wave-1 { top: 15%; left: 8%; }
.wave-2 { top: 20%; right: 12%; animation-delay: 0.5s; }
.scene-sparkle { animation: sparkle 2s ease-in-out infinite; }
.sparkle-1 { top: 20%; right: 15%; }
.scene-rainbow { top: 8%; left: 50%; transform: translateX(-50%); font-size: 3rem; opacity: 0.2; }
.scene-palette { bottom: 25%; right: 10%; }
.scene-abacus { top: 10%; left: 8%; font-size: 2.5rem; }
.scene-star { animation: starTwinkle 2s ease-in-out infinite; }
.star-1 { top: 15%; right: 20%; }
.star-2 { bottom: 30%; left: 15%; animation-delay: 1s; }
.scene-runner { bottom: 20%; left: 10%; animation: runBounce 1s ease-in-out infinite; }
.scene-music { top: 15%; right: 10%; animation: musicFloat 3s ease-in-out infinite; }
.scene-sun { top: 8%; right: 10%; font-size: 2.5rem; animation: sunPulse 5s ease-in-out infinite; }
.scene-cloud { top: 12%; left: 15%; animation: cloudDrift 10s ease-in-out infinite; }
.scene-rain { bottom: 30%; right: 20%; animation: rainFall 2s linear infinite; }
.scene-heart { animation: heartBeat 2s ease-in-out infinite; }
.heart-1 { top: 15%; left: 12%; }
.heart-2 { top: 22%; right: 15%; animation-delay: 0.5s; }
.scene-mirror { top: 10%; left: 8%; font-size: 2.5rem; }

/* ============================================================
   主要内容
   ============================================================ */
.sentence-main {
  flex: 1; display: flex; flex-direction: column;
  padding: 16px 20px; position: relative; z-index: 5;
}

.practice-area {
  flex: 1; display: flex; flex-direction: column; gap: 20px;
  width: 100%; max-width: 800px; margin: 0 auto;
}

/* 步骤指示器 */
.step-indicator {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  padding: 8px 0;
}
.step-dot {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.4); opacity: 0.4;
  transition: all 0.3s;
}
.step-dot.active { opacity: 0.7; background: rgba(255,255,255,0.7); }
.step-dot.current {
  opacity: 1; background: white;
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
  transform: scale(1.1);
}
.step-line {
  width: 40px; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px;
  transition: background 0.3s;
}
.step-line.filled { background: rgba(139, 92, 246, 0.5); }

/* ============================================================
   句型卡片
   ============================================================ */
.sentence-card {
  background: white; border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.12);
  display: flex; flex-direction: column; align-items: center;
  gap: 20px;
  width: 100%;
}

/* Step 1: 听 */
.listen-label, .practice-label, .speak-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: #7C3AED; font-weight: 600;
}
.listen-icon, .practice-icon, .speak-icon { font-size: 1.2rem; }

.sentence-display {
  display: flex; align-items: center; gap: 16px;
  padding: 24px 36px; background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 20px; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 74px;
  width: 100%; max-width: 640px;
}
.sentence-display:active { transform: scale(0.98); }
.sentence-en {
  font-size: 1.5rem; font-weight: 700; color: #4C1D95;
  line-height: 1.4;
}
.play-btn {
  width: 48px; height: 48px; border-radius: 50%; border: none;
  background: #8B5CF6; color: white; font-size: 1.3rem;
  cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.play-btn:active { transform: scale(0.9); }
.play-btn:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 2px; }
.play-btn.playing { animation: pulse 1s ease-in-out infinite; }
.playing-wave { animation: wave 0.5s ease-in-out infinite; }
.play-btn.small {
  width: 36px; height: 36px; font-size: 1rem;
}

.sentence-zh {
  padding: 8px 20px; background: rgba(251, 191, 36, 0.1);
  border-radius: 12px;
}
.zh-text {
  font-size: 1rem; color: #92400E;
}

.listen-hint {
  font-size: 0.8rem; color: #A78BFA; opacity: 0.7;
}

/* Step 2: 点词练习 */
.sentence-words {
  display: flex; flex-wrap: wrap; gap: 10px;
  justify-content: center; padding: 8px 0;
}
.word-chip {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 14px; background: #F5F3FF;
  border-radius: 14px; cursor: pointer;
  transition: all 0.2s; position: relative;
  border: 2px solid transparent;
}
.word-chip.is-key {
  background: #FEF3C7; border-color: #FCD34D;
}
.word-chip.highlighted {
  transform: scale(1.08);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.2);
}
.chip-en {
  font-size: 1.1rem; font-weight: 600; color: #4C1D95;
}
.chip-meaning {
  position: absolute; top: -32px; left: 50%; transform: translateX(-50%);
  background: white; padding: 4px 10px; border-radius: 10px;
  font-size: 0.8rem; white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  color: #92400E; font-weight: 600;
}
.practice-full {
  margin-top: 8px;
}
.btn-play-full {
  padding: 10px 24px; border-radius: 16px; border: none;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: transform 0.2s;
}
.btn-play-full:active { transform: scale(0.95); }
.btn-play-full:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 2px; }

/* Step 3: 跟读 */
.speak-sentence {
  display: flex; align-items: center; gap: 12px;
  padding: 20px 32px; background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 20px; cursor: pointer;
  width: 100%; max-width: 640px;
}
.speak-en {
  font-size: 1.4rem; font-weight: 700; color: #4C1D95;
}
.speak-zh {
  font-size: 0.95rem; color: #92400E;
  padding: 6px 16px; background: rgba(251, 191, 36, 0.1);
  border-radius: 10px;
}
.speak-actions {
  display: flex; gap: 12px; margin-top: 8px;
}
.btn-say {
  padding: 14px 32px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white; font-size: 1.1rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: transform 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.btn-say:active { transform: scale(0.95); }
.btn-say:focus-visible { outline: 3px solid #10B981; outline-offset: 2px; }
.btn-icon { font-size: 1.2rem; }

.btn-skip-speak {
  padding: 14px 20px; border-radius: 20px;
  background: rgba(255,255,255,0.6); border: 2px solid #E5E7EB;
  color: #9CA3AF; font-size: 0.95rem; cursor: pointer;
  transition: transform 0.2s;
}
.btn-skip-speak:active { transform: scale(0.95); }
.btn-skip-speak:focus-visible { outline: 3px solid #9CA3AF; outline-offset: 2px; }

/* 底部按钮 */
.bottom-actions {
  display: flex; justify-content: center; padding: 12px 0;
}
.btn-next {
  padding: 14px 40px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white; font-size: 1.05rem; font-weight: 700;
  cursor: pointer; transition: transform 0.2s;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}
.btn-next:active { transform: scale(0.95); }
.btn-next:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 2px; }

/* ============================================================
   完成庆祝
   ============================================================ */
.complete-screen {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 32px 20px; flex: 1;
}
.complete-stars {
  display: flex; gap: 8px; margin-bottom: 8px;
}
.star-pop {
  font-size: 2.5rem;
  animation: starPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.complete-title {
  font-size: 1.8rem; font-weight: 800; color: #4C1D95; margin: 0;
}
.complete-sub {
  font-size: 1rem; color: #7C3AED; margin: 0;
}
.complete-list {
  width: 100%; max-width: 400px;
  display: flex; flex-direction: column; gap: 8px;
  max-height: 200px; overflow-y: auto;
}
.complete-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; background: white; border-radius: 12px;
  gap: 12px;
}
.complete-en { font-weight: 600; color: #4C1D95; font-size: 0.9rem; }
.complete-zh { color: #92400E; font-size: 0.85rem; }

.complete-actions {
  display: flex; gap: 12px; margin-top: 12px;
}
.btn-again {
  padding: 14px 32px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white; font-size: 1rem; font-weight: 700;
  cursor: pointer; transition: transform 0.2s;
}
.btn-again:active { transform: scale(0.95); }
.btn-again:focus-visible { outline: 3px solid #8B5CF6; outline-offset: 2px; }
.btn-home {
  padding: 14px 32px; border-radius: 20px;
  background: rgba(255,255,255,0.7); border: 2px solid #DDD6FE;
  color: #7C3AED; font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: transform 0.2s;
}
.btn-home:active { transform: scale(0.95); }
.btn-home:focus-visible { outline: 3px solid #7C3AED; outline-offset: 2px; }

/* ============================================================
   呦呦位置
   ============================================================ */
.sentence-yoyo {
  position: fixed; bottom: 16px; right: 16px; z-index: 50;
}

/* ============================================================
   动画
   ============================================================ */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}
@keyframes sparkle {
  0%, 100% { opacity: 0.15; transform: scale(0.8); }
  50% { opacity: 0.4; transform: scale(1.2); }
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.5; transform: scale(1.1); }
}
@keyframes runBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes musicFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(10deg); }
}
@keyframes sunPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}
@keyframes cloudDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(20px); }
}
@keyframes rainFall {
  0% { transform: translateY(0); opacity: 0.3; }
  100% { transform: translateY(20px); opacity: 0; }
}
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
}
@keyframes starPop {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* 过渡 */
.celebrate-pop-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.celebrate-pop-leave-active { transition: all 0.3s ease; }
.celebrate-pop-enter-from { opacity: 0; transform: scale(0.8); }
.celebrate-pop-leave-to { opacity: 0; transform: scale(0.8); }

.chip-pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.chip-pop-leave-active { transition: all 0.2s ease; }
.chip-pop-enter-from { opacity: 0; transform: translateX(-50%) translateY(8px); }
.chip-pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(-4px); }

/* ===== 平板横屏适配（≥900px） ===== */
@media (min-width: 900px) {
  .practice-area {
    max-width: 900px;
  }
  .sentence-card {
    padding: 32px 40px;
  }
  .sentence-display {
    max-width: 720px;
    padding: 28px 40px;
  }
  .speak-sentence {
    max-width: 720px;
    padding: 24px 36px;
  }
  .sentence-en {
    font-size: 1.7rem;
  }
  .speak-en {
    font-size: 1.6rem;
  }
  .word-chip {
    padding: 12px 18px;
  }
  .chip-en {
    font-size: 1.25rem;
  }
}

/* ===== 华为 MatePad 11.5S 超宽屏适配（≥1600px） ===== */
@media (min-width: 1600px) {
  .practice-area {
    max-width: 1100px;
  }
  .sentence-card {
    padding: 36px 48px;
  }
  .sentence-display {
    max-width: 860px;
    padding: 32px 48px;
  }
  .speak-sentence {
    max-width: 860px;
    padding: 28px 44px;
  }
  .sentence-en {
    font-size: 1.9rem;
  }
  .speak-en {
    font-size: 1.8rem;
  }
}

/* ===== 小屏幕回退（≤480px） ===== */
@media (max-width: 480px) {
  .practice-area {
    max-width: 100%;
  }
  .sentence-card {
    padding: 20px 16px;
  }
  .sentence-display {
    padding: 16px 20px;
    max-width: 100%;
  }
  .speak-sentence {
    padding: 14px 18px;
    max-width: 100%;
  }
  .sentence-en {
    font-size: 1.2rem;
  }
  .speak-en {
    font-size: 1.1rem;
  }
}
</style>
