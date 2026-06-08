/**
 * 呦呦英语启蒙 — 萌宠通知气泡
 *
 * 设计原则：
 * - 宠物通知是"呦呦替宠物传话"，不是 App 推消息
 * - 复用现有 yoyoBubble 机制，零新增 UI
 * - 每日最多 2 次，避免"狼来了"效应
 * - 底部导航宠物按钮显示红点角标
 */

import { ref, computed, watch } from 'vue'
import { usePetStore } from './usePetStore'

const DB_NAME = 'yoyo-english-v2'
const STORE_PET_BUBBLE = 'pet_bubble_queue'

// ============================================================
// 状态
// ============================================================

const hasPendingNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref('')
const todayShowCount = ref(0)
const MAX_DAILY = 2

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

async function dbGetBubbleQueue() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pet_bubble_queue', 'readonly')
    const store = tx.objectStore('pet_bubble_queue')
    const request = store.get(STORE_PET_BUBBLE)
    request.onsuccess = () => { db.close(); resolve(request.result) }
    request.onerror = () => reject(request.error)
  })
}

async function dbPutBubbleQueue(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pet_bubble_queue', 'readwrite')
    const store = tx.objectStore('pet_bubble_queue')
    store.put({ key: STORE_PET_BUBBLE, ...data })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => reject(tx.error)
  })
}

// 确保 objectStore 存在（首次使用时创建）
async function ensureStore() {
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 3) // version 3 for new store
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('pet_bubble_queue')) {
        db.createObjectStore('pet_bubble_queue', { keyPath: 'key' })
      }
    }
    request.onsuccess = () => { request.result.close(); resolve() }
    request.onerror = () => { resolve() } // 静默失败，不影响主流程
  })
}

// ============================================================
// 通知队列管理
// ============================================================

/** 推送一条通知到队列 */
async function pushNotification(type, message) {
  await ensureStore()
  try {
    const data = await dbGetBubbleQueue()
    const queue = data?.queue || []
    // 去重：同类型只保留最新的
    const filtered = queue.filter(q => q.type !== type)
    filtered.push({ type, message, at: Date.now() })
    await dbPutBubbleQueue({ key: STORE_PET_BUBBLE, queue: filtered })
  } catch (e) {
    console.warn('[PetBubble] 推送通知失败:', e)
  }
}

/** 从队列取出一条通知 */
async function popNotification() {
  await ensureStore()
  try {
    const data = await dbGetBubbleQueue()
    const queue = data?.queue || []
    if (queue.length === 0) return null
    const item = queue.shift()
    await dbPutBubbleQueue({ key: STORE_PET_BUBBLE, queue })
    return item
  } catch (e) {
    console.warn('[PetBubble] 弹出通知失败:', e)
    return null
  }
}

/** 重置今日计数 */
function resetDailyIfNeeded(lastDate) {
  const today = new Date().toDateString()
  if (lastDate !== today) {
    todayShowCount.value = 0
    return today
  }
  return lastDate
}

// ============================================================
// 通知触发逻辑
// ============================================================

/** 检查宠物状态并生成通知 */
function checkPetStatus() {
  const petStore = usePetStore()
  const s = petStore.petState.value
  if (!s || !s.enabled || !s.petSpecies) return

  // 每日重置
  todayShowCount.value = resetDailyIfNeeded(s.lastOpenDate)
  if (todayShowCount.value >= MAX_DAILY) return

  // 优先级 1：升级/破壳
  if (s.petMood === 'excited') {
    const species = petStore.currentSpecies.value
    if (s.petLevel >= 5 && species) {
      // 破壳
      pushNotification('hatch', `你的小${getEmojiName(species)}破壳了！快去底部看看它吧 ✨`)
    } else {
      // 升级
      pushNotification('levelup', `你的宠物升级了！现在是 Lv.${s.petLevel}，快去看看吧 🎉`)
    }
    return
  }

  // 优先级 2：饿了
  if (s.petMood === 'hungry') {
    const species = petStore.currentSpecies.value
    const name = species ? `小${getEmojiName(species)}` : '宠物'
    pushNotification('hungry', `${name}说它肚子咕咕叫了...去喂喂它吧 🍎`)
    return
  }

  // 优先级 3：连续 N 天未互动
  const now = Date.now()
  const lastInteraction = Math.max(
    s.lastFeedTime || 0,
    s.lastPetTime || 0,
    s.lastPlayTime || 0,
    s.lastWalkTime || 0,
    s.lastCuddleTime || 0
  )
  if (lastInteraction > 0 && (now - lastInteraction) > 3 * 24 * 3600 * 1000) {
    const days = Math.floor((now - lastInteraction) / (24 * 3600 * 1000))
    const species = petStore.currentSpecies.value
    const name = species ? `小${getEmojiName(species)}` : '宠物'
    pushNotification('missed', `${name}说它有点想你了...已经 ${days} 天没来看它了 💕`)
  }
}

function getEmojiName(species) {
  const names = {
    cat: '猫咪', dog: '狗狗', rabbit: '兔子', dragon: '龙龙',
    unicorn: '独角兽', tiger: '老虎', lion: '狮子', sheep: '绵羊'
  }
  return names[species.id] || '宠物'
}

// ============================================================
// 消费通知（用户点击底部宠物按钮时清除）
// ============================================================

async function consumeNotification() {
  hasPendingNotification.value = false
  notificationMessage.value = ''
  notificationType.value = ''
  todayShowCount.value++
  await popNotification()
}

// ============================================================
// 加载并显示通知
// ============================================================

async function loadAndShow(yoyoBubble, yoyoMood) {
  // 每日重置
  todayShowCount.value = resetDailyIfNeeded(
    usePetStore().petState.value?.lastOpenDate
  )
  if (todayShowCount.value >= MAX_DAILY) return

  const item = await popNotification()
  if (!item) return

  hasPendingNotification.value = true
  notificationMessage.value = item.message
  notificationType.value = item.type

  // 设置呦呦气泡
  yoyoBubble.value = item.message
  yoyoMood.value = item.type === 'hungry' ? 'comfort' : 'happy'

  // 8 秒后自动消失（如果用户没手动清除）
  setTimeout(() => {
    if (hasPendingNotification.value) {
      hasPendingNotification.value = false
      // 不自动清除气泡，让它自然消失
    }
  }, 8000)
}

// ============================================================
// 导出
// ============================================================

export function usePetBubble() {
  return {
    hasPendingNotification,
    notificationMessage,
    notificationType,
    todayShowCount,

    checkPetStatus,
    loadAndShow,
    consumeNotification,
    pushNotification,
  }
}
