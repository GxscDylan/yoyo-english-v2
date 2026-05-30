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

/** 操作消耗与冷却 */
const ACTIONS = {
  feed:  { cost: 5, cooldown: 10 * 60 * 1000, label: '喂食', emoji: '🍎', animClass: 'feed-bounce' },
  bath:  { cost: 3, cooldown: 15 * 60 * 1000, label: '洗澡', emoji: '🛁', animClass: 'bubble-float' },
  sing:  { cost: 2, cooldown: 10 * 60 * 1000, label: '唱歌', emoji: '🎵', animClass: 'creature-bounce' },
  dress: { cost: 10, cooldown: 30 * 60 * 1000, label: '换装', emoji: '👗', animClass: 'creature-bounce' },
}

/** 装扮列表 */
const DRESS_ITEMS = [
  { id: 'shell-pattern', emoji: '🐚', label: '蛋壳纹理', level: 1 },
  { id: 'hat', emoji: '🎩', label: '小帽子', level: 2 },
  { id: 'bow', emoji: '🎀', label: '蝴蝶结', level: 1 },
  { id: 'sunglasses', emoji: '🕶️', label: '墨镜', level: 2 },
  { id: 'crown', emoji: '👑', label: '皇冠', level: 3 },
  { id: 'necktie', emoji: '👔', label: '领结', level: 1 },
  { id: 'santa-hat', emoji: '🎅', label: '圣诞帽', level: 2 },
  { id: 'scarf', emoji: '🧣', label: '围巾', level: 1 },
]

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

    // 今日统计
    todayFeedCount: 0,
    todayBathCount: 0,
    todaySingCount: 0,
    todayDressCount: 0,
    todayLikeCount: 0,

    // 装扮
    currentDress: null,       // 当前装扮 id

    // 家长指定
    petAssignedSpecies: null, // 家长指定的品种，破壳时消费后清除

    // 系统
    enabled: true,            // 总开关
    showHungerAnim: true,     // 饥饿动画开关
    showHatchAnim: true,      // 破壳动画开关
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

/** 可用装扮（根据等级过滤） */
const availableDresses = computed(() => {
  const lv = petLevel.value
  return DRESS_ITEMS.filter(d => d.level <= lv)
})

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

  const oldLevel = petLevel.value
  s.petTotalLikes += count
  s.todayLikeCount += count

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
    setTimeout(() => {
      if (s.petMood === 'excited') detectMood()
    }, 10000)
  }
}

/** 触发破壳 */
function triggerHatch() {
  const s = petState.value
  if (!s) return

  // 确定品种：优先家长指定，否则随机
  const species = s.petAssignedSpecies
    || PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)].id
  s.petSpecies = species
  s.petMood = 'excited'

  // 记录历史
  s.petHistory.push({
    species,
    hatchedAt: Date.now(),
    totalLikes: s.petTotalLikes,
  })

  // 清除家长指定
  s.petAssignedSpecies = null

  console.log(`[PetStore] 🎊 破壳！精灵: ${species}`)
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

  // 喂食/洗澡 → 心情变开心
  if (actionKey === 'feed' || actionKey === 'bath') {
    s.petMood = 'happy'
  }

  // 唱歌 → 好奇
  if (actionKey === 'sing') {
    s.petMood = 'curious'
    setTimeout(() => { if (s.petMood === 'curious') detectMood() }, 8000)
  }

  persist()
  return { success: true, cost: action.cost }
}

/** 换装 */
function setDress(dressId) {
  const s = petState.value
  if (!s) return
  s.currentDress = dressId
  persist()
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

// ============================================================
// 加载
// ============================================================

async function loadFromDB() {
  try {
    const data = await dbGetPet()
    if (data) {
      // 合并默认值（兼容旧版数据）
      petState.value = { ...createDefaultState(), ...data }
    } else {
      petState.value = createDefaultState()
    }
  } catch (e) {
    console.warn('[PetStore] 加载失败:', e)
    petState.value = createDefaultState()
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
    addLikes,
    doAction,
    setDress,
    detectMood,
    resetPet,
    triggerHatch,

    // 持久化
    loadFromDB,
    persist,
  }
}
