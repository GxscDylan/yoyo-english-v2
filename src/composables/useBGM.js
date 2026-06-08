/**
 * 呦呦英语启蒙 — BGM 背景音乐引擎 v3.0（Web Audio API 合成，零外部依赖）
 * 
 * 7 个场景 BGM，Melody + Pad + Bass + Rhythm 四层合成
 * 支持 crossfade 场景切换（500ms 淡入淡出）、音量控制、TTS 语音 ducking
 * 
 * v1.0: Melody + Bass 两层合成
 * v2.0: 新增 Pad 和弦垫层 + Rhythm 打击乐层 + 偏好持久化
 * v3.0: 全面重编旋律 — 每个场景独特的调性和情感表达
 *       首页: C大调童谣风 → 学习: G大调五声音阶 → 游戏: D大调8-bit街机风
 *       结算: C大调凯旋号角 → 童谣: F大调摇篮曲 → 复习: A小调西班牙走向
 *       萌宠: C大调八音盒催眠风
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
let fadeTimer = null

// 持久化键
const STORAGE_KEY = 'yoyo-bgm-prefs'

// ============================================================
// BGM 场景配置 v2.0
// ============================================================

const BGM_CONFIGS = {
  home: {
    label: '首页',
    bpm: 100,
    // 🎵 旋律：C 大调，童谣风格，跳跃活泼
    // 设计意图：孩子打开 App 第一个听到，要有"欢迎来到乐园"的感觉
    melody: [
      { note: 523, dur: 0.2 }, { note: 523, dur: 0.2 }, // C-C 短促开场
      { note: 659, dur: 0.4 }, { note: 784, dur: 0.4 }, // E-G 上行跳跃
      { note: 880, dur: 0.6 }, // A 高潮音符
      { note: 784, dur: 0.2 }, { note: 659, dur: 0.2 }, { note: 523, dur: 0.3 }, { note: 587, dur: 0.3 }, // 下行回归
      { note: 523, dur: 0.2 }, { note: 440, dur: 0.2 }, // C-A
      { note: 392, dur: 0.3 }, { note: 440, dur: 0.3 }, { note: 523, dur: 0.8 }, // G-A-C 上扬收尾
    ],
    // 🎸 低音：Walking bass + 跳跃感
    bass: [
      { note: 262, dur: 0.6 }, { note: 330, dur: 0.6 }, // C-E 上行
      { note: 392, dur: 0.8 }, { note: 330, dur: 0.4 }, // G-E 回落
      { note: 262, dur: 0.6 }, { note: 220, dur: 0.6 }, // C-A
      { note: 196, dur: 0.4 }, { note: 262, dur: 0.8 }, // G-C 回归
    ],
    // 🎹 Pad：C→Am→F→G 经典流行走向
    pad: [
      { notes: [262, 330, 392], dur: 1.6 }, // C
      { notes: [220, 262, 330], dur: 1.6 }, // Am
      { notes: [175, 220, 262], dur: 1.6 }, // F
      { notes: [196, 247, 294], dur: 1.6 }, // G
    ],
    // 🥁 Rhythm：轻快的 4 拍摇摆感
    rhythm: [
      { freq: 900, dur: 0.04, vol: 0.018, type: 'square' }, // 嗒
      { freq: 700, dur: 0.04, vol: 0.012, type: 'square' }, // 嗒
      { freq: 900, dur: 0.04, vol: 0.018, type: 'square' }, // 嗒
      { freq: 450, dur: 0.08, vol: 0.025, type: 'triangle' }, // 咚（重拍）
    ],
    volume: 0.5,
  },
  learn: {
    label: '单词学习',
    bpm: 80,
    // 🎵 旋律：G 大调，温和平静，五声音阶风格（东方童谣感）
    // 设计意图：学习时需要专注，旋律不能太抢眼，像背景音乐中的背景
    melody: [
      { note: 392, dur: 1.0 }, // G 长音入场
      { note: 440, dur: 0.6 }, { note: 392, dur: 0.6 }, // A-G 轻轻摇摆
      { note: 330, dur: 0.8 }, { note: 294, dur: 0.8 }, // E-D 下行沉淀
      { note: 330, dur: 0.6 }, { note: 392, dur: 1.2 }, // E-G 回归，循环
    ],
    // 🎸 低音：极简根音，每小节只变一次
    bass: [
      { note: 196, dur: 3.2 }, // G
      { note: 147, dur: 3.2 }, // D
    ],
    // 🎹 Pad：G→Em→C→D 温暖走向，长音铺满
    pad: [
      { notes: [196, 247, 294], dur: 3.2 }, // G
      { notes: [165, 196, 247], dur: 3.2 }, // Em
    ],
    // 🥁 Rhythm：几乎听不到的心跳节拍
    rhythm: [
      { freq: 400, dur: 0.06, vol: 0.005, type: 'sine' }, // 极轻
      { freq: 300, dur: 0.08, vol: 0.004, type: 'sine' },
    ],
    volume: 0.3,
  },
  game: {
    label: '游戏进行中',
    bpm: 128,
    // 🎵 旋律：D 大调，8-bit 游戏风格，快速琶音 + 跳跃音符
    // 设计意图：紧张感 + 兴奋感，像经典街机游戏的 BGM
    melody: [
      { note: 587, dur: 0.15 }, { note: 740, dur: 0.15 }, { note: 880, dur: 0.2 }, { note: 1175, dur: 0.3 }, // D-F#-A-D5 快速琶音
      { note: 880, dur: 0.15 }, { note: 740, dur: 0.15 }, { note: 587, dur: 0.2 }, { note: 523, dur: 0.15 }, // 下行
      { note: 587, dur: 0.15 }, { note: 659, dur: 0.15 }, { note: 740, dur: 0.2 }, { note: 880, dur: 0.3 }, // 再次上行
      { note: 740, dur: 0.15 }, { note: 659, dur: 0.15 }, { note: 587, dur: 0.4 }, // A-E-D 短收尾
      { note: 523, dur: 0.15 }, { note: 587, dur: 0.15 }, { note: 659, dur: 0.2 }, { note: 740, dur: 0.3 }, // 新的上行
      { note: 880, dur: 0.2 }, { note: 740, dur: 0.15 }, { note: 659, dur: 0.15 }, { note: 587, dur: 0.6 }, // 长音悬停
    ],
    // 🎸 低音：快速的八分音符驱动
    bass: [
      { note: 294, dur: 0.3 }, { note: 294, dur: 0.3 }, { note: 370, dur: 0.3 }, { note: 370, dur: 0.3 },
      { note: 294, dur: 0.3 }, { note: 294, dur: 0.3 }, { note: 262, dur: 0.3 }, { note: 262, dur: 0.3 },
      { note: 294, dur: 0.3 }, { note: 294, dur: 0.3 }, { note: 370, dur: 0.3 }, { note: 370, dur: 0.3 },
      { note: 294, dur: 0.3 }, { note: 294, dur: 0.3 }, { note: 262, dur: 0.3 }, { note: 294, dur: 0.3 },
    ],
    // 🎹 Pad：D→A→Bm→A 动力走向
    pad: [
      { notes: [294, 370, 440], dur: 1.2 }, // D
      { notes: [220, 277, 330], dur: 1.2 }, // A
      { notes: [247, 294, 370], dur: 1.2 }, // Bm
      { notes: [220, 277, 330], dur: 1.2 }, // A
    ],
    // 🥁 Rhythm：密集 8 拍，像电子鼓机
    rhythm: [
      { freq: 1200, dur: 0.03, vol: 0.025, type: 'square' },
      { freq: 900, dur: 0.03, vol: 0.02, type: 'square' },
      { freq: 1200, dur: 0.03, vol: 0.025, type: 'square' },
      { freq: 600, dur: 0.05, vol: 0.035, type: 'triangle' }, // 重拍
      { freq: 1200, dur: 0.03, vol: 0.025, type: 'square' },
      { freq: 900, dur: 0.03, vol: 0.02, type: 'square' },
      { freq: 1200, dur: 0.03, vol: 0.025, type: 'square' },
      { freq: 600, dur: 0.05, vol: 0.035, type: 'triangle' }, // 重拍
    ],
    volume: 0.45,
  },
  result: {
    label: '游戏结算',
    bpm: 100,
    // 🎵 旋律：C 大调，凯旋号角 + 童谣欢乐感
    // 设计意图：赢了要有成就感，输了也要有鼓励感
    melody: [
      { note: 523, dur: 0.3 }, { note: 659, dur: 0.3 }, { note: 784, dur: 0.5 }, // C-E-G 号角式上行
      { note: 1047, dur: 0.6 }, // C5 高潮！
      { note: 880, dur: 0.3 }, { note: 784, dur: 0.3 }, { note: 659, dur: 0.5 }, // A-G-E 下行
      { note: 523, dur: 0.3 }, { note: 587, dur: 0.3 }, { note: 659, dur: 0.8 }, // C-D-E 上扬微笑
    ],
    // 🎸 低音：稳定根音支撑
    bass: [
      { note: 262, dur: 1.6 }, { note: 175, dur: 1.6 }, { note: 131, dur: 1.6 }, { note: 196, dur: 1.6 },
    ],
    // 🎹 Pad：C→F→C→G 凯旋走向
    pad: [
      { notes: [262, 330, 392], dur: 1.6 }, // C
      { notes: [175, 220, 262], dur: 1.6 }, // F
      { notes: [262, 330, 392], dur: 1.6 }, // C
      { notes: [196, 247, 294], dur: 1.6 }, // G
    ],
    // 🥁 Rhythm：胜利感的中等节奏
    rhythm: [
      { freq: 800, dur: 0.05, vol: 0.02, type: 'square' },
      { freq: 600, dur: 0.05, vol: 0.015, type: 'square' },
      { freq: 800, dur: 0.05, vol: 0.02, type: 'square' },
      { freq: 400, dur: 0.1, vol: 0.028, type: 'triangle' }, // 胜利重拍
    ],
    volume: 0.45,
  },
  nursery: {
    label: '童谣播放',
    bpm: 68,
    // 🎵 旋律：F 大调，摇篮曲风格，五声音阶，像"小星星"的变体
    // 设计意图：让孩子安静下来，旋律要像妈妈哼的摇篮曲
    melody: [
      { note: 349, dur: 1.0 }, { note: 392, dur: 0.8 }, { note: 440, dur: 0.8 }, // F-G-A 缓慢上行
      { note: 392, dur: 0.6 }, { note: 349, dur: 0.6 }, { note: 294, dur: 1.0 }, // G-F-D 沉降
      { note: 330, dur: 0.8 }, { note: 294, dur: 0.8 }, { note: 262, dur: 1.2 }, // E-D-C 入眠
    ],
    // 🎸 低音：极慢的长音，像呼吸
    bass: [
      { note: 175, dur: 4.0 }, { note: 147, dur: 4.0 }, { note: 131, dur: 4.0 },
    ],
    // 🎹 Pad：F→Dm→C 温柔走向
    pad: [
      { notes: [175, 220, 262], dur: 4.0 }, // F
      { notes: [147, 175, 220], dur: 4.0 }, // Dm
      { notes: [131, 165, 196], dur: 4.0 }, // C
    ],
    // 🥁 Rhythm：几乎无声，只有偶尔心跳
    rhythm: [
      { freq: 280, dur: 0.1, vol: 0.004, type: 'sine' },
      { freq: 220, dur: 0.12, vol: 0.003, type: 'sine' },
    ],
    volume: 0.25,
  },
  review: {
    label: '复习模式',
    bpm: 88,
    // 🎵 旋律：A 小调，思考感，循环往复的旋律像"回忆"
    // 设计意图：复习是回顾过去，旋律要有"似曾相识"的感觉
    melody: [
      { note: 440, dur: 0.5 }, { note: 494, dur: 0.5 }, { note: 523, dur: 0.6 }, // A-B-C 思考上行
      { note: 587, dur: 0.4 }, { note: 523, dur: 0.4 }, { note: 494, dur: 0.5 }, // B-C-B 回顾
      { note: 440, dur: 0.5 }, { note: 392, dur: 0.6 }, { note: 440, dur: 1.0 }, // A-G-A 循环锚点
    ],
    // 🎸 低音：稳定的根音交替
    bass: [
      { note: 220, dur: 2.0 }, { note: 196, dur: 2.0 }, { note: 175, dur: 2.0 }, { note: 220, dur: 2.0 },
    ],
    // 🎹 Pad：Am→G→F→E 西班牙走向（有回忆的淡淡忧伤感）
    pad: [
      { notes: [220, 262, 330], dur: 2.0 }, // Am
      { notes: [196, 247, 294], dur: 2.0 }, // G
      { notes: [175, 220, 262], dur: 2.0 }, // F
      { notes: [165, 196, 247], dur: 2.0 }, // E
    ],
    // 🥁 Rhythm：温和的 4 拍
    rhythm: [
      { freq: 550, dur: 0.04, vol: 0.01, type: 'square' },
      { freq: 450, dur: 0.04, vol: 0.008, type: 'square' },
      { freq: 550, dur: 0.04, vol: 0.01, type: 'square' },
      { freq: 330, dur: 0.06, vol: 0.013, type: 'triangle' },
    ],
    volume: 0.3,
  },
  pet: {
    label: '萌宠摇篮',
    bpm: 56,
    // 🎵 旋律：C 大调，催眠八音盒风格，简单的音程跳跃
    // 设计意图：最安静的场景，像八音盒在慢慢转，哄宠物（和孩子）入睡
    melody: [
      { note: 523, dur: 1.2 }, // C 八音盒第一个音
      { note: 392, dur: 0.8 }, { note: 523, dur: 0.8 }, // G-C 回到原点
      { note: 659, dur: 1.0 }, { note: 523, dur: 0.8 }, { note: 392, dur: 0.8 }, // E-G-E 摇摆
      { note: 330, dur: 1.0 }, { note: 262, dur: 2.0 }, // E-C 沉入梦乡
    ],
    // 🎸 低音：极慢的呼吸节奏
    bass: [
      { note: 131, dur: 4.0 }, { note: 165, dur: 4.0 }, { note: 131, dur: 4.0 }, { note: 131, dur: 4.0 },
    ],
    // 🎹 Pad：C→C→F→C 永恒回归
    pad: [
      { notes: [131, 165, 196], dur: 4.8 }, // C
      { notes: [175, 220, 262], dur: 4.8 }, // F
    ],
    // 🥁 Rhythm：心跳般的极轻节拍
    rhythm: [
      { freq: 250, dur: 0.1, vol: 0.003, type: 'sine' },
      { freq: 200, dur: 0.12, vol: 0.002, type: 'sine' },
    ],
    volume: 0.2,
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
  if (masterGain) return

  masterGain = ctx.createGain()
  bgmGain = ctx.createGain()
  sfxGain = ctx.createGain()

  bgmGain.connect(masterGain)
  sfxGain.connect(ctx.destination)
  masterGain.connect(ctx.destination)

  // 从 localStorage 恢复偏好
  loadPrefs()
  updateVolumes()
}

/** 加载用户偏好 */
function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const prefs = JSON.parse(raw)
      bgmEnabled = prefs.enabled ?? true
      bgmVolume = prefs.bgmVolume ?? 0.6
      sfxVolume = prefs.sfxVolume ?? 0.8
      masterVolume = prefs.masterVolume ?? 0.8
    }
  } catch (e) {
    console.warn('[BGM] 加载偏好失败:', e)
  }
}

/** 保存用户偏好 */
function savePrefs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      enabled: bgmEnabled,
      bgmVolume,
      sfxVolume,
      masterVolume,
    }))
  } catch (e) {
    console.warn('[BGM] 保存偏好失败:', e)
  }
}

/** 更新所有音量（用户调节后调用） */
function updateVolumes() {
  if (!masterGain || !audioCtx) return
  const now = audioCtx.currentTime
  masterGain.gain.setTargetAtTime(masterVolume, now, 0.05)
  bgmGain.gain.setTargetAtTime(bgmEnabled ? bgmVolume : 0, now, 0.05)
}

// ============================================================
// 合成引擎 v2.0（四层合成）
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

/** 🎵 主旋律层 */
function scheduleMelody(config, startTime) {
  let t = startTime
  for (const n of config.melody) {
    playTone(n.note, n.dur * 0.85, t, 'sine', 0.05)
    t += n.dur
  }
  return t
}

/** 🎹 Pad 和弦垫层（长音铺底，营造氛围） */
function schedulePad(config, startTime, loopDuration) {
  if (!config.pad) return
  let t = startTime
  for (const p of config.pad) {
    // 每个和弦：多个音符同时播放，极低音量
    for (const note of p.notes) {
      playTone(note, p.dur * 0.9, t, 'sine', 0.015)
    }
    t += p.dur
  }
}

/** 🎸 低音伴奏层 */
function scheduleBass(config, startTime) {
  let t = startTime
  for (const n of config.bass) {
    playTone(n.note, n.dur * 0.9, t, 'triangle', 0.03)
    t += n.dur
  }
  return t
}

/** 🥁 Rhythm 打击乐层（轻量节拍） */
function scheduleRhythm(config, startTime, loopDuration) {
  if (!config.rhythm) return
  const beatInterval = 60 / config.bpm
  const beatsPerLoop = loopDuration / beatInterval
  
  let t = startTime
  let beatIndex = 0
  while (t < startTime + loopDuration - 0.01) {
    const hit = config.rhythm[beatIndex % config.rhythm.length]
    // 使用噪声 + 短促振荡器模拟打击乐
    playTone(hit.freq, hit.dur, t, hit.type || 'square', hit.vol)
    t += beatInterval
    beatIndex++
  }
}

/** 调度一个完整循环 */
function scheduleLoop(config) {
  const ctx = getCtx()
  const now = ctx.currentTime
  const loopDuration = calcLoopDuration(config)

  scheduleMelody(config, now)
  schedulePad(config, now, loopDuration)
  scheduleBass(config, now)
  scheduleRhythm(config, now, loopDuration)

  // 预调度下一次循环
  loopTimer = setTimeout(() => {
    if (isPlaying && currentScene === config._sceneKey) {
      scheduleLoop(config)
    }
  }, (loopDuration - 0.15) * 1000)
}

// ============================================================
// 公开 API
// ============================================================

/** 播放场景 BGM（自动 crossfade 500ms） */
export function playBGM(scene) {
  initAudioChain()
  const config = BGM_CONFIGS[scene]
  if (!config) {
    console.warn(`[BGM] 未知场景: ${scene}`)
    return
  }

  if (currentScene === scene && isPlaying) return

  // 🎵 Crossfade 淡出旧曲（500ms）
  if (isPlaying && bgmGain) {
    const ctx = getCtx()
    bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
  }

  // 停止旧循环
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }
  if (fadeTimer) {
    clearTimeout(fadeTimer)
    fadeTimer = null
  }

  // 延迟启动新曲（等待旧曲淡出）
  const fadeOutTime = 300
  fadeTimer = setTimeout(() => {
    stopAllActive()
    currentScene = scene
    isPlaying = true
    config._sceneKey = scene

    // 🎵 Crossfade 淡入新曲（500ms）
    if (bgmGain && bgmEnabled) {
      const ctx = getCtx()
      bgmGain.gain.setValueAtTime(0, ctx.currentTime)
      bgmGain.gain.setTargetAtTime(bgmVolume * config.volume, ctx.currentTime, 0.3)
    }

    scheduleLoop(config)
  }, fadeOutTime)
}

/** 停止 BGM（淡出） */
export function stopBGM() {
  if (!isPlaying || !bgmGain) return
  
  // 清除所有定时器
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = null
  }
  if (fadeTimer) {
    clearTimeout(fadeTimer)
    fadeTimer = null
  }

  // 淡出
  const ctx = getCtx()
  bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1)

  // 延迟停止振荡器
  setTimeout(() => {
    stopAllActive()
    isPlaying = false
    currentScene = null
  }, 400)
}

/** 恢复 BGM（从停止状态） */
export function resumeBGM() {
  if (currentScene) {
    playBGM(currentScene)
  }
}

/** 静音（不改变场景标记） */
export function muteBGM() {
  bgmEnabled = false
  updateVolumes()
  savePrefs()
}

/** 取消静音 */
export function unmuteBGM() {
  bgmEnabled = true
  updateVolumes()
  savePrefs()
  if (currentScene && !isPlaying) {
    playBGM(currentScene)
  }
}

/** 设置 BGM 音量 (0~1) */
export function setBGMVolume(v) {
  bgmVolume = Math.max(0, Math.min(1, v))
  updateVolumes()
  savePrefs()
}

/** 设置 SFX 音量 (0~1) */
export function setSFXVolume(v) {
  sfxVolume = Math.max(0, Math.min(1, v))
  savePrefs()
}

/** 设置主音量 (0~1) */
export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v))
  updateVolumes()
  savePrefs()
}

/** TTS 语音播放时 duck BGM（降低 30%） */
export function duckBGMForSpeech(on) {
  if (!bgmGain || !audioCtx) return
  const config = BGM_CONFIGS[currentScene]
  const target = bgmEnabled ? (on ? bgmVolume * (config?.volume || 0.5) * 0.3 : bgmVolume * (config?.volume || 0.5)) : 0
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

/** 获取 BGM 场景列表 */
export function getBGMScenes() {
  return Object.entries(BGM_CONFIGS).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    bpm: cfg.bpm,
  }))
}
