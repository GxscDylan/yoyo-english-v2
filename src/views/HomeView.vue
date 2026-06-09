<template>
  <div class="home-page" :class="{ 'home-locked': isLocked, 'home-learning-mode': store.settings.learningMode === 'card' }">
    <!-- P2: 首次开场动画 -->
    <Transition name="intro-fade">
      <div v-if="showIntro" class="intro-overlay" @click="dismissIntro">
        <div class="intro-content">
          <div class="intro-yoyo" :class="{ 'intro-bounce': introPhase >= 1 }">
            <span class="intro-yoyo-face">{{ store.currentPetType.emoji }}</span>
          </div>
          <Transition name="pop">
            <div v-if="introPhase >= 2" class="intro-bubble intro-title">
              <p>🌟 YoYo English 🌟</p>
            </div>
          </Transition>
          <Transition name="pop">
            <div v-if="introPhase >= 3" class="intro-bubble intro-sub">
              <p>Hi! I'm YoYo!</p>
              <p class="intro-sub-text">Let's learn English together!</p>
            </div>
          </Transition>
          <Transition name="pop">
            <div v-if="introPhase >= 4" class="intro-invite">
              <p>点击屏幕开始冒险 →</p>
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
      <!-- 节日问候横幅 -->
      <div v-if="seasonalGreeting" class="season-greeting" :data-decoration="seasonalDecoration">
        {{ seasonalGreeting }}
      </div>

      <!-- v6.1: 资源栏（星星 + 今日点赞） -->
      <div v-if="!isLocked" class="home-resource-bar anim-fade-up">
        <div class="home-resource-item home-resource-stars">
          <span class="home-resource-icon">⭐</span>
          <span class="home-resource-value">{{ store.totalStars }}</span>
          <span class="home-resource-label">星星</span>
        </div>
        <div class="home-resource-item home-resource-likes">
          <span class="home-resource-icon">👍</span>
          <span class="home-resource-value" :class="{ 'milestone-reached': isLikeMilestone }">{{ todayLikes }}</span>
          <span class="home-resource-label">今天收获</span>
        </div>
      </div>

      <!-- 顶部区域：呦呦 + 冒险地图 -->
      <header class="home-top">
        <div class="hero-left">
          <HomeAvatar :mood="yoyoMood" :bubble-text="yoyoBubble" :show-stars="showStars"
            :show-hat="store.showHat" :show-glasses="store.showGlasses"
            :show-wings="store.showWings"
            :show-crown="store.showCrown" :show-halo="store.showHalo"
            :avatar-src="store.avatar"
            @click="handleYoyoInteraction" />
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
                }"
                @click="i < store.unlockedCategories ? goLearn(cat.id) : null"
                :style="{ cursor: i < store.unlockedCategories ? 'pointer' : 'default' }">
                <div class="node-icon-wrap">
                  <span class="node-icon">{{ i < store.unlockedCategories ? cat.emoji : '🔒' }}</span>
                  <span v-if="catProgress(cat.id) >= 100" class="node-check">✅</span>
                </div>
                <span class="node-label" v-if="i < store.unlockedCategories">{{ cat.name }}</span>
                <span class="node-scene" v-if="i === store.unlockedCategories - 1 || catProgress(cat.id) >= 100">{{ sceneName(cat.scene) }}</span>
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
          <span class="streak-flame" :class="{ active: store.currentStreak > 0 }"></span>
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
          <span class="tip-emoji">{{ store.currentPetType.emoji }}💤</span>
          <p>今天好棒！所有分类都掌握啦！</p>
          <p class="tip-sub">明天再来冒险吧~ 或者去🎮 玩个小游戏？</p>
        </div>
      </section>
    </main>

    <!-- 季节节日漂浮粒子 -->
    <div v-if="showParticles" class="season-particles-container">
      <span v-for="(p, i) in particles" :key="i" class="season-particle"
        :style="{
          left: p.left,
          animationDelay: p.delay,
          animationDuration: p.duration,
          fontSize: p.size
        }">
        {{ p.emoji }}
      </span>
    </div>

    <!-- 底部导航（锁屏/学习模式时隐藏） -->
    <nav class="home-nav" v-if="!isLocked && store.settings.learningMode !== 'card'">
      <button class="nav-btn nav-playground" @click="goPlayground">
        <span class="nav-icon">🎮</span>
        <span>游乐场</span>
      </button>
      <button class="nav-btn nav-nursery" @click="goNursery">
        <span class="nav-icon">🎵</span>
        <span>Songs</span>
      </button>
      <button class="nav-btn nav-pet" @click="goPet" v-if="petStore.petState.value?.enabled">
        <span class="nav-icon">🐾</span>
        <span>宠物</span>
        <span v-if="petBubble.hasPendingNotification.value" class="nav-pet-badge"></span>
      </button>
      <button class="nav-btn nav-adventure" @click="goAdventure">
        <span class="nav-icon">🗺️</span>
        <span>冒险</span>
      </button>
      <button class="nav-btn nav-sentence" @click="goSentence">
        <span class="nav-icon">💬</span>
        <span>Sentences</span>
      </button>
      <button class="nav-btn nav-review" @click="goReview">
        <span class="nav-icon">🔄</span>
        <span>复习</span>
      </button>
      <button class="nav-btn nav-parent" @click="goParent" title="家长中心">
        <span class="nav-icon">
          <svg class="nav-shield" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>
        <span>家长</span>
      </button>
    </nav>

    <!-- v5.0: 点赞里程碑特效 -->
    <Transition name="pop">
      <div v-if="showLikeMilestone" class="milestone-overlay" @click="dismissMilestone">
        <div class="milestone-content">
          <span class="milestone-emoji">🎉</span>
          <h3>太棒了！</h3>
          <p>今天已经收到 <strong>{{ todayLikes }}</strong> 个赞啦！</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { ALL_CATEGORIES } from '@/data/words'
import HomeAvatar from '@/components/common/HomeAvatar.vue'
import { triggerConfetti } from '@/composables/useConfetti'
import { useSeasonalDecorations } from '@/composables/useSeasonalDecorations'
import { useSpeech } from '@/composables/useSpeech'
import { useEasterEggs } from '@/composables/useEasterEggs'
import { useYoyoCopy } from '@/composables/useYoyoCopy'
import { generateAIBubble } from '@/composables/useYoyoAI'
import { useThumbsUp } from '@/composables/useThumbsUp'
import { usePetBubble } from '@/composables/usePetBubble'
import { usePetStore } from '@/composables/usePetStore'
import { sfxCheer } from '@/composables/useSfx'

const router = useRouter()
const store = useLearningStore()
const mapPathRef = ref(null)

// v6.2: 宠物通知气泡系统
const petBubble = usePetBubble()
const petStore = usePetStore()

// v5.0: 点赞系统
const { thumbsUpState, triggerAutoLike, loadFromDB: loadThumbsUpDB } = useThumbsUp()
const todayLikes = ref(0)
const showLikeMilestone = ref(false)
const milestoneThresholds = [10, 25, 50, 100]
const lastShownMilestone = ref(0)

// 是否达到新的里程碑
const isLikeMilestone = computed(() => {
  return milestoneThresholds.some(t => todayLikes.value >= t && t > lastShownMilestone.value)
})

function dismissMilestone() {
  showLikeMilestone.value = false
}

// 更新今日点赞数
function updateTodayLikes() {
  todayLikes.value = thumbsUpState.value.todayLikes || 0

  // 检查里程碑
  for (const threshold of milestoneThresholds) {
    if (todayLikes.value >= threshold && threshold > lastShownMilestone.value) {
      lastShownMilestone.value = threshold
      showLikeMilestone.value = true
      sfxCheer()
      triggerConfetti(15)
      setTimeout(() => { showLikeMilestone.value = false }, 3000)
      break
    }
  }
}

// 监听点赞变化
watch(() => thumbsUpState.value.todayLikes, updateTodayLikes)

// P1-1: 季节节日装饰
const {
  greeting: seasonalGreeting,
  bubbleText: seasonalBubble,
  particles,
  showParticles,
  isActive: isSeasonActive
} = useSeasonalDecorations()

// P1-2: Easter Egg 发现系统
const { handleYoyoClick: handleEasterEggClick } = useEasterEggs()

// P2: 首次开场动画状态
const showIntro = ref(false)
const introPhase = ref(0) // 0=黑屏, 1=呦呦弹入, 2=标题, 3=TTS语音+副标题, 4=邀请
const { speakSentence } = useSpeech()

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

// P2-1: 情境微文案系统
const yoyoCopy = useYoyoCopy(store)

function handleYoyoInteraction() {
  // 先触发 Easter Egg 检测
  handleEasterEggClick()
  // 再执行常规互动
  petYoyo()
}

function petYoyo() {
  yoyoMood.value = 'happy'
  // P2-1: 情境微文案 — 根据学习状态动态生成
  yoyoBubble.value = yoyoCopy.getWelcomeBubble()
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
function goPlayground() { router.push('/playground') }
function goParent() { router.push('/parent') }
function goReview() { router.push('/review') }
function goNursery() { router.push('/nursery') }
function goSentence() { router.push('/sentence') }
function goPet() {
  petBubble.consumeNotification()
  router.push('/pet')
}
function goAdventure() { router.push('/adventure') }

// 场景名称映射
const sceneLabels = {
  forest: '🌲 森林', orchard: '🍎 果园', rainbow: '🌈 彩虹', mirror: '🪞 魔镜', home: '🏠 家',
  kitchen: '🍳 厨房', city: '🏢 城市', outdoor: '☀️ 户外', classroom: '📚 教室',
  playground: '🛝 游乐场', bedroom: '🌙 卧室', heart: '❤️ 心灵'
}

// 底部导航按钮配置 - 5 个主要入口
const NAV_BUTTONS = [
  { key: 'playground', label: '游乐场', icon: '🎮', action: () => goGame('match') },
  { key: 'nursery', label: 'Songs', icon: '🎵', action: goNursery },
  { key: 'sentence', label: 'Sentences', icon: '💬', action: goSentence },
  { key: 'review', label: '复习', icon: '🔄', action: goReview },
  { key: 'parent', label: '家长', icon: '🛡️', action: goParent },
]
function sceneName(scene) { return sceneLabels[scene] || scene }

onMounted(async () => {
  await store.loadFromDB()

  // v5.0: 加载点赞数据
  await loadThumbsUpDB()

  // v6.2: 加载宠物数据并检查通知
  await petStore.loadFromDB()
  if (petStore.petState.value?.enabled && petStore.petState.value?.petSpecies) {
    petBubble.checkPetStatus()
    // 延迟 1.5s 显示宠物通知（避免和开场动画冲突）
    setTimeout(async () => {
      await petBubble.loadAndShow(yoyoBubble, yoyoMood)
    }, 1500)
  }

  // v5.0: 更新今日点赞数
  updateTodayLikes()

  // 检查并清理过期的解锁标记（防止标记永久保持）
  store.checkAndClearExpiredUnlock()

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

  // P2: 首次访问播放开场动画 — 5 秒增强版
  const hasSeenIntro = localStorage.getItem('yoyo-intro-seen')
  if (store.isFirstUse && !hasSeenIntro) {
    showIntro.value = true
    introPhase.value = 0

    // 0.3s 呦呦弹入
    setTimeout(() => { introPhase.value = 1 }, 300)
    // 1.0s 品牌标题
    setTimeout(() => { introPhase.value = 2 }, 1000)
    // 2.0s TTS 语音 + 副标题
    setTimeout(() => {
      introPhase.value = 3
      // TTS 朗读 "Hi! I'm YoYo!" 和 "Let's learn English together!"
      speakSentence("Hi! I'm YoYo!", { rate: 0.85 })
      setTimeout(() => speakSentence("Let's learn English together!", { rate: 0.85 }), 2000)
    }, 2000)
    // 3.5s 邀请提示 + 撒星星
    setTimeout(() => {
      introPhase.value = 4
      triggerConfetti(8, { x: '50%', y: '50%' })
    }, 3500)
    // 5.5s 自动消失
    setTimeout(() => {
      showIntro.value = false
      localStorage.setItem('yoyo-intro-seen', 'true')
      // 后续显示 AI 情境化欢迎气泡
      yoyoMood.value = 'summon'
      yoyoBubble.value = generateAIBubble(store, { scenario: 'welcome' })
      showStars.value = true
      setTimeout(() => { yoyoBubble.value = ''; showStars.value = false }, 3000)
    }, 4000)
  } else {
    const m = store.masteredWordCount
    yoyoMood.value = 'idle'
    // P3-1: AI 情境对话 — 根据学习进度智能生成欢迎语
    yoyoBubble.value = generateAIBubble(store, { scenario: 'welcome' })
    // 气泡 3 秒后自动隐藏
    setTimeout(() => { yoyoBubble.value = '' }, 3000)
  }
})
</script>

<style scoped>
.home-page { width: 100vw; height: 100dvh; display: flex; flex-direction: column; background: var(--bg-main); overflow: hidden; }
.home-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; padding-bottom: var(--space-lg); }

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

/* ===== v6.1: 资源栏（星星 + 今日点赞） ===== */
.home-resource-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 10px var(--space-xl) 0;
  animation: resourceSlideIn 0.5s ease;
}
@keyframes resourceSlideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.home-resource-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  min-width: 100px;
  justify-content: center;
}
.home-resource-item:active { transform: scale(0.96); }
.home-resource-icon { font-size: 1.4rem; }
.home-resource-value {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  transition: transform 0.3s, color 0.3s;
}
.home-resource-value.milestone-reached {
  color: #FF6F00;
  animation: milestonePulse 0.6s ease-in-out 3;
}
.home-resource-label {
  font-size: 0.6rem;
  color: var(--text-hint);
  font-weight: 600;
}
.home-resource-stars { border-color: #FFE082; }
.home-resource-stars .home-resource-value { color: #F57F17; }
.home-resource-likes { border-color: #90CAF9; }
.home-resource-likes .home-resource-value { color: #1565C0; }

/* ===== 顶部 ===== */
.home-top {
  display: flex; gap: var(--space-sm); padding: var(--space-sm) var(--space-xl) 0;
  align-items: flex-start;
}
.hero-left { flex: 0 0 140px; min-width: 140px; display: flex; flex-direction: column; align-items: center; gap: var(--space-sm); }
.hero-right { flex: 1; min-width: 0; }

@keyframes milestonePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* ===== 冒险地图 ===== */
.adventure-map {
  background: linear-gradient(135deg, #FFFDF7 0%, #FFF8E1 100%);
  border-radius: var(--radius-lg);
  padding: var(--space-sm) var(--space-md); box-shadow: var(--shadow-card);
  border: 2px solid #FFE082;
}
.map-title { font-size: var(--font-size-xs); color: #F57F17; font-weight: 700; margin-bottom: var(--space-sm); letter-spacing: 0.5px; }
.map-path {
  display: flex; align-items: flex-start; gap: 0;
  overflow-x: auto; padding-bottom: var(--space-sm);
}
.map-node {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  position: relative; min-width: 48px; flex-shrink: 0;
  padding: 4px var(--space-xs) 2px;
  transition: background 0.3s;
  border-radius: 12px;
}
.map-node.current { min-width: 64px; }
.map-node.unlocked { background: rgba(255,255,255,0.5); }
.map-node.unlocked:hover { background: rgba(255,255,255,0.85); }
.map-node.unlocked:active { transform: scale(0.95); }
.map-node:not(:last-child)::after {
  content: '→';
  position: absolute; right: -8px; top: 28%;
  color: #FFB74D; font-size: 0.8rem; opacity: 0.6;
  z-index: 1;
}
.map-node.locked:not(:last-child)::after { opacity: 0.15; }

.node-icon-wrap {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
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
.node-icon { font-size: 1.4rem; transition: transform 0.3s; }
.node-check {
  position: absolute; top: -4px; right: -4px; font-size: 0.7rem;
  animation: checkPop 0.4s var(--ease-bounce);
}
.node-label { font-size: 0.7rem; color: var(--text-primary); font-weight: 600; white-space: nowrap; }
.map-node:not(.current):not(.completed) .node-label { font-size: 0.6rem; }
.map-node.locked .node-label { display: none; }
.map-node.locked .node-scene { display: none; }
.map-node.locked .node-bar { display: none; }
.map-node.locked .node-pct { display: none; }
.map-node:not(.current):not(.completed) .node-bar { width: 36px; height: 4px; }
.map-node:not(.current):not(.completed) .node-pct { font-size: 0.55rem; }
.map-node:not(.current):not(.completed) .node-scene { display: none; }
.node-scene { font-size: 0.5rem; color: var(--text-hint); white-space: nowrap; opacity: 0.7; }
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
.map-footer { margin-top: var(--space-sm); font-size: var(--font-size-xs); color: var(--text-hint); text-align: right; display: flex; justify-content: space-between; padding-top: var(--space-xs); border-top: 1px solid rgba(0,0,0,0.06); }

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
  margin: var(--space-xs) var(--space-xl) var(--space-xs);
  padding: var(--space-xs) var(--space-lg);
  background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
  border-radius: var(--radius-lg);
  border: 2px solid #FFB74D;
  display: flex; align-items: center; gap: var(--space-sm);
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
  padding: 0 var(--space-xl); margin-bottom: var(--space-sm);
}
.section-header {
  display: flex; align-items: center; gap: var(--space-xs);
  margin-bottom: var(--space-sm);
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
  display: flex; gap: var(--space-xs); padding: var(--space-xs) var(--space-xl) var(--space-sm);
  background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-light);
  position: relative; z-index: 110;
}

.nav-btn {
  flex: 1 1 auto; min-width: 0; padding: 4px var(--space-xs); border-radius: var(--radius-lg);
  font-size: var(--font-size-sm); font-weight: 700; text-align: center;
  transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  min-height: 48px;
}
.nav-icon { font-size: 1.3rem; line-height: 1; }
.nav-playground { background: linear-gradient(135deg, #EDE7F6, #D1C4E9); color: #5E35B1; }
.nav-playground:hover { transform: scale(1.02); }
.nav-nursery { background: linear-gradient(135deg, #FFF3E0, #FFE0B2); color: #E65100; }
.nav-nursery:hover { transform: scale(1.02); }
.nav-pet { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); color: #2E7D32; position: relative; }
.nav-pet:hover { transform: scale(1.02); }
/* v6.2: 宠物通知红点角标 */
.nav-pet-badge {
  position: absolute;
  top: 2px; right: calc(50% - 14px);
  width: 8px; height: 8px;
  background: #FF5252;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 82, 82, 0.6);
  animation: petBadgePulse 1.5s ease-in-out infinite;
}
@keyframes petBadgePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
.nav-sentence { background: linear-gradient(135deg, #F3E8FF, #DDD6FE); color: #7C3AED; }
.nav-sentence:hover { transform: scale(1.02); }
.nav-review { background: linear-gradient(135deg, #E8F5E9, #C8E6C9); color: #2E7D32; }
.nav-review:hover { transform: scale(1.02); }
.nav-adventure { background: linear-gradient(135deg, #E3F2FD, #BBDEFB); color: #1565C0; }
.nav-adventure:hover { transform: scale(1.02); }
.nav-parent {
  background: var(--border-light); color: var(--text-secondary); flex: 0.8;
  transition: all 0.2s;
}
.nav-parent:hover { background: #E8E0D6; color: var(--text-primary); transform: scale(1.05); }
.nav-parent:active { transform: scale(0.95); }
.nav-shield { stroke: currentColor; flex-shrink: 0; }

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

/* 品牌标题样式 */
.intro-bubble.intro-title {
  background: linear-gradient(135deg, #FF8C42, #FFB74D);
  border: none;
  padding: var(--space-md) var(--space-2xl);
}
.intro-bubble.intro-title p {
  font-size: var(--font-size-3xl);
  color: #FFF;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
  letter-spacing: 2px;
}

/* 副标题样式 */
.intro-bubble.intro-sub p:first-child {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
}
.intro-sub-text {
  font-size: var(--font-size-md) !important;
  color: var(--text-hint) !important;
  margin-top: var(--space-xs) !important;
  font-weight: 400;
}

/* 邀请提示样式 */
.intro-invite {
  text-align: center;
  animation: fadeUp 0.5s var(--ease-smooth);
}
.intro-invite p {
  font-size: var(--font-size-xl);
  color: var(--color-primary);
  font-weight: 600;
  animation: introPulse 1.5s ease-in-out infinite;
}

@keyframes introPulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* ====== P3: 场景动态插图 ===== */

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

/* v5.0: 点赞里程碑弹窗 */
.milestone-overlay {
  position: fixed; inset: 0; z-index: 999;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
  cursor: pointer;
}
.milestone-content {
  text-align: center; padding: var(--space-xl) var(--space-2xl);
  background: linear-gradient(135deg, #FFF8E1, #FFE0B2);
  border-radius: var(--radius-xl); border: 3px solid #FFB74D;
  box-shadow: 0 12px 48px rgba(255, 152, 0, 0.3);
  animation: milestonePop 0.5s var(--ease-bounce);
}
.milestone-emoji { font-size: 4rem; display: block; margin-bottom: var(--space-sm); }
.milestone-content h3 { font-size: var(--font-size-2xl); color: #E65100; margin-bottom: var(--space-xs); }
.milestone-content p { font-size: var(--font-size-lg); color: #F57C00; }
.milestone-content strong { font-size: var(--font-size-3xl); }

@keyframes milestonePop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  70% { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ===== P1: 季节节日漂浮粒子 ===== */
.season-particles-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  overflow: hidden;
}
</style>
