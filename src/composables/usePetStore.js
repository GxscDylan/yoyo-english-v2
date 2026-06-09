/**
 * 呦呦英语启蒙 — 萌宠养成系统 Store
 *
 * 核心机制：
 * - 5 级成长阶段：蛋蛋(Lv1) → 发光蛋(Lv2) → 彩色蛋(Lv3) → 裂缝蛋(Lv4) → 破壳(Lv5)
 * - 8 种精灵：猫/狗/兔/龙/独角兽/虎/狮/羊
 * - 日常状态机：开心 → 饿了/睡觉/兴奋/好奇
 * - 消耗操作：喂食/洗澡/唱歌/换装
 * - IndexedDB 持久化
 */

import { ref, computed, watch } from 'vue'
import { useLearningStore } from '@/stores/learning.js'

// 延迟导入点赞系统,避免循环依赖
let _thumbsUpModule = null
function getThumbsUp() {
  if (!_thumbsUpModule) {
    try {
      _thumbsUpModule = require('./useThumbsUp')
    } catch (e) {
      return null
    }
  }
  return _thumbsUpModule
}

// ============================================================
// 常量
// ============================================================

const DB_NAME = 'yoyo-english-v2'
const STORE_KEY = 'pet_data'

/** 5 级成长阶段 */
const PET_LEVELS = [
  { level: 1, name: '小蛋蛋', minLikes: 0, emoji: '🥚', desc: '一颗温暖的蛋蛋' },
  { level: 2, name: '发光蛋', minLikes: 15, emoji: '✨🥚', desc: '开始发光了！' },
  { level: 3, name: '彩色蛋', minLikes: 40, emoji: '🌈🥚', desc: '好漂亮的颜色~' },
  { level: 4, name: '裂缝蛋', minLikes: 75, emoji: '🥚💥', desc: '快要破壳了！' },
  { level: 5, name: '破壳精灵', minLikes: 120, emoji: '🎉', desc: '诞生啦！' },
]

/** 8 种精灵 */
const PET_SPECIES = [
  { id: 'cat', emoji: '🐱', name: '小猫咪', color: '#FFE0B2' },
  { id: 'dog', emoji: '🐶', name: '小狗狗', color: '#FFCCBC' },
  { id: 'rabbit', emoji: '🐰', name: '小兔子', color: '#F8BBD0' },
  { id: 'dragon', emoji: '🐲', name: '小龙龙', color: '#C8E6C9' },
  { id: 'unicorn', emoji: '🦄', name: '独角兽', color: '#E1BEE7' },
  { id: 'tiger', emoji: '🐯', name: '小老虎', color: '#FFE082' },
  { id: 'lion', emoji: '🦁', name: '小狮子', color: '#FFCC80' },
  { id: 'sheep', emoji: '🐑', name: '小绵羊', color: '#B3E5FC' },
]

/** 日常状态 */
const PET_MOODS = {
  happy: { emoji: '😊', label: '开心' },
  hungry: { emoji: '😢', label: '饿了' },
  sleeping: { emoji: '😴', label: '睡觉' },
  excited: { emoji: '🎉', label: '兴奋' },
  curious: { emoji: '❓', label: '好奇' },
}

/** 操作消耗与冷却（v6.1: 冷却从分钟改为秒，适合幼儿节奏） */
const ACTIONS = {
  feed:  { cost: 5, cooldown: 15 * 1000, label: '喂食', emoji: '🍎', animClass: 'feed-bounce' },
  bath:  { cost: 3, cooldown: 20 * 1000, label: '洗澡', emoji: '🛁', animClass: 'bubble-float' },
  sing:  { cost: 2, cooldown: 10 * 1000, label: '唱歌', emoji: '🎵', animClass: 'creature-bounce' },
  pet:   { cost: 1, cooldown: 10 * 1000, label: '摸头', emoji: '✋', animClass: 'pet-purr' },
  play:  { cost: 8, cooldown: 20 * 1000, label: '玩耍', emoji: '🎾', animClass: 'pet-play' },
  walk:  { cost: 4, cooldown: 15 * 1000, label: '散步', emoji: '🌿', animClass: 'pet-walk' },
  cuddle:{ cost: 3, cooldown: 15 * 1000, label: '拥抱', emoji: '🫂', animClass: 'pet-cuddle' },
  explore:{cost: 6, cooldown: 30 * 1000, label: '探险', emoji: '🗺️', animClass: 'pet-explore' },
  dress: { cost: 10, cooldown: 10 * 1000, label: '换装', emoji: '👗', animClass: 'creature-bounce' },
}

/** 装扮列表（GDD 8 款） */
const DRESS_ITEMS = [
  { id: 'hat-grass', emoji: '🧢', label: '草帽', unlockLikes: 15, cssClass: 'hat-grass' },
  { id: 'bow', emoji: '🎀', label: '蝴蝶结', unlockLikes: 15, cssClass: 'accessory-bow' },
  { id: 'crown', emoji: '👑', label: '皇冠', unlockLikes: 30, cssClass: 'hat-crown' },
  { id: 'sunglasses', emoji: '🕶️', label: '墨镜', unlockLikes: 25, cssClass: 'glasses-sunglasses' },
  { id: 'shirt', emoji: '👔', label: '小衣服', unlockLikes: 20, cssClass: 'clothes-shirt' },
  { id: 'mask', emoji: '😷', label: '小口罩', unlockLikes: 50, cssClass: 'mask', seasonal: true },
  { id: 'pacifier', emoji: '🍼', label: '奶嘴', unlockLikes: 20, cssClass: 'pacifier' },
  { id: 'remove', emoji: '❌', label: '清除', unlockLikes: 0, cssClass: null },
]

/** 首次破壳基础精灵（1-4号） */
const BASE_SPECIES = ['cat', 'dog', 'rabbit', 'dragon']
/** 全部精灵 */
const ALL_SPECIES = ['cat', 'dog', 'rabbit', 'dragon', 'unicorn', 'tiger', 'lion', 'sheep']

/** 精灵默认名字 */
const SPECIES_DEFAULT_NAMES = {
  cat: '小咪', dog: '旺财', rabbit: '小白', dragon: '小龙',
  unicorn: '彩虹', tiger: '小虎', lion: '辛巴', sheep: '绵绵',
}

/** 获取精灵默认名字 */
function getDefaultSpeciesName(speciesId) {
  return SPECIES_DEFAULT_NAMES[speciesId] || '蛋蛋'
}

/** 获取随机精灵（区分首次/后续） */
function getRandomSpecies(isFirst) {
  const pool = isFirst ? BASE_SPECIES : ALL_SPECIES
  const id = pool[Math.floor(Math.random() * pool.length)]
  return PET_SPECIES.find(s => s.id === id) || PET_SPECIES[0]
}

// ============================================================
// 状态（模块级单例）
// ============================================================

const petState = ref(null)

function createDefaultState() {
  return {
    // 基础
    petLevel: 1,
    petTotalLikes: 0,
    petSpecies: null,         // 当前精灵 id（破壳后确定）
    petName: '',              // 宝贝给萌宠起的名字
    petHistory: [],           // 养过的萌宠历史 [{ species, hatchedAt, totalLikes }]

    // 日常
    petMood: 'happy',
    lastFeedTime: 0,
    lastBathTime: 0,
    lastSingTime: 0,
    lastDressTime: 0,
    lastPetTime: 0,
    lastPlayTime: 0,
    lastWalkTime: 0,
    lastCuddleTime: 0,
    lastExploreTime: 0,

    // 今日统计
    todayFeedCount: 0,
    todayBathCount: 0,
    todaySingCount: 0,
    todayDressCount: 0,
    todayAccelCount: 0,     // 今日加速次数（兼容字段）
    todayLikeCount: 0,
    todayPetCount: 0,       // 今日摸头次数
    todayPlayCount: 0,      // 今日玩耍次数
    todayWalkCount: 0,      // 今日散步次数
    todayCuddleCount: 0,    // 今日拥抱次数
    todayExploreCount: 0,   // 今日探险次数

    // 探险奖励记录
    exploreRewards: [],      // 探险带回的奖励 [{ type: 'star'|'likes'|'surprise', amount: N, at: timestamp }]

    // 装扮系统
    petCosmetics: [],         // 已解锁装扮 ID 列表
    currentDress: null,       // 当前穿戴装扮 id

    // 加速成长
    petLastAccelAt: 0,        // 最后加速时间戳
    petAccelCountToday: 0,    // 今日加速次数

    // 家长指定
    petAssignedSpecies: null, // 家长指定的品种，破壳时消费后清除
    growthRate: 1.0,          // 成长速度倍率（0.5~2.0）

    // 系统
    enabled: true,            // 总开关
    showHungerAnim: true,     // 饥饿动画开关
    showHatchAnim: true,      // 破壳动画开关
    petHatching: false,       // 破壳进行中标志位（P0 Fix #2）
    lastOpenDate: '',         // 上次打开日期（日重置用）
    createdAt: Date.now(),
  }
}

// ============================================================
// IndexedDB
// ============================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function dbGetPet() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pet', 'readonly')
    const store = tx.objectStore('pet')
    const request = store.get(STORE_KEY)
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => reject(request.error)
  })
}

async function dbPutPet(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pet', 'readwrite')
    const store = tx.objectStore('pet')
    store.put({ key: STORE_KEY, ...data })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

async function persist() {
  if (!petState.value) return
  try {
    await dbPutPet({ ...petState.value })
  } catch (e) {
    console.warn('[PetStore] 保存失败:', e)
  }
}

// ============================================================
// 每日重置
// ============================================================

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function checkDailyReset() {
  const s = petState.value
  if (!s) return
  const today = todayKey()
  if (s.lastOpenDate !== today) {
    // 归档昨日
    if (s.lastOpenDate) {
      s.todayFeedCount = 0
      s.todayBathCount = 0
      s.todaySingCount = 0
      s.todayDressCount = 0
      s.todayLikeCount = 0
      s.todayAccelCount = 0
      s.todayPetCount = 0
      s.todayPlayCount = 0
      s.todayWalkCount = 0
      s.todayCuddleCount = 0
      s.todayExploreCount = 0
      s.exploreRewards = [] // 清空今日探险奖励
    }
    s.lastOpenDate = today
    persist()
  }
}

// ============================================================
// 计算属性
// ============================================================

/** 当前等级配置 */
const currentLevelConfig = computed(() => {
  const s = petState.value
  if (!s) return PET_LEVELS[0]
  let cfg = PET_LEVELS[0]
  for (const lvl of PET_LEVELS) {
    if (s.petTotalLikes >= lvl.minLikes) cfg = lvl
  }
  return cfg
})

/** 当前等级 1~5 */
const petLevel = computed(() => currentLevelConfig.value.level)

/** 下一个等级配置 */
const nextLevelConfig = computed(() => {
  const lv = petLevel.value
  if (lv >= 5) return null
  return PET_LEVELS[lv] // 下一个
})

/** 当前等级进度 0~1 */
const levelProgress = computed(() => {
  const s = petState.value
  if (!s) return 0
  const cur = currentLevelConfig.value
  const nxt = nextLevelConfig.value
  if (!nxt) return 1
  const range = nxt.minLikes - cur.minLikes
  if (range <= 0) return 1
  return Math.min(1, (s.petTotalLikes - cur.minLikes) / range)
})

/** 距离下一个里程碑还需要多少赞 */
const likesToNextLevel = computed(() => {
  const s = petState.value
  if (!s) return 120
  const nxt = nextLevelConfig.value
  if (!nxt) return 0
  return Math.max(0, nxt.minLikes - s.petTotalLikes)
})

/** 精灵信息 */
const currentSpecies = computed(() => {
  const s = petState.value
  if (!s?.petSpecies) return null
  return PET_SPECIES.find(sp => sp.id === s.petSpecies) || null
})

/** 装扮信息 */
const currentDressItem = computed(() => {
  const s = petState.value
  if (!s?.currentDress) return null
  return DRESS_ITEMS.find(d => d.id === s.currentDress) || null
})

/** 可用装扮（根据等级/解锁状态过滤） */
const availableDresses = computed(() => {
  const s = petState.value
  if (!s) return DRESS_ITEMS.filter(d => d.id !== 'remove')
  // 移除按钮始终可用（如果已穿戴）
  const unlockable = DRESS_ITEMS.filter(d => {
    if (d.id === 'remove') return s.currentDress !== null
    if (d.unlockLikes <= 0) return true // 免费
    return s.petTotalLikes >= d.unlockLikes
  })
  return unlockable
})

/** 是否已解锁某装扮 */
function isCosmeticUnlocked(dressId) {
  const s = petState.value
  if (!s) return false
  const item = DRESS_ITEMS.find(d => d.id === dressId)
  if (!item) return false
  if (item.unlockLikes <= 0) return true
  return s.petTotalLikes >= item.unlockLikes || s.petCosmetics.includes(dressId)
}

/** 操作是否在冷却中 */
function getActionCooldown(actionKey) {
  const s = petState.value
  if (!s) return 0
  const action = ACTIONS[actionKey]
  if (!action) return 0
  const lastTime = s[`last${capitalize(actionKey)}Time`] || 0
  const elapsed = Date.now() - lastTime
  return Math.max(0, action.cooldown - elapsed)
}

/** 操作是否可用 */
function isActionAvailable(actionKey, currentStars = 0) {
  if (getActionCooldown(actionKey) > 0) return false
  return currentStars >= ACTIONS[actionKey]?.cost
}

/** 日常状态自动检测 */
function detectMood() {
  const s = petState.value
  if (!s || !s.enabled) return
  const hour = new Date().getHours()
  // 21:00 ~ 07:00 → 睡觉
  if (hour >= 21 || hour < 7) {
    s.petMood = 'sleeping'
  }
  // 4 小时未喂 → 饿了
  else if (s.showHungerAnim && s.lastFeedTime && (Date.now() - s.lastFeedTime > 4 * 3600 * 1000)) {
    s.petMood = 'hungry'
  }
  // 否则开心
  else if (s.petMood !== 'excited' && s.petMood !== 'curious') {
    s.petMood = 'happy'
  }
}

// ============================================================
// 核心 Actions
// ============================================================

/** 接收点赞（从 useThumbsUp 系统调用） */
function addLikes(count) {
  const s = petState.value
  if (!s || !s.enabled) return
  
  // 防御性检查:确保参数有效
  if (typeof count !== 'number' || count <= 0 || !isFinite(count)) {
    console.warn('[PetStore] 无效的点赞数量:', count)
    return
  }

  // 🛡️ 附带修复: 应用 growthRate 成长速度倍率
  const rate = s.growthRate || 1.0
  const adjustedCount = Math.round(count * rate)

  const oldLevel = petLevel.value
  s.petTotalLikes += adjustedCount
  s.todayLikeCount += adjustedCount

  // 检测升级
  const newLevel = petLevel.value
  if (newLevel > oldLevel) {
    onLevelUp(oldLevel, newLevel)
  }

  // 达到 Lv5 且未破壳 → 触发破壳
  if (newLevel >= 5 && !s.petSpecies) {
    triggerHatch()
  }

  persist()
}

/** 升级回调 */
function onLevelUp(from, to) {
  console.log(`[PetStore] 🎉 升级！Lv.${from} → Lv.${to}`)
  // 升级时设置兴奋状态（持续 10 秒后恢复）
  const s = petState.value
  if (s) {
    s.petMood = 'excited'
    // 🎁 升级奖励：额外星星回馈
    const starReward = [0, 0, 5, 10, 15, 20] // Lv1→Lv2:5, Lv2→Lv3:10, Lv3→Lv4:15, Lv4→Lv5:20
    const rewardStars = starReward[to] || 0
    if (rewardStars > 0) {
      try {
        const learningStore = useLearningStore()
        // 🛡️ P2 修复 #13: 检查 learningStore 是否已初始化
        if (learningStore && typeof learningStore.totalStars === 'number') {
          learningStore.totalStars += rewardStars
          learningStore.persistAll()
          console.log(`[PetStore] 🎁 升级奖励：+${rewardStars} 星星`)
        } else {
          console.warn('[PetStore] learningStore 未就绪，星星奖励延迟发放')
        }
      } catch (e) {
        console.warn('[PetStore] 星星奖励同步失败:', e)
      }
    }
    setTimeout(() => {
      if (s.petMood === 'excited') detectMood()
    }, 10000)
  }
}

/** 触发破壳 */
function triggerHatch() {
  const s = petState.value
  if (!s) return

  // 🐣 P0 Fix #1: 首次破壳仅限基础精灵（猫/狗/兔/龙）
  // 家长指定可绕过首次限制（家长特权），后续破壳无限制
  const isFirstHatch = (s.petHistory || []).length === 0
  if (s.petAssignedSpecies) {
    // 家长指定 — 绕过首次限制
    s.petSpecies = s.petAssignedSpecies
    s.petAssignedSpecies = null
  } else if (isFirstHatch) {
    // 首次破壳 — 仅从基础4种中随机
    const baseIds = BASE_SPECIES
    s.petSpecies = baseIds[Math.floor(Math.random() * baseIds.length)]
  } else {
    // 后续破壳 — 全部8种可选
    s.petSpecies = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)].id
  }

  s.petMood = 'excited'

  // 记录历史（包含名字字段）
  s.petHistory.push({
    species: s.petSpecies,
    name: s.petName || getDefaultSpeciesName(s.petSpecies),
    hatchedAt: Date.now(),
    totalLikes: s.petTotalLikes,
  })

  // 🎁 P0 Fix #3: 破壳奖励 — 50 星星 + 1款随机装扮
  try {
    const learningStore = useLearningStore()
    learningStore.totalStars += 50
    learningStore.persistAll()
    console.log('[PetStore] 🎁 破壳奖励：+50 星星')

    // 随机解锁一款装扮
    const unlockable = DRESS_ITEMS.filter(d => d.id !== 'remove' && !s.petCosmetics.includes(d.id))
    if (unlockable.length > 0) {
      const gift = unlockable[Math.floor(Math.random() * unlockable.length)]
      s.petCosmetics.push(gift.id)
      console.log(`[PetStore] 🎁 破壳奖励：解锁装扮 ${gift.emoji} ${gift.label}`)
    }
  } catch (e) {
    console.warn('[PetStore] 破壳奖励同步失败:', e)
  }

  console.log(`[PetStore] 🎊 破壳！精灵: ${s.petSpecies} (首次: ${isFirstHatch})`)

  // P0 Fix #2: 设置破壳标志位，通知 UI 展示全屏动画
  s.petHatching = true
  persist()
}

/** 完成破壳动画（UI 调用） */
function dismissHatchAnim() {
  const s = petState.value
  if (!s) return
  s.petHatching = false
  persist()
}

/** 执行操作 */
function doAction(actionKey, currentStars) {
  const s = petState.value
  if (!s || !s.enabled) return { success: false, reason: 'disabled' }

  const action = ACTIONS[actionKey]
  if (!action) return { success: false, reason: 'unknown' }

  // 冷却检查
  if (getActionCooldown(actionKey) > 0) {
    return { success: false, reason: 'cooldown' }
  }

  // ⭐ 检查（由调用方保证传入最新值）
  if (currentStars < action.cost) {
    return { success: false, reason: 'stars' }
  }

  // 执行
  const now = Date.now()
  s[`last${capitalize(actionKey)}Time`] = now
  s[`today${capitalize(actionKey)}Count`]++

  // 🎁 宠物操作回馈：每次操作返还少量星星（1-2颗），形成经济闭环
  // 设计意图：避免星星只减不增导致玩家无法继续互动
  const starReturnMap = {
    feed: 1, bath: 1, sing: 1, pet: 2, play: 2, walk: 1, cuddle: 2, explore: 3, dress: 0
  }
  const starReturn = starReturnMap[actionKey] || 0
  if (starReturn > 0) {
    try {
      const learningStore = useLearningStore()
      learningStore.totalStars += starReturn
      learningStore.persistAll()
      console.log(`[PetStore] 🎁 ${action.label}回馈：+${starReturn} 星星`)
    } catch (e) {
      console.warn('[PetStore] 操作回馈星星同步失败:', e)
    }
  }

  // 喂食/洗澡 → 心情变开心
  if (actionKey === 'feed' || actionKey === 'bath') {
    s.petMood = 'happy'
  }

  // 唱歌 → 好奇
  if (actionKey === 'sing') {
    s.petMood = 'curious'
    setTimeout(() => { if (s.petMood === 'curious') detectMood() }, 8000)
  }

  // 摸头 → 开心（短暂兴奋）
  if (actionKey === 'pet') {
    s.petMood = 'excited'
    setTimeout(() => { if (s.petMood === 'excited') detectMood() }, 6000)
  }

  // 玩耍 → 兴奋
  if (actionKey === 'play') {
    s.petMood = 'excited'
    setTimeout(() => { if (s.petMood === 'excited') detectMood() }, 10000)
  }

  // 散步 → 开心
  if (actionKey === 'walk') {
    s.petMood = 'happy'
  }

  // 拥抱 → 幸福（持续兴奋）
  if (actionKey === 'cuddle') {
    s.petMood = 'excited'
    setTimeout(() => { if (s.petMood === 'excited') detectMood() }, 8000)
  }

  // 探险 → 好奇（带回惊喜）
  if (actionKey === 'explore') {
    s.petMood = 'curious'
    // 探险奖励随机生成（延迟 3 秒后带回）
    setTimeout(() => {
      if (!s) return
      const rewards = generateExploreReward(s)
      s.exploreRewards.push(rewards)
      if (rewards.type === 'likes') {
        s.petTotalLikes += rewards.amount
        s.todayLikeCount += rewards.amount
        // 🛡️ P2 修复 #14: 不通过 thumbsUp.addLikes() 回写，避免双向同步循环
        // 探险奖励直接计入 petTotalLikes，不再同步到外部点赞系统
        // 如需外部系统感知，应通过事件总线而非直接调用 addLikes
        console.log(`[PetStore] 🎁 探险带回：+${rewards.amount} 点赞`)

        // 检查升级
        const newLevel = petLevel.value
        if (newLevel > currentLevelConfig.value.level) {
          onLevelUp(currentLevelConfig.value.level, newLevel)
        }
        if (newLevel >= 5 && !s.petSpecies) triggerHatch()
      }
      // 探险星星由 PetView.vue 的 watch 处理同步到 learningStore（避免双重同步）
      persist()
    }, 3000)
  }

  persist()
  return { success: true, cost: action.cost }
}

/** 换装 */
function setDress(dressId) {
  const s = petState.value
  if (!s) return
  // 清除装扮
  if (dressId === null || dressId === 'remove') {
    s.currentDress = null
    persist()
    return
  }
  // 首次穿戴且未解锁
  if (!s.petCosmetics.includes(dressId)) {
    const item = DRESS_ITEMS.find(d => d.id === dressId)
    if (item && item.unlockLikes > 0 && s.petTotalLikes < item.unlockLikes) {
      return { success: false, reason: 'likes' }
    }
    s.petCosmetics.push(dressId)
  }
  s.currentDress = dressId
  persist()
  return { success: true }
}

/** 加速成长 */
function accel(currentStars, currentTodayLikes) {
  const s = petState.value
  if (!s || !s.enabled) return { success: false, reason: 'disabled' }

  const today = new Date().toDateString()
  const lastDate = s.petLastAccelAt ? new Date(s.petLastAccelAt).toDateString() : null
  // 每日重置
  if (today !== lastDate) {
    s.petAccelCountToday = 0
  }

  if (s.petAccelCountToday >= 2) {
    return { success: false, reason: 'limit' }
  }
  if (currentStars < 5) {
    return { success: false, reason: 'stars' }
  }

  s.petLastAccelAt = Date.now()
  s.petAccelCountToday++

  // 🛡️ 附带修复: 加速成长也应用 growthRate
  const rate = s.growthRate || 1.0
  const accelLikes = Math.round(10 * rate)

  const oldLevel = petLevel.value
  s.petTotalLikes += accelLikes

  const newLevel = petLevel.value
  if (newLevel > oldLevel) {
    onLevelUp(oldLevel, newLevel)
  }
  if (newLevel >= 5 && !s.petSpecies) {
    triggerHatch()
  }

  persist()
  return { success: true, cost: 5 }
}

/** 是否可加速 */
function canAccel() {
  const s = petState.value
  if (!s) return false
  const today = new Date().toDateString()
  const lastDate = s.petLastAccelAt ? new Date(s.petLastAccelAt).toDateString() : null
  if (today !== lastDate) return true
  return s.petAccelCountToday < 2
}

/** 重置萌宠（开始新一轮） */
function resetPet() {
  const s = petState.value
  if (!s) return
  // 保留历史和设置
  const preserved = {
    petHistory: s.petHistory,
    enabled: s.enabled,
    showHungerAnim: s.showHungerAnim,
    showHatchAnim: s.showHatchAnim,
    petAssignedSpecies: s.petAssignedSpecies,
    petCosmetics: s.petCosmetics,
    growthRate: s.growthRate,
  }
  Object.assign(s, createDefaultState(), preserved)
  s.createdAt = Date.now()
  detectMood()
  persist()
}

// ============================================================
// 辅助
// ============================================================

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** 探险奖励随机生成 */
function generateExploreReward(state) {
  const rand = Math.random()
  if (rand < 0.4) {
    // 40% 概率带回 2-5 个点赞
    const amount = 2 + Math.floor(Math.random() * 4)
    return { type: 'likes', amount, desc: `探险带回了 ${amount} 个点赞！`, emoji: '👍' }
  } else if (rand < 0.7) {
    // 30% 概率带回星星
    const amount = 3 + Math.floor(Math.random() * 5)
    return { type: 'stars', amount, desc: `探险带回了 ${amount} 颗星星！`, emoji: '⭐' }
  } else if (rand < 0.9) {
    // 20% 概率带回惊喜（随机单词 +1 点赞）
    return { type: 'surprise', amount: 1, desc: '探险带回了一个惊喜！', emoji: '🎁' }
  } else {
    // 10% 概率带回装扮碎片
    const unlocked = DRESS_ITEMS.filter(d => d.id !== 'remove' && !state.petCosmetics.includes(d.id) && state.petTotalLikes >= d.unlockLikes)
    if (unlocked.length > 0) {
      const item = unlocked[Math.floor(Math.random() * unlocked.length)]
      return { type: 'cosmetic', amount: 0, desc: `探险发现了 ${item.emoji} ${item.label}！`, emoji: item.emoji }
    }
    return { type: 'likes', amount: 3, desc: '探险带回了 3 个点赞！', emoji: '👍' }
  }
}

// ============================================================
// 加载
// ============================================================

async function loadFromDB() {
  try {
    const data = await dbGetPet()
    const merged = { ...createDefaultState(), ...data }
    if (petState.value) {
      // 保持响应式代理不变，只更新内部属性
      Object.assign(petState.value, merged)
    } else {
      petState.value = merged
    }
  } catch (e) {
    console.warn('[PetStore] 加载失败:', e)
    if (petState.value) {
      Object.assign(petState.value, createDefaultState())
    } else {
      petState.value = createDefaultState()
    }
  }

  checkDailyReset()
  detectMood()

  // 定时检测心情（每分钟）
  setInterval(detectMood, 60000)
}

// ============================================================
// 导出
// ============================================================

export function usePetStore() {
  return {
    // 状态
    petState,

    // 计算属性
    petLevel,
    currentLevelConfig,
    nextLevelConfig,
    levelProgress,
    likesToNextLevel,
    currentSpecies,
    currentDressItem,
    availableDresses,

    // 常量
    PET_LEVELS,
    PET_SPECIES,
    PET_MOODS,
    ACTIONS,
    DRESS_ITEMS,

    // 操作
    getActionCooldown,
    isActionAvailable,
    isCosmeticUnlocked,
    addLikes,
    doAction,
    setDress,
    accel,
    canAccel,
    detectMood,
    resetPet,
    triggerHatch,
    dismissHatchAnim,
    getRandomSpecies,

    // 持久化
    loadFromDB,
    persist,
  }
}
