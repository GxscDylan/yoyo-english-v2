/**
 * 呦呦英语启蒙 — 统一 Confetti 庆祝系统（v5.0）
 *
 * 全局调用 triggerConfetti() 即可触发撒星星效果
 * 支持主题: 'default' / 'gold' / 'purple' / 'rainbow'
 * 支持局部发射: triggerMiniConfetti(element)
 * 自动遵循 prefers-reduced-motion
 */

// ─── 主题 Emoji 集合 ────────────────────────────────────
const THEME_EMOJIS = {
  default: ['⭐', '✨', '🎉', '🌟', '💫', '🎊', '🏆', '💛'],
  gold:    ['⭐', '🌟', '💫', '✨', '🏆', '💛', '🥇', '👑'],
  purple:  ['💜', '✨', '🔮', '💫', '🌟', '🎆', '🪻', '💎'],
  rainbow: ['🌈', '⭐', '✨', '🎉', '💖', '💛', '💚', '💙'],
}

// ─── 主题 CSS 色调（用于非 emoji 的彩色纸片） ──────────
const THEME_COLORS = {
  default: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
  gold:    ['#FFD700', '#FFC107', '#FF9800', '#FFE082', '#FFF8E1', '#FFAB00'],
  purple:  ['#9C27B0', '#CE93D8', '#BA68C8', '#E1BEE7', '#7B1FA2', '#AB47BC'],
  rainbow: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF6B9D'],
}

/** 检查用户是否偏好减少动画 */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** 降级静态显示 */
function showReducedMotionFallback() {
  const fallback = document.createElement('div')
  fallback.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-size: 4rem; z-index: 9999; pointer-events: none;
    animation: starPop 0.5s ease forwards;
  `
  fallback.textContent = '⭐✨🎉'
  document.body.appendChild(fallback)
  setTimeout(() => fallback.remove(), 2000)
}

/**
 * 创建单个 emoji纸片
 * @param {string[]} emojis - emoji 集合
 * @param {string} theme - 主题名
 * @param {object} position - { x, y } 起始位置（vw/vh 百分比），null 表示随机顶部
 */
function createPiece(emojis, theme, position = null) {
  const el = document.createElement('div')
  el.className = 'confetti-piece'

  // 50% 概率使用 emoji，50% 概率使用彩色方块纸片
  if (Math.random() > 0.5) {
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
  } else {
    // 彩色方块纸片
    const colors = THEME_COLORS[theme] || THEME_COLORS.default
    const color = colors[Math.floor(Math.random() * colors.length)]
    el.style.width = (6 + Math.random() * 8) + 'px'
    el.style.height = (6 + Math.random() * 8) + 'px'
    el.style.backgroundColor = color
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
  }

  // 位置：指定起点 or 随机顶部
  if (position) {
    el.style.left = position.x + 'vw'
    el.style.top = position.y + 'vh'
    el.style.setProperty('--spread-x', (Math.random() * 40 - 20) + 'vw')
  } else {
    el.style.left = Math.random() * 100 + 'vw'
  }

  el.style.setProperty('--fall-duration', (1.5 + Math.random() * 1.5) + 's')
  el.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg')
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem'
  el.style.animationDelay = Math.random() * 0.5 + 's'
  return el
}

/**
 * 触发撒星星庆祝动画（全屏）
 * @param {number} count - 粒子数量，默认 40
 * @param {string} theme - 主题: 'default' | 'gold' | 'purple' | 'rainbow'
 */
export function triggerConfetti(count = 40, theme = 'default') {
  if (prefersReducedMotion()) {
    showReducedMotionFallback()
    return
  }

  const emojis = THEME_EMOJIS[theme] || THEME_EMOJIS.default

  // 每次都创建独立容器，支持多次叠加
  const container = document.createElement('div')
  container.className = 'confetti-container'
  document.body.appendChild(container)

  for (let i = 0; i < count; i++) {
    container.appendChild(createPiece(emojis, theme))
  }

  // 动画结束后清理
  setTimeout(() => container.remove(), 3500)
}

/**
 * 从指定元素位置发射局部粒子（适用于答题正确、按钮点击等）
 * @param {HTMLElement} element - 发射源元素
 * @param {object} options
 * @param {number} options.count - 粒子数量，默认 12
 * @param {string} options.theme - 主题，默认 'default'
 * @param {boolean} options.useElementColor - 是否从元素获取主色调，默认 false
 */
export function triggerMiniConfetti(element, options = {}) {
  const { count = 12, theme = 'default', useElementColor = false } = options

  if (prefersReducedMotion()) return

  const emojis = THEME_EMOJIS[theme] || THEME_EMOJIS.default

  // 计算元素在视口中的位置
  const rect = element.getBoundingClientRect()
  const centerX = ((rect.left + rect.width / 2) / window.innerWidth) * 100   // vw
  const centerY = ((rect.top + rect.height / 2) / window.innerHeight) * 100  // vh

  const container = document.createElement('div')
  container.className = 'confetti-container'
  document.body.appendChild(container)

  for (let i = 0; i < count; i++) {
    const piece = createPiece(emojis, theme, { x: centerX, y: centerY })

    // mini 版：更短的动画 + 更大扩散
    piece.style.setProperty('--fall-duration', (0.8 + Math.random() * 0.8) + 's')
    piece.style.setProperty('--spread-x', (Math.random() * 30 - 15) + 'vw')
    piece.style.fontSize = (0.8 + Math.random() * 0.8) + 'rem'

    // 如果使用元素颜色
    if (useElementColor) {
      const computedStyle = window.getComputedStyle(element)
      const bgColor = computedStyle.backgroundColor
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        piece.style.backgroundColor = bgColor
      }
    }

    container.appendChild(piece)
  }

  setTimeout(() => container.remove(), 2500)
}

/**
 * 游戏专用：从元素位置向上爆发（适合答题正确时的局部庆祝）
 * 别名函数，方便游戏组件调用
 * @param {HTMLElement} element - 触发元素
 * @param {string} theme - 主题
 */
export function triggerBurstConfetti(element, theme = 'default') {
  triggerMiniConfetti(element, { count: 16, theme })
}
