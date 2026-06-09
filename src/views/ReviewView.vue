<template>
  <div class="review-page" :style="{ '--scene-color': sceneColor }">
    <!-- 背景浮动装饰 -->
    <div class="bg-deco" aria-hidden="true">
      <span class="deco-item deco-1">✨</span>
      <span class="deco-item deco-2"></span>
      <span class="deco-item deco-3">⭐</span>
      <span class="deco-item deco-4"></span>
    </div>

    <!-- 顶部 -->
    <header class="review-header">
      <button class="btn-back" @click="goHome">
        <span class="back-icon">🏠</span>
      </button>
      <div class="review-title">
        <span class="review-icon">🔄</span>
        <h2>复习</h2>
        <span v-if="reviewWords.length > 0" class="review-count">第 {{ currentIndex + 1 }} / {{ reviewWords.length }}</span>
      </div>
      <div v-if="reviewWords.length > 0" class="review-progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </header>

    <!-- 空状态 — 呦呦趣味引导 -->
    <div v-if="reviewWords.length === 0" class="review-empty anim-fade-up">
      <LearnAvatar :mood="'happy'" :bubble-text="emptyBubble" :show-stars="true" class="empty-yoyo" />
      <h2>{{ emptyTitle }}</h2>
      <p>{{ emptyMessage }}</p>
      <div class="empty-actions">
        <button class="btn-continue" @click="goHome">🏠 返回首页</button>
        <button class="btn-continue btn-secondary" @click="goLearn">📚 去学新单词</button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <main v-else class="review-content">
      <!-- Step 1: 认读 -->
      <div v-if="step === 1" class="step-recognize anim-fade-up">
        <div class="step-badge">第 1 步 · 看一看</div>
        <div class="card anim-float">
          <div class="card-emoji">{{ word.emoji }}</div>
          <div class="card-word">{{ word.en }}</div>
          <div class="card-phonetic">{{ word.phonetic }}</div>
          <div class="card-zh">{{ word.zh }}</div>
        </div>
        <div class="step-actions">
          <button class="btn-listen" @click="playWord">🔊 听发音</button>
          <button class="btn-skip" @click="skipToNext">跳过 →</button>
          <button class="btn-next" @click="nextStep">我记住了 →</button>
        </div>
      </div>

      <!-- Step 2: 辨音 -->
      <div v-else-if="step === 2" class="step-listen anim-fade-up">
        <div class="step-badge">第 2 步 · 听一听</div>
        <button class="btn-listen-big" @click="playWord" :class="{ active: isSpeaking }">
          <span class="listen-icon">🔊</span>
        </button>
        <p class="listen-hint">哪个单词是你听到的？</p>
        <div class="options-grid">
          <button v-for="opt in options" :key="opt.id" 
            class="option-btn" 
            :class="{
              correct: feedback === 'correct' && opt.id === word.id,
              wrong: feedback === 'wrong' && opt.id !== word.id && !isOptionSelected(opt.id),
              dimmed: feedback && opt.id !== word.id && !isOptionSelected(opt.id)
            }"
            :disabled="!!feedback"
            @click="pickOption(opt)">
            <span class="opt-emoji">{{ opt.emoji }}</span>
            <span class="opt-word">{{ opt.en }}</span>
          </button>
        </div>
        <Transition name="pop">
          <div v-if="feedback" class="feedback-msg" :class="feedbackClass">{{ feedbackText }}</div>
        </Transition>
      </div>

      <!-- Step 3: 跟读 -->
      <div v-else-if="step === 3" class="step-repeat anim-fade-up">
        <div class="step-badge">第 3 步 · 读一读</div>
        <div class="repeat-card">
          <span class="repeat-emoji">{{ word.emoji }}</span>
          <span class="repeat-word">{{ word.en }}</span>
        </div>
        <div class="mic-area" :class="{ recording: isSpeaking, done: repeatDone }" @click="speakWord">
          <span class="mic-icon">{{ repeatDone ? '✅' : '🎤' }}</span>
          <span class="mic-label">{{ repeatDone ? '太棒了！' : '点我开口读' }}</span>
          <div class="mic-waves" v-if="isSpeaking">
            <span v-for="i in 4" :key="i" :style="{ animationDelay: i * 0.15 + 's' }"></span>
          </div>
        </div>
        <button class="btn-next" v-if="repeatDone" @click="nextStep">继续 →</button>
      </div>
    </main>

    <!-- 完成弹窗 -->
    <Transition name="fade">
      <div v-if="showComplete" class="complete-overlay" @click.self="goHome">
        <div class="complete-modal anim-bounce">
          <span class="complete-icon">🏆</span>
          <h2 class="complete-title">复习完成！</h2>
          <p class="complete-text">
            <span v-if="reviewWords.length === 1">这个单词你记得很牢哦！</span>
            <span v-else>{{ reviewWords.length }} 个单词全部巩固啦！</span>
          </p>
          <div class="complete-stars">
            <span v-for="i in 3" :key="i" class="star star-active anim-fade-up"
              :style="{ animationDelay: i * 0.2 + 's' }">⭐</span>
          </div>
          <div class="complete-actions">
            <button class="btn-complete-again" @click="reviewAgain">🔄 再学一次</button>
            <button class="btn-complete-home" @click="goHome">🏠 回到首页</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 呦呦 -->
    <LearnAvatar :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showYoyoStars"
      :is-speaking="isSpeaking"
      class="review-yoyo" :show-hat="store.showHat" :show-glasses="store.showGlasses"
      :show-crown="store.showCrown" />

    <!-- 宠物学习伴侣 -->
    <PetCompanion
      :show-bubble="companion.showPetBubble"
      :reaction="companion.activeReaction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect, sfxWrong, sfxComplete } from '@/composables/useSfx'
import { triggerConfetti } from '@/composables/useConfetti'
import { usePetCompanion } from '@/composables/usePetCompanion.js'
import PetCompanion from '@/components/PetCompanion.vue'
import LearnAvatar from '@/components/common/LearnAvatar.vue'

const companion = usePetCompanion()

const router = useRouter()
const store = useLearningStore()
const { speak, isSpeaking, stop } = useSpeech()

const reviewWords = ref([])
const currentIndex = ref(0)
const step = ref(1) // 1=认读, 2=辨音, 3=跟读
const yoyoMood = ref('idle')
const yoyoBubble = ref('')
const showYoyoStars = ref(false)
const feedback = ref('') // 'correct' | 'wrong' | ''
const feedbackText = ref('')
const repeatDone = ref(false)
const showComplete = ref(false)
const selectedOptionId = ref(null)

const word = computed(() => reviewWords.value[currentIndex.value] || {})

// 空状态趣味文案
const emptyTitle = computed(() => {
  const todayWords = store.todayLearned || 0
  if (todayWords === 0) return '还没有需要复习的单词哦~'
  if (todayWords < 10) return '今天学得很认真！暂时没有需要复习的~'
  return '哇！今天学了这么多，暂时不需要复习哦！'
})

const emptyMessage = computed(() => {
  const messages = [
    '去学几个新单词吧，呦呦在等你呢！',
    '休息一下，然后继续探险吧~',
    '所有单词都记住了，太厉害了！去解锁新内容吧~'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
})

const emptyBubble = computed(() => {
  const bubbles = [
    '太棒了！所有单词都记住了~',
    '去学新的吧！我在等你呢~',
    '休息一下，喝口水再继续~ 💧'
  ]
  return bubbles[Math.floor(Math.random() * bubbles.length)]
})

const progressPct = computed(() => {
  if (!reviewWords.value.length) return 0
  return Math.round(((currentIndex.value) / reviewWords.value.length) * 100)
})

const sceneColor = computed(() => {
  const colors = ['#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA', '#FFF8E1']
  return colors[currentIndex.value % colors.length]
})

const feedbackClass = computed(() => {
  if (feedback.value === 'correct') return 'correct'
  if (feedback.value === 'wrong') return 'wrong'
  return ''
})

const options = computed(() => {
  if (!word.value?.en) return []
  const correct = word.value
  const pool = correct.level === 2 ? ALL_L2_WORDS : ALL_L1_WORDS
  const others = pool.filter(w => w.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3)
  return [correct, ...others].sort(() => Math.random() - 0.5)
})

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text
  showYoyoStars.value = stars
}

function playWord() {
  if (word.value?.en) speak(word.value.en, { rate: 0.8 })
}

function isOptionSelected(id) {
  return selectedOptionId.value === id
}

function pickOption(opt) {
  if (feedback.value) return // 已锁定，防止重复点击
  selectedOptionId.value = opt.id
  if (opt.id === word.value.id) {
    feedback.value = 'correct'
    feedbackText.value = 'Great! 答对了！🌟'
    sfxCorrect()
    companion.onAnswerCorrect()
    setYoyo('happy', '太厉害了！', true)
    
    setTimeout(() => {
      feedback.value = ''
      feedbackText.value = ''
      selectedOptionId.value = null
      nextStep()
    }, 1500)
  } else {
    feedback.value = 'wrong'
    feedbackText.value = '再想想~'
    sfxWrong()
    companion.onAnswerWrong()
    setYoyo('encourage', '没关系，再试试！')
    
    setTimeout(() => {
      feedback.value = ''
      feedbackText.value = ''
      selectedOptionId.value = null
    }, 1200)
  }
}

function speakWord() {
  if (repeatDone.value) return
  playWord()
  // 模拟跟读
  setTimeout(() => {
    repeatDone.value = true
    sfxCorrect()
    setYoyo('happy', '读得真好听！👏', true)
    // 1.5s 后自动前进到下一个单词
    setTimeout(() => nextStep(), 1500)
  }, 1500)
}

function skipToNext() {
  // 跳过当前步骤，直接进入下一步
  if (step.value < 3) {
    step.value++
    handleStepEntry()
  } else {
    // 跳过整个单词，进入下一个
    if (currentIndex.value < reviewWords.value.length - 1) {
      currentIndex.value++
      step.value = 1
      repeatDone.value = false
      feedback.value = ''
      feedbackText.value = ''
      selectedOptionId.value = null
      setYoyo('idle', `下一个：${word.value.zh}`)
      setTimeout(() => playWord(), 400)
    } else {
      showCompleteScreen()
    }
  }
}

function nextStep() {
  if (step.value < 3) {
    step.value++
    handleStepEntry()
  } else {
    // 完成当前单词复习
    const wordId = word.value.id
    handleReviewComplete(wordId, true)
    
    if (currentIndex.value < reviewWords.value.length - 1) {
      currentIndex.value++
      step.value = 1
      repeatDone.value = false
      feedback.value = ''
      feedbackText.value = ''
      selectedOptionId.value = null
      handleStepEntry()
    } else {
      showCompleteScreen()
    }
  }
}

function handleStepEntry() {
  feedback.value = ''
  feedbackText.value = ''
  selectedOptionId.value = null
  
  if (step.value === 1) {
    setYoyo('idle', `我们来复习 "${word.value.zh}" 吧！`)
    setTimeout(() => playWord(), 400)
  } else if (step.value === 2) {
    setYoyo('thinking', '仔细听哦~')
    setTimeout(() => playWord(), 400)
  } else if (step.value === 3) {
    setYoyo('encourage', '大声读出来！')
    setTimeout(() => playWord(), 400)
  }
}

/**
 * 处理复习完成的单词
 * @param {string} wordId - 单词ID
 * @param {boolean} completed - 是否完整完成复习
 */
function handleReviewComplete(wordId, completed = true) {
  if (!wordId) return
  
  // 如果完整完成复习,标记掌握并重新加入队列
  if (completed) {
    store.markWordMastered(wordId)
    store.addToReviewQueue(wordId)
  } else {
    // 如果中断复习,将单词重新加入队列
    store.addToReviewQueue(wordId)
  }
}

function showCompleteScreen() {
  triggerConfetti(50)
  sfxComplete()
  // P2-2: 记录复习次数
  store.settings.reviewCount = (store.settings.reviewCount || 0) + 1
  store.persistSettings?.()
  showComplete.value = true
  companion.onLessonComplete({ category: 'review' })
  setYoyo('celebrate', '全部复习完成！🎉', true)
}

function reviewAgain() {
  showComplete.value = false
  currentIndex.value = 0
  step.value = 1
  repeatDone.value = false
  feedback.value = ''
  feedbackText.value = ''
  selectedOptionId.value = null
  handleStepEntry()
}

function goHome() {
  stop()
  // 如果还有未复习完的单词,将当前单词重新加入队列
  if (reviewWords.value.length > 0 && currentIndex.value < reviewWords.value.length) {
    const currentWordId = word.value?.id
    if (currentWordId) {
      handleReviewComplete(currentWordId, false)
    }
  }
  router.push('/')
}

function goLearn() {
  stop()
  // 如果还有未复习完的单词,将当前单词重新加入队列
  if (reviewWords.value.length > 0 && currentIndex.value < reviewWords.value.length) {
    const currentWordId = word.value?.id
    if (currentWordId) {
      handleReviewComplete(currentWordId, false)
    }
  }
  router.push('/learn')
}

onMounted(async () => {
  await store.loadFromDB()
  const words = store.getDueReviewWords()
  reviewWords.value = words || []
  if (reviewWords.value.length > 0) {
    setYoyo('summon', `有 ${reviewWords.value.length} 个单词需要复习，准备好了吗？`)
  }
})

onUnmounted(() => {
  stop()
  // 组件卸载时,如果还有未复习完的单词,将当前单词重新加入队列
  // 这样可以防止单词在复习中途退出时丢失
  if (reviewWords.value.length > 0 && currentIndex.value < reviewWords.value.length) {
    const currentWordId = word.value?.id
    if (currentWordId) {
      handleReviewComplete(currentWordId, false)
    }
  }
})
</script>

<style scoped>
.review-page {
  width: 100vw; height: 100dvh;
  display: flex; flex-direction: column;
  background: linear-gradient(180deg, var(--scene-color) 0%, var(--bg-main) 60%);
  position: relative; overflow: hidden;
}

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

/* ===== 顶部栏 ===== */
.review-header {
  padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-light);
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

.review-title {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.review-icon { font-size: 1.2rem; }

.review-title h2 {
  font-size: var(--font-size-lg);
  color: var(--text-primary); margin: 0;
}

.review-count {
  font-size: var(--font-size-xs);
  color: var(--text-hint); margin-left: auto;
}

.review-progress {
  height: 6px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #FF6B2B);
  transition: width 0.5s ease;
  border-radius: var(--radius-full);
}

/* ===== 主要内容区 ===== */
.review-content {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-xl);
  padding-top: var(--space-2xl);
  padding-bottom: 160px; /* 安全区：为呦呦预留空间 */
}

/* ===== 空状态 ===== */
.review-empty {
  text-align: center;
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  min-height: 60vh;
  justify-content: center;
}

.empty-yoyo {
  transform: scale(1.2);
  margin-bottom: var(--space-sm);
}

.review-empty h2 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin: 0;
}

.review-empty p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
}

.empty-actions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  justify-content: center;
}

.btn-continue {
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 700; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-continue:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 20px rgba(255,140,66,0.3); }

.btn-secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 2px solid var(--border-light);
}
.btn-secondary:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

/* ===== Step 徽章 ===== */
.step-badge {
  display: inline-block;
  padding: var(--space-xs) var(--space-lg);
  background: rgba(255,255,255,0.9);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-primary-dark);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-card);
  animation: badgeFloat 2.5s ease-in-out infinite;
}
@keyframes badgeFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ===== Step 1: 认读 ===== */
.step-recognize {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xl);
  position: relative; z-index: 1;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 2px solid rgba(255,255,255,0.6);
  position: relative; overflow: hidden;
  min-width: 280px;
}
.card::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 40%, rgba(255,140,66,0.08), transparent 60%);
  pointer-events: none;
}

@keyframes anim-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.anim-float { animation: anim-float 3s ease-in-out infinite; }

.card-emoji {
  font-size: 5rem;
  margin-bottom: var(--space-lg);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  transition: transform 0.3s;
}
.card:hover .card-emoji { transform: scale(1.15) rotate(-5deg); }

.card-word {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.card-phonetic {
  font-size: var(--font-size-sm);
  color: var(--text-hint);
  margin-bottom: var(--space-sm);
}

.card-zh {
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
}

.step-actions {
  display: flex; gap: var(--space-md);
}

.btn-listen {
  padding: var(--space-sm) var(--space-xl);
  background: var(--border-light);
  color: var(--text-primary);
  border: none; border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600; cursor: pointer;
  transition: all 0.3s;
}
.btn-listen:hover { background: var(--color-primary-light); transform: translateY(-2px); }

.btn-skip {
  padding: var(--space-sm) var(--space-lg);
  background: none;
  color: var(--text-hint);
  border: 2px dashed var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 600; cursor: pointer;
  transition: all 0.3s;
}
.btn-skip:hover { border-color: var(--color-primary); color: var(--color-primary); background: rgba(255,140,66,0.05); }

.btn-next {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 700; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.btn-next::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  transform: translateX(-100%);
}
.btn-next:hover::after { animation: shimmer 1.2s infinite; }
.btn-next:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 24px rgba(255,140,66,0.3); }
.btn-next:active { transform: scale(0.97); }
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* ===== Step 2: 辨音 ===== */
.step-listen {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-lg);
  position: relative; z-index: 1;
}

.btn-listen-big {
  width: 90px; height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(255,140,66,0.3);
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center;
}
.btn-listen-big:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(255,140,66,0.4); }
.btn-listen-big.active { animation: listenPulse 1s ease-in-out infinite; }
.listen-icon { font-size: 2.5rem; }
@keyframes listenPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,66,0.4); }
  50% { box-shadow: 0 0 0 14px rgba(255,140,66,0); }
}

.listen-hint {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  margin: 0;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  width: 100%;
  max-width: 420px;
}

.option-btn {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: var(--space-xs);
  min-height: 120px;
  padding: var(--space-md);
  background: var(--bg-card);
  border: 3px solid var(--border-light);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.option-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 8px 24px rgba(255,140,66,0.15);
}
.option-btn:active:not(:disabled) { transform: scale(0.97); }
.option-btn .opt-emoji { font-size: 2.5rem; transition: transform 0.3s; }
.option-btn:hover:not(:disabled) .opt-emoji { transform: scale(1.15) rotate(-5deg); }
.option-btn .opt-word { font-size: var(--font-size-lg); font-weight: 700; color: var(--text-primary); }

.option-btn.correct {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  animation: optionCorrectBounce 0.5s var(--ease-bounce);
  box-shadow: 0 6px 24px rgba(76,175,80,0.25);
}
.option-btn.correct .opt-emoji { animation: emojiCelebrate 0.6s var(--ease-bounce); }

.option-btn.wrong {
  border-color: var(--color-danger);
  background: #FFEBEE;
  animation: shake 0.4s ease;
}

.option-btn.dimmed {
  opacity: 0.3;
  transform: scale(0.95);
}

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

.feedback-msg {
  font-size: var(--font-size-xl);
  font-weight: 700;
  padding: var(--space-sm) var(--space-xl);
  border-radius: var(--radius-full);
}
.feedback-msg.correct { color: var(--color-success); background: #E8F5E9; }
.feedback-msg.wrong { color: var(--color-danger); background: #FFEBEE; }

/* ===== Step 3: 跟读 ===== */
.step-repeat {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-xl);
  position: relative; z-index: 1;
}

.repeat-card {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-sm);
}
.repeat-emoji {
  font-size: 4.5rem;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));
  animation: sayEmojiFloat 3s ease-in-out infinite;
}
@keyframes sayEmojiFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.repeat-word {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: var(--color-primary);
}

.mic-area {
  width: 160px; height: 160px;
  border-radius: 50%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: var(--space-xs);
  cursor: pointer;
  background: var(--bg-card);
  border: 3px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.mic-area::before {
  content: ''; position: absolute; inset: -4px; border-radius: 50%;
  border: 2px dashed rgba(255,140,66,0.2);
  animation: micRingRotate 8s linear infinite;
}
@keyframes micRingRotate { 100% { transform: rotate(360deg); } }

.mic-area:hover {
  border-color: var(--color-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255,140,66,0.15);
}

.mic-area.recording {
  border-color: var(--color-danger);
  background: #FFF5F5;
  animation: micRecordPulse 1.5s ease-in-out infinite;
}
@keyframes micRecordPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,53,69,0.4); transform: scale(1); }
  50% { box-shadow: 0 0 0 16px rgba(220,53,69,0); transform: scale(1.03); }
}

.mic-area.done {
  border-color: var(--color-success);
  background: #E8F5E9;
  pointer-events: none;
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

/* ===== 完成弹窗 ===== */
.complete-overlay {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-overlay);
}

.complete-modal {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  text-align: center;
  max-width: 420px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  position: relative; overflow: hidden;
}
.complete-modal::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255,140,66,0.08), transparent 70%);
  pointer-events: none;
}

.complete-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-lg);
  animation: trophySpin 2s ease-in-out infinite;
}
@keyframes trophySpin {
  0%, 100% { transform: rotateY(0deg) scale(1); }
  25% { transform: rotateY(10deg) scale(1.05); }
  75% { transform: rotateY(-10deg) scale(1.05); }
}

.complete-title {
  font-size: var(--font-size-2xl);
  color: var(--color-primary-dark);
  margin-bottom: var(--space-sm);
}

.complete-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
  font-size: var(--font-size-lg);
}

.complete-stars {
  display: flex; justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.star { font-size: 2.5rem; }
.star-active {
  opacity: 1;
  animation: starPop 0.5s var(--ease-bounce) both;
}
@keyframes starPop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.complete-actions {
  display: flex; justify-content: center; gap: var(--space-md);
}

.btn-complete-again {
  padding: var(--space-md) var(--space-xl);
  background: var(--border-light);
  color: var(--text-primary);
  border: none; border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: 700; cursor: pointer;
  transition: all 0.3s;
}
.btn-complete-again:hover { background: var(--color-primary-light); transform: translateY(-2px); }

.btn-complete-home {
  padding: var(--space-md) var(--space-2xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff; border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 700; cursor: pointer;
  transition: all 0.3s;
}
.btn-complete-home:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 6px 20px rgba(255,140,66,0.3); }

/* ===== 呦呦 ===== */
.review-yoyo {
  position: absolute;
  bottom: 16px;
  right: 20px;
  z-index: 10;
  transform: scale(0.85);
  transform-origin: bottom right;
}
/* 呦呦气泡朝向左上 */
.review-yoyo .yoyo-bubble {
  right: auto;
  left: auto;
  margin-right: 0;
}
.review-yoyo .yoyo-bubble::before,
.review-yoyo .yoyo-bubble::after {
  left: auto;
  right: 20px;
}

/* ===== 动画工具类 ===== */
.anim-fade-up {
  animation: fadeUp 0.5s var(--ease-smooth);
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.anim-bounce {
  animation: bounceIn 0.6s var(--ease-bounce);
}
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* Pop 过渡 */
.pop-enter-active { animation: pop 0.3s var(--ease-bounce); }
.pop-leave-active { animation: pop 0.2s ease reverse; }
@keyframes pop {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Fade 过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
