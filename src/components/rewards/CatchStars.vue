<template>
  <div class="catch-stars-overlay" @touchstart.prevent="handleTap">
    <!-- 开场动画 -->
    <div v-if="phase === 'intro'" class="intro-bubble">
      <span class="yoyo-say">你太棒了！星星掉下来啦！快接住它们！</span>
    </div>

    <!-- 收集阶段 -->
    <template v-if="phase === 'collecting'">
      <!-- 倒计时（右上角圆形） -->
      <div class="timer-ring">
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#FFD700" stroke-width="3"
            :stroke-dasharray="125.6" :stroke-dashoffset="125.6 * (1 - timeLeft / GAME_DURATION)"
            stroke-linecap="round" transform="rotate(-90 24 24)"/>
        </svg>
        <span class="timer-text">{{ Math.ceil(timeLeft) }}</span>
      </div>

      <!-- 收集计数器 -->
      <div class="collect-counter">
        已收集: <strong>{{ totalCollected }}</strong> ⭐
      </div>

      <!-- 掉落物 -->
      <div
        v-for="drop in activeDrops"
        :key="drop.id"
        class="drop-item"
        :style="{
          left: drop.x + '%',
          '--fall-duration': drop.duration + 's',
          '--rotate-swing': drop.rotation + 'deg',
          top: drop.collected ? drop.collectY + '%' : '0'
        }"
        :class="{ 'collected': drop.collected }"
      >
        <span class="drop-emoji">{{ drop.emoji }}</span>
      </div>
    </template>

    <!-- 结算动画 -->
    <div v-if="phase === 'result'" class="result-overlay">
      <div class="result-card">
        <span class="result-emoji">🎉</span>
        <p class="result-text">太厉害了！</p>
        <p class="result-stars">收集了 <strong>{{ totalCollected }}</strong> 个星星！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxStar, sfxMatch, sfxComplete } from '@/composables/useSfx'

const router = useRouter()
const store = useLearningStore()
const { speak, playAudio } = useSpeech()

const props = defineProps({
  categoryIndex: { type: Number, default: 0 },
  triggerLabel: { type: String, default: '' } // 如 'game-clear', 'category-complete'
})

const emit = defineEmits(['done'])

const GAME_DURATION = 15 // 收集阶段 15 秒
const MAX_DROPS_ON_SCREEN = 8
const CLICK_COOLDOWN = 200 // ms

const phase = ref('intro') // intro → collecting → result
const timeLeft = ref(GAME_DURATION)
const activeDrops = ref([])
const totalCollected = ref(0)
let dropTimer = null
let gameTimer = null
let lastClickTime = 0
let dropIdCounter = 0

// 掉落物类型与概率
const DROP_TYPES = [
  { emoji: '⭐', weight: 70, value: 1 },
  { emoji: '🎁', weight: 25, value: 3 },
  { emoji: '💎', weight: 5,  value: 5 }
]

function getRandomDrop() {
  const total = DROP_TYPES.reduce((s, d) => s + d.weight, 0)
  let rand = Math.random() * total
  for (const drop of DROP_TYPES) {
    rand -= drop.weight
    if (rand <= 0) return drop
  }
  return DROP_TYPES[0]
}

function createDrop() {
  if (activeDrops.value.length >= MAX_DROPS_ON_SCREEN) return
  const type = getRandomDrop()
  activeDrops.value.push({
    id: ++dropIdCounter,
    emoji: type.emoji,
    value: type.value,
    x: 5 + Math.random() * 85, // 5% ~ 90%
    duration: 3 + Math.random() * 2, // 3~5 秒
    rotation: -30 + Math.random() * 60, // -30° ~ +30°
    collected: false,
    collectY: 0
  })
}

function handleTap(event) {
  if (phase.value !== 'collecting') return
  // 点击冷却
  const now = Date.now()
  if (now - lastClickTime < CLICK_COOLDOWN) return
  lastClickTime = now

  // 获取点击位置附近的掉落物
  const touch = event.touches ? event.touches[0] : event
  const clickX = touch.clientX
  const clickY = touch.clientY

  const threshold = 60 // 60px 点击区域
  let closest = null
  let closestDist = Infinity

  for (const drop of activeDrops.value) {
    if (drop.collected) continue
    const el = document.querySelector(`.drop-item:nth-child(${activeDrops.value.indexOf(drop) + 1})`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2)
    if (dist < threshold && dist < closestDist) {
      closest = drop
      closestDist = dist
    }
  }

  if (closest) {
    collectDrop(closest)
  }
}

function collectDrop(drop) {
  // 检查上限
  const limit = store.getCatchStarsLimit()
  if (totalCollected.value >= limit) return

  drop.collected = true
  drop.collectY = window.innerHeight * 0.8 // 飞向底部

  sfxStar()
  if (drop.value >= 3) sfxMatch()

  totalCollected.value += drop.value
  store.addStars(drop.value)

  // 动画结束后移除
  setTimeout(() => {
    activeDrops.value = activeDrops.value.filter(d => d.id !== drop.id)
  }, 500)
}

function startGame() {
  phase.value = 'collecting'
  playAudio('/audio/great.mp3')
  speak('Catch the stars!', { rate: 0.8 })

  // 掉落生成器
  dropTimer = setInterval(() => {
    createDrop()
  }, 800)

  // 倒计时
  gameTimer = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 100)
}

function endGame() {
  clearInterval(dropTimer)
  clearInterval(gameTimer)
  phase.value = 'result'

  if (totalCollected.value >= 10) {
    sfxComplete()
  }

  // 记录冷却
  if (props.categoryIndex >= 0) {
    store.recordCatchStarsTrigger(props.categoryIndex)
  }

  // 2 秒后返回
  setTimeout(() => {
    emit('done')
  }, 2000)
}

onMounted(() => {
  // 1 秒后开始收集
  setTimeout(() => {
    if (phase.value === 'intro') startGame()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(dropTimer)
  clearInterval(gameTimer)
})
</script>

<style scoped>
.catch-stars-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(180deg, #1a0a3e 0%, #3d1a78 50%, #1a0a3e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}

.intro-bubble {
  text-align: center;
  animation: popIn 0.5s ease;
}

.yoyo-say {
  font-size: 1.5rem;
  color: #FFD700;
  font-weight: 700;
}

/* 倒计时 */
.timer-ring {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
}

.timer-ring svg {
  width: 100%;
  height: 100%;
}

.timer-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #FFD700;
}

/* 收集计数器 */
.collect-counter {
  position: absolute;
  bottom: 24px;
  left: 24px;
  font-size: 1.2rem;
  color: white;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px 16px;
  border-radius: 20px;
}

.collect-counter strong {
  color: #FFD700;
  font-size: 1.5rem;
}

/* 掉落物 */
.drop-item {
  position: absolute;
  top: -60px;
  animation: fall var(--fall-duration) linear forwards;
  transform-origin: center;
  animation-name: fall, swing;
}

.drop-emoji {
  font-size: 3rem;
  display: block;
  cursor: pointer;
  transition: transform 0.2s;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
}

.drop-item.collected .drop-emoji {
  animation: collectFly 0.5s ease-out forwards;
}

@keyframes fall {
  from { top: -60px; }
  to { top: 110vh; }
}

@keyframes swing {
  0%, 100% { transform: rotate(calc(var(--rotate-swing) * -1)); }
  50% { transform: rotate(var(--rotate-swing)); }
}

@keyframes collectFly {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(0) translateY(50vh); opacity: 0; }
}

/* 结算 */
.result-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.5s ease;
}

.result-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 32px 48px;
  border-radius: 24px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.result-emoji {
  font-size: 5rem;
  display: block;
  animation: bounce 0.6s ease;
}

.result-text {
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
  margin: 8px 0;
}

.result-stars {
  font-size: 1.2rem;
  color: #FFD700;
}

.result-stars strong {
  font-size: 2rem;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
</style>
