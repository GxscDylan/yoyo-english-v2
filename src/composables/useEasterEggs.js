import { ref, onMounted, onUnmounted } from 'vue'
import { triggerConfetti } from './useConfetti'
import { sfxComplete, sfxStar } from './useSfx'

// Konami Code: ↑↑↓↓←→←→BA
const KONAMI_SEQUENCE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]

/**
 * Easter Egg 发现系统
 * - Konami Code 触发彩虹模式
 * - 快速点击呦呦触发庆祝
 */
export function useEasterEggs() {
  const isRainbowMode = ref(false)
  const rainbowTimeout = ref(null)
  const keySequence = ref([])
  const clickCount = ref(0)
  const lastClickTime = ref(0)
  const easterEggTriggered = ref(false)

  // Konami Code 监听
  function handleKeydown(e) {
    keySequence.value.push(e.keyCode)
    // 保持最近 10 个键
    if (keySequence.value.length > 10) {
      keySequence.value = keySequence.value.slice(-10)
    }

    // 检查 Konami Code 匹配
    const current = keySequence.value.join(',')
    const target = KONAMI_SEQUENCE.join(',')

    if (current === target) {
      triggerKonamiEgg()
      keySequence.value = []
    }
  }

  // 快速点击呦呦检测
  function handleYoyoClick() {
    const now = Date.now()
    const timeDiff = now - lastClickTime.value

    // 2秒内的点击算作连续
    if (timeDiff < 2000) {
      clickCount.value++
    } else {
      clickCount.value = 1
    }

    lastClickTime.value = now

    // 连续点击 5 次触发
    if (clickCount.value >= 5) {
      triggerClickEgg()
      clickCount.value = 0
    }
  }

  // Konami Code 彩蛋
  function triggerKonamiEgg() {
    if (isRainbowMode.value) return

    isRainbowMode.value = true
    easterEggTriggered.value = true
    document.body.classList.add('rainbow-mode')

    // 播放特殊音效
    try {
      sfxComplete()
    } catch (e) {
      // 音效可能未初始化，忽略
    }

    // 触发撒花
    triggerConfetti({
      particleCount: 80,
      spread: 100,
      startVelocity: 40,
      colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
    })

    // 显示提示
    showEasterEggMessage('🌈 Rainbow Mode! You found the secret code!')

    // 10秒后自动退出
    rainbowTimeout.value = setTimeout(() => {
      isRainbowMode.value = false
      document.body.classList.remove('rainbow-mode')
    }, 10000)
  }

  // 点击呦呦彩蛋
  function triggerClickEgg() {
    easterEggTriggered.value = true

    // 播放庆祝音效
    try {
      sfxStar()
    } catch (e) {
      // 忽略
    }

    // 触发撒花
    triggerConfetti({
      particleCount: 40,
      spread: 70,
      startVelocity: 30,
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#7FFF00']
    })

    // 显示浮动 emoji
    createFloatingEmojis(12)

    showEasterEggMessage('🎉 Yoyo loves you! Super click combo!')
  }

  // 创建浮动 emoji
  function createFloatingEmojis(count) {
    const emojis = ['🎉', '✨', '🎊', '🌟', '💫', '🐯', '🎈', '🎁']

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div')
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
        el.className = 'easter-egg-emoji'
        el.style.cssText = `
          position: fixed;
          bottom: 0;
          left: ${Math.random() * 100}vw;
          font-size: ${24 + Math.random() * 24}px;
          pointer-events: none;
          z-index: 10000;
          animation: easterFloat ${3 + Math.random() * 3}s ease-out forwards;
        `
        document.body.appendChild(el)

        setTimeout(() => el.remove(), 6000)
      }, i * 80)
    }
  }

  // 显示彩蛋消息
  function showEasterEggMessage(msg) {
    const el = document.createElement('div')
    el.className = 'easter-egg-toast'
    el.textContent = msg
    el.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 600;
      z-index: 10001;
      animation: toastSlideIn 0.5s ease-out;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
    `
    document.body.appendChild(el)

    setTimeout(() => {
      el.style.animation = 'toastSlideOut 0.3s ease-in forwards'
      setTimeout(() => el.remove(), 300)
    }, 3000)
  }

  // 初始化
  function init() {
    document.addEventListener('keydown', handleKeydown)
  }

  // 清理
  function cleanup() {
    document.removeEventListener('keydown', handleKeydown)
    if (rainbowTimeout.value) clearTimeout(rainbowTimeout.value)
    document.body.classList.remove('rainbow-mode')
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isRainbowMode,
    easterEggTriggered,
    handleYoyoClick,
    triggerKonamiEgg
  }
}
