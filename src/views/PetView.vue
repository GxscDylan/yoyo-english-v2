<template>
  <div class="pet-page">
    <!-- 顶部导航 -->
    <header class="pet-header">
      <button class="btn-back" @click="$router.push('/')">
        <span class="back-icon">🏠</span>
      </button>
      <h2>🐾 我的宠物</h2>
      <div class="header-spacer"></div>
    </header>

    <main class="pet-main" v-if="s">
      <!-- ===== 区域 A：宠物信息卡 ===== -->
      <section class="pet-info-card anim-fade-up">
        <div class="pet-card-left">
          <PetEgg ref="petEggRef" @tap="handlePetTap" />
        </div>
        <div class="pet-card-right">
          <span class="pet-card-name">{{ petDisplayName }}</span>
          <span class="pet-card-subtitle">
            <template v-if="petLevel >= 5">
              破壳精灵 · {{ currentSpecies?.name || '' }}
            </template>
            <template v-else>
              {{ currentLevelConfig.desc }}
            </template>
          </span>
          <div class="pet-card-progress">
            <div class="pet-card-progress-fill" :style="{ width: (levelProgress * 100) + '%' }"></div>
          </div>
          <span class="pet-card-likes" v-if="likesToNext > 0">
            还差 {{ likesToNext }} 赞升级 ✨
          </span>
          <span class="pet-card-likes max" v-else>
            已达最高等级 🏅
          </span>
        </div>
      </section>

      <!-- ===== 区域 B：活动记录面板 ===== -->
      <section class="pet-activity-panel anim-fade-up" style="animation-delay: 0.1s">
        <!-- 今日统计行 -->
        <div class="activity-stats">
          <div class="stat-item">
            <span class="stat-icon">👍</span>
            <span class="stat-label">今日获赞</span>
            <span class="stat-value">{{ s.todayLikeCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🍎</span>
            <span class="stat-label">喂食</span>
            <span class="stat-value">{{ s.todayFeedCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🛁</span>
            <span class="stat-label">洗澡</span>
            <span class="stat-value">{{ s.todayBathCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-icon">🎵</span>
            <span class="stat-label">唱歌</span>
            <span class="stat-value">{{ s.todaySingCount }}</span>
          </div>
        </div>

        <!-- 操作按钮行 -->
        <div class="action-buttons">
          <button
            v-for="(action, key) in ACTIONS"
            :key="key"
            class="action-btn"
            :class="{
              available: canDoAction(key),
              cooldown: cooldowns[key] > 0,
              insufficient: !canDoAction(key) && cooldowns[key] === 0
            }"
            @click.stop="handleAction(key)"
          >
            <span class="action-btn-emoji">{{ action.emoji }}</span>
            <span class="action-btn-label">{{ action.label }}</span>
            <span class="action-btn-cost">{{ action.cost }}⭐</span>
            <span v-if="cooldowns[key] > 0" class="action-btn-cd">
              {{ formatCooldown(cooldowns[key]) }}
            </span>
          </button>

          <!-- 加速成长按钮（仅非满级时显示） -->
          <button
            v-if="petLevel < 5"
            class="action-btn action-btn-accel"
            :class="{
              available: canAccelAction,
              exhausted: !canAccelAction
            }"
            @click.stop="handleAccel"
          >
            <span class="action-btn-emoji">⚡</span>
            <span class="action-btn-label">加速</span>
            <span class="action-btn-cost">5⭐+5👍</span>
            <span v-if="!canAccelAction" class="action-btn-cd">
              今日剩余 {{ accelRemaining }} 次
            </span>
          </button>
        </div>

        <!-- 心情状态提示 -->
        <div class="mood-hint" v-if="moodHint">
          {{ moodHint }}
        </div>
      </section>

      <!-- ===== 区域 C：换装区域 ===== -->
      <section class="pet-dress-section anim-fade-up" v-if="petLevel >= 5" style="animation-delay: 0.2s">
        <div class="dress-header">
          <span class="dress-title">换装 👗</span>
          <span class="dress-hint">点击切换装扮（每次 10⭐）</span>
        </div>
        <div class="dress-grid">
          <button
            v-for="item in DRESS_ITEMS"
            :key="item.id"
            class="dress-item"
            :class="{
              equipped: s.currentDress === item.id,
              locked: !isCosmeticUnlocked(item.id),
              clear: item.id === 'remove'
            }"
            @click.stop="handleDress(item.id)"
          >
            <span class="dress-emoji">{{ item.emoji }}</span>
            <span v-if="isCosmeticUnlocked(item.id)" class="dress-label">{{ item.label }}</span>
            <span v-else class="dress-label dress-locked-label">🔒{{ item.unlockLikes }}👍</span>
          </button>
        </div>
      </section>

      <!-- 精灵收藏（历史养成记录） -->
      <section class="pet-history-section anim-fade-up" v-if="s.petHistory.length > 0" style="animation-delay: 0.3s">
        <h3 class="history-title">📜 养成记录</h3>
        <div class="history-list">
          <div v-for="(h, i) in s.petHistory" :key="i" class="history-item">
            <span class="history-emoji">{{ getSpeciesEmoji(h.species) }}</span>
            <span class="history-name">{{ getSpeciesName(h.species) }}</span>
            <span class="history-date">{{ formatDate(h.hatchedAt) }}</span>
            <span class="history-likes">{{ h.totalLikes }}👍</span>
          </div>
        </div>
      </section>

      <!-- 再养一颗按钮 -->
      <div class="pet-reset-row" v-if="petLevel >= 5">
        <button class="btn-reset" @click="showResetConfirm = true">
          🥚 再养一颗蛋？
        </button>
      </div>
    </main>

    <!-- 空状态 -->
    <div v-if="!s || !petStore.petState.value" class="pet-empty">
      <span class="empty-emoji">🥚</span>
      <p>萌宠系统加载中...</p>
    </div>

    <!-- 重置确认弹窗 -->
    <Transition name="pop">
      <div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
        <div class="modal-card">
          <span class="modal-emoji">🥚</span>
          <h3>要重新开始吗？</h3>
          <p>当前精灵将保存到历史记录，<br/>你会得到一颗新蛋蛋重新开始！</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" @click="showResetConfirm = false">取消</button>
            <button class="modal-btn modal-btn-confirm" @click="handleReset">好的，重新开始</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 破壳仪式全屏动画 -->
    <PetHatching
      v-if="showHatching"
      :species="hatchingSpecies"
      @dismiss="showHatching = false"
    />

    <!-- Toast 提示 -->
    <Transition name="pop">
      <div v-if="toastMsg" class="toast-overlay">
        <div class="toast-card">{{ toastMsg }}</div>
      </div>
    </Transition>

    <!-- 星星不足引导弹窗 -->
    <Transition name="fade">
      <div v-if="showStarGuide" class="star-guide-overlay" @click.self="showStarGuide = false">
        <div class="star-guide-card">
          <div class="guide-yoyo">🐯</div>
          <div class="guide-title">星星不够啦~</div>
          <div class="guide-desc">去学习赚更多星星吧！</div>
          <div class="guide-actions">
            <button class="guide-btn-secondary" @click="showStarGuide = false">
              稍后再说
            </button>
            <button class="guide-btn-primary" @click="goLearn">
              去学习 📚
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePetStore } from '@/composables/usePetStore.js'
import { useLearningStore } from '@/stores/learning.js'
import PetEgg from '@/components/PetEgg.vue'
import PetHatching from '@/components/PetHatching.vue'
import { triggerConfetti } from '@/composables/useConfetti'
import { sfxPetFeed, sfxPetBath, sfxPetSing, sfxPetHatch, sfxPetDress, sfxPetAccel, sfxFanfare } from '@/composables/useSfx'

const petStore = usePetStore()
const learningStore = useLearningStore()
const router = useRouter()

// ===== 状态 =====
const petEggRef = ref(null)
const showResetConfirm = ref(false)
const showStarGuide = ref(false)
const showHatching = ref(false)
const hatchingSpecies = ref(null)
const cooldowns = ref({ feed: 0, bath: 0, sing: 0, dress: 0 })
let cooldownTimer = null

// ===== 快捷引用 =====
const { petState, petLevel, currentLevelConfig, currentSpecies, levelProgress, likesToNextLevel } = petStore
const { ACTIONS, DRESS_ITEMS } = petStore
const { getActionCooldown, doAction, setDress, accel, canAccel, isCosmeticUnlocked } = petStore

const s = computed(() => petState.value)

// ===== 展示信息 =====
const petDisplayName = computed(() => {
  if (!s.value) return '蛋蛋'
  if (petLevel.value >= 5) {
    return s.value.petName || currentSpecies.value?.name || '精灵'
  }
  return currentLevelConfig.value?.name || '小蛋蛋'
})

// ===== 心情提示 =====
const moodHint = computed(() => {
  if (!s.value) return ''
  const mood = s.value.petMood
  if (mood === 'hungry' && s.value.showHungerAnim) return '😢 宠物饿啦！快喂食吧~'
  if (mood === 'sleeping') return '😴 宠物在睡觉呢，别打扰它~'
  if (mood === 'excited') return '🎉 宠物很开心！'
  if (mood === 'curious') return '❓ 宠物很好奇你在做什么~'
  return ''
})

// ===== 冷却倒计时 =====
function updateCooldowns() {
  for (const key of Object.keys(ACTIONS)) {
    cooldowns.value[key] = getActionCooldown(key)
  }
}

// ===== 操作可用性 =====
function canDoAction(actionKey) {
  const cd = cooldowns.value[actionKey]
  if (cd > 0) return false
  const cost = ACTIONS[actionKey]?.cost || 0
  return learningStore.totalStars >= cost
}

// ===== 加速可用性 =====
const canAccelAction = computed(() => {
  return canAccel() && learningStore.totalStars >= 5
})

const accelRemaining = computed(() => {
  const s2 = petState.value
  if (!s2) return 0
  const today = new Date().toDateString()
  const lastDate = s2.petLastAccelAt ? new Date(s2.petLastAccelAt).toDateString() : null
  if (today !== lastDate) return 2
  return Math.max(0, 2 - (s2.petAccelCountToday || 0))
})

// ===== 执行操作 =====
function handleAction(actionKey) {
  if (!canDoAction(actionKey)) {
    const cd = cooldowns.value[actionKey]
    if (cd > 0) {
      showToast('冷却中~ 再等等')
    } else {
      showToast('星星不够啦！去学习赚星星吧~')
    }
    return
  }

  const result = doAction(actionKey, learningStore.totalStars)
  if (result.success) {
    learningStore.spendStars(result.cost)
    playActionAnim(actionKey)
    // 播放宠物专属音效
    try {
      if (actionKey === 'feed') sfxPetFeed()
      else if (actionKey === 'bath') sfxPetBath()
      else if (actionKey === 'sing') sfxPetSing()
    } catch(e) {}
  } else if (result.reason === 'cooldown') {
    showToast('冷却中~')
  } else if (result.reason === 'stars') {
    showStarGuide.value = true
  }
}

// ===== 加速成长 =====
function handleAccel() {
  if (!canAccelAction.value) {
    if (accelRemaining.value <= 0) {
      showToast('今天加速次数用完啦~ 明天再来')
    } else {
      showToast('星星不够啦！')
    }
    return
  }

  const result = accel(learningStore.totalStars, petState.value?.todayLikeCount || 0)
  if (result.success) {
    learningStore.spendStars(result.cost)
    playActionAnim('feed')
    triggerConfetti(10)
    try { sfxPetAccel() } catch(e) {}
  }
}

// ===== 换装 =====
function handleDress(dressId) {
  if (dressId === 'remove') {
    setDress(null)
    playActionAnim('dress')
    return
  }

  // 检查是否已解锁
  if (!isCosmeticUnlocked(dressId)) {
    const item = DRESS_ITEMS.find(d => d.id === dressId)
    const need = item ? item.unlockLikes - (petState.value?.petTotalLikes || 0) : 0
    showToast(`还需 ${need}👍 解锁哦~`)
    return
  }

  const result = setDress(dressId)
  if (result && result.success) {
    playActionAnim('dress')
    triggerConfetti(5)
    try { sfxPetDress() } catch(e) {}
  }
}

// ===== 动画 =====
function playActionAnim(actionKey) {
  const animClass = ACTIONS[actionKey]?.animClass
  if (animClass && petEggRef.value) {
    petEggRef.value.playActionAnim(animClass)
  }
}

// ===== 宠物点击 =====
function handlePetTap() {
  if (!s.value) return
  if (s.value.petMood === 'sleeping') return // 睡觉时不响应
  s.value.petMood = 'curious'
  setTimeout(() => {
    if (s.value && s.value.petMood === 'curious') petStore.detectMood()
  }, 2000)
}

// ===== 重置 =====
function handleReset() {
  petStore.resetPet()
  showResetConfirm.value = false
  triggerConfetti(15)
}

// ===== 引导 =====
function goLearn() {
  showStarGuide.value = false
  router.push('/home')
}

// ===== 工具 =====
function formatCooldown(ms) {
  if (ms <= 0) return ''
  const totalSec = Math.ceil(ms / 1000)
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    return `${h}h${m}m`
  }
  const m = Math.floor(totalSec / 60)
  const s2 = totalSec % 60
  return m > 0 ? `${m}m${s2}s` : `${s2}s`
}

function getSpeciesEmoji(speciesId) {
  const sp = petStore.PET_SPECIES.find(s => s.id === speciesId)
  return sp?.emoji || '🥚'
}

function getSpeciesName(speciesId) {
  const sp = petStore.PET_SPECIES.find(s => s.id === speciesId)
  return sp?.name || '未知精灵'
}

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ===== Toast 提示 =====
const toastMsg = ref('')
let toastTimer = null
function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2000)
}

// ===== 生命周期 =====
onMounted(async () => {
  await petStore.loadFromDB()
  updateCooldowns()
  cooldownTimer = setInterval(updateCooldowns, 1000)
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.pet-page {
  width: 100%;
  min-height: 100dvh;
  background: linear-gradient(180deg, #FFF8F0 0%, #FFFDF7 40%, #F5F0FF 100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* ===== 顶部导航 ===== */
.pet-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}
.pet-header h2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}
.header-spacer { flex: 1; }
.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  transition: background 0.2s;
}
.btn-back:hover { background: rgba(0, 0, 0, 0.04); }
.back-icon { font-size: 1.3rem; }

/* ===== 主内容 ===== */
.pet-main {
  flex: 1;
  padding: 16px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* ===== 区域 A：宠物信息卡 ===== */
.pet-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 20px;
  padding: 16px 20px;
  border: 2px solid #A5D6A7;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.12);
}
.pet-card-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pet-card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.pet-card-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
}
.pet-card-subtitle {
  font-size: 0.75rem;
  color: var(--text-hint);
}
.pet-card-progress {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-top: 4px;
}
.pet-card-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #66BB6A, #43A047);
  transition: width 0.5s ease;
}
.pet-card-likes {
  font-size: 0.7rem;
  color: #F57C00;
  font-weight: 600;
}
.pet-card-likes.max {
  color: #4CAF50;
}

/* ===== 区域 B：活动记录面板 ===== */
.pet-activity-panel {
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-radius: 20px;
  padding: 16px;
  border: 2px solid #FFE082;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.1);
}
.activity-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.stat-icon { font-size: 1.3rem; }
.stat-label {
  font-size: 0.6rem;
  color: var(--text-hint);
  font-weight: 600;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
}
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 16px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 64px;
  position: relative;
}
.action-btn.available {
  border-color: #CE93D8;
  background: #F3E5F5;
  box-shadow: 0 2px 8px rgba(206, 147, 216, 0.2);
}
.action-btn.available:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(206, 147, 216, 0.3);
}
.action-btn.cooldown {
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
}
.action-btn.insufficient {
  opacity: 0.5;
  border-color: #EF9A9A;
}
.action-btn-accel {
  border-color: #FFD54F;
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
}
.action-btn-accel.exhausted {
  opacity: 0.4;
}
.action-btn-emoji { font-size: 1.5rem; }
.action-btn-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-primary);
}
.action-btn-cost {
  font-size: 0.55rem;
  color: var(--text-hint);
}
.action-btn-cd {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-hint);
}
.mood-hint {
  margin-top: 12px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

/* ===== 区域 C：换装区域 ===== */
.pet-dress-section {
  background: linear-gradient(135deg, #F3E5F5, #EDE7F6);
  border-radius: 20px;
  padding: 16px;
  border: 2px solid #D1C4E9;
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.08);
}
.dress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.dress-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #7B1FA2;
}
.dress-hint {
  font-size: 0.6rem;
  color: var(--text-hint);
}
.dress-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.dress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 14px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 56px;
}
.dress-item.equipped {
  border-color: #CE93D8;
  background: #F3E5F5;
  box-shadow: 0 2px 8px rgba(206, 147, 216, 0.3);
}
.dress-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.dress-item.clear {
  border-color: #EF9A9A;
}
.dress-emoji { font-size: 1.5rem; }
.dress-label {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
}
.dress-locked-label {
  font-size: 0.5rem;
  color: var(--text-hint);
}

/* ===== 养成记录 ===== */
.pet-history-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.history-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  font-size: 0.75rem;
}
.history-emoji { font-size: 1.3rem; }
.history-name { font-weight: 700; flex: 1; }
.history-date { color: var(--text-hint); }
.history-likes { color: #FF9800; font-weight: 700; }

/* ===== 再养一颗按钮 ===== */
.pet-reset-row {
  text-align: center;
  padding: 8px 0 20px;
}
.btn-reset {
  padding: 12px 24px;
  border-radius: 16px;
  border: 2px solid #FFE082;
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  font-size: 0.9rem;
  font-weight: 700;
  color: #F57C00;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-reset:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}
.btn-reset:active { transform: scale(0.98); }

/* ===== 空状态 ===== */
.pet-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
}
.empty-emoji { font-size: 4rem; }
.pet-empty p { color: var(--text-hint); font-size: 0.9rem; }

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}
.modal-card {
  text-align: center;
  padding: 24px 32px;
  background: var(--bg-card);
  border-radius: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border: 2px solid #FFE082;
  max-width: 320px;
}
.modal-emoji { font-size: 3rem; display: block; margin-bottom: 12px; }
.modal-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px;
}
.modal-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 16px;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.modal-btn {
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.modal-btn-cancel {
  background: #F5F5F5;
  color: var(--text-secondary);
}
.modal-btn-confirm {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
}
.modal-btn:hover { transform: scale(1.03); }
.modal-btn:active { transform: scale(0.97); }

/* ===== Toast ===== */
.toast-overlay {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  animation: toastIn 0.3s ease;
}
.toast-card {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ===== 星星不足引导 ===== */
.star-guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
}
.star-guide-card {
  text-align: center;
  padding: 32px 28px;
  background: var(--bg-card);
  border-radius: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 2px solid #FFE082;
  max-width: 300px;
  animation: guideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes guideIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.guide-yoyo {
  font-size: 3.5rem;
  margin-bottom: 8px;
  animation: guideYoyoBounce 1s ease-in-out infinite;
}
@keyframes guideYoyoBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.guide-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.guide-desc {
  font-size: 0.8rem;
  color: var(--text-hint);
  margin-bottom: 20px;
}
.guide-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.guide-btn {
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.guide-btn-secondary {
  background: #F5F5F5;
  color: var(--text-secondary);
}
.guide-btn-primary {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}
.guide-btn:hover { transform: scale(1.05); }
.guide-btn:active { transform: scale(0.97); }
</style>
