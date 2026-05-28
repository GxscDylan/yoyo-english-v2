/**
 * 呦呦英语启蒙 — 撒星星 Confetti 庆祝动画
 *
 * 全局调用 triggerConfetti() 即可触发撒星星效果
 * 自动遵循 prefers-reduced-motion
 */

let container = null
let isRunning = false

const EMOJIS = ['⭐', '✨', '🎉', '🌟', '💫', '🎊', '🏆', '💛']

/** 检查用户是否偏好减少动画 */
function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** 创建单个纸片 */
function createPiece() {
  const el = document.createElement('div')
  el.className = 'confetti-piece'
  el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  el.style.left = Math.random() * 100 + 'vw'
  el.style.setProperty('--fall-duration', (1.5 + Math.random() * 1.5) + 's')
  el.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg')
  el.style.fontSize = (1 + Math.random() * 1.5) + 'rem'
  el.style.animationDelay = Math.random() * 0.5 + 's'
  return el
}

/**
 * 触发撒星星庆祝动画
 * @param {number} count - 粒子数量，默认 40
 */
export function triggerConfetti(count = 40) {
  // 尊重 prefers-reduced-motion
  if (prefersReducedMotion()) {
    // 降级：在页面中心显示静态星星
    const fallback = document.createElement('div')
    fallback.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      font-size: 4rem; z-index: 9999; pointer-events: none;
      animation: starPop 0.5s ease forwards;
    `
    fallback.textContent = '⭐✨🎉'
    document.body.appendChild(fallback)
    setTimeout(() => fallback.remove(), 2000)
    return
  }

  if (isRunning) return
  isRunning = true

  if (!container) {
    container = document.createElement('div')
    container.className = 'confetti-container'
    document.body.appendChild(container)
  }

  // 清空之前的
  container.innerHTML = ''

  for (let i = 0; i < count; i++) {
    container.appendChild(createPiece())
  }

  // 动画结束后清理
  setTimeout(() => {
    if (container) {
      container.innerHTML = ''
      isRunning = false
    }
  }, 3000)
}
