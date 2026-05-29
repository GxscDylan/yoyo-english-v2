/**
 * 呦呦英语启蒙 — BGM 背景音乐引擎（Web Audio API 合成，零外部依赖）
 * 
 * 8 个场景 BGM，Melody + Bass + Rhythm + Pad 四层合成
 * 支持 crossfade 场景切换、音量控制、TTS 语音 ducking
 */

let audioCtx = null
let bgmGain = null       // BGM master gain
let sfxGain = null       // SFX gain（不通过 BGM 路由）
let masterGain = null    // 最终输出
let currentScene = null
let isPlaying = false
let bgmEnabled = false
let bgmVolume = 0.6
let sfxVolume = 0.8
let masterVolume = 0.8

// 活跃振荡器和定时器
let activeNodes = []
let loopTimer = null

// ============================================================
// BGM 场景配置
// ============================================================

const BGM_CONFIGS = {
  home: {
    label: '首页',
    bpm: 100,
    melody: [
      { note: 330, dur: 0.4 }, { note: 392, dur: 0.4 }, { note: 440, dur: 0.4 }, { note: 523, dur: 0.6 },
      { note: 440, dur: 0.4 }, { note: 392, dur: 0.4 }, { note: 330, dur: 0.8 },
      { note: 349, dur: 0.4 }, { note: 392, dur: 0.4 }, { note: 330, dur: 0.4 }, { note: 262, dur: 0.8 },
    ],
    bass: [
      { note: 131, dur: 1.6 }, { note: 131, dur: 1.6 }, { note: 175, dur: 1.6 }, { note: 131, dur: 1.6 },
    ],
    volume: 0.6,
  },
  learn: {
    label: '单词学习',
    bpm: 80,
    melody: [
      { note: 349, dur: 0.6 }, { note: 440, dur: 0.6 }, { note: 349, dur: 0.6 }, { note: 262, dur: 1.0 },
      { note: 294, dur: 0.6 }, { note: 349, dur: 0.6 }, { note: 440, dur: 1.0 }, { note: 349, dur: 1.2 },
    ],
    bass: [
      { note: 175, dur: 1.6 }, { note: 175, dur: 1.6 }, { note: 131, dur: 1.6 }, { note: 175, dur: 1.6 },
    ],
    volume: 0.4,
  },
  game: {
    label: '游戏进行中',
    bpm: 120,
    melody: [
      { note: 392, dur: 0.25 }, { note: 494, dur: 0.25 }, { note: 587, dur: 0.25 }, { note: 494, dur: 0.25 },
      { note: 392, dur: 0.25 }, { note: 494, dur: 0.5 }, { note: 587, dur: 0.5 }, { note: 784, dur: 0.5 },
      { note: 587, dur: 0.25 }, { note: 494, dur: 0.25 }, { note: 392, dur: 0.5 },
    ],
    bass: [
      { note: 196, dur: 0.8 }, { note: 196, dur: 0.8 }, { note: 247, dur: 0.8 }, { note: 247, dur: 0.8 },
      { note: 196, dur: 0.8 }, { note: 196, dur: 0.8 }, { note: 165, dur: 0.8 }, { note: 196, dur: 0.8 },
    ],
    volume: 0.5,
  },
  result: {
    label: '游戏结算',
    bpm: 100,
    melody: [
      { note: 523, dur: 0.6 }, { note: 659, dur: 0.6 }, { note: 784, dur: 0.8 },
      { note: 659, dur: 0.4 }, { note: 523, dur: 0.6 }, { note: 440, dur: 0.8 },
      { note: 349, dur: 0.6 }, { note: 392, dur: 0.6 }, { note: 440, dur: 1.2 },
    ],
    bass: [
      { note: 131, dur: 1.6 }, { note: 175, dur: 1.6 }, { note: 131, dur: 1.6 }, { note: 131, dur: 1.6 },
    ],
    volume: 0.55,
  },
  nursery: {
    label: '童谣播放',
    bpm: 70,
    melody: [
      { note: 294, dur: 0.8 }, { note: 349, dur: 0.8 }, { note: 392, dur: 1.0 }, { note: 349, dur: 0.8 },
      { note: 294, dur: 0.8 }, { note: 262, dur: 1.2 }, { note: 294, dur: 1.6 },
    ],
    bass: [
      { note: 147, dur: 2.0 }, { note: 147, dur: 2.0 }, { note: 175, dur: 2.0 }, { note: 131, dur: 2.0 },
    ],
    volume: 0.45,
  },
  review: {
    label: '复习模式',
    bpm: 90,
    melody: [
      { note: 440, dur: 0.5 }, { note: 494, dur: 0.5 }, { note: 523, dur: 0.6 }, { note: 494, dur: 0.5 },
      { note: 440, dur: 0.5 }, { note: 392, dur: 0.8 }, { note: 440, dur: 1.0 },
      { note: 392, dur: 0.5 }, { note: 440, dur: 0.5 }, { note: 494, dur: 1.2 },
    ],
    bass: [
      { note: 220, dur: 1.6 }, { note: 220, dur: 1.6 }, { note: 196, dur: 1.6 }, { note: 220, dur: 1.6 },
    ],
    volume: 0.4,
  },
  pet: {
    label: '萌宠摇篮',
    bpm: 60,
    melody: [
      { note: 262, dur: 0.8 }, { note: 330, dur: 0.8 }, { note: 392, dur: 1.0 }, { note: 330, dur: 0.8 },
      { note: 294, dur: 0.8 }, { note: 262, dur: 1.2 }, { note: 220, dur: 1.6 },
    ],
    bass: [
      { note: 131, dur: 2.4 }, { note: 165, dur: 2.4 }, { note: 131, dur: 2.4 }, { note: 131, dur: 2.4 },
    ],
    volume: 0.3,
  },
}

// ============================================================
// 初始化
// ============================================================

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/** 初始化音频路由 */
function initAudioChain() {
  const ctx = getCtx()

  // 如果已初始化，只更新音量
  if (masterGain) return

  masterGain = ctx.createGain()
  bgmGain = ctx.createGain()
  sfxGain = ctx.createGain()

  bgmGain.connect(masterGain)
  sfxGain.connect(ctx.destination) // SFX 直接输出
  masterGain.connect(ctx.destination)

  updateVolumes()
}

/** 更新所有音量（用户调节后调用） */
function updateVolumes() {
  if (!masterGain || !audioCtx) return
  const now = audioCtx.currentTime
  masterGain.gain.setTargetAtTime(masterVolume, now, 0.05)
  bgmGain.gain.setTargetAtTime(bgmEnabled ? bgmVolume : 0, now, 0.05)
}

// ============================================================
// 合成引擎
// ============================================================

/** 计算一个循环的时长（秒） */
function calcLoopDuration(config) {
  return config.melody.reduce((sum, n) => sum + n.dur, 0)
}

/** 播放单音 */
function playTone(freq, duration, startTime, type = 'sine', gainVal = 0.08, destination = null) {
  const ctx = getCtx()
  const dest = destination || bgmGain
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02)
  gain.gain.setValueAtTime(gainVal, startTime + duration * 0.7)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(gain)
  gain.connect(dest)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
  activeNodes.push({ osc, gain })
}

/** 创建主旋律层 */
function scheduleMelody(config, startTime, loopStart) {
  let t = startTime
  for (const n of config.melody) {
    playTone(n.note, n.dur * 0.9, t, 'sine', 0.06)
    t += n.dur
  }
  return t
}

/** 创建低音伴奏层 */
function scheduleBass(config, startTime) {
  let t = startTime
  for (const n of config.bass) {
    playTone(n.note, n.dur * 0.95, t, 'triangle', 0.04)
    t += n.dur
  }
  return t
}

/** 创建和弦垫底层（简化：根音长音） */
function schedulePad(config, startTime, loopDuration) {
  const rootNote = config.bass[0]?.note || 131
  playTone(rootNote, loopDuration * 0.95, startTime, 'sine', 0.02)
}

/** 调度一个完整循环 */
function scheduleLoop(config) {
  const ctx = getCtx()
  const now = ctx.currentTime
  const loopDuration = calcLoopDuration(config)

  scheduleMelody(config, now, 0)
  scheduleBass(config, now)
  schedulePad(config, now, loopDuration)

  // 预调度下一次循环（提前 200ms 避免断裂）
  loopTimer = setTimeout(() => {
    if (isPlaying && currentScene === config._sceneKey) {
      scheduleLoop(config)
    }
  }, (loopDuration - 0.2) * 1000)
}

// ============================================================
// 公开 API
// ============================================================

/** 播放场景 BGM（自动 fade out 旧 + fade in 新） */
export function playBGM(scene) {
  initAudioChain()
  const config = BGM_CONFIGS[scene]
  if (!config) {
    console.warn(`[BGM] 未知场景: ${scene}`)
    return
  }

  // 如果已播放同一场景，忽略
  if (currentScene === scene && isPlaying) return

  // 淡出旧曲
  if (isPlaying && bgmGain) {
    const ctx = getCtx()
    bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
  }

  // 停止旧循环
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }

  // 停止旧振荡器
  stopAllActive()

  currentScene = scene
  isPlaying = true
  config._sceneKey = scene

  // 淡入新曲
  if (bgmGain && bgmEnabled) {
    const ctx = getCtx()
    bgmGain.gain.setValueAtTime(0, ctx.currentTime)
    bgmGain.gain.setTargetAtTime(bgmVolume * config.volume, ctx.currentTime, 0.2)
  }

  scheduleLoop(config)
}

/** 停止 BGM（淡出） */
export function stopBGM() {
  if (!isPlaying || !bgmGain) return
  const ctx = getCtx()
  bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1)

  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }
  isPlaying = false
  currentScene = null

  setTimeout(stopAllActive, 500)
}

/** 恢复 BGM（从停止状态） */
export function resumeBGM() {
  if (currentScene) {
    playBGM(currentScene)
  }
}

/** 静音（家长中心用，不改变场景标记） */
export function muteBGM() {
  bgmEnabled = false
  updateVolumes()
}

/** 取消静音 */
export function unmuteBGM() {
  bgmEnabled = true
  updateVolumes()
  if (currentScene && !isPlaying) {
    playBGM(currentScene)
  }
}

/** 设置 BGM 音量 (0~1) */
export function setBGMVolume(v) {
  bgmVolume = Math.max(0, Math.min(1, v))
  updateVolumes()
}

/** 设置 SFX 音量 (0~1) */
export function setSFXVolume(v) {
  sfxVolume = Math.max(0, Math.min(1, v))
}

/** 设置主音量 (0~1) */
export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v))
  updateVolumes()
}

/** TTS 语音播放时 duck BGM（降低 30%） */
export function duckBGMForSpeech(on) {
  if (!bgmGain || !audioCtx) return
  const target = bgmEnabled ? (on ? bgmVolume * 0.3 : bgmVolume) : 0
  bgmGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.1)
}

/** 是否正在播放 */
export function isBGMPlaying() {
  return isPlaying
}

/** 当前场景 */
export function getCurrentBGMScene() {
  return currentScene
}

/** 是否启用 BGM */
export function isBGMEnabled() {
  return bgmEnabled
}

/** 停止所有活跃振荡器 */
function stopAllActive() {
  for (const node of activeNodes) {
    try { node.osc.stop() } catch(e) {}
  }
  activeNodes = []
}

/** 获取 BGM 场景列表（家长中心用） */
export function getBGMScenes() {
  return Object.entries(BGM_CONFIGS).map(([key, cfg]) => ({
    key,
    label: cfg.label,
  }))
}
