/**
 * 呦呦英语启蒙 — Pinia 核心状态管理
 *
 * 管理：学习进度、星星、游戏得分、家长设置、复习队列、数据导出/导入
 * 所有数据通过 IndexedDB 持久化，刷新/关闭不丢失
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ALL_CATEGORIES, ALL_WORDS, ALL_L1_WORDS } from '@/data/words'

const DB_NAME = 'yoyo-english-v2'
const DB_VERSION = 1

/** IndexedDB 工具函数 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('learning_records')) {
        db.createObjectStore('learning_records', { keyPath: 'wordId' })
      }
      if (!db.objectStoreNames.contains('user_progress')) {
        db.createObjectStore('user_progress', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('parent_settings')) {
        db.createObjectStore('parent_settings', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('review_queue')) {
        db.createObjectStore('review_queue', { keyPath: 'wordId' })
      }
    }
  })
}

async function dbPut(storeName, data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.put(data)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

async function dbGet(storeName, key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => reject(request.error)
  })
}

async function dbGetAll(storeName) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => reject(request.error)
  })
}

async function dbDelete(storeName, key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.delete(key)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

/** 默认父级设置 */
const DEFAULT_SETTINGS = {
  pin: '1234',
  dailyLessonLimit: true,
  singleSessionMinutes: 15,
  lockStartTime: '20:00',
  lockEndTime: '07:00',
  learningMode: 'fourStep' // 'fourStep' | 'card'
}

export const useLearningStore = defineStore('learning', () => {
  // ============================================================
  // 状态
  // ============================================================

  /** 每个单词的学习记录 { wordId: { stepComplete: [1,2,3,4], mastered: false, lastReviewed } } */
  const wordRecords = ref({})

  /** 已解锁分类数（按顺序解锁） */
  const unlockedCategories = ref(1)

  /** 刚刚解锁的分类索引（用于首页入场动画，不持久化） */
  const justUnlockedIndex = ref(-1)

  /** 总星星数 */
  const totalStars = ref(0)

  /** 各游戏历史最高分 { match: X, listen: X, memory: X } */
  const gameScores = ref({ match: 0, listen: 0, memory: 0, balloon: 0, 'speed-rush': 0, 'sort-it': 0 })

  /** 首次使用时间 */
  const firstUseTime = ref(null)

  /** 家长设置 */
  const settings = ref({ ...DEFAULT_SETTINGS })

  /** 今日已学单词数（每日限学用） */
  const todayLearnedCount = ref(0)
  const todayDate = ref('')

  /** 复习队列 { wordId: nextReviewTime } */
  const reviewQueue = ref({})

  /** 宝贝头像（base64 字符串，纯本地存储） */
  const avatar = ref(null)

  /** 主题色方案 */
  const themeColor = ref('orange')

  /** 游戏难度级别 ('simple' | 'medium' | 'hard') */
  const gameDifficulty = ref('medium')

  /** 每日活动记录 { 'YYYY-MM-DD': { steps: N, mastered: N, stars: N } } */
  const dailyActivity = ref({})

  // ============================================================
  // Combo 连击系统
  // ============================================================

  /** 当前连击数（不持久化，局内有效） */
  const gameCombo = ref(0)

  /** 本局最大连击（不持久化） */
  const gameMaxCombo = ref(0)

  /** 历史最大连击（持久化到 user_progress） */
  const lifetimeMaxCombo = ref(0)

  /** 是否显示 Combo 首次引导（家长控制） */
  const showComboGuide = ref(true)

  // ============================================================
  // Catch Stars 奖励游戏
  // ============================================================

  /** 各分类最后一次奖励游戏触发时间 { categoryIndex: timestamp } */
  const catchStarsCooldown = ref({})

  function canTriggerCatchStars(categoryIndex) {
    const lastTime = catchStarsCooldown.value[categoryIndex] || 0
    const now = Date.now()
    // 24 小时冷却：同一分类 24 小时内不再触发
    return now - lastTime > 24 * 60 * 60 * 1000
  }

  function recordCatchStarsTrigger(categoryIndex) {
    catchStarsCooldown.value[categoryIndex] = Date.now()
    persistProgress()
  }

  /** 获取 Catch Stars 收集上限 */
  function getCatchStarsLimit() {
    // L1: 10 个，L2: 15 个
    return unlockedCategories.value <= 5 ? 10 : 15
  }

  function addCombo() {
    gameCombo.value++
    if (gameCombo.value > gameMaxCombo.value) gameMaxCombo.value = gameCombo.value
    if (gameCombo.value > lifetimeMaxCombo.value) lifetimeMaxCombo.value = gameCombo.value
  }

  function resetCombo() {
    gameCombo.value = 0
  }

  function getComboBonus() {
    return gameCombo.value >= 3 ? gameCombo.value : 1
  }

  // ============================================================
  // 计算属性
  // ============================================================

  const isFirstUse = computed(() => !firstUseTime.value)

  /** 解锁的分类数据（L1 + L2） */
  const unlockedCategoryList = computed(() =>
    ALL_CATEGORIES.slice(0, unlockedCategories.value)
  )

  /** 当前掌握单词数 */
  const masteredWordCount = computed(() =>
    Object.values(wordRecords.value).filter(r => r.mastered).length
  )

  // ============================================================
  // P3: 养成系统 — 成就装扮检测
  // ============================================================

  /** 获取今天的日期 key (YYYY-MM-DD) */
  function todayKey() {
    return new Date().toISOString().slice(0, 10)
  }

  /** 记录今日活动（完成步骤时调用） */
  function recordDailyActivity(type, count = 1) {
    const key = todayKey()
    if (!dailyActivity.value[key]) {
      dailyActivity.value[key] = { steps: 0, mastered: 0, stars: 0 }
    }
    if (type === 'step') dailyActivity.value[key].steps += count
    if (type === 'mastered') dailyActivity.value[key].mastered += count
    if (type === 'stars') dailyActivity.value[key].stars += count
    persistProgress()
  }

  /** 连续学习天数（基于 dailyActivity 记录） */
  const currentStreak = computed(() => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const record = dailyActivity.value[key]
      if (record && (record.steps > 0 || record.mastered > 0)) {
        streak++
      } else if (i > 0) {
        // 今天还没活动不算断，但昨天及之前没活动就断
        break
      }
      // i === 0 且今天没活动，继续检查昨天
    }
    return streak
  })

  /** 连续学习天数（兼容旧逻辑） */
  const consecutiveDays = computed(() => {
    if (!firstUseTime.value) return 0
    // 优先使用 streak 计算，旧逻辑作为 fallback
    const streak = currentStreak.value
    if (streak > 0) return streak
    return Math.max(1, Math.floor((Date.now() - firstUseTime.value) / (24 * 60 * 60 * 1000)))
  })

  /** 最近7天活动（周报用） */
  const weeklyActivity = computed(() => {
    const result = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const record = dailyActivity.value[key] || { steps: 0, mastered: 0, stars: 0 }
      result.push({
        date: key,
        dayLabel: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        isToday: i === 0,
        ...record
      })
    }
    return result
  })

  /** 本周汇总统计 */
  const weeklySummary = computed(() => {
    const week = weeklyActivity.value
    return {
      totalSteps: week.reduce((s, d) => s + d.steps, 0),
      totalMastered: week.reduce((s, d) => s + d.mastered, 0),
      totalStars: week.reduce((s, d) => s + d.stars, 0),
      activeDays: week.filter(d => d.steps > 0 || d.mastered > 0).length,
      maxDailySteps: Math.max(...week.map(d => d.steps), 0)
    }
  })

  /** 🎩 小帽子（连续学习3天） */
  const showHat = computed(() => consecutiveDays.value >= 3)
  /** 👓 小眼镜（连续学习7天） */
  const showGlasses = computed(() => consecutiveDays.value >= 7)
  /** 🦋 翅膀（掌握50个单词） */
  const showWings = computed(() => masteredWordCount.value >= 50)
  /** 👑 小皇冠（掌握100个单词） */
  const showCrown = computed(() => masteredWordCount.value >= 100)
  /** 🌟 光环（全部游戏通关） */
  const showHalo = computed(() => {
    return gameScores.value.match > 0 && gameScores.value.listen > 0 && gameScores.value.memory > 0 && gameScores.value.balloon > 0 && gameScores.value['speed-rush'] > 0 && gameScores.value['sort-it'] > 0
  })

  // ============================================================
  // P3: 勋章系统 — 成就列表（用于家长中心展示）
  // ============================================================

  /** 5 个成就的完整信息 */
  const achievements = computed(() => [
    { id: 'hat', name: '学习小达人', nameEn: 'Study Star', icon: '🎩', condition: '连续学习 3 天', unlocked: showHat.value, progress: Math.min(consecutiveDays.value, 3), max: 3 },
    { id: 'glasses', name: '知识探索家', nameEn: 'Knowledge Seeker', icon: '👓', condition: '连续学习 7 天', unlocked: showGlasses.value, progress: Math.min(consecutiveDays.value, 7), max: 7 },
    { id: 'wings', name: '单词小飞侠', nameEn: 'Word Flyer', icon: '🦋', condition: '掌握 50 个单词', unlocked: showWings.value, progress: Math.min(masteredWordCount.value, 50), max: 50 },
    { id: 'crown', name: '词汇大师', nameEn: 'Vocab Master', icon: '👑', condition: '掌握 100 个单词', unlocked: showCrown.value, progress: Math.min(masteredWordCount.value, 100), max: 100 },
    { id: 'halo', name: '游戏全通关', nameEn: 'Game Champion', icon: '🌟', condition: '6 款游戏全部通关', unlocked: showHalo.value, progress: [gameScores.value.match, gameScores.value.listen, gameScores.value.memory, gameScores.value.balloon, gameScores.value['speed-rush'], gameScores.value['sort-it']].filter(s => s > 0).length, max: 6 }
  ])

  /** 时间段锁检测 */
  const isInLockPeriod = computed(() => {
    const start = settings.value.lockStartTime
    const end = settings.value.lockEndTime
    if (!start || !end) return false
    const now = new Date()
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const startMin = sh * 60 + sm
    const endMin = eh * 60 + em
    const nowMin = now.getHours() * 60 + now.getMinutes()
    if (endMin < startMin) {
      // 跨夜锁（如 20:00~07:00）
      return nowMin >= startMin || nowMin < endMin
    }
    return nowMin >= startMin && nowMin < endMin
  })

  /** 单次会话开始时间（用于时长检查） */
  let sessionStartTime = Date.now()

  function resetSessionTimer() {
    sessionStartTime = Date.now()
  }

  /** 单次时长是否超限（分钟） */
  function isSessionTimeExceeded() {
    const limit = settings.value.singleSessionMinutes * 60 * 1000
    return Date.now() - sessionStartTime > limit
  }

  /** 所有限制检查（首页用） */
  function checkAllLimits() {
    if (isInLockPeriod.value) return { reason: 'lock_period', message: '现在是休息时间哦~' }
    if (isSessionTimeExceeded()) return { reason: 'time_limit', message: '今天已经学够啦~' }
    return null
  }

  // ============================================================
  // 单词学习方法
  // ============================================================

  /** 获取某单词学习记录 */
  function getWordRecord(wordId) {
    return wordRecords.value[wordId] || { stepComplete: [], mastered: false, lastReviewed: null }
  }

  /** 完成四步中的某一步 */
  function completeWordStep(wordId, step) {
    const record = getWordRecord(wordId)
    if (!record.stepComplete.includes(step)) {
      record.stepComplete.push(step)
      recordDailyActivity('step')
    }
    record.lastReviewed = Date.now()
    wordRecords.value[wordId] = { ...record }
    dbPut('learning_records', JSON.parse(JSON.stringify({ wordId, ...record })))
    persistProgress()
  }

  /** 标记单词掌握 */
  function markWordMastered(wordId) {
    const record = getWordRecord(wordId)
    record.mastered = true
    record.stepComplete = [1, 2, 3, 4]
    record.lastReviewed = Date.now()
    wordRecords.value[wordId] = { ...record }
    totalStars.value += 3
    recordDailyActivity('mastered')
    recordDailyActivity('stars', 3)
    dbPut('learning_records', JSON.parse(JSON.stringify({ wordId, ...record })))
    persistProgress()
    addToReviewQueue(wordId)
  }

  /** 单词是否已学会 */
  function isWordMastered(wordId) {
    const record = wordRecords.value[wordId]
    return record?.mastered || false
  }

  // ============================================================
  // 进度管理
  // ============================================================

  /** 解锁下一个分类 */
  function unlockNextCategory() {
    if (unlockedCategories.value < ALL_CATEGORIES.length) {
      // Record the index of the node that is about to be unlocked
      justUnlockedIndex.value = unlockedCategories.value
      unlockedCategories.value++
      persistProgress()
    }
  }

  /** 消费“刚刚解锁”标记（首页动画播放后调用） */
  function consumeJustUnlocked() {
    justUnlockedIndex.value = -1
  }

  /** 添加星星 */
  function addStars(count) {
    totalStars.value += count
    recordDailyActivity('stars', count)
    persistProgress()
  }

  /** 更新游戏最高分 */
  function updateGameScore(gameId, score) {
    if (score > (gameScores.value[gameId] || 0)) {
      gameScores.value[gameId] = score
      persistProgress()
    }
  }

  /** 今日学习计数 */
  function incrementTodayLearned() {
    const today = new Date().toDateString()
    if (todayDate.value !== today) {
      todayDate.value = today
      todayLearnedCount.value = 0
    }
    todayLearnedCount.value++
  }

  function resetTodayLearned() {
    todayDate.value = new Date().toDateString()
    todayLearnedCount.value = 0
  }

  // ============================================================
  // 复习队列（简化的遗忘曲线：1h / 1d / 3d / 7d）
  // ============================================================

  const REVIEW_INTERVALS = [1 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000]

  function addToReviewQueue(wordId) {
    const record = getWordRecord(wordId)
    const reviewCount = record.reviewCount || 0
    const interval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)]
    reviewQueue.value[wordId] = Date.now() + interval
    dbPut('review_queue', { wordId, nextReviewTime: reviewQueue.value[wordId] })
    // 递增 reviewCount 以便下次间隔更长
    record.reviewCount = reviewCount + 1
    dbPut('learning_records', JSON.parse(JSON.stringify({ wordId, ...record })))
    wordRecords.value[wordId] = { ...record }
  }

  function getDueReviewWords() {
    const now = Date.now()
    return Object.entries(reviewQueue.value)
      .filter(([_, nextTime]) => nextTime <= now)
      .map(([wordId]) => ALL_WORDS.find(w => w.id === wordId))
      .filter(Boolean)
  }

  // ============================================================
  // 设置管理
  // ============================================================

  /** 设置游戏难度 */
  function setGameDifficulty(difficulty) {
    gameDifficulty.value = difficulty
    persistSettings()
  }

  function updateSettings(key, value) {
    settings.value[key] = value
    persistSettings()
  }

  function updatePIN(newPin) {
    settings.value.pin = newPin
    persistSettings()
  }

  function verifyPIN(input) {
    return input === settings.value.pin
  }

  // ============================================================
  // 数据导出/导入
  // ============================================================

  function exportData() {
    return {
      version: 'v2',
      timestamp: Date.now(),
      wordRecords: wordRecords.value,
      unlockedCategories: unlockedCategories.value,
      totalStars: totalStars.value,
      gameScores: gameScores.value,
      reviewQueue: reviewQueue.value,
      settings: { ...settings.value },
      avatar: avatar.value,
      themeColor: themeColor.value,
      gameDifficulty: gameDifficulty.value,
      dailyActivity: dailyActivity.value,
      lifetimeMaxCombo: lifetimeMaxCombo.value,
      showComboGuide: showComboGuide.value,
      catchStarsCooldown: catchStarsCooldown.value
    }
  }

  function importData(data) {
    if (!data || data.version !== 'v2') return false
    wordRecords.value = data.wordRecords || {}
    unlockedCategories.value = data.unlockedCategories || 1
    totalStars.value = data.totalStars || 0
    gameScores.value = data.gameScores || { match: 0, listen: 0, memory: 0, balloon: 0, 'speed-rush': 0, 'sort-it': 0 }
    reviewQueue.value = data.reviewQueue || {}
    if (data.settings) settings.value = { ...DEFAULT_SETTINGS, ...data.settings }
    avatar.value = data.avatar || null
    themeColor.value = data.themeColor || 'orange'
    gameDifficulty.value = data.gameDifficulty || 'medium'
    dailyActivity.value = data.dailyActivity || {}
    lifetimeMaxCombo.value = data.lifetimeMaxCombo || 0
    showComboGuide.value = data.showComboGuide !== false
    persistAll()
    return true
  }

  /** 重置所有数据 */
  function resetAll() {
    Object.assign(wordRecords, {})
    unlockedCategories.value = 1
    totalStars.value = 0
    gameScores.value = { match: 0, listen: 0, memory: 0, balloon: 0, 'speed-rush': 0, 'sort-it': 0 }
    reviewQueue.value = {}
    todayLearnedCount.value = 0
    todayDate.value = ''
    firstUseTime.value = null
    avatar.value = null
    themeColor.value = 'orange'
    gameDifficulty.value = 'medium'
    dailyActivity.value = {}
    gameCombo.value = 0
    gameMaxCombo.value = 0
    lifetimeMaxCombo.value = 0
    catchStarsCooldown.value = {}
    persistAll()
  }

  // ============================================================
  // 持久化
  // ============================================================

  function persistProgress() {
    dbPut('user_progress', JSON.parse(JSON.stringify({
      key: 'main',
      unlockedCategories: unlockedCategories.value,
      totalStars: totalStars.value,
      gameScores: gameScores.value,
      firstUseTime: firstUseTime.value,
      todayLearnedCount: todayLearnedCount.value,
      todayDate: todayDate.value,
      avatar: avatar.value,
      themeColor: themeColor.value,
      gameDifficulty: gameDifficulty.value,
      dailyActivity: dailyActivity.value,
      lifetimeMaxCombo: lifetimeMaxCombo.value,
      showComboGuide: showComboGuide.value,
      catchStarsCooldown: catchStarsCooldown.value
    })))
  }

  function persistSettings() {
    dbPut('parent_settings', JSON.parse(JSON.stringify({ key: 'main', ...settings.value })))
  }

  async function persistAll() {
    persistProgress()
    persistSettings()
    // 批量保存词记录（深拷贝避免 DataCloneError）
    for (const [wordId, record] of Object.entries(wordRecords.value)) {
      await dbPut('learning_records', JSON.parse(JSON.stringify({ wordId, ...record })))
    }
    for (const [wordId, nextTime] of Object.entries(reviewQueue.value)) {
      await dbPut('review_queue', JSON.parse(JSON.stringify({ wordId, nextReviewTime: nextTime })))
    }
  }

  // ============================================================
  // 初始化（从 IndexedDB 加载）
  // ============================================================

  async function loadFromDB() {
    try {
      const progress = await dbGet('user_progress', 'main')
      if (progress) {
        unlockedCategories.value = progress.unlockedCategories || 1
        totalStars.value = progress.totalStars || 0
        gameScores.value = progress.gameScores || { match: 0, listen: 0, memory: 0, balloon: 0, 'speed-rush': 0, 'sort-it': 0 }
        firstUseTime.value = progress.firstUseTime || null
        todayLearnedCount.value = progress.todayLearnedCount || 0
        todayDate.value = progress.todayDate || ''
        avatar.value = progress.avatar || null
        themeColor.value = progress.themeColor || 'orange'
        gameDifficulty.value = progress.gameDifficulty || 'medium'
        dailyActivity.value = progress.dailyActivity || {}
        lifetimeMaxCombo.value = progress.lifetimeMaxCombo || 0
        showComboGuide.value = progress.showComboGuide !== false
        catchStarsCooldown.value = progress.catchStarsCooldown || {}
      }

      const settingData = await dbGet('parent_settings', 'main')
      if (settingData) {
        settings.value = { ...DEFAULT_SETTINGS, ...settingData }
      }

      const records = await dbGetAll('learning_records')
      records.forEach(r => {
        wordRecords.value[r.wordId] = { stepComplete: r.stepComplete || [], mastered: r.mastered || false, lastReviewed: r.lastReviewed }
      })

      const queue = await dbGetAll('review_queue')
      queue.forEach(q => {
        reviewQueue.value[q.wordId] = q.nextReviewTime
      })

      if (!firstUseTime.value) {
        firstUseTime.value = Date.now()
        persistProgress()
      }
    } catch (error) {
      console.warn('IndexedDB 加载失败，使用默认值:', error)
    }
  }

  return {
    // 状态
    wordRecords, unlockedCategories, totalStars, gameScores,
    firstUseTime, settings, todayLearnedCount, todayDate, reviewQueue,
    avatar, themeColor, gameDifficulty, dailyActivity,
    // Combo 连击系统
    gameCombo, gameMaxCombo, lifetimeMaxCombo, showComboGuide,
    addCombo, resetCombo, getComboBonus,
    // Catch Stars 奖励游戏
    catchStarsCooldown, canTriggerCatchStars, recordCatchStarsTrigger, getCatchStarsLimit,
    // 计算
    isFirstUse, unlockedCategoryList, masteredWordCount, consecutiveDays, currentStreak,
    weeklyActivity, weeklySummary, isInLockPeriod,
    // 每日打卡
    recordDailyActivity, todayKey,
    // P3: 养成系统
    showHat, showGlasses, showWings, showCrown, showHalo, achievements,
    // 限制检查
    resetSessionTimer, isSessionTimeExceeded, checkAllLimits,
    // 单词
    getWordRecord, completeWordStep, markWordMastered, isWordMastered,
    // 进度
    unlockNextCategory, addStars, updateGameScore,
    incrementTodayLearned, resetTodayLearned,
    // just unlocked tracking
    justUnlockedIndex, consumeJustUnlocked,
    // 复习
    addToReviewQueue, getDueReviewWords,
    // 设置
    updateSettings, updatePIN, verifyPIN, setGameDifficulty,
    // 数据
    exportData, importData, resetAll,
    // 持久化
    loadFromDB, persistAll
  }
})