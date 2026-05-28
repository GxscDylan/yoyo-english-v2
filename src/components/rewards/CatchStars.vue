<template>
  <div class="catch-stars-overlay">
    <!-- 背景闪烁星星 -->
    <div class="bg-stars">
      <span v-for="i in 20" :key="'bg-'+i" class="bg-star" :style="{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 3 + 's',
        animationDuration: (2 + Math.random() * 2) + 's'
      }">✦</span>
    </div>

    <!-- 开场动画 -->
    <div v-if="phase === 'intro'" class="intro-bubble">
      <span class="yoyo-say">你太棒了！星星掉下来啦！快接住它们！</span>
    </div>

    <!-- 收集阶段 -->
    <template v-if="phase === 'collecting'">
      <!-- 倒计时（右上角圆形） -->
      <div class="timer-ring" :class="{ 'timer-warning': timeLeft <= 5 }">
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#FFD700" stroke-width="3"
            :stroke-dasharray="125.6" :stroke-dashoffset="125.6 * (1 - timeLeft / GAME_DURATION)"
            stroke-linecap="round" transform="rotate(-90 24 24)"/>
        </svg>
        <span class="timer-text">{{ Math.ceil(timeLeft) }}</span>
      </div>

      <!-- 收集计数器 -->
      <div class="collect-counter" :class="{ 'counter-pop': counterPop }">
        已收集: <strong>{{ totalCollected }}</strong> / {{ store.getCatchStarsLimit() }} ⭐
      </div>

      <!-- 分数飘升动画 -->
      <div
        v-for="fly in scoreFlies"
        :key="'fly-' + fly.id"
        class="score-fly"
        :style="{
          left: fly.x + '%',
          top: fly.y + '%',
          '--fly-color': fly.color
        }"
      >
        {{ fly.text }}
      </div>

      <!-- 收集粒子效果 -->
      <div
        v-for="particle in particles"
        :key="'p-' + particle.id"
        class="collect-particle"
        :style="{
          left: particle.x + '%',
          top: particle.y + '%',
          '--px': particle.dx + 'px',
          '--py': particle.dy + 'px',
          '--pc': particle.color
        }"
      >✦</div>

      <!-- 掉落物 -->
      <div
        v-for="drop in activeDrops"
        :key="drop.id"
        class="drop-item"
        :style="{
          left: drop.x + '%',
          '--fall-duration': drop.duration + 's',
          '--rotate-swing': drop.rotation + 'deg'
        }"
        :class="{
          'collected': drop.collected,
          'limit-shake': drop.limitShake
        }"
        @click="collectDrop(drop)"
        @touchstart.prevent="collectDrop(drop)"
      >
        <span class="drop-emoji">{{ drop.emoji }}</span>
      </div>
    </template>

    <!-- 结算动画 -->
    <div v-if="phase === 'result'" class="result-overlay">
      <div class="result-card">
        <div class="confetti-burst">
          <span v-for="i in 30" :key="'c-'+i" class="confetti-dot" :style="{
            animationDelay: Math.random() * 0.5 + 's',
            '--cx': (Math.random() * 200 - 100) + 'px',
            '--cy': (Math.random() * 200 - 100) + 'px',
            '--cc': ['#FFD700', '#FF6B6B', '#6C63FF', '#4FC3F7', '#4CAF50'][Math.floor(Math.random()*5)]
          }">●</span>
        </div>
        <span class="result-emoji">🎉</span>
        <p class="result-text">太厉害了！</p>
        <p class="result-stars">收集了 <strong>{{ totalCollected }}</strong> 个星星！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import { useSpeech } from '@/composables/useSpeech'
import { sfxStar, sfxMatch, sfxComplete, sfxTick } from '@/composables/useSfx'

const store = useLearningStore()
const { speak, playAudio } = useSpeech()

const props = defineProps({
  categoryIndex: { type: Number, default: 0 },
  triggerLabel: { type: String, default: '' }
})

const emit = defineEmits(['done'])

const GAME_DURATION = 15
const MAX_DROPS_ON_SCREEN = 8
const CLICK_COOLDOWN = 300
// 清理出屏幕的掉落物：fall 时间 + 0.5s 缓冲
const DROP_EXPIRE_BUFFER = 500

const phase = ref('intro')
const timeLeft = ref(GAME_DURATION)
const activeDrops = ref([])
const totalCollected = ref(0)
let dropTimer = null
let gameTimer = null
let bgmTimer = null
let lastClickTime = 0
let dropIdCounter = 0
let audioCtx = null

// 分数飘升
const scoreFlies = ref([])
let flyIdCounter = 0

// 收集粒子
const particles = ref([])
let particleIdCounter = 0

// 计数器弹跳
const counterPop = ref(false)

// 背景音乐（Web Audio 轻快循环）
let bgmGain = null
let bgmInterval = null

function startBGM() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    bgmGain = audioCtx.createGain()
    bgmGain.gain.value = 0.06
    bgmGain.connect(audioCtx.destination)

    // 轻快琶音循环
    const notes = [523, 659, 784, 1047, 784, 659, 523, 392]
    let idx = 0
    bgmInterval = setInterval(() => {
      if (!audioCtx || audioCtx.state === 'closed') return
      const osc = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      osc.connect(g); g.connect(bgmGain)
      osc.type = 'sine'
      g.gain.setValueAtTime(0.08, audioCtx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
      osc.frequency.setValueAtTime(notes[idx % notes.length], audioCtx.currentTime)
      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.4)
      idx++
    }, 500)
  } catch(e) {}
}

function stopBGM() {
  if (bgmInterval) clearInterval(bgmInterval)
  bgmInterval = null
  if (bgmGain) {
    try { bgmGain.gain.linearRampToValueAtTime(0, audioCtx?.currentTime + 0.3) } catch(e) {}
  }
}

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
  const drop = {
    id: ++dropIdCounter,
    emoji: type.emoji,
    value: type.value,
    x: 5 + Math.random() * 85,
    duration: 3 + Math.random() * 2,
    rotation: -30 + Math.random() * 60,
    collected: false,
    limitShake: false
  }
  activeDrops.value.push(drop)

  // 掉出屏幕后自动移除，避免占名额导致空闲
  setTimeout(() => {
    if (!drop.collected) {
      activeDrops.value = activeDrops.value.filter(d => d.id !== drop.id)
    }
  }, drop.duration * 1000 + DROP_EXPIRE_BUFFER)
}

function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i
    const dist = 30 + Math.random() * 30
    particles.value.push({
      id: ++particleIdCounter,
      x, y,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color
    })
  }
  // 粒子自动清理
  setTimeout(() => {
    particles.value = particles.value.filter(p => p.id <= particleIdCounter - count)
  }, 600)
}

function spawnScoreFly(x, y, text, color) {
  scoreFlies.value.push({ id: ++flyIdCounter, x, y, text, color })
  setTimeout(() => {
    scoreFlies.value = scoreFlies.value.filter(f => f.id !== flyIdCounter)
  }, 1000)
}

function collectDrop(drop) {
  // 防重复收集
  if (drop.collected) return
  if (phase.value !== 'collecting') return
  // 点击冷却
  const now = Date.now()
  if (now - lastClickTime < CLICK_COOLDOWN) return
  lastClickTime = now

  // 检查上限 — 有动画+音效反馈
  const limit = store.getCatchStarsLimit()
  if (totalCollected.value >= limit) {
    // 摇晃动画
    drop.limitShake = true
    setTimeout(() => { drop.limitShake = false }, 500)
    sfxWrong()
    spawnParticles(drop.x, 60, '#F44336', 6)
    speak('已经满了', { rate: 0.9 })
    return
  }

  drop.collected = true

  sfxStar()
  if (drop.value >= 3) sfxMatch()

  totalCollected.value += drop.value
  store.addStars(drop.value)

  // 计数器弹跳
  counterPop.value = true
  setTimeout(() => { counterPop.value = false }, 300)

  // 分数飘升 + 粒子
  const color = drop.value >= 5 ? '#00E5FF' : drop.value >= 3 ? '#FFD700' : '#FF9800'
  spawnScoreFly(drop.x, 60, `+${drop.value}`, color)
  spawnParticles(drop.x, 60, color, drop.value >= 3 ? 12 : 8)

  // 动画结束后移除
  setTimeout(() => {
    activeDrops.value = activeDrops.value.filter(d => d.id !== drop.id)
  }, 600)
}

function startGame() {
  phase.value = 'collecting'
  playAudio('/audio/great.mp3')
  speak('Catch the stars!', { rate: 0.8 })
  startBGM()

  dropTimer = setInterval(() => {
    createDrop()
  }, 800)

  gameTimer = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 0) {
      endGame()
    } else if (timeLeft.value <= 5 && Math.ceil(timeLeft.value * 10) % 10 === 0) {
      // 最后 5 秒每整秒滴答
      sfxTick()
    }
  }, 100)
}

function endGame() {
  clearInterval(dropTimer)
  clearInterval(gameTimer)
  stopBGM()
  phase.value = 'result'

  if (totalCollected.value >= 10) {
    sfxComplete()
  }

  // 记录冷却（包括全局冷却 -1）
  store.recordCatchStarsTrigger(props.categoryIndex)

  setTimeout(() => {
    emit('done')
  }, 2000)
}

onMounted(() => {
  setTimeout(() => {
    if (phase.value === 'intro') startGame()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(dropTimer)
  clearInterval(gameTimer)
  stopBGM()
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
  overflow: hidden;
}

/* ===== 背景闪烁星星 ===== */
.bg-stars {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
}
.bg-star {
  position: absolute;
  color: rgba(255, 215, 0, 0.3);
  font-size: 0.8rem;
  animation: bgTwinkle 2s ease-in-out infinite;
}

@keyframes bgTwinkle {
  0%, 100% { opacity: 0.1; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.3); }
}

.intro-bubble {
  text-align: center;
  animation: popIn 0.5s ease;
  z-index: 1;
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
  z-index: 10;
}
.timer-ring.timer-warning svg circle:last-child {
  stroke: #F44336 !important;
  animation: timerPulse 0.5s ease-in-out infinite;
}
@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
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
  z-index: 10;
  transition: transform 0.15s;
}
.collect-counter.counter-pop {
  animation: counterBounce 0.3s ease;
}
@keyframes counterBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.collect-counter strong {
  color: #FFD700;
  font-size: 1.5rem;
}

/* 分数飘升 */
.score-fly {
  position: absolute;
  z-index: 20;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--fly-color, #FFD700);
  pointer-events: none;
  animation: flyUp 1s ease-out forwards;
  text-shadow: 0 0 8px rgba(255,255,255,0.5);
}
@keyframes flyUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
}

/* 收集粒子 */
.collect-particle {
  position: absolute;
  z-index: 15;
  font-size: 0.8rem;
  color: var(--pc);
  pointer-events: none;
  animation: particleBurst 0.6s ease-out forwards;
}
@keyframes particleBurst {
  0% { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--px), var(--py)) scale(0); }
}

/* 掉落物容器 - 只负责下落 */
.drop-item {
  position: absolute;
  top: -60px;
  animation: fall var(--fall-duration) linear forwards;
  cursor: pointer;
  z-index: 10;
  padding: 10px;
  -webkit-tap-highlight-color: transparent;
}

/* 上限摇晃 */
.drop-item.limit-shake .drop-emoji {
  animation: shake 0.5s ease !important;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px) rotate(-5deg); }
  40% { transform: translateX(8px) rotate(5deg); }
  60% { transform: translateX(-6px) rotate(-3deg); }
  80% { transform: translateX(6px) rotate(3deg); }
}

/* 掉落物 emoji - 负责摇摆 + 收集飞走 */
.drop-emoji {
  font-size: 3rem;
  display: block;
  transition: transform 0.15s;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
  user-select: none;
  -webkit-user-select: none;
  animation: swing 1.5s ease-in-out infinite;
  transform-origin: center;
}

.drop-item:active .drop-emoji {
  transform: scale(1.3);
}

/* 收集后：容器停止下落 + emoji 飞走 */
.drop-item.collected {
  animation-play-state: paused !important;
  pointer-events: none;
}

.drop-item.collected .drop-emoji {
  animation: collectFly 0.6s ease-out forwards !important;
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
  z-index: 1;
}

.result-card {
  position: relative;
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 32px 48px;
  border-radius: 24px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

/* 结算粒子爆发 */
.confetti-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}
.confetti-dot {
  position: absolute;
  top: 50%; left: 50%;
  font-size: 0.5rem;
  color: var(--cc);
  animation: confettiBurst 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}
@keyframes confettiBurst {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--cx), var(--cy)) scale(0); opacity: 0; }
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
