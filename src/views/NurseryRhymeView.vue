<template>
  <div class="nursery-page" :style="{ background: pageBg }">
    <!-- 顶部 -->
    <header class="nursery-header">
      <button class="btn-back" @click="goHome">
        <span class="back-icon">🏠</span>
      </button>
      <div class="nursery-title">
        <span class="nursery-emoji">{{ rhyme?.emoji }}</span>
        <h2>{{ rhyme?.title || 'Nursery Rhymes' }}</h2>
      </div>
      <button class="btn-auto" @click="toggleAutoPlay">
        {{ isAutoPlaying ? '⏸️ Pause' : '▶️ Auto Play' }}
      </button>
    </header>

    <!-- 选择器（未选分类时显示） -->
    <div v-if="!rhyme" class="rhyme-picker">
      <h3>🎵 Choose a Rhyme</h3>
      <div class="rhyme-list">
        <button v-for="r in rhymes" :key="r.id" class="rhyme-card"
          :class="{ active: currentRhymeId === r.id }"
          @click="selectRhyme(r.id)">
          <span class="rhyme-emoji">{{ r.emoji }}</span>
          <div class="rhyme-info">
            <span class="rhyme-name">{{ r.title }}</span>
            <span class="rhyme-cat">{{ getCategoryName(r.categoryId) }}</span>
          </div>
          <span v-if="currentRhymeId === r.id" class="play-indicator">▶</span>
        </button>
      </div>
    </div>

    <!-- 歌词展示 -->
    <main v-else class="lyrics-container">
      <!-- 背景 emoji 动画 -->
      <div class="bg-decoration">
        <span v-for="(e, i) in bgEmojis" :key="i" class="floating-emoji"
          :style="emojiStyle(i)">{{ e }}</span>
      </div>

      <div class="lyrics-scroll" ref="lyricsRef">
        <div v-for="(line, i) in rhyme.lines" :key="i"
          class="lyric-line"
          :class="{ active: i === activeLine }"
          @click="readLine(i)">
          <div class="line-content" v-html="highlightKeywords(line)"></div>
          <span v-if="i === activeLine && isSpeaking" class="speaking-indicator">🔊</span>
        </div>
      </div>

      <!-- 控制栏 -->
      <div class="nursery-controls">
        <button class="ctrl-btn" @click="prevLine" :disabled="activeLine <= 0">⏮️</button>
        <button class="ctrl-btn ctrl-play" @click="readCurrentLine">
          {{ isSpeaking ? '⏸️' : '🔊' }}
        </button>
        <button class="ctrl-btn" @click="nextLine" :disabled="activeLine >= rhyme.lines.length - 1">⏭️</button>
        <button class="ctrl-btn ctrl-full" @click="readAll">🎵 完整朗读</button>
      </div>

      <!-- 进度条 -->
      <div class="lyrics-progress">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </main>

    <!-- 呦呦 -->
    <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble"
      class="nursery-yoyo" :show-hat="store.showHat" :show-glasses="store.showGlasses" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { getCategoryById } from '@/data/words'
import { NURSERY_RHYMES, getRhymeByCategory } from '@/data/nursery-rhymes'
import { useSpeech } from '@/composables/useSpeech'
import YoyoMascot from '@/components/common/YoyoMascot.vue'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()
const { speakSentence, stop } = useSpeech()

const rhymes = NURSERY_RHYMES
const currentRhymeId = ref(route.query.cat || '')
const activeLine = ref(-1)
const isSpeaking = ref(false)
const isAutoPlaying = ref(false)
const yoyoMood = ref('idle')
const yoyoBubble = ref('')
const lyricsRef = ref(null)
let autoTimer = null

const rhyme = computed(() => {
  if (!currentRhymeId.value) return null
  // 优先按 rhyme.id 查找，其次按 categoryId 查找
  return rhymes.find(r => r.id === currentRhymeId.value) || getRhymeByCategory(currentRhymeId.value)
})

const pageBg = computed(() => {
  if (!rhyme.value) return 'linear-gradient(135deg, #FFF8F0, #F5E6D3)'
  const colors = {
    animal: '#E8F5E9', fruit: '#FFF3E0', colors: '#F3E5F5', body: '#E0F7FA',
    family: '#FFF8E1', food: '#FFCCBC', transport: '#B0BEC5', weather: '#C8E6C9',
    numbers: '#F3E5F5', actions: '#FFF9C4', clothes: '#E1D5E7', emotions: '#FFCDD2'
  }
  const cat = getCategoryById(currentRhymeId.value)
  return `linear-gradient(135deg, ${colors[cat?.scene] || '#FFF8F0'}, #F5E6D3)`
})

const bgEmojis = computed(() => {
  if (!rhyme.value) return ['🎵', '🎶', '🎵', '🎶']
  return [rhyme.value.emoji, rhyme.value.bgMusic, '🎵', '🎶', rhyme.value.emoji, '⭐']
})

const progressPct = computed(() => {
  if (!rhyme.value) return 0
  return Math.round(((activeLine.value + 1) / rhyme.value.lines.length) * 100)
})

function getCategoryName(catId) {
  const cat = getCategoryById(catId)
  return cat?.nameEn || cat?.name || ''
}

function emojiStyle(i) {
  const positions = [
    { top: '10%', left: '5%', delay: '0s' },
    { top: '30%', left: '85%', delay: '1s' },
    { top: '60%', left: '10%', delay: '2s' },
    { top: '80%', left: '90%', delay: '0.5s' },
    { top: '50%', left: '50%', delay: '1.5s' },
    { top: '20%', left: '70%', delay: '2.5s' }
  ]
  const p = positions[i % positions.length]
  return { top: p.top, left: p.left, animationDelay: p.delay }
}

function highlightKeywords(line) {
  if (!rhyme.value) return line
  let result = line
  rhyme.value.keywords.forEach(kw => {
    const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    result = result.replace(regex, '<span class="keyword">$1</span>')
  })
  return result
}

function selectRhyme(id) {
  currentRhymeId.value = id
  activeLine.value = 0
  yoyoMood.value = 'happy'
  yoyoBubble.value = 'Great choice! Let\'s sing together! '
  setTimeout(() => { yoyoMood.value = 'idle'; yoyoBubble.value = '' }, 3000)
  // 自动朗读第一行（等待响应式更新完成）
  setTimeout(() => {
    console.log('[Nursery] selectRhyme triggered, rhyme:', rhyme.value?.title)
    readLine(0)
  }, 50)
}

function readLine(index) {
  if (!rhyme.value || index < 0 || index >= rhyme.value.lines.length) return
  activeLine.value = index
  const line = rhyme.value.lines[index]
  isSpeaking.value = true
  
  // 提取关键词朗读
  const words = line.replace(/[^\w\s']/g, '').split(/\s+/)
  const text = words.join(' ')
  
  speakSentence(text, {
    rate: 0.8,
    onEnd: () => {
      isSpeaking.value = false
      scrollToActiveLine()
    },
    onError: () => {
      isSpeaking.value = false
    }
  })
  
  scrollToActiveLine()
}

function readCurrentLine() {
  if (isSpeaking.value) {
    stop()
    isSpeaking.value = false
    return
  }
  if (activeLine.value < 0) activeLine.value = 0
  readLine(activeLine.value)
}

function readAll() {
  if (!rhyme.value) return
  activeLine.value = 0
  readLinesSequential(0)
}

function readLinesSequential(index) {
  if (!rhyme.value || index >= rhyme.value.lines.length) {
    isSpeaking.value = false
    yoyoMood.value = 'happy'
    yoyoBubble.value = 'Wonderful! You sang the whole song! 🎉'
    setTimeout(() => { yoyoMood.value = 'idle'; yoyoBubble.value = '' }, 3000)
    return
  }
  
  activeLine.value = index
  const line = rhyme.value.lines[index]
  const words = line.replace(/[^\w\s']/g, '').split(/\s+/)
  const text = words.join(' ')
  isSpeaking.value = true
  
  speakSentence(text, {
    rate: 0.8,
    onEnd: () => {
      isSpeaking.value = false
      scrollToActiveLine()
      setTimeout(() => readLinesSequential(index + 1), 500)
    },
    onError: () => {
      isSpeaking.value = false
      setTimeout(() => readLinesSequential(index + 1), 500)
    }
  })
}

function prevLine() {
  if (activeLine.value > 0) {
    stop()
    isSpeaking.value = false
    activeLine.value--
    readLine(activeLine.value)
  }
}

function nextLine() {
  if (rhyme.value && activeLine.value < rhyme.value.lines.length - 1) {
    stop()
    isSpeaking.value = false
    activeLine.value++
    readLine(activeLine.value)
  }
}

function toggleAutoPlay() {
  if (isAutoPlaying.value) {
    stopAutoPlay()
  } else {
    startAutoPlay()
  }
}

function startAutoPlay() {
  if (!rhyme.value) return
  isAutoPlaying.value = true
  activeLine.value = 0
  
  const playNext = () => {
    if (!isAutoPlaying.value || !rhyme.value || activeLine.value >= rhyme.value.lines.length - 1) {
      stopAutoPlay()
      return
    }
    activeLine.value++
    readLine(activeLine.value)
    // 自动播放间隔由 speak 的 onEnd 触发
  }
  
  // 重写 readLine 的 onEnd 来自动下一行
  const origSpeak = speak
  readLine(activeLine.value)
  
  // 监听 speak 完成
  const checkAutoPlay = setInterval(() => {
    if (!isAutoPlaying.value) {
      clearInterval(checkAutoPlay)
      return
    }
    if (!isSpeaking.value && activeLine.value < rhyme.value.lines.length - 1) {
      setTimeout(() => {
        if (isAutoPlaying.value) {
          activeLine.value++
          readLine(activeLine.value)
        }
      }, 800)
    }
  }, 500)
  
  autoTimer = checkAutoPlay
}

function stopAutoPlay() {
  isAutoPlaying.value = false
  stop()
  isSpeaking.value = false
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function scrollToActiveLine() {
  nextTick(() => {
    if (lyricsRef.value) {
      const activeEl = lyricsRef.value.querySelector('.lyric-line.active')
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

function goHome() {
  stopAutoPlay()
  stop()
  router.push('/')
}

onMounted(async () => {
  await store.loadFromDB()
  
  // 如果 URL 有 cat 参数，自动选择对应童谣
  if (route.query.cat) {
    currentRhymeId.value = route.query.cat
    activeLine.value = 0
  }
  
  yoyoMood.value = 'idle'
  yoyoBubble.value = rhyme.value ? `Let's sing "${rhyme.value.title}"! 🎵` : 'Pick a song to sing! 🎶'
})

onUnmounted(() => {
  stopAutoPlay()
  stop()
})
</script>

<style scoped>
.nursery-page {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}

.nursery-header {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-light);
}

.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none; border-radius: 50%;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: var(--color-primary-light); transform: scale(1.05); }
.btn-back .back-icon { font-size: 1.3rem; }

.nursery-title {
  display: flex; align-items: center; gap: var(--space-sm);
  flex: 1;
}

.nursery-emoji { font-size: 1.5rem; }

.nursery-title h2 {
  font-size: var(--font-size-base); color: var(--text-primary); margin: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.btn-auto {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-primary); color: #fff; border: none;
  border-radius: var(--radius-full); font-size: var(--font-size-xs);
  font-weight: 700; cursor: pointer; white-space: nowrap;
}

/* ===== 选择器 ===== */
.rhyme-picker {
  flex: 1; overflow-y: auto; padding: var(--space-lg);
}

.rhyme-picker h3 {
  font-size: var(--font-size-lg); color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.rhyme-list {
  display: flex; flex-direction: column; gap: var(--space-sm);
}

.rhyme-card {
  display: flex; align-items: center; gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-card); border-radius: var(--radius-lg);
  border: 2px solid var(--border-light); cursor: pointer;
  transition: all 0.2s;
}

.rhyme-card:hover { transform: translateX(4px); border-color: var(--color-primary-light); }
.rhyme-card.active { border-color: var(--color-primary); background: var(--color-primary-light); }

.rhyme-emoji { font-size: 2rem; }

.rhyme-info {
  display: flex; flex-direction: column; flex: 1; min-width: 0;
}

.rhyme-name { font-size: var(--font-size-base); font-weight: 700; color: var(--text-primary); }
.rhyme-cat { font-size: var(--font-size-xs); color: var(--text-hint); }

.play-indicator { color: var(--color-primary); font-size: var(--font-size-lg); }

/* ===== 歌词容器 ===== */
.lyrics-container {
  flex: 1; position: relative; overflow: hidden;
  display: flex; flex-direction: column;
}

.bg-decoration {
  position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
}

.floating-emoji {
  position: absolute; font-size: 2rem; opacity: 0.15;
  animation: floatEmoji 8s ease-in-out infinite;
}

@keyframes floatEmoji {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(10deg); }
}

.lyrics-scroll {
  flex: 1; overflow-y: auto; padding: var(--space-lg) var(--space-xl);
  position: relative; z-index: 1;
  scroll-behavior: smooth;
}

.lyric-line {
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-sm);
  background: rgba(255,255,255,0.6);
  border-radius: var(--radius-lg);
  transition: all 0.3s;
  cursor: pointer;
  display: flex; align-items: center; justify-content: space-between;
}

.lyric-line:hover { background: rgba(255,255,255,0.8); }

.lyric-line.active {
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: scale(1.02);
}

.line-content {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
}

.lyric-line.active .line-content {
  color: var(--text-primary);
  font-weight: 600;
}

.keyword {
  color: var(--color-primary);
  font-weight: 700;
  background: rgba(255, 140, 66, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.speaking-indicator {
  font-size: 1.2rem;
  animation: pulse 1s infinite;
}

/* ===== 控制栏 ===== */
.nursery-controls {
  display: flex; align-items: center; justify-content: center; gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
  border-top: 1px solid var(--border-light);
}

.ctrl-btn {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--bg-card); border: 2px solid var(--border-light);
  font-size: 1.2rem; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}

.ctrl-btn:hover { transform: scale(1.1); border-color: var(--color-primary-light); }
.ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.ctrl-play {
  width: 56px; height: 56px;
  background: var(--color-primary); border-color: var(--color-primary);
  font-size: 1.5rem;
}

.ctrl-play:hover { transform: scale(1.1); }

.ctrl-full {
  width: auto; border-radius: var(--radius-full);
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-sm); font-weight: 700;
  background: var(--color-primary); color: #fff;
  border-color: var(--color-primary);
}

.lyrics-progress {
  height: 4px; background: var(--border-light); overflow: hidden;
}

.progress-fill {
  height: 100%; background: var(--color-primary);
  transition: width 0.3s ease;
}

/* ===== 呦呦 ===== */
.nursery-yoyo {
  position: absolute; bottom: var(--space-lg); left: var(--space-lg);
  z-index: 10;
}

/* ===== 动画 ===== */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
