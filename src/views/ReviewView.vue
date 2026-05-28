<template>
  <div class="review-page" :style="{ background: `linear-gradient(135deg, ${sceneColor}, ${sceneColor}dd)` }">
    <!-- 顶部 -->
    <header class="review-header">
      <button class="btn-back" @click="goHome">← 首页</button>
      <div class="review-title">
        <span class="review-icon">🔄</span>
        <h2>复习</h2>
        <span class="review-count">第 {{ currentIndex + 1 }} / {{ reviewWords.length }}</span>
      </div>
      <div class="review-progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </header>

    <!-- 空状态 -->
    <div v-if="reviewWords.length === 0" class="review-empty">
      <span class="empty-icon">✅</span>
      <h2>暂无复习内容</h2>
      <p>所有单词都已掌握，继续学习新内容吧！</p>
      <button class="btn-continue" @click="goHome">返回首页</button>
    </div>

    <!-- 单词卡片 -->
    <main v-else class="review-content">
      <!-- Step 1: 认读 -->
      <div v-if="step === 1" class="step-recognize anim-fade-up">
        <div class="card">
          <div class="card-emoji">{{ word.emoji }}</div>
          <div class="card-word">{{ word.en }}</div>
          <div class="card-phonetic">{{ word.phonetic }}</div>
          <div class="card-zh">{{ word.zh }}</div>
        </div>
        <button class="btn-next" @click="playWord">🔊 听发音</button>
      </div>

      <!-- Step 2: 辨音 -->
      <div v-else-if="step === 2" class="step-listen anim-fade-up">
        <button class="btn-listen-big" @click="playWord">🔊</button>
        <p class="listen-hint">听听是哪个？</p>
        <div class="options-grid">
          <button v-for="opt in options" :key="opt.id" class="option-btn" @click="pickOption(opt)">
            {{ opt.en }}
          </button>
        </div>
        <div v-if="feedback" :class="['feedback', feedbackClass]">{{ feedback }}</div>
      </div>

      <!-- Step 3: 跟读 -->
      <div v-else-if="step === 3" class="step-repeat anim-fade-up">
        <div class="repeat-emoji">{{ word.emoji }}</div>
        <h3>跟我读：{{ word.en }}</h3>
        <p class="repeat-hint">大声读出来！</p>
        <button class="btn-speak" @click="speakWord">🎤 我读完了</button>
      </div>
    </main>

    <!-- 呦呦 -->
    <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble"
      class="review-yoyo" :show-hat="store.showHat" :show-glasses="store.showGlasses"
      :show-crown="store.showCrown" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { ALL_L1_WORDS, ALL_L2_WORDS } from '@/data/words'
import { useSpeech } from '@/composables/useSpeech'
import { sfxCorrect as playCorrect, sfxWrong as playWrong } from '@/composables/useSfx'
import YoyoMascot from '@/components/common/YoyoMascot.vue'

const router = useRouter()
const store = useLearningStore()
const { speak } = useSpeech()

const reviewWords = ref([])
const currentIndex = ref(0)
const step = ref(1) // 1=认读, 2=辨音, 3=跟读
const yoyoMood = ref('idle')
const yoyoBubble = ref('')
const feedback = ref('')
const feedbackClass = ref('')

const word = computed(() => reviewWords.value[currentIndex.value] || {})

const progressPct = computed(() => {
  if (!reviewWords.value.length) return 0
  return Math.round(((currentIndex.value) / reviewWords.value.length) * 100)
})

const sceneColor = computed(() => {
  const colors = ['#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA', '#FFF8E1']
  return colors[currentIndex.value % colors.length]
})

const options = computed(() => {
  if (!word.value?.en) return []
  const correct = word.value
  const pool = correct.level === 2 ? ALL_L2_WORDS : ALL_L1_WORDS
  const others = pool.filter(w => w.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3)
  return [correct, ...others].sort(() => Math.random() - 0.5)
})

function playWord() {
  if (word.value?.en) speak(word.value.en, { rate: 0.85 })
}

function pickOption(opt) {
  if (opt.id === word.value.id) {
    feedback.value = '对了！真棒！🌟'
    feedbackClass.value = 'correct'
    playCorrect()
    yoyoMood.value = 'happy'
    yoyoBubble.value = '太厉害了！'
    playClick()
    setTimeout(() => {
      feedback.value = ''
      nextStep()
    }, 1200)
  } else {
    feedback.value = '再想想~'
    feedbackClass.value = 'wrong'
    playWrong()
    yoyoMood.value = 'encourage'
    yoyoBubble.value = '没关系，再试试！'
    setTimeout(() => {
      feedback.value = ''
    }, 1000)
  }
}

function speakWord() {
  playCorrect()
  yoyoMood.value = 'happy'
  yoyoBubble.value = '读得真好听！👏'
  setTimeout(() => nextStep(), 1000)
}

function nextStep() {
  if (step.value < 3) {
    step.value++
  } else {
    // 完成当前单词的复习
    const wordId = word.value.id
    store.markWordMastered(wordId)
    store.addToReviewQueue(wordId)
    
    if (currentIndex.value < reviewWords.value.length - 1) {
      currentIndex.value++
      step.value = 1
      yoyoMood.value = 'idle'
      yoyoBubble.value = ''
      feedback.value = ''
    } else {
      // 全部复习完成
      showComplete()
    }
  }
}

function showComplete() {
  yoyoMood.value = 'happy'
  yoyoBubble.value = `复习完成！${reviewWords.value.length} 个单词都巩固啦！🎉`
  setTimeout(() => goHome(), 2500)
}

function goHome() { router.push('/') }

onMounted(async () => {
  await store.loadFromDB()
  const words = store.getDueReviewWords()
  reviewWords.value = words || []
  if (reviewWords.value.length > 0) {
    yoyoMood.value = 'idle'
    yoyoBubble.value = `有 ${reviewWords.value.length} 个单词需要复习，准备好了吗？`
  }
})
</script>

<style scoped>
.review-page {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}

.review-header {
  padding: var(--space-md) var(--space-lg);
  background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-light);
}

.btn-back {
  background: none; border: none; font-size: var(--font-size-sm);
  color: var(--text-secondary); cursor: pointer; padding: var(--space-xs) 0;
}

.review-title {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.review-icon { font-size: 1.2rem; }

.review-title h2 {
  font-size: var(--font-size-lg); color: var(--text-primary); margin: 0;
}

.review-count {
  font-size: var(--font-size-xs); color: var(--text-hint); margin-left: auto;
}

.review-progress {
  height: 4px; background: var(--border-light); border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%; background: var(--color-primary);
  transition: width 0.3s ease;
}

.review-content {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: var(--space-lg);
}

.review-empty {
  text-align: center; padding: var(--space-xl);
}

.empty-icon { font-size: 4rem; display: block; margin-bottom: var(--space-lg); }

.review-empty h2 { font-size: var(--font-size-xl); color: var(--text-primary); margin-bottom: var(--space-md); }

.review-empty p { color: var(--text-secondary); margin-bottom: var(--space-lg); }

.btn-continue {
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-full); font-size: var(--font-size-base);
  font-weight: 700; cursor: pointer;
}

/* ===== Step 1: 认读 ===== */
.step-recognize {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-lg);
  width: 100%; max-width: 500px;
}

.card {
  background: var(--bg-card); border-radius: var(--radius-xl);
  padding: var(--space-xl) var(--space-2xl); text-align: center;
  box-shadow: var(--shadow-card); width: 100%;
}

.card-emoji { font-size: 4rem; margin-bottom: var(--space-md); }
.card-word { font-size: var(--font-size-3xl); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-xs); }
.card-phonetic { font-size: var(--font-size-sm); color: var(--text-hint); margin-bottom: var(--space-sm); }
.card-zh { font-size: var(--font-size-lg); color: var(--text-secondary); }

.btn-next {
  padding: var(--space-md) var(--space-2xl);
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-full); font-size: var(--font-size-base);
  font-weight: 700; cursor: pointer;
}

/* ===== Step 2: 辨音 ===== */
.step-listen {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
  width: 100%; max-width: 500px;
}

.btn-listen-big {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none; font-size: 2.5rem; cursor: pointer;
  box-shadow: 0 4px 16px rgba(255,140,66,0.4);
}

.listen-hint { color: var(--text-secondary); font-size: var(--font-size-base); margin: 0; }

.options-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm); width: 100%;
}

.option-btn {
  padding: var(--space-md); border-radius: var(--radius-lg);
  background: var(--bg-card); border: 2px solid var(--border-light);
  font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary);
  cursor: pointer; transition: all 0.2s;
}

.option-btn:hover { border-color: var(--color-primary); transform: scale(1.02); }

.feedback {
  padding: var(--space-md) var(--space-xl); border-radius: var(--radius-full);
  font-size: var(--font-size-base); font-weight: 700;
  animation: pop 0.3s var(--ease-bounce);
}

.feedback.correct { background: #C8E6C9; color: #2E7D32; }
.feedback.wrong { background: #FFCDD2; color: #C62828; }

/* ===== Step 3: 跟读 ===== */
.step-repeat {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-md);
  width: 100%; max-width: 500px;
}

.repeat-emoji { font-size: 4rem; }

.step-repeat h3 { font-size: var(--font-size-xl); color: var(--text-primary); margin: 0; }

.repeat-hint { color: var(--text-secondary); font-size: var(--font-size-base); margin: 0; }

.btn-speak {
  padding: var(--space-md) var(--space-2xl);
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-full); font-size: var(--font-size-base);
  font-weight: 700; cursor: pointer;
}

/* ===== 呦呦 ===== */
.review-yoyo {
  position: absolute; bottom: var(--space-md); left: var(--space-lg);
  z-index: 10;
}
</style>
