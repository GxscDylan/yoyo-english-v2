<template>
  <div class="sentence-page">
    <!-- 顶部导航 -->
    <header class="sentence-header">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span>
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
    <YoyoMascot
      :mood="yoyoMood"
      :bubble-text="yoyoBubble"
      class="sentence-yoyo"
      @click="petYoyo"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { L2_SENTENCES, ALL_WORDS } from '@/data/words'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxComplete, sfxStar } from '@/composables/useSfx'
import YoyoMascot from '@/components/common/YoyoMascot.vue'

const router = useRouter()
const route = useRoute()
const store = useLearningStore()
const { speak, playAudio, stop, isSpeaking } = useSpeech()

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
  'YoYo': { zh: '呦呦', emoji: '🐯' },
  'name': { zh: '名字', emoji: '📛' },
  'morning': { zh: '早上', emoji: '🌅' },
  'Goodbye': { zh: '再见', emoji: '👋' },
  'Nice': { zh: '好的', emoji: '👍' },
  'meet': { zh: '见面', emoji: '🤝' },
  // color
  'color': { zh: '颜色', emoji: '🎨' },
  'red': { zh: '红色', emoji: '🔴' },
  'blue': { zh: '蓝色', emoji: '🔵' },
  'green': { zh: '绿色', emoji: '🟢' },
  // number
  'many': { zh: '多少', emoji: '❓' },
  'three': { zh: '三', emoji: '3️⃣' },
  'five': { zh: '五', emoji: '5️⃣' },
  'fingers': { zh: '手指', emoji: '🖐️' },
  'Count': { zh: '数', emoji: '🔢' },
  // action
  'run': { zh: '跑', emoji: '🏃' },
  'jump': { zh: '跳', emoji: '🦘' },
  'dance': { zh: '跳舞', emoji: '💃' },
  'swim': { zh: '游泳', emoji: '🏊' },
  // weather
  'weather': { zh: '天气', emoji: '🌤️' },
  'sunny': { zh: '晴天', emoji: '☀️' },
  'raining': { zh: '下雨', emoji: '🌧️' },
  'snowy': { zh: '下雪', emoji: '🌨️' },
  // preference
  'like': { zh: '喜欢', emoji: '❤️' },
  'apples': { zh: '苹果', emoji: '🍎' },
  'cake': { zh: '蛋糕', emoji: '🎂' },
  'Yes': { zh: '是的', emoji: '✅' },
  'No': { zh: '不', emoji: '❌' },
  // body
  'nose': { zh: '鼻子', emoji: '👃' },
  'hand': { zh: '手', emoji: '🖐️' },
  'eyes': { zh: '眼睛', emoji: '👀' },
  'Clap': { zh: '拍', emoji: '👏' },
  'Touch': { zh: '摸', emoji: '👆' },
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
    ? ((currentIndex.value + (step.value - 1) / 3) / roundSentences.value.length) * 100
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

function playSentence() {
  if (!currentSentence.value) return
  isPlaying.value = true
  // 直接用 Web Speech TTS 播放整个句子（比逐词音频更自然）
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(currentSentence.value.en)
    utter.rate = 0.65
    utter.lang = 'en-US'
    utter.volume = 1.0
    const voices = window.speechSynthesis.getVoices()
    const enVoice = voices.find(v => v.lang.startsWith('en'))
    if (enVoice) utter.voice = enVoice
    utter.onend = () => { isPlaying.value = false }
    utter.onerror = () => { isPlaying.value = false }
    window.speechSynthesis.speak(utter)
  } else {
    // Fallback to audio file
    playAudio(`/audio/${currentSentence.value.en.toLowerCase().replace(/\s+/g, '-')}.mp3`, () => {
      isPlaying.value = false
    })
  }
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
  padding-bottom: 120px;
}

.sentence-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px 8px;
  position: relative; z-index: 10;
}
.back-btn {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.8); border: none; cursor: pointer;
  font-size: 1.2rem; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.back-btn:active { transform: scale(0.9); }
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
  padding: 32px 24px; min-height: 260px;
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.12);
  display: flex; flex-direction: column; align-items: center;
  gap: 20px;
}

/* Step 1: 听 */
.listen-label, .practice-label, .speak-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: #7C3AED; font-weight: 600;
}
.listen-icon, .practice-icon, .speak-icon { font-size: 1.2rem; }

.sentence-display {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 28px; background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 20px; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 70px;
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

/* Step 3: 跟读 */
.speak-sentence {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 24px; background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
  border-radius: 20px; cursor: pointer;
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
.btn-icon { font-size: 1.2rem; }

.btn-skip-speak {
  padding: 14px 20px; border-radius: 20px;
  background: rgba(255,255,255,0.6); border: 2px solid #E5E7EB;
  color: #9CA3AF; font-size: 0.95rem; cursor: pointer;
  transition: transform 0.2s;
}
.btn-skip-speak:active { transform: scale(0.95); }

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
.btn-home {
  padding: 14px 32px; border-radius: 20px;
  background: rgba(255,255,255,0.7); border: 2px solid #DDD6FE;
  color: #7C3AED; font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: transform 0.2s;
}
.btn-home:active { transform: scale(0.95); }

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
</style>
