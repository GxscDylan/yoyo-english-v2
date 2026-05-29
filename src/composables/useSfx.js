/**
 * 呦呦英语启蒙 — 游戏音效（Web Audio API 合成，零外部依赖）
 */
let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

/** 正确提示音：清脆上扬 */
export function sfxCorrect() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    osc.frequency.setValueAtTime(523, ctx.currentTime)      // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1) // E5
    osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2) // G5
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4)
  } catch(e) {}
}

/** 错误提示音：低沉下降 */
export function sfxWrong() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'triangle'
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.frequency.setValueAtTime(330, ctx.currentTime)       // E4
    osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2) // A3
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3)
  } catch(e) {}
}

/** 翻牌音效：清脆短促 */
export function sfxFlip() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1)
  } catch(e) {}
}

/** 配对成功：金色叮咚 */
export function sfxMatch() {
  try {
    const ctx = getCtx()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
      osc.frequency.setValueAtTime(freq, t)
      osc.start(t); osc.stop(t + 0.25)
    })
  } catch(e) {}
}

/** 星星音效：闪亮 */
export function sfxStar() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.3)
    osc.frequency.linearRampToValueAtTime(2400, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6)
  } catch(e) {}
}

/** 完成音效：凯旋 */
export function sfxComplete() {
  try {
    const ctx = getCtx()
    const notes = [523, 659, 784, 1047, 784, 1047, 1319]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = i < 4 ? 'sine' : 'triangle'
      const t = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35)
      osc.frequency.setValueAtTime(freq, t)
      osc.start(t); osc.stop(t + 0.35)
    })
  } catch(e) {}
}

/** 倒计时滴答 */
export function sfxTick() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15)
  } catch(e) {}
}

/** 悬停微音效：极短轻触（<30ms），用于按钮/卡片 hover */
export function sfxHover() {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    // 极短、极轻，仅可感知
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.03)
  } catch(e) {}
}

/**
 * P1-3: 悬停音效系统 — 全局自动注入
 * 用法：在 App.vue 或 main.js 调用 initHoverSfx()
 * 自动为所有按钮、可交互卡片添加 hover 音效
 */
let hoverSfxInitialized = false
let hoverSfxEnabled = true

export function initHoverSfx() {
  if (hoverSfxInitialized) return
  hoverSfxInitialized = true

  // 尊重 prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (prefersReducedMotion.matches) {
    hoverSfxEnabled = false
    return
  }

  // 监听所有可交互元素的 mouseenter
  document.addEventListener('mouseenter', (e) => {
    if (!hoverSfxEnabled) return
    const target = e.target
    // 只对按钮和特定可交互元素播放
    if (target.matches('button, [role="button"], .explore-card, .today-card, .nav-btn, .theme-option, .diff-option, .pin-key, .btn-elastic')) {
      // 避免频繁触发：距上次至少 100ms
      if (!target._lastHoverSfx || Date.now() - target._lastHoverSfx > 100) {
        sfxHover()
        target._lastHoverSfx = Date.now()
      }
    }
  }, true)
}

export function setHoverSfxEnabled(enabled) {
  hoverSfxEnabled = enabled
}

// ============================================================
// 点赞系统专属音效（v5.0 新增）
// ============================================================

/** 点赞音效：上行三音 C5-E5-G5 + "叮" */
export function sfxThumbsUp() {
  try {
    const ctx = getCtx()
    ;[523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18)
      osc.frequency.setValueAtTime(freq, t)
      osc.start(t); osc.stop(t + 0.18)
    })
  } catch(e) {}
}

/** 欢呼音效：上行滑音 + 轻拍手声 */
export function sfxCheer() {
  try {
    sfxThumbsUp()
    // 模拟轻拍: 短促白噪声 + 高通滤波
    const ctx = getCtx()
    const bufferSize = Math.floor(ctx.sampleRate * 0.08)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2000
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.4)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.48)
    source.start(ctx.currentTime + 0.4)
  } catch(e) {}
}

/** 掌声模拟：白噪声 + 带通滤波 + 包络 + 凯旋音型 */
export function sfxApplause() {
  try {
    const ctx = getCtx()
    // 掌声: 持续白噪声 + 带通滤波
    const bufferSize = Math.floor(ctx.sampleRate * 0.6)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 4000
    filter.Q.value = 0.5
    // 包络: attack 0.01, decay 0.3, sustain 0.4, release 0.3
    const t = ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.12, t + 0.01)
    gain.gain.linearRampToValueAtTime(0.08, t + 0.3)
    gain.gain.setValueAtTime(0.08, t + 0.3 + 0.4 * 0.6)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start(t)
    source.stop(t + 0.6)

    // 叠加凯旋音型
    sfxFanfare()
  } catch(e) {}
}

/** 心形收藏音效：上行音 C5-D5-E5 + 轻柔爆开声 */
export function sfxFavorite() {
  try {
    const ctx = getCtx()
    ;[523, 587, 659].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.1
      gain.gain.setValueAtTime(0.15, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15)
      osc.frequency.setValueAtTime(freq, t)
      osc.start(t); osc.stop(t + 0.15)
    })
    // 轻柔爆开声
    const bufferSize = Math.floor(ctx.sampleRate * 0.05)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 3000
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.15, ctx.currentTime + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    source.start(ctx.currentTime + 0.3)
  } catch(e) {}
}

/** 凯旋号角：C5-G5-C6-E6（0.8s） */
export function sfxFanfare() {
  try {
    const ctx = getCtx()
    ;[523, 784, 1047, 1319].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'square'
      const t = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0.08, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25)
      osc.frequency.setValueAtTime(freq, t)
      osc.start(t); osc.stop(t + 0.25)
    })
  } catch(e) {}
}

/** 共享 AudioContext getter（供 BGM 等使用） */
export function getSharedAudioCtx() {
  return getCtx()
}