/**
 * 呦呦英语启蒙 — 统一反馈调度器（v5.0）
 * 
 * 根据反馈级别（L1~L5）统一调度：音效 + 语音 + 吉祥物 + 视觉 + 触觉
 * 同时处理特殊时刻（首次学会 / 完美通关 / 里程碑）
 */

import { sfxCorrect, sfxWrong, sfxComplete, sfxStar, sfxFanfare } from './useSfx'
import { triggerConfetti } from './useConfetti'

// ============================================================
// 反馈级别定义
// ============================================================

/**
 * @typedef {Object} FeedbackConfig
 * @property {string} label - 级别名称
 * @property {Function} sfx - 音效
 * @property {string} mascot - 吉祥物 mood
 * @property {Function} visual - 视觉特效（DOM 操作）
 * @property {Function} vibrate - 触觉反馈
 */

/**
 * 播放反馈（根据级别和上下文）
 * @param {number} level - 1~5
 * @param {object} context - 上下文（combo, mascot, confettiContainer 等）
 */
export function playFeedback(level, context = {}) {
  const { mascot, container, combo = 0, isCorrect = true } = context

  switch (level) {
    case 1: // 温暖鼓励（答错）
      playLevel1(context)
      break
    case 2: // 正常正确
      playLevel2(context)
      break
    case 3: // 优秀表现（Combo x3）
      playLevel3(context)
      break
    case 4: // 高光时刻（Combo x5+ / 单轮全对）
      playLevel4(context)
      break
    case 5: // 传奇时刻（全对通关 / 成就解锁）
      playLevel5(context)
      break
    default:
      playLevel2(context)
  }
}

// ============================================================
// Level 1 — 温暖鼓励（答错回应）
// ============================================================

function playLevel1(context = {}) {
  // 音效：降低音量 30%，更柔和
  try {
    sfxWrong()
  } catch(e) {}

  // 吉祥物：comfort 或 encourage mood
  if (context.mascot) {
    context.mascot.value = context.wrongCount >= 3 ? 'comfort' : 'encourage'
    context.mascotBubble = 'Almost! 👋'
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 2500)
  }

  // 视觉：轻微抖动（已在 transitions.css 中定义 shake-gentle）
  if (context.cardRef) {
    context.cardRef.classList.add('shake-gentle')
    setTimeout(() => context.cardRef.classList.remove('shake-gentle'), 500)
  }

  // 触觉：单次轻振
  gentleVibrate(30)
}

// ============================================================
// Level 2 — 正常正确（基线）
// ============================================================

function playLevel2(context = {}) {
  // 音效
  try {
    sfxCorrect()
  } catch(e) {}

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'happy'
    context.mascotBubble = 'Great! 👍'
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 2000)
  }

  // 视觉：绿色脉冲光环
  if (context.cardRef) {
    context.cardRef.classList.add('correct-pulse')
    setTimeout(() => context.cardRef.classList.remove('correct-pulse'), 600)
  }

  // 星星飞入
  if (context.cardRef) {
    flyStars(context.cardRef, 1)
  }

  // 触觉
  gentleVibrate(30)
}

// ============================================================
// Level 3 — 优秀表现（Combo x3）
// ============================================================

function playLevel3(context = {}) {
  // 音效：升调版
  try {
    sfxCorrect()
  } catch(e) {}

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'excited'
    context.mascotBubble = "You're on fire! 🔥"
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 2500)
  }

  // ComboDisplay 火焰特效（已有）+ 底部升起 🔥 emoji
  spawnFloatingEmojis('🔥', 5)

  // 触觉
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }

  // 星星飞入（3颗 + 拖尾）
  if (context.cardRef) {
    flyStars(context.cardRef, 3)
  }
}

// ============================================================
// Level 4 — 高光时刻（Combo x5+ / 单轮全对）
// ============================================================

function playLevel4(context = {}) {
  // 音效：凯旋号角
  try {
    sfxFanfare()
  } catch(e) {}

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'proud'
    context.mascotBubble = "Amazing! You're a superstar! 🌟"
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 3000)
  }

  // 全屏金色粒子雨
  triggerConfetti(30, 'gold')

  // 金色径向闪光
  flashGolden()

  // 触觉：节奏振动
  if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50])
  }

  // 横幅
  showBanner('🔥 PERFECT STREAK!')
}

// ============================================================
// Level 5 — 传奇时刻（全对通关 / 成就解锁）
// ============================================================

function playLevel5(context = {}) {
  // 音效：增强版
  try {
    sfxComplete()
  } catch(e) {}

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'celebrate'
    context.mascotBubble = "You did it! Wow, you're incredible! 🏆"
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 3000)
  }

  // 统一全屏庆祝：50颗金色+紫色双色粒子
  triggerConfetti(50, 'gold')

  // 彩虹边框
  showRainbowBorder()

  // 触觉：庆祝节奏
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200])
  }
}

// ============================================================
// 特殊时刻
// ============================================================

/** 首次学会一个单词 */
export function triggerFirstLearn(word, context = {}) {
  // 金色光环
  if (context.cardRef) {
    context.cardRef.classList.add('correct-pulse')
    setTimeout(() => context.cardRef.classList.remove('correct-pulse'), 700)
  }

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'proud'
    context.mascotBubble = 'You learned a new word! 🎉'
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 3000)
  }

  // 音效
  try {
    sfxStar()
  } catch(e) {}

  // 星星飞入
  if (context.cardRef) {
    flyStars(context.cardRef, 3)
  }
}

/** 完美通关（全对 0 错） */
export function triggerPerfectClear(context = {}) {
  // 全屏金色闪光
  flashGolden()

  // 横幅
  showBanner('⭐ PERFECT! ⭐')

  // 吉祥物
  if (context.mascot) {
    context.mascot.value = 'celebrate'
    setTimeout(() => { context.mascot.value = 'idle' }, 3000)
  }

  // 音效
  try {
    sfxFanfare()
  } catch(e) {}

  // confetti
  triggerConfetti(50, 'gold')
}

/** 学习里程碑（5/10/20 词） */
export function triggerMilestone(count, context = {}) {
  let message, mood
  if (count >= 20) {
    message = '20 words! Time to take a break? 😊'
    mood = 'celebrate'
    triggerConfetti(20, 'rainbow')
  } else if (count >= 10) {
    message = "10 words! You're a learning machine! 🤖"
    mood = 'excited'
  } else {
    message = `${count} words! Keep going! 💪`
    mood = 'happy'
  }

  if (context.mascot) {
    context.mascot.value = mood
    context.mascotBubble = message
    setTimeout(() => { context.mascot.value = 'idle'; context.mascotBubble = '' }, 3000)
  }

  try {
    if (count >= 20) sfxComplete()
    else if (count >= 10) sfxFanfare()
    else sfxCorrect()
  } catch(e) {}

  // 底部飘过一排 📚
  if (count >= 5 && count < 20) {
    spawnFloatingEmojis('📚', 5)
  }
}

// ============================================================
// 辅助函数
// ============================================================

/** 轻振 */
function gentleVibrate(duration) {
  if (navigator.vibrate) {
    navigator.vibrate(duration)
  }
}

/** 星星飞入动画 */
function flyStars(element, count = 1) {
  const rect = element.getBoundingClientRect()
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div')
    star.className = 'star-fly'
    star.textContent = '⭐'
    star.style.left = (rect.left + rect.width / 2) + 'px'
    star.style.top = (rect.top + rect.height / 2) + 'px'
    // 飞入方向：向左上（首页方向）
    star.style.setProperty('--fly-x', (-40 + Math.random() * 30) + 'px')
    star.style.setProperty('--fly-y', (-150 - Math.random() * 100) + 'px')
    star.style.animationDelay = (i * 0.1) + 's'
    document.body.appendChild(star)
    setTimeout(() => star.remove(), 1000)
  }
}

/** 飘浮 emoji */
function spawnFloatingEmojis(emoji, count) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'fire-float'
    el.textContent = emoji
    el.style.left = (10 + Math.random() * 80) + 'vw'
    el.style.animationDelay = (Math.random() * 0.5) + 's'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }
}

/** 金色闪光 */
function flashGolden() {
  const flash = document.createElement('div')
  flash.className = 'golden-flash'
  document.body.appendChild(flash)
  setTimeout(() => flash.remove(), 700)
}

/** 横幅 */
function showBanner(text) {
  const banner = document.createElement('div')
  banner.className = 'perfect-banner'
  banner.textContent = text
  document.body.appendChild(banner)
  setTimeout(() => banner.remove(), 2600)
}

/** 彩虹边框 */
function showRainbowBorder() {
  const border = document.createElement('div')
  border.className = 'rainbow-border'
  document.body.appendChild(border)
  setTimeout(() => border.remove(), 3100)
}
