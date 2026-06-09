/**
 * 呦呦英语启蒙 — 点赞系统 composable
 * 
 * 支持：
 * - 主动点赞：结算页👍按钮 + 单词卡❤️收藏
 * - 系统自动点赞：19 个触发场景
 * - IndexedDB 存储 + 每日重置
 * - 首页点赞墙展示
 */

import { ref, computed, watch } from 'vue'
import { getSharedAudioCtx, sfxStar, sfxThumbsUp, sfxCheer, sfxApplause, sfxFavorite } from './useSfx'
import { usePetStore } from './usePetStore'

const DB_NAME = 'yoyo-english-v2'

// ============================================================
// 数据模型
// ============================================================

const thumbsUpState = ref({
  todayLikes: 0,          // 今日点赞总数
  todayAutoLikes: 0,      // 今日系统自动点赞
  todayManualLikes: 0,    // 今日孩子主动点赞
  favoriteWords: [],      // 收藏的单词列表
  likeHistory: [],        // 最近 7 天历史
  likeMilestone: 'none',  // 当前最高里程碑: none/bronze/silver/gold
  lastOpenDate: '',       // 上次打开日期
})

/** 今天是否首次打开 */
let isFirstOpenToday = false

// ============================================================
// IndexedDB 操作
// ============================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function dbGetThumbsUp() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('thumbs_up', 'readonly')
    const store = tx.objectStore('thumbs_up')
    const request = store.get('main')
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => reject(request.error)
  })
}

async function dbPutThumbsUp(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('thumbs_up', 'readwrite')
    const store = tx.objectStore('thumbs_up')
    store.put({ key: 'main', ...data })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

// ============================================================
// 每日重置检测
// ============================================================

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function checkDailyReset() {
  const today = todayKey()
  if (thumbsUpState.value.lastOpenDate !== today) {
    // 新的一天 — 归档历史
    if (thumbsUpState.value.lastOpenDate && thumbsUpState.value.todayLikes > 0) {
      thumbsUpState.value.likeHistory.push({
        date: thumbsUpState.value.lastOpenDate,
        total: thumbsUpState.value.todayLikes,
        auto: thumbsUpState.value.todayAutoLikes,
        manual: thumbsUpState.value.todayManualLikes,
      })
      // 只保留最近 7 天
      if (thumbsUpState.value.likeHistory.length > 7) {
        thumbsUpState.value.likeHistory = thumbsUpState.value.likeHistory.slice(-7)
      }
    }
    // 重置今日计数
    thumbsUpState.value.todayLikes = 0
    thumbsUpState.value.todayAutoLikes = 0
    thumbsUpState.value.todayManualLikes = 0
    thumbsUpState.value.lastOpenDate = today
    isFirstOpenToday = true
    persist()
  }
  return isFirstOpenToday
}

// ============================================================
// 点赞计数管理
// ============================================================

/** 增加今日点赞数 */
function addLikes(count, type = 'auto') {
  // 防御性检查:确保参数有效
  if (typeof count !== 'number' || count <= 0 || !isFinite(count)) {
    console.warn('[ThumbsUp] 无效的点赞数量:', count)
    return
  }
  
  thumbsUpState.value.todayLikes += count
  if (type === 'auto') {
    thumbsUpState.value.todayAutoLikes += count
  } else {
    thumbsUpState.value.todayManualLikes += count
  }
  checkMilestone()
  persist()
  
  // 同步到萌宠系统
  try {
    const petStore = usePetStore()
    if (petStore && typeof petStore.addLikes === 'function') {
      petStore.addLikes(count)
    }
  } catch(e) {
    // 萌宠未启用时忽略
  }
}

/** 检查点赞里程碑 */
function checkMilestone() {
  const total = thumbsUpState.value.todayLikes
  if (total >= 100 && thumbsUpState.value.likeMilestone !== 'gold') {
    thumbsUpState.value.likeMilestone = 'gold'
  } else if (total >= 50 && thumbsUpState.value.likeMilestone === 'bronze' || 
             total >= 50 && thumbsUpState.value.likeMilestone === 'none') {
    thumbsUpState.value.likeMilestone = 'silver'
  } else if (total >= 25 && thumbsUpState.value.likeMilestone === 'none' ||
             total >= 25 && thumbsUpState.value.likeMilestone === 'bronze') {
    thumbsUpState.value.likeMilestone = 'bronze'
  } else if (total >= 10 && thumbsUpState.value.likeMilestone === 'none') {
    thumbsUpState.value.likeMilestone = 'bronze'
  }
}

/** 获取当前里程碑配置 */
function getMilestoneConfig() {
  return {
    bronze: { icon: '🥉', label: '铜牌', threshold: 10 },
    silver: { icon: '🥈', label: '银牌', threshold: 50 },
    gold:   { icon: '🥇', label: '金牌', threshold: 100 },
  }[thumbsUpState.value.likeMilestone]
}

// ============================================================
// 主动点赞（结算页👍按钮）
// ============================================================

function doManualLike() {
  addLikes(1, 'manual')
  // 播放点赞音效
  try {
    sfxThumbsUp()
  } catch(e) {}
  return { count: 1, total: thumbsUpState.value.todayLikes }
}

// ============================================================
// 单词收藏
// ============================================================

function toggleFavorite(word) {
  const idx = thumbsUpState.value.favoriteWords.indexOf(word)
  if (idx >= 0) {
    thumbsUpState.value.favoriteWords.splice(idx, 1)
  } else {
    thumbsUpState.value.favoriteWords.push(word)
    // 收藏音效
    try {
      sfxFavorite()
    } catch(e) {}
  }
  persist()
  return thumbsUpState.value.favoriteWords.includes(word)
}

function isFavorite(word) {
  return thumbsUpState.value.favoriteWords.includes(word)
}

// ============================================================
// 系统自动点赞（19 个触发场景）
// ============================================================

const AUTO_THUMBS_CONFIGS = {
  // 1. 首次学会一个新单词
  firstLearn:     { count: 1, message: 'New word learned! 👍', strength: 1 },
  // 2. 游戏完美通关（0 错）
  perfectGame:    { count: 3, message: 'Perfect game! 👑👑', strength: 3 },
  // 3. Combo 达到 x3
  combo3:         { count: 1, message: 'Nice streak! 👍', strength: 1 },
  // 4. Combo 达到 x5
  combo5:         { count: 2, message: 'On fire! 🔥', strength: 2 },
  // 5. 单次会话学会 5 个词
  words5:         { count: 1, message: '5 words! Great! 👍', strength: 1 },
  // 6. 单次会话学会 10 个词
  words10:        { count: 2, message: '10 words today! 👍👍', strength: 2 },
  // 7. 单次会话学会 20 个词
  words20:        { count: 3, message: '20 words! Wow! 🌟👍👍👍', strength: 3 },
  // 20. 单次会话学会 30 个词
  words30:        { count: 5, message: '30 words! Star champion! ', strength: 3 },
  // 21. 单次会话学会 34 个词
  words34:        { count: 5, message: '34 words! SUPER LEARNER! ', strength: 3 },
  // 8. 每日首次打开 App
  dailyFirst:     { count: 1, message: 'Welcome back! 👍', strength: 1 },
  // 9. 复习了 3 个旧单词
  review3:        { count: 1, message: 'Great review! 👍', strength: 1 },
  // 10. 复习了 10 个旧单词
  review10:       { count: 2, message: '10 reviews! Super! 👍👍', strength: 2 },
  // 11. 解锁新分类
  unlockCategory: { count: 2, message: 'New world unlocked! 👍', strength: 2 },
  // 12. 连续学习 2 天
  streak2:        { count: 1, message: '2 day streak! 👍', strength: 1 },
  // 13. 连续学习 3 天
  streak3:        { count: 3, message: '3 day streak! 🏅👍👍', strength: 3 },
  // 14. 连续学习 7 天
  streak7:        { count: 5, message: '7 day streak! 👍👍👍', strength: 3 },
  // 15. 游戏正确率 ≥ 80%
  goodScore:      { count: 1, message: 'Great score! 👍', strength: 1 },
  // 16. 主动点赞 3 次（结算页）
  manual3:        { count: 1, message: 'You like it 3 times! ❤️👍', strength: 1 },
  // 17. 收藏了 5 个单词
  favorite5:      { count: 1, message: '5 favorites! 👍', strength: 1 },
  // 18. 单次学习时长 ≥ 10 分钟
  time10min:      { count: 1, message: '10 min learning! 👍', strength: 1 },
  // 19. 完成所有学习步骤（四步全通关）
  allSteps:       { count: 2, message: 'All steps done! 🎉👍', strength: 2 },
}

// 追踪本局已触发的自动点赞（防止重复）
const triggeredThisSession = new Set()
let wordsLearnedThisSession = 0
let reviewsThisSession = 0

/** 重置会话追踪 */
function resetSessionTracking() {
  triggeredThisSession.clear()
  wordsLearnedThisSession = 0
  reviewsThisSession = 0
}

/** 触发自动点赞 */
function triggerAutoLike(key) {
  // 检查是否已触发（单次会话仅一次）
  if (triggeredThisSession.has(key)) return null

  const config = AUTO_THUMBS_CONFIGS[key]
  if (!config) return null

  triggeredThisSession.add(key)
  addLikes(config.count, 'auto')

  // 根据强度播放音效
  try {
    if (config.strength >= 3) {
      sfxApplause()
    } else if (config.strength >= 2) {
      sfxCheer()
    } else {
      sfxStar()
    }
  } catch(e) {}

  return { count: config.count, message: config.message, total: thumbsUpState.value.todayLikes }
}

/** 记录学会一个单词（累积计数触发） */
function recordWordLearned() {
  wordsLearnedThisSession++
  
  // 首次学会
  triggerAutoLike('firstLearn')
  
  // 5/10/20/30/34 词里程碑
  if (wordsLearnedThisSession === 34) {
    triggerAutoLike('words34')
  } else if (wordsLearnedThisSession === 30) {
    triggerAutoLike('words30')
  } else if (wordsLearnedThisSession >= 20 && wordsLearnedThisSession % 20 === 0) {
    triggerAutoLike('words20')
  } else if (wordsLearnedThisSession >= 10 && wordsLearnedThisSession % 10 === 0) {
    triggerAutoLike('words10')
  } else if (wordsLearnedThisSession >= 5 && wordsLearnedThisSession % 5 === 0) {
    triggerAutoLike('words5')
  }
}

/** 记录复习一个单词（累积计数触发） */
function recordReview() {
  reviewsThisSession++
  
  if (reviewsThisSession >= 10 && reviewsThisSession % 10 === 0) {
    triggerAutoLike('review10')
  } else if (reviewsThisSession >= 3 && reviewsThisSession % 3 === 0) {
    triggerAutoLike('review3')
  }
}

/** 记录主动点赞（累积触发 bonus） */
function recordManualLike() {
  const manual = thumbsUpState.value.todayManualLikes
  if (manual >= 3 && manual % 3 === 0) {
    triggerAutoLike('manual3')
  }
}

/** 记录收藏单词（累积触发 bonus） */
function recordFavorite() {
  const favCount = thumbsUpState.value.favoriteWords.length
  if (favCount >= 5 && favCount % 5 === 0) {
    triggerAutoLike('favorite5')
  }
}

/** 获取收藏的单词列表 */
function getFavoriteWords() {
  return [...thumbsUpState.value.favoriteWords]
}

/** 获取点赞历史记录 */
function getLikeHistory() {
  return [...thumbsUpState.value.likeHistory]
}

// ============================================================
// 持久化
// ============================================================

async function persist() {
  try {
    await dbPutThumbsUp({
      todayLikes: thumbsUpState.value.todayLikes,
      todayAutoLikes: thumbsUpState.value.todayAutoLikes,
      todayManualLikes: thumbsUpState.value.todayManualLikes,
      favoriteWords: thumbsUpState.value.favoriteWords,
      likeHistory: thumbsUpState.value.likeHistory,
      likeMilestone: thumbsUpState.value.likeMilestone,
      lastOpenDate: thumbsUpState.value.lastOpenDate,
    })
  } catch(e) {
    console.warn('[ThumbsUp] IndexedDB 保存失败:', e)
  }
}

// ============================================================
// 加载
// ============================================================

async function loadFromDB() {
  try {
    const data = await dbGetThumbsUp()
    if (data) {
      thumbsUpState.value.todayLikes = data.todayLikes || 0
      thumbsUpState.value.todayAutoLikes = data.todayAutoLikes || 0
      thumbsUpState.value.todayManualLikes = data.todayManualLikes || 0
      thumbsUpState.value.favoriteWords = Array.isArray(data.favoriteWords) ? data.favoriteWords : []
      thumbsUpState.value.likeHistory = Array.isArray(data.likeHistory) ? data.likeHistory : []
      thumbsUpState.value.likeMilestone = data.likeMilestone || 'none'
      thumbsUpState.value.lastOpenDate = data.lastOpenDate || ''
    }
  } catch(e) {
    console.warn('[ThumbsUp] IndexedDB 加载失败:', e)
  }

  // 检查每日重置
  const isNewDay = checkDailyReset()

  // 首次打开触发 dailyFirst
  if (isNewDay) {
    setTimeout(() => {
      triggerAutoLike('dailyFirst')
    }, 1000)
  }

  // 自动保存
  watch(() => thumbsUpState.value.todayLikes, () => {
    persist()
  }, { deep: true })

  // 同步历史总点赞到萌宠系统（修复旧数据）
  try {
    const petStore = usePetStore()
    const s = petStore.petState?.value
    if (s) {
      const historicalTotal = (thumbsUpState.value.likeHistory || []).reduce(
        (sum, h) => sum + (h.total || 0), 0
      )
      const todayLikes = thumbsUpState.value.todayLikes || 0
      const totalLikes = historicalTotal + todayLikes
      if (totalLikes > (s.petTotalLikes || 0)) {
        console.log(`[ThumbsUp] 同步历史点赞到萌宠: ${s.petTotalLikes || 0} → ${totalLikes}`)
        s.petTotalLikes = totalLikes
        petStore.persist()
      }
    }
  } catch(e) {
    // 萌宠未启用时忽略
  }
}

// ============================================================
// 导出
// ============================================================

export function useThumbsUp() {
  return {
    // 状态
    thumbsUpState,
    isFirstOpenToday: () => isFirstOpenToday,

    // 加载
    loadFromDB,

    // 主动点赞
    doManualLike,
    recordManualLike,

    // 收藏
    toggleFavorite,
    isFavorite,
    recordFavorite,
    getFavoriteWords,
    getLikeHistory,

    // 自动点赞
    triggerAutoLike,
    recordWordLearned,
    recordReview,
    resetSessionTracking,

    // 工具
    addLikes,
    getMilestoneConfig,
    checkDailyReset,
  }
}
