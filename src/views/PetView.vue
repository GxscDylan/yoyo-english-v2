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
      <!-- ===== 资源栏：星星 + 点赞 ===== -->
      <section class="pet-resources anim-fade-up">
        <div class="resource-item resource-stars">
          <span class="resource-icon">⭐</span>
          <span class="resource-value">{{ learningStore.totalStars }}</span>
          <span class="resource-label">星星</span>
        </div>
        <div class="resource-item resource-likes">
          <span class="resource-icon">👍</span>
          <span class="resource-value">{{ s.petTotalLikes || 0 }}</span>
          <span class="resource-label">总点赞</span>
        </div>
      </section>

      <!-- ===== 区域 A：宠物信息卡 ===== -->
      <section class="pet-info-card anim-fade-up" style="animation-delay: 0.05s">
        <div class="pet-card-left">
          <PetEgg ref="petEggRef" large @tap="handlePetTap" />
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

      <!-- ===== 区域 B：互动面板 ===== -->
      <section class="pet-activity-panel anim-fade-up" style="animation-delay: 0.1s">
        <!-- 顶部统计行（精简8项） -->
        <div class="activity-stats">
          <div class="stat-item" v-for="(stat, key) in STATS_MAP" :key="key">
            <span class="stat-icon">{{ stat.icon }}</span>
            <span class="stat-value">{{ s[stat.key] || 0 }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>

        <!-- ===== 核心操作（大按钮） ===== -->
        <div class="action-tier action-tier-core">
          <button
            v-for="key in CORE_ACTIONS"
            :key="key"
            class="action-btn action-btn-core"
            :class="{
              available: canDoAction(key),
              cooldown: cooldowns[key] > 0,
              insufficient: !canDoAction(key) && cooldowns[key] === 0,
              'shake-error': shakeState[key]
            }"
            @click.stop="handleAction(key, $event)"
            @animationend="onShakeEnd(key)"
            :aria-label="`${ACTIONS[key].label}，消耗${ACTIONS[key].cost}星星，${cooldowns[key] > 0 ? '冷却中' : '可用'}`"
            :aria-disabled="!canDoAction(key)"
          >
            <span class="action-btn-emoji">{{ ACTIONS[key].emoji }}</span>
            <span class="action-btn-label">{{ ACTIONS[key].label }}</span>
            <span class="action-btn-cost">{{ ACTIONS[key].cost }}</span>
            <span v-if="cooldowns[key] > 0" class="action-btn-cd">
              <svg class="cooldown-ring-svg" viewBox="0 0 36 36">
                <circle class="ring-bg" cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/>
                <circle
                  class="ring-fill"
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#AB47BC"
                  stroke-width="2"
                  stroke-linecap="round"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="getRingOffset(key)"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span class="cd-text">{{ formatCooldown(cooldowns[key]) }}</span>
            </span>
          </button>
        </div>

        <!-- ===== 日常操作（中按钮） ===== -->
        <div class="action-tier action-tier-daily">
          <button
            v-for="key in DAILY_ACTIONS"
            :key="key"
            class="action-btn action-btn-daily"
            :class="{
              available: canDoAction(key),
              cooldown: cooldowns[key] > 0,
              insufficient: !canDoAction(key) && cooldowns[key] === 0,
              'shake-error': shakeState[key]
            }"
            @click.stop="handleAction(key, $event)"
            @animationend="onShakeEnd(key)"
            :aria-label="`${ACTIONS[key].label}，消耗${ACTIONS[key].cost}星星，${cooldowns[key] > 0 ? '冷却中' : '可用'}`"
            :aria-disabled="!canDoAction(key)"
          >
            <span class="action-btn-emoji">{{ ACTIONS[key].emoji }}</span>
            <span class="action-btn-label">{{ ACTIONS[key].label }}</span>
            <span class="action-btn-cost">{{ ACTIONS[key].cost }}</span>
            <span v-if="cooldowns[key] > 0" class="action-btn-cd">
              <svg class="cooldown-ring-svg" viewBox="0 0 36 36">
                <circle class="ring-bg" cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/>
                <circle
                  class="ring-fill"
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#AB47BC"
                  stroke-width="2"
                  stroke-linecap="round"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="getRingOffset(key)"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span class="cd-text">{{ formatCooldown(cooldowns[key]) }}</span>
            </span>
          </button>
        </div>

        <!-- ===== 特殊操作（小按钮） ===== -->
        <div class="action-tier action-tier-special">
          <button
            v-for="key in SPECIAL_ACTIONS"
            :key="key"
            class="action-btn action-btn-special"
            :class="{
              available: canDoAction(key),
              cooldown: cooldowns[key] > 0,
              insufficient: !canDoAction(key) && cooldowns[key] === 0,
              'shake-error': shakeState[key]
            }"
            @click.stop="handleAction(key, $event)"
            @animationend="onShakeEnd(key)"
            :aria-label="`${ACTIONS[key].label}，消耗${ACTIONS[key].cost}星星，${cooldowns[key] > 0 ? '冷却中' : '可用'}`"
            :aria-disabled="!canDoAction(key)"
          >
            <span class="action-btn-emoji">{{ ACTIONS[key].emoji }}</span>
            <span class="action-btn-label">{{ ACTIONS[key].label }}</span>
            <span class="action-btn-cost">{{ ACTIONS[key].cost }}</span>
            <span v-if="cooldowns[key] > 0" class="action-btn-cd">
              <svg class="cooldown-ring-svg" viewBox="0 0 36 36">
                <circle class="ring-bg" cx="18" cy="18" r="15" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2"/>
                <circle
                  class="ring-fill"
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#AB47BC"
                  stroke-width="2"
                  stroke-linecap="round"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="getRingOffset(key)"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span class="cd-text">{{ formatCooldown(cooldowns[key]) }}</span>
            </span>
          </button>

          <!-- 加速成长按钮（仅非满级时显示） -->
          <button
            v-if="petLevel < 5"
            class="action-btn action-btn-special action-btn-accel"
            :class="{
              available: canAccelAction,
              exhausted: !canAccelAction
            }"
            @click.stop="handleAccel"
          >
            <span class="action-btn-emoji">⚡</span>
            <span class="action-btn-label">加速</span>
            <span class="action-btn-cost">5⭐ → +10👍</span>
            <span v-if="!canAccelAction" class="action-btn-cd">
              余 {{ accelRemaining }} 次
            </span>
          </button>
        </div>

        <!-- Lv5+ 换装（收敛到面板内） -->
        <div class="dress-inline" v-if="petLevel >= 5">
          <span class="dress-inline-label">换装 👗</span>
          <div class="dress-inline-grid">
            <button
              v-for="item in DRESS_ITEMS"
              :key="item.id"
              class="dress-inline-item"
              :class="{
                equipped: s.currentDress === item.id,
                locked: item.id !== 'remove' && !isCosmeticUnlocked(item.id),
                clear: item.id === 'remove'
              }"
              @click.stop="handleDress(item.id)"
            >
              <span class="dress-inline-emoji">{{ item.emoji }}</span>
              <span v-if="item.id !== 'remove' && !isCosmeticUnlocked(item.id)" class="dress-inline-lock">🔒</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ===== 操作反馈：呦呦鼓励气泡 ===== -->
      <Transition name="pop">
        <div v-if="showFeedback" class="feedback-overlay" @click.self="dismissFeedback">
          <div class="feedback-card">
            <span class="feedback-emoji">{{ feedbackEmoji }}</span>
            <div class="feedback-text">{{ feedbackText }}</div>
            <button class="feedback-close" @click.stop="dismissFeedback">知道了~</button>
          </div>
        </div>
      </Transition>

      <!-- 里程碑庆祝 -->
      <Transition name="pop">
        <div v-if="showMilestone" class="milestone-overlay">
          <div class="milestone-card">
            <span class="milestone-emoji">🎊</span>
            <h3>{{ milestoneText }}</h3>
            <p>太棒了！继续加油~</p>
          </div>
        </div>
      </Transition>

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
      @dismiss="onHatchDismiss"
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
              去学习 
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
import { usePetBubble } from '@/composables/usePetBubble'
import PetEgg from '@/components/PetEgg.vue'
import PetHatching from '@/components/PetHatching.vue'
import '@/assets/styles/pet.css'
import { triggerConfetti } from '@/composables/useConfetti'
import { sfxPetFeed, sfxPetBath, sfxPetSing, sfxPetHatch, sfxPetDress, sfxPetAccel, sfxPetPet, sfxPetPlay, sfxPetWalk, sfxPetCuddle, sfxFanfare, sfxPetExplore, sfxMilestone } from '@/composables/useSfx'

const petStore = usePetStore()
const learningStore = useLearningStore()
const petBubble = usePetBubble()
const router = useRouter()

// ===== 状态 =====
const petEggRef = ref(null)
const showResetConfirm = ref(false)
const showStarGuide = ref(false)
const showHatching = ref(false)
const hatchingSpecies = ref(null)
const cooldowns = ref({ feed: 0, bath: 0, sing: 0, pet: 0, play: 0, walk: 0, cuddle: 0, explore: 0 })
let cooldownTimer = null
const shakeState = ref({})
const ringCircumference = 2 * Math.PI * 15

// ===== 操作分级 =====
const CORE_ACTIONS = ['feed', 'pet']           // 核心：喂食、摸头
const DAILY_ACTIONS = ['bath', 'sing', 'play', 'walk']  // 日常：洗澡、唱歌、玩耍、散步
const SPECIAL_ACTIONS = ['cuddle', 'explore']  // 特殊：拥抱、探险

// ===== 统计映射 =====
const STATS_MAP = {
  feed:    { key: 'todayFeedCount',   icon: '🍎', label: '喂食' },
  bath:    { key: 'todayBathCount',   icon: '', label: '洗澡' },
  sing:    { key: 'todaySingCount',   icon: '🎵', label: '唱歌' },
  pet:     { key: 'todayPetCount',    icon: '✋', label: '摸头' },
  play:    { key: 'todayPlayCount',   icon: '🎾', label: '玩耍' },
  walk:    { key: 'todayWalkCount',   icon: '🌿', label: '散步' },
  cuddle:  { key: 'todayCuddleCount', icon: '🫂', label: '拥抱' },
  explore: { key: 'todayExploreCount',icon: '🗺️', label: '探险' },
}

// ===== 快捷引用 =====
const { petState, petLevel, currentLevelConfig, currentSpecies, levelProgress, likesToNextLevel } = petStore
const { ACTIONS, DRESS_ITEMS } = petStore
const { getActionCooldown, doAction, setDress, accel, canAccel, isCosmeticUnlocked } = petStore
const { persist: persistPet } = petStore

const s = computed(() => petState.value)

// ===== 展示信息 =====
const petDisplayName = computed(() => {
  if (!s.value) return '蛋蛋'
  if (petLevel.value >= 5) {
    return s.value.petName || currentSpecies.value?.name || '精灵'
  }
  return currentLevelConfig.value?.name || '小蛋蛋'
})

// ===== 操作反馈 =====
const showFeedback = ref(false)
const feedbackText = ref('')
const feedbackEmoji = ref('🐯')
let feedbackTimer = null

// 操作成功后的个性化鼓励语
const ENCOURAGEMENTS = {
  feed:    ['吃得饱饱的！🍎', '小肚子圆滚滚~ 🍎', '好香好满足！🍎'],
  bath:    ['洗香香啦！', '泡泡浴好开心~ ', '干干净净最漂亮！'],
  sing:    ['好好听呀~ 🎵', '跟着音乐摇摆！🎵', '音乐小精灵~ 🎵'],
  pet:     ['舒服~ 🤗', '摸摸最开心！🤗', '好温柔的摸摸~ 🤗'],
  play:    ['太好玩了！🎾', '再来一次！🎾', '活力满满~ 🎾'],
  walk:    ['散步好舒服~ 🌿', '外面的世界真大！🌿', '走走看看~ 🌿'],
  cuddle:  ['抱抱好温暖~ ', '最喜欢抱抱了！🫂', '幸福抱抱~ 🫂'],
  explore: ['探险真刺激！🗺️', '发现新大陆！🗺️', '勇敢小探险家~ 🗺️'],
}

const MILESTONE_MESSAGES = [
  '喂食 5 次啦！🍎',
  '摸了 5 次头！🤗',
  '唱歌 5 次！🎵',
  '玩耍 5 次！🎾',
  '探险 3 次！🗺️',
]

function showActionFeedback(actionKey) {
  const msgs = ENCOURAGEMENTS[actionKey]
  if (!msgs) return
  feedbackText.value = msgs[Math.floor(Math.random() * msgs.length)]
  feedbackEmoji.value = '🐯'
  showFeedback.value = true
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { showFeedback.value = false }, 2500)
}

function dismissFeedback() {
  showFeedback.value = false
  if (feedbackTimer) clearTimeout(feedbackTimer)
}

// 里程碑庆祝
const showMilestone = ref(false)
const milestoneText = ref('')
let milestoneTimer = null

function checkMilestone(actionKey) {
  const s2 = petState.value
  if (!s2) return
  const countKey = `today${actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}Count`
  const count = s2[countKey] || 0
  const milestones = { feed: 5, pet: 5, sing: 5, play: 5, explore: 3 }
  if (milestones[actionKey] && count === milestones[actionKey]) {
    milestoneText.value = MILESTONE_MESSAGES.find(m => m.includes(actionKey.charAt(0).toUpperCase() + actionKey.slice(1))) || `做了 ${count} 次${ACTIONS[actionKey]?.label || ''}！`
    showMilestone.value = true
    triggerConfetti(15)
    try { sfxMilestone() } catch(e) {}
    if (milestoneTimer) clearTimeout(milestoneTimer)
    milestoneTimer = setTimeout(() => { showMilestone.value = false }, 3000)
  }
}

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

// ===== 冷却进度环偏移量计算 =====
function getRingOffset(actionKey) {
  const action = ACTIONS[actionKey]
  if (!action) return 0
  const total = action.cooldown
  const remaining = cooldowns.value[actionKey]
  return ringCircumference * (1 - remaining / total)
}

// ===== 抖动状态管理 =====
function triggerShake(actionKey) {
  shakeState.value[actionKey] = true
}

function onShakeEnd(key) {
  shakeState.value[key] = false
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
function handleAction(actionKey, event) {
  if (!canDoAction(actionKey)) {
    const cd = cooldowns.value[actionKey]
    if (cd > 0) {
      showToast('冷却中~ 再等等')
    } else {
      triggerShake(actionKey)
      showToast('星星不够啦！去学习赚星星吧~')
    }
    return
  }

  // 记录点击位置用于涟漪效果
  if (event && event.currentTarget) {
    const btn = event.currentTarget
    const rect = btn.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(0)
    const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(0)
    btn.style.setProperty('--rx', x + '%')
    btn.style.setProperty('--ry', y + '%')
  }

  const result = doAction(actionKey, learningStore.totalStars)
  if (result.success) {
    learningStore.spendStars(result.cost)
    playActionAnim(actionKey)
    // 个性化鼓励反馈
    showActionFeedback(actionKey)
    // 检查里程碑
    checkMilestone(actionKey)
    // 播放宠物专属音效
    try {
      if (actionKey === 'feed') sfxPetFeed()
      else if (actionKey === 'bath') sfxPetBath()
      else if (actionKey === 'sing') sfxPetSing()
      else if (actionKey === 'pet') sfxPetPet()
      else if (actionKey === 'play') sfxPetPlay()
      else if (actionKey === 'walk') sfxPetWalk()
      else if (actionKey === 'cuddle') sfxPetCuddle()
    } catch(e) {}
  } else if (result.reason === 'cooldown') {
    showToast('冷却中~')
  } else if (result.reason === 'stars') {
    showStarGuide.value = true
  } else if (result.reason === 'disabled') {
    showToast('萌宠系统未开启~')
  } else {
    showToast('出了点小问题~')
  }
}

// ===== 探险奖励联动（星星实际到账） =====
/**
 * 监听探险奖励变化，将星星/点赞/收藏等奖励同步到 learningStore
 * 机制：doAction('explore') 3秒后生成奖励存入 exploreRewards，
 * 此处检测新奖励并执行实际到账
 */
const lastProcessedRewardCount = ref(0)

watch(() => s.value?.exploreRewards?.length, (newLen) => {
  if (!s.value || !newLen || newLen <= lastProcessedRewardCount.value) return

  // 处理未结算的新奖励
  for (let i = lastProcessedRewardCount.value; i < newLen; i++) {
    const reward = s.value.exploreRewards[i]
    if (!reward) continue

    if (reward.type === 'stars' && reward.amount > 0) {
      learningStore.addStars(reward.amount)
      showRewardNotification(reward)
    }

    if (reward.type === 'likes' && reward.amount > 0) {
      // 点赞已在 doAction 内部处理（petTotalLikes += reward.amount）
      // 此处仅做通知
      showRewardNotification(reward)
    }

    if (reward.type === 'cosmetic' && reward.desc) {
      showRewardNotification(reward)
    }

    if (reward.type === 'surprise') {
      showRewardNotification(reward)
    }
  }

  lastProcessedRewardCount.value = newLen
  persistPet()
}, { deep: true })

/** 探险奖励到账通知 */
function showRewardNotification(reward) {
  feedbackText.value = reward.desc || '探险带回了好东西！'
  feedbackEmoji.value = reward.emoji || '🎁'
  showFeedback.value = true
  if (feedbackTimer) clearTimeout(feedbackTimer)
  feedbackTimer = setTimeout(() => { showFeedback.value = false }, 3000)
  triggerConfetti(8)
  try { sfxPetExplore() } catch(e) {} // 探险奖励音效
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
    feedbackText.value = '加速成长！冲鸭~ ⚡'
    feedbackEmoji.value = '🐯'
    showFeedback.value = true
    if (feedbackTimer) clearTimeout(feedbackTimer)
    feedbackTimer = setTimeout(() => { showFeedback.value = false }, 2500)
    try { sfxPetAccel() } catch(e) {}
  }
}

// ===== 换装 =====
function handleDress(dressId) {
  if (dressId === 'remove') {
    setDress(null)
    playActionAnim('dress')
    feedbackText.value = '恢复自然美~ ✨'
    feedbackEmoji.value = '🐯'
    showFeedback.value = true
    if (feedbackTimer) clearTimeout(feedbackTimer)
    feedbackTimer = setTimeout(() => { showFeedback.value = false }, 2000)
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
    const item = DRESS_ITEMS.find(d => d.id === dressId)
    feedbackText.value = `穿上${item?.label || '新衣服'}啦~ 👗`
    feedbackEmoji.value = '🐯'
    showFeedback.value = true
    if (feedbackTimer) clearTimeout(feedbackTimer)
    feedbackTimer = setTimeout(() => { showFeedback.value = false }, 2000)
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
  router.push('/')
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

// ===== Toast 提示 =====
const toastMsg = ref('')
let toastTimer = null
function showToast(msg) {
  toastMsg.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2000)
}

// ===== 破壳动画触发 =====
let hatchTriggered = false

/** 核心修复 P0 #2: 监听 petHatching 标志位（store 驱动） */
watch(() => s.value?.petHatching, (isHatching) => {
  if (isHatching && !showHatching.value && !hatchTriggered) {
    hatchTriggered = true
    hatchingSpecies.value = s.value?.petSpecies
    showHatching.value = true
    try { sfxFanfare() } catch(e) {}
    setTimeout(() => { hatchTriggered = false }, 10000)
  }
})

/** 兼容旧逻辑: 直接检测 level 变化（兜底） */
watch(() => petLevel.value, (newLevel) => {
  if (newLevel >= 5 && petState.value?.petSpecies && !hatchTriggered) {
    hatchTriggered = true
    hatchingSpecies.value = petState.value.petSpecies
    showHatching.value = true
    try { sfxFanfare() } catch(e) {}
    setTimeout(() => { hatchTriggered = false }, 10000)
  }
})

watch(() => petStore.petState?.value?.petSpecies, (species) => {
  if (species && !hatchTriggered) {
    hatchTriggered = true
    hatchingSpecies.value = species
    showHatching.value = true
    setTimeout(() => { hatchTriggered = false }, 10000)
  }
}, { immediate: true })

// ===== 破壳动画关闭回调 =====
function onHatchDismiss() {
  showHatching.value = false
  hatchTriggered = false
  petStore.dismissHatchAnim()
}

// ===== 生命周期 =====
onMounted(async () => {
  await petStore.loadFromDB()
  updateCooldowns()
  cooldownTimer = setInterval(updateCooldowns, 1000)

  // 修复：从 IndexedDB 加载后，如果已有 petSpecies 但破壳动画未展示过，主动触发
  if (petState.value?.petSpecies && !showHatching.value && !hatchTriggered) {
    hatchTriggered = true
    hatchingSpecies.value = petState.value.petSpecies
    showHatching.value = true
    try { sfxFanfare() } catch(e) {}
    setTimeout(() => { hatchTriggered = false }, 10000)
  }
})

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
  if (toastTimer) clearTimeout(toastTimer)
  if (feedbackTimer) clearTimeout(feedbackTimer)
  if (milestoneTimer) clearTimeout(milestoneTimer)
})
</script>

<style scoped>
.pet-page {
  width: 100%;
  height: 100dvh;
  background: linear-gradient(180deg, #FFF8F0 0%, #FFFDF7 40%, #F5F0FF 100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-sizing: border-box;
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

/* ===== iPad 横屏/平板以上：单列上下布局 ===== */
@media (min-width: 820px) {
  .pet-main {
    max-width: 720px;
  }

  /* 宠物信息卡横向展开 */
  .pet-info-card {
    padding: 28px 32px;
  }
  .pet-card-left {
    flex: 0 0 160px;
  }

  /* 互动面板加宽 */
  .pet-activity-panel {
    padding: 20px 24px;
  }
  .activity-stats {
    grid-template-columns: repeat(8, 1fr);
    gap: 12px;
  }
}

/* ===== 资源栏：星星 + 点赞 ===== */
.pet-resources {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.resource-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}
.resource-item:active { transform: scale(0.96); }
.resource-icon { font-size: 1.3rem; }
.resource-value {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1;
}
.resource-label {
  font-size: 0.6rem;
  color: var(--text-hint);
  font-weight: 600;
}
.resource-stars { border-color: #FFE082; }
.resource-stars .resource-value { color: #F57F17; }
.resource-likes { border-color: #90CAF9; }
.resource-likes .resource-value { color: #1565C0; }

/* ===== 区域 A：宠物信息卡 ===== */
.pet-info-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 24px;
  padding: 24px;
  border: 2px solid #A5D6A7;
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
}
.pet-card-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 8px;
}
.pet-card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding-top: 12px;
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

/* ===== 区域 B：互动面板 ===== */
.pet-activity-panel {
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-radius: 20px;
  padding: 16px;
  border: 2px solid #FFE082;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.1);
}

/* 统计行 */
.activity-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.stat-icon { font-size: 1.2rem; line-height: 1; }
.stat-label {
  font-size: 0.55rem;
  color: var(--text-hint);
  font-weight: 600;
  white-space: nowrap;
}
.stat-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.2;
}

/* ===== 操作按钮分级 ===== */
.action-tier {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.action-tier:last-of-type { margin-bottom: 0; }

/* 核心按钮（大） */
.action-tier-core {
  gap: 16px;
  margin-bottom: 12px;
}
.action-btn-core {
  min-width: 90px;
  padding: 14px 18px;
  border-radius: 18px;
  border: 3px solid #AB47BC;
  background: linear-gradient(135deg, #F3E5F5, #E1BEE7);
  box-shadow: 0 4px 16px rgba(171, 71, 188, 0.25);
  position: relative;
  overflow: hidden;
}
.action-btn-core::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--rx, 50%) var(--ry, 50%), rgba(255,255,255,0.4) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.action-btn-core:active::before { opacity: 1; }
.action-btn-core.available:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 24px rgba(171, 71, 188, 0.35);
  border-color: #9C27B0;
}
.action-btn-core.available:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 2px 8px rgba(171, 71, 188, 0.2);
}
.action-btn-core .action-btn-emoji { font-size: 2rem; }
.action-btn-core .action-btn-label { font-size: 0.8rem; }

/* 日常按钮（中） */
.action-btn-daily {
  min-width: 64px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 2px solid #AB47BC;
  background: #F3E5F5;
  box-shadow: 0 2px 10px rgba(171, 71, 188, 0.15);
  position: relative;
  overflow: hidden;
}
.action-btn-daily::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--rx, 50%) var(--ry, 50%), rgba(255,255,255,0.4) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.action-btn-daily:active::before { opacity: 1; }
.action-btn-daily.available:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 16px rgba(171, 71, 188, 0.25);
  border-color: #9C27B0;
}
.action-btn-daily.available:active {
  transform: translateY(0) scale(0.96);
}
.action-btn-daily .action-btn-emoji { font-size: 1.4rem; }
.action-btn-daily .action-btn-label { font-size: 0.65rem; }

/* 特殊按钮（小） */
.action-btn-special {
  min-width: 52px;
  padding: 8px 10px;
  border-radius: 14px;
  border: 2px solid #D1C4E9;
  background: rgba(243, 229, 245, 0.5);
  position: relative;
  overflow: hidden;
}
.action-btn-special::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--rx, 50%) var(--ry, 50%), rgba(255,255,255,0.4) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.action-btn-special:active::before { opacity: 1; }
.action-btn-special.available:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 4px 10px rgba(206, 147, 216, 0.2);
  border-color: #AB47BC;
}
.action-btn-special.available:active {
  transform: translateY(0) scale(0.96);
}
.action-btn-special .action-btn-emoji { font-size: 1.2rem; }
.action-btn-special .action-btn-label { font-size: 0.55rem; }

/* 加速按钮 */
.action-btn-accel {
  border-color: #FFD54F !important;
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0) !important;
}
.action-btn-accel.exhausted { opacity: 0.4; }

/* 冷却/不可用状态 */
.action-btn.cooldown {
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
}
.action-btn.insufficient {
  opacity: 0.5;
  border-color: #EF9A9A;
}

/* 星星不足时抖动动画 */
.action-btn.shake-error {
  animation: btn-shake 0.4s ease 2;
}
@keyframes btn-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

.action-btn-emoji { display: block; }
.action-btn-label {
  font-weight: 700;
  color: var(--text-primary);
}
.action-btn-cost {
  font-size: 0.5rem;
  color: var(--text-hint);
}

/* 冷却覆盖层：SVG进度环 */
.action-btn-cd {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.cooldown-ring-svg {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
}

.action-btn-cd .cd-text {
  position: relative;
  z-index: 2;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-hint);
  background: rgba(255,255,255,0.8);
  padding: 2px 5px;
  border-radius: 4px;
  line-height: 1.2;
}

.ring-fill {
  transition: stroke-dashoffset 1s linear;
}

/* ===== 内联换装（Lv5+） ===== */
.dress-inline {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.dress-inline-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #7B1FA2;
  margin-bottom: 8px;
  text-align: center;
}
.dress-inline-grid {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}
.dress-inline-item {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid var(--border-light);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.dress-inline-item.equipped {
  border-color: #CE93D8;
  background: #F3E5F5;
  box-shadow: 0 2px 8px rgba(206, 147, 216, 0.3);
}
.dress-inline-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.dress-inline-item.clear {
  border-color: #EF9A9A;
}
.dress-inline-emoji { font-size: 1.4rem; }
.dress-inline-lock {
  position: absolute;
  font-size: 0.8rem;
  bottom: 0;
  right: 2px;
}

/* ===== 操作反馈气泡 ===== */
.feedback-overlay {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
}
.feedback-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid #FFE082;
  backdrop-filter: blur(8px);
}
.feedback-emoji { font-size: 1.5rem; }
.feedback-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
}
.feedback-close {
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid #FFE082;
  background: #FFF8E1;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-secondary);
}

/* ===== 里程碑庆祝 ===== */
.milestone-overlay {
  position: fixed;
  inset: 0;
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}
.milestone-card {
  text-align: center;
  padding: 28px 32px;
  background: var(--bg-card);
  border-radius: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border: 2px solid #FFD54F;
  animation: milestoneIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.milestone-emoji { font-size: 3rem; display: block; }
.milestone-card h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 8px 0 4px;
}
.milestone-card p {
  font-size: 0.8rem;
  color: var(--text-hint);
}
@keyframes milestoneIn {
  from { opacity: 0; transform: scale(0.7) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

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

/* ===== 通用过渡动画 ===== */
.pop-enter-active { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-leave-active { animation: popIn 0.2s reverse; }
@keyframes popIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.fade-enter-active { animation: fadeIn 0.3s; }
.fade-leave-active { animation: fadeIn 0.2s reverse; }
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>