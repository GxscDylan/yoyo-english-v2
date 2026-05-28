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