<template>
  <div class="home-page" :class="{ 'home-locked': isLocked, 'home-learning-mode': store.settings.learningMode === 'card' }">
    <!-- P2: 首次开场动画 -->
    <Transition name="intro-fade">
      <div v-if="showIntro" class="intro-overlay" @click="dismissIntro">
        <div class="intro-content">
          <div class="intro-yoyo" :class="{ 'intro-bounce': introPhase >= 1 }">
            <span class="intro-yoyo-face">🐯</span>
          </div>
          <Transition name="pop">
            <div v-if="introPhase >= 2" class="intro-bubble">
              <p>Hi~ 我是呦呦！</p>
            </div>
          </Transition>
          <Transition name="pop">
            <div v-if="introPhase >= 3" class="intro-invite">
              <p>来和我一起玩吧！</p>
              <span class="intro-arrow">👆</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

    <!-- 锁屏遮罩 -->
    <div v-if="isLocked" class="lock-overlay">
      <div class="lock-content">
        <span class="lock-icon">🌙</span>
        <h2>休息时间到啦</h2>
        <p class="lock-time">呦呦在 {{ store.settings.lockEndTime }} 之前都在睡觉 💤</p>
        <p class="lock-hint">家长可以在家长中心调整时间</p>
        <button class="lock-parent-btn" @click="goParent">
          <svg class="parent-shield" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          家长中心
        </button>
      </div>
    </div>

    <main class="home-main">
      <!-- 顶部区域：呦呦 + 冒险地图 -->
      <header class="home-top">
        <div class="hero-left">
          <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars"
            :show-hat="store.showHat" :show-glasses="store.showGlasses"
            :show-wings="store.showWings"
            :show-crown="store.showCrown" :show-halo="store.showHalo"
            :avatar-src="store.avatar"
            @click="petYoyo" />
        </div>
        <div class="hero-right">
          <div class="adventure-map">
            <div class="map-title">🗺️ 冒险地图</div>
            <div class="map-path" ref="mapPathRef">
              <div v-for="(cat, i) in ALL_CATEGORIES" :key="cat.id" class="map-node"
                :class="{
                  unlocked: i < store.unlockedCategories,
                  current: i === store.unlockedCategories - 1,
                  locked: i >= store.unlockedCategories,
                  completed: catProgress(cat.id) >= 100,
                  'just-unlocked': i === store.justUnlockedIndex
                }">
                <div class="node-icon-wrap">
                  <span class="node-icon">{{ i < store.unlockedCategories ? cat.emoji : '🔒' }}</span>
                  <span v-if="catProgress(cat.id) >= 100" class="node-check">✅</span>
                </div>
                <span class="node-label" v-if="i < store.unlockedCategories">{{ cat.name }}</span>
                <span class="node-scene" v-if="i < store.unlockedCategories">{{ sceneName(cat.scene) }}</span>
                <div v-if="i < store.unlockedCategories" class="node-bar">
                  <div class="node-bar-fill" :style="{ width: catProgress(cat.id) + '%' }"></div>
                </div>
                <span v-if="i < store.unlockedCategories" class="node-pct">{{ catProgress(cat.id) }}%</span>
                <span v-if="i === store.unlockedCategories - 1 && catProgress(cat.id) < 100" class="node-pulse"></span>
                <span v-if="i === store.unlockedCategories - 1 && catProgress(cat.id) < 100" class="node-go">GO!</span>
              </div>
            </div>
            <div class="map-footer">
              <span>⭐ {{ store.totalStars }}</span>
              <span>{{ totalProgress }} 词已掌握</span>
            </div>
          </div>
        </div>
      </header>

      <!-- 每日打卡 streak 徽章 -->
      <section class="streak-card" v-if="!isLocked">
        <div class="streak-main">
          <span class="streak-flame" :class="{ active: store.currentStreak > 0 }">🔥</span>
          <div class="streak-info">
            <span class="streak-count">连续学习 <strong>{{ store.currentStreak }}</strong> 天</span>
            <span class="streak-hint" v-if="store.currentStreak === 0">今天开始打卡吧！</span>
            <span class="streak-hint" v-else-if="store.currentStreak < 3">加油，坚持就是胜利！</span>
            <span class="streak-hint" v-else-if="store.currentStreak < 7">太棒了，继续保持！</span>
            <span class="streak-hint" v-else>🌟 学习小达人！</span>
          </div>
        </div>
        <div class="streak-week">
          <div v-for="day in store.weeklyActivity" :key="day.date" class="streak-day" :class="{ active: day.steps > 0 || day.mastered > 0, today: day.isToday }">
            <span class="streak-dot"></span>
            <span class="streak-label">{{ day.dayLabel }}</span>
          </div>
        </div>
      </section>

      <!-- 今日推荐 -->
      <section class="today-section" v-if="todayCategory">
        <div class="section-header">
          <span class="section-icon">📌</span>
          <h3>今日推荐</h3>
        </div>
        <div class="today-card" @click="goLearn(todayCategory.id)">
          <span class="today-emoji">{{ todayCategory.emoji }}</span>
          <div class="today-info">
            <span class="today-name">{{ todayCategory.name }}</span>
            <span class="today-desc">{{ catProgress(todayCategory.id) > 0 ? '继续学习' : '开始学习' }} · {{ catProgress(todayCategory.id) }}% 完成</span>
          </div>
          <span class="today-arrow">→</span>
        </div>

        <!-- 待复习 -->
        <div v-if="dueReviews.length > 0" class="review-row">
          <span class="review-icon">🔄</span>
          <span class="review-text">{{ dueReviews.length }} 个单词需要复习</span>
          <button class="review-btn" @click="goReview()">去复习 →</button>
        </div>
      </section>

      <!-- 自由探索 -->
      <section class="explore-section">
        <div class="section-header">
          <span class="section-icon">🎒</span>
          <h3>自由探索</h3>
          <span class="section-count">{{ store.unlockedCategories }} / {{ ALL_CATEGORIES.length }}</span>
        </div>
        <div class="explore-grid">
          <button v-for="(cat, i) in ALL_CATEGORIES" :key="cat.id" class="explore-card"
            :class="{ mastered: catProgress(cat.id) >= 100, locked: i >= store.unlockedCategories }"
            @click="i < store.unlockedCategories ? goLearn(cat.id) : null">
            <div class="explore-scene" :style="{ background: sceneGradient(cat.scene) }">
              <span class="explore-emoji">{{ i < store.unlockedCategories ? cat.emoji : '🔒' }}</span>
              <span v-if="catProgress(cat.id) >= 100" class="mastered-badge">✅</span>
              <span v-if="i >= store.unlockedCategories" class="locked-badge">🔒</span>
            </div>
            <div class="explore-info">
              <span class="explore-name">{{ cat.name }}</span>
              <span class="explore-sub">
                <template v-if="i >= store.unlockedCategories">学完前面的来这~</template>
                <template v-else>{{ catProgress(cat.id) >= 100 ? '已掌握' : catProgress(cat.id) + '%' }}</template>
              </span>
            </div>
          </button>
        </div>
        <!-- 全部完成时的呦呦提示 -->
        <div v-if="allMastered" class="all-done-tip anim-fade-up">
          <span class="tip-emoji">🐯💤</span>
          <p>今天好棒！所有分类都掌握啦！</p>
          <p class="tip-sub">明天再来冒险吧~ 或者去🎮 玩个小游戏？</p>
        </div>
      </section>
    </main>

    <!-- 底部导航（锁屏/学习模式时隐藏） -->
    <nav class="home-nav" v-if="!isLocked && store.settings.learningMode !== 'card'">
      <button class="nav-btn nav-game" @click="goGame('match')">
        <span>🔍 Find It</span>
      </button>
      <button class="nav-btn nav-game" @click="goGame('listen')">
        <span>🎧 Listen</span>
      </button>
      <button class="nav-btn nav-game" @click="goGame('memory')">
        <span>🃏 Memory</span>
      </button>
      <button class="nav-btn nav-balloon" @click="goGame('balloon')">
        <span>🎈 Pop!</span>
      </button>
      <button class="nav-btn nav-speed" @click="goGame('speed-rush')">
        <span>⚡ Rush</span>
      </button>
      <button class="nav-btn nav-sort" @click="goGame('sort-it')">
        <span>🗂️ Sort!</span>
      </button>
      <button class="nav-btn nav-nursery" @click="goNursery">
        <span>🎵 Songs</span>
      </button>
      <button class="nav-btn nav-sentence" @click="goSentence">
        <span>💬 Sentences</span>
      </button>
      <button class="nav-btn nav-parent" @click="goParent" title="家长中心">
        <svg class="nav-parent-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <span class="nav-parent-text">家长</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { ALL_CATEGORIES } from '@/data/words'
import YoyoMascot from '@/components/common/YoyoMascot.vue'
import { triggerConfetti } from '@/composables/useConfetti'

const router = useRouter()
const store = useLearningStore()
const mapPathRef = ref(null)

// P2: 首次开场动画状态
const showIntro = ref(false)
const introPhase = ref(0) // 0=黑屏, 1=呦呦弹入, 2=气泡弹出, 3=邀请+高亮

function dismissIntro() {
  showIntro.value = false
}

const sceneMap = {
  // L1 场景
  forest: 'linear-gradient(135deg, #A8D8B9, #81C784)',
  orchard: 'linear-gradient(135deg, #FFD4A3, #FFB74D)',
  rainbow: 'linear-gradient(135deg, #D4C5F0, #B39DDB)',
  mirror: 'linear-gradient(135deg, #B5E4E8, #80DEEA)',
  home: 'linear-gradient(135deg, #FFF0D4, #FFE0B2)',
  // L2 场景
  kitchen: 'linear-gradient(135deg, #FFCCBC, #FFAB91)',
  city: 'linear-gradient(135deg, #B0BEC5, #90A4AE)',
  outdoor: 'linear-gradient(135deg, #C8E6C9, #A5D6A7)',
  classroom: 'linear-gradient(135deg, #F3E5F5, #E1BEE7)',
  playground: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
  bedroom: 'linear-gradient(135deg, #E1D5E7, #CE93D8)',
  heart: 'linear-gradient(135deg, #FFCDD2, #EF9A9A)'
}
function sceneGradient(scene) { return sceneMap[scene] || sceneMap.forest }

const yoyoMood = ref('idle')
const yoyoBubble = ref('')
const showStars = ref(false)

const yoyoMessages = [
  '你真棒！一起加油 💪',
  '今天也要开开心心哦 😄',
  '你是最棒的小朋友！🌟',
  '来，击个掌 ✋',
  '哇！你又来看我啦 ',
  '今天想学什么呢？📚',
  '我等你好久了 🐯',
  '你是我的小太阳 ☀️',
]

function petYoyo() {
  yoyoMood.value = 'happy'
  yoyoBubble.value = yoyoMessages[Math.floor(Math.random() * yoyoMessages.length)]
  showStars.value = true
  setTimeout(() => {
    showStars.value = false
    yoyoMood.value = 'idle'
  }, 2000)
  // 气泡再过 2 秒隐藏
  setTimeout(() => { yoyoBubble.value = '' }, 4000)
}

const isLocked = computed(() => store.isInLockPeriod)

const unlockedCats = computed(() => ALL_CATEGORIES.slice(0, store.unlockedCategories))

const totalProgress = computed(() => {
  const totalWords = ALL_CATEGORIES.reduce((s, c) => s + c.words.length, 0)
  const totalSteps = totalWords * 4
  let completedSteps = 0
  ALL_CATEGORIES.forEach(cat => {
    cat.words.forEach(w => {
      const record = store.getWordRecord(w.id)
      completedSteps += record.stepComplete?.length || 0
    })
  })
  const masteredCount = Math.floor(completedSteps / 4)
  return masteredCount + ' / ' + totalWords
})

// 今日推荐：第一个未完成的分类
const todayCategory = computed(() => {
  return ALL_CATEGORIES.find(cat => catProgress(cat.id) < 100)
})

function getNextCategory() {
  const next = ALL_CATEGORIES.find(cat => catProgress(cat.id) < 100)
  return next?.id || ALL_CATEGORIES[0].id
}

const dueReviews = computed(() => store.getDueReviewWords() || [])

/** 所有分类是否全部掌握 */
const allMastered = computed(() => {
  return ALL_CATEGORIES.every(cat => catProgress(cat.id) >= 100)
})

function catProgress(catId) {
  const cat = ALL_CATEGORIES.find(c => c.id === catId)
  if (!cat) return 0
  const totalSteps = cat.words.length * 4 // 每词4步
  let completedSteps = 0
  cat.words.forEach(w => {
    const record = store.getWordRecord(w.id)
    completedSteps += record.stepComplete?.length || 0
  })
  return Math.min(Math.round((completedSteps / totalSteps) * 100), 100)
}

function goLearn(catId) { router.push(`/learn/${catId}`) }
function goGame(gameId) { router.push(`/game/${gameId}`) }
function goParent() { router.push('/parent') }
function goReview() { router.push('/review') }
function goNursery() { router.push('/nursery') }
function goSentence() { router.push('/sentence') }

const sceneLabels = {
  forest: '🌲 森林', orchard: '🍎 果园', rainbow: '🌈 彩虹', mirror: '🪞 魔镜', home: '🏠 家',
  kitchen: '🍳 厨房', city: '🏢 城市', outdoor: '☀️ 户外', classroom: '📚 教室',
  playground: '🛝 游乐场', bedroom: '🛏️ 卧室', heart: '❤️ 心灵'
}
function sceneName(scene) { return sceneLabels[scene] || scene }

onMounted(async () => {
  await store.loadFromDB()
  
  // Detect if a new category was just unlocked
  if (store.justUnlockedIndex >= 0) {
    // Trigger a small confetti burst on return to home
    triggerConfetti(20)

    // After DOM updates, scroll to the new node and let CSS animation play
    nextTick(() => {
      const newNode = mapPathRef.value?.querySelector('.just-unlocked')
      if (newNode) {
        newNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    })

    // Clear the flag so the animation only plays once
    store.consumeJustUnlocked()
  }
  
  // P2: 首次访问播放开场动画
  const hasSeenIntro = localStorage.getItem('yoyo-intro-seen')
  if (store.isFirstUse && !hasSeenIntro) {
    showIntro.value = true
    introPhase.value = 0
    
    // 0.3s 呦呦弹入
    setTimeout(() => { introPhase.value = 1 }, 300)
    // 1.0s 气泡弹出
    setTimeout(() => { introPhase.value = 2 }, 1000)
    // 2.0s 邀请+高亮
    setTimeout(() => { introPhase.value = 3 }, 2000)
    // 4.0s 自动消失
    setTimeout(() => {
      showIntro.value = false
      localStorage.setItem('yoyo-intro-seen', 'true')
      // 后续显示普通欢迎气泡
      yoyoMood.value = 'summon'
      yoyoBubble.value = '准备好了吗？点一个分类开始探险吧！'
      showStars.value = true
      setTimeout(() => { yoyoBubble.value = ''; showStars.value = false }, 3000)
    }, 4000)
  } else {
    const m = store.masteredWordCount
    yoyoMood.value = 'idle'
    yoyoBubble.value = m > 0 ? `你已经学会 ${m} 个单词啦！今天继续~` : '快来学新单词吧！'
    // 气泡 3 秒后自动隐藏
    setTimeout(() => { yoyoBubble.value = '' }, 3000)
  }
})
</script>

<style scoped>
.home-page { width: 100vw; height: 100dvh; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.home-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }

/* ===== 锁屏 ===== */
.home-locked .home-main { display: none; }
.lock-overlay {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #1A1A2E, #16213E);
}
.lock-content { text-align: center; animation: yoyoSleepy 2s ease-in-out infinite; }
.lock-icon { font-size: 6rem; display: block; margin-bottom: var(--space-lg); }
.lock-content h2 { font-size: var(--font-size-2xl); color: #F5F5F5; margin-bottom: var(--space-md); }
.lock-time { color: #9E9E9E; font-size: var(--font-size-lg); margin-bottom: var(--space-sm); }
.lock-hint { color: #616161; font-size: var(--font-size-sm); margin-bottom: var(--space-lg); }

/* 锁屏内的家长中心按钮 */
.lock-parent-btn {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-lg);
  color: #E0E0E0; font-size: var(--font-size-base); font-weight: 600;
  cursor: pointer; transition: all 0.25s ease;
  backdrop-filter: blur(8px);
  margin-top: var(--space-md);
}
.lock-parent-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.03);
}
.lock-parent-btn:active { transform: scale(0.97); }
.parent-shield { stroke: #90CAF9; flex-shrink: 0; }

/* ===== 顶部 ===== */
.home-top {
  display: flex; gap: var(--space-lg); padding: var(--space-lg) var(--space-xl);
  align-items: flex-start;
}
.hero-left { flex: 0 0 auto; min-width: 140px; display: flex; align-items: center; gap: var(--space-sm); justify-content: center; }
.hero-right { flex: 1; min-width: 0; }

/* ===== 冒险地图 ===== */
.adventure-map {
  background: linear-gradient(135deg, #FFFDF7 0%, #FFF8E1 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-lg); box-shadow: var(--shadow-card);
  border: 2px solid #FFE082;
}
.map-title { font-size: var(--font-size-sm); color: #F57F17; font-weight: 700; margin-bottom: var(--space-md); letter-spacing: 0.5px; }
.map-path {
  display: flex; align-items: flex-start; gap: 0;
  overflow-x: auto; padding-bottom: var(--space-sm);
}
.map-node {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  position: relative; min-width: 72px;
  padding: 6px var(--space-xs) 4px;
  transition: background 0.3s;
  border-radius: 12px;
}
.map-node.unlocked { background: rgba(255,255,255,0.5); }
.map-node.unlocked:hover { background: rgba(255,255,255,0.85); }
.map-node:not(:last-child)::after {
  content: '→';
  position: absolute; right: -6px; top: 32%;
  color: #FFB74D; font-size: 0.9rem; opacity: 0.7;
  z-index: 1;
}
.map-node.locked:not(:last-child)::after { opacity: 0.2; }

.node-icon-wrap {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
}
.map-node.completed .node-icon-wrap {
  background: rgba(76, 175, 80, 0.15);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.25);
}
.map-node.locked .node-icon-wrap {
  background: rgba(0,0,0,0.04);
  box-shadow: none;
}
.node-icon { font-size: 1.6rem; transition: transform 0.3s; }
.node-check {
  position: absolute; top: -4px; right: -4px; font-size: 0.7rem;
  animation: checkPop 0.4s var(--ease-bounce);
}
.node-label { font-size: 0.7rem; color: var(--text-primary); font-weight: 600; white-space: nowrap; }
.node-scene { font-size: 0.55rem; color: var(--text-hint); white-space: nowrap; }
.node-bar { width: 52px; height: 5px; background: var(--border-light); border-radius: var(--radius-full); overflow: hidden; }
.node-bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #FFB74D); border-radius: var(--radius-full); transition: width 0.5s; }
.node-pct { font-size: 0.6rem; color: var(--color-primary); font-weight: 700; }
.node-pulse {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-primary); animation: pulse 1.5s infinite;
}
.node-go {
  position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
  font-size: 0.55rem; font-weight: 800; color: #FF5722;
  animation: goBounce 1.2s ease-in-out infinite;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.map-node.completed .node-icon { transform: scale(1.05); }
.map-node.completed .node-bar-fill { background: linear-gradient(90deg, #4CAF50, #66BB6A); }
.map-node.completed .node-pct { color: #4CAF50; }
.map-node.locked .node-icon { opacity: 0.3; }
.map-node.locked .node-label { opacity: 0.3; }
.map-footer { margin-top: var(--space-sm); font-size: var(--font-size-xs); color: var(--text-hint); text-align: right; display: flex; justify-content: space-between; }

@keyframes checkPop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
@keyframes goBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 1; }
  50% { transform: translateX(-50%) translateY(-6px); opacity: 0.7; }
}

/* === Current node: guiding glow === */
.map-node.current .node-icon {
  animation: currentIconBounce 2s ease-in-out infinite;
}
.map-node.current .node-icon-wrap {
  background: linear-gradient(135deg, #FFF8E1, #FFECB3);
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.4);
  border: 2px solid #FFD54F;
}
.map-node.current {
  background: rgba(255, 248, 225, 0.6);
  animation: currentGlow 2s ease-in-out infinite;
}

@keyframes currentIconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

/* === Just-unlocked node: entrance animation === */
.map-node.just-unlocked {
  animation: nodeUnlock 0.8s var(--ease-bounce) forwards, unlockBurst 1s ease-out forwards;
}
.map-node.just-unlocked .node-icon {
  animation: nodeUnlockIcon 0.8s var(--ease-bounce) forwards;
  font-size: 2.2rem;
}
@keyframes nodeUnlockIcon {
  0% { transform: scale(0.3) rotate(-15deg); }
  50% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* === Smooth scrolling for map-path === */
.map-path {
  scroll-behavior: smooth;
}

/* ===== 每日打卡 streak 徽章 ===== */
.streak-card {
  margin: 0 var(--space-xl) var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  border-radius: var(--radius-lg);
  border: 2px solid #FFB74D;
  display: flex; align-items: center; gap: var(--space-lg);
  box-shadow: var(--shadow-card);
}
.streak-main { display: flex; align-items: center; gap: var(--space-md); flex: 1; min-width: 0; }
.streak-flame {
  font-size: 2rem; flex-shrink: 0;
  filter: grayscale(0.8) opacity(0.4);
  transition: all 0.4s;
}
.streak-flame.active {
  filter: none;
  animation: flameDance 1.2s ease-in-out infinite;
}
.streak-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.streak-count { font-size: var(--font-size-sm); color: var(--text-primary); }
.streak-count strong { color: #E65100; font-size: var(--font-size-lg); }
.streak-hint { font-size: var(--font-size-xs); color: var(--text-hint); }
.streak-week {
  display: flex; gap: 6px; flex-shrink: 0;
}
.streak-day {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
}
.streak-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(0,0,0,0.08);
  transition: all 0.3s;
}
.streak-day.active .streak-dot {
  background: #FF9800;
  box-shadow: 0 0 6px rgba(255, 152, 0, 0.5);
}
.streak-day.today .streak-dot {
  border: 2px solid #E65100;
}
.streak-day.today.active .streak-dot {
  background: #E65100;
}
.streak-label { font-size: 0.55rem; color: var(--text-hint); }
.streak-day.today .streak-label { color: #E65100; font-weight: 700; }

@keyframes flameDance {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.05) rotate(3deg); }
  75% { transform: scale(1.12) rotate(-3deg); }
}

/* ===== 今日推荐 ===== */
.today-section {
  padding: 0 var(--space-xl); margin-bottom: var(--space-md);
}
.section-header {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-bottom: var(--space-md);
}
.section-icon { font-size: 1.2rem; }
.section-header h3 { font-size: var(--font-size-base); color: var(--text-primary); font-weight: 700; }
.section-count { font-size: var(--font-size-xs); color: var(--text-hint); margin-left: auto; }

.today-card {
  display: flex; align-items: center; gap: var(--space-md);
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
  border-radius: var(--radius-lg); padding: var(--space-md) var(--space-lg);
  cursor: pointer; transition: transform 0.2s; border: 2px solid #FFE0B2;
}
.today-card:hover { transform: scale(1.01); }
.today-emoji { font-size: 2.5rem; }
.today-name { font-size: var(--font-size-lg); font-weight: 700; color: var(--text-primary); display: block; }
.today-desc { font-size: var(--font-size-xs); color: var(--text-hint); }
.today-arrow { font-size: var(--font-size-xl); color: var(--color-primary); margin-left: auto; }

.review-row {
  display: flex; align-items: center; gap: var(--space-sm);
  margin-top: var(--space-sm); padding: var(--space-sm) 0;
}
.review-icon { font-size: 1.2rem; }
.review-text { font-size: var(--font-size-sm); color: var(--text-secondary); }
.review-btn { font-size: var(--font-size-sm); color: var(--color-primary); font-weight: 700; }

/* ===== 自由探索 ===== */
.explore-section {
  flex: 1; padding: 0 var(--space-xl); overflow-y: auto;
}
.explore-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-sm); padding-bottom: var(--space-lg);
}
.explore-card {
  background: var(--bg-card); border-radius: var(--radius-md);
  overflow: hidden; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 2px solid transparent;
}
.explore-card:hover { transform: translateY(-2px); border-color: var(--color-primary-light); }
.explore-card.mastered { opacity: 0.7; }
.explore-scene {
  height: 72px; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.explore-emoji { font-size: 2rem; }
.mastered-badge { position: absolute; top: 4px; right: 4px; font-size: 0.8rem; }
.explore-info {
  padding: var(--space-sm); display: flex; justify-content: space-between; align-items: center;
}
.explore-name { font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary); }
.explore-sub { font-size: 0.65rem; color: var(--text-hint); }

/* ===== 底部导航 ===== */
.home-nav {
  display: flex; gap: var(--space-xs); padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  position: relative; z-index: 110;
  flex-wrap: wrap; justify-content: center;
}
.nav-btn {
  flex: 1; min-width: 0; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-md);
  font-size: var(--font-size-xs); font-weight: 700; text-align: center;
  transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  min-height: 40px;
}
.nav-game { background: linear-gradient(135deg, #EDE7F6, #D1C4E9); color: #5E35B1; }
.nav-game:hover { transform: scale(1.02); }
.nav-nursery { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); color: #E65100; }
.nav-nursery:hover { transform: scale(1.02); }
.nav-sentence { background: linear-gradient(135deg, #F3E8FF, #DDD6FE); color: #7C3AED; }
.nav-sentence:hover { transform: scale(1.02); }
.nav-balloon { background: linear-gradient(135deg, #FFEBEE, #FFCDD2); color: #D32F2F; }
.nav-balloon:hover { transform: scale(1.02); }
.nav-speed { background: linear-gradient(135deg, #FFF8E1, #FFE082); color: #F57F17; }
.nav-speed:hover { transform: scale(1.02); }
.nav-sort { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); color: #2E7D32; }
.nav-sort:hover { transform: scale(1.02); }
.nav-parent {
  background: var(--border-light); color: var(--text-secondary); flex: 0.6;
  transition: all 0.2s;
}
.nav-parent:hover { background: #E8E0D6; color: var(--text-primary); transform: scale(1.05); }
.nav-parent:active { transform: scale(0.95); }
.nav-parent-icon { stroke: currentColor; flex-shrink: 0; }
.nav-parent-text { font-size: 0.65rem; font-weight: 600; line-height: 1; }

/* 学习模式隐藏游戏 */
.home-learning-mode .nav-game,
.home-learning-mode .nav-balloon,
.home-learning-mode .nav-speed,
.home-learning-mode .nav-sort { display: none; }

/* ===== P1: 锁定的分类卡片 ===== */
.explore-card.locked {
  opacity: 0.55;
  filter: grayscale(0.3);
  cursor: not-allowed;
  position: relative;
}
.explore-card.locked::after {
  content: '';
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-md);
  pointer-events: none;
}
.locked-badge {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: 2.5rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
.explore-card.locked .explore-emoji { opacity: 0.3; }
.explore-card.locked:hover { transform: none; border-color: transparent; }

/* ===== P1: 全部完成提示 ===== */
.all-done-tip {
  text-align: center; padding: var(--space-xl); margin-top: var(--space-lg);
}
.tip-emoji { font-size: 3rem; display: block; margin-bottom: var(--space-md); }
.all-done-tip p { font-size: var(--font-size-lg); color: var(--text-primary); font-weight: 600; margin: 0; }
.tip-sub { font-size: var(--font-size-sm) !important; color: var(--text-hint) !important; margin-top: var(--space-xs) !important; }

/* ===== P2: 首次开场动画 ===== */
.intro-overlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #0D0D1A 0%, #1A1A2E 40%, #FFF8F0 100%);
  animation: introBg 2.5s ease forwards;
  cursor: pointer;
}
@keyframes introBg {
  0% { background: #0D0D1A; }
  60% { background: linear-gradient(180deg, #1A1A2E, #FFF8F0); }
  100% { background: #FFF8F0; }
}

.intro-content {
  display: flex; flex-direction: column; align-items: center; gap: var(--space-lg);
  position: relative;
}

.intro-yoyo {
  width: 120px; height: 120px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 32px rgba(255, 140, 66, 0.5);
  transform: translateY(100vh);
  opacity: 0;
}
.intro-yoyo.intro-bounce {
  animation: introYoyoPop 0.6s var(--ease-bounce) forwards;
}
.intro-yoyo-face { font-size: 4rem; }

@keyframes introYoyoPop {
  0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
  70% { transform: translateY(-10px) scale(1.1); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}

.intro-bubble {
  background: var(--bg-card); border: 2px solid var(--color-primary-light);
  border-radius: var(--radius-lg); padding: var(--space-md) var(--space-xl);
  box-shadow: var(--shadow-card); text-align: center;
  animation: bubblePop 0.4s var(--ease-bounce);
}
.intro-bubble p { font-size: var(--font-size-xl); font-weight: 700; color: var(--text-primary); margin: 0; }

@keyframes bubblePop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.intro-invite {
  text-align: center; animation: fadeUp 0.5s var(--ease-smooth);
}
.intro-invite p { font-size: var(--font-size-lg); color: var(--text-secondary); margin: 0 0 var(--space-sm); }
.intro-arrow { font-size: 2.5rem; display: block; animation: introArrow 1s ease-in-out infinite; }

@keyframes introArrow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.intro-fade-enter-active { animation: fadeIn 0.5s ease; }
.intro-fade-leave-active { animation: fadeOut 0.5s ease; }
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
