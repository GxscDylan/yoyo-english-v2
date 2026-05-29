/**
 * 呦呦英语启蒙 — 语音文案库（v5.0 激励系统）
 *
 * 20 条语音文案，分 5 级强度阶梯：
 *   L1 温暖鼓励（答错/重试）
 *   L2 正常正确（单次答对）
 *   L3 优秀表现（Combo x3）
 *   L4 高光时刻（Combo x5+ / 单轮全对）
 *   L5 传奇时刻（全对通关 / 成就解锁）
 *
 * 音频文件通过 Edge TTS 离线生成（en-US-AnaNeural），
 * 放在 /public/audio/ 目录，PWA 缓存，离线可用。
 * 未生成 MP3 时，useSpeech 自动回退 Web Speech API。
 */

// ─── L1 温暖鼓励 ───────────────────────────────────────────
export const L1_ENCOURAGE = [
  { id: 'try-again',     file: 'try-again.mp3',     text: 'Try again!',         mood: 'encourage' },
  { id: 'almost',        file: 'almost.mp3',        text: 'Almost!',            mood: 'encourage' },
  { id: 'so-close',      file: 'so-close.mp3',      text: 'So close!',          mood: 'encourage' },
  { id: 'you-can-do-it', file: 'you-can-do-it.mp3', text: 'You can do it!',     mood: 'comfort'   },
]

// ─── L2 正常正确 ───────────────────────────────────────────
export const L2_CORRECT = [
  { id: 'great',      file: 'great.mp3',      text: 'Great!',          mood: 'happy' },
  { id: 'good-job',   file: 'good-job.mp3',   text: 'Good job!',       mood: 'happy' },
  { id: 'excellent',  file: 'excellent.mp3',   text: 'Excellent!',      mood: 'happy' },
  { id: 'well-done',  file: 'well-done.mp3',   text: 'Well done!',      mood: 'happy' },
  { id: 'nice-work',  file: 'nice-work.mp3',   text: 'Nice work!',      mood: 'happy' },
  { id: 'awesome',    file: 'awesome.mp3',      text: 'Awesome!',        mood: 'happy' },
]

// ─── L3 优秀表现（Combo x3）────────────────────────────────
export const L3_STREAK = [
  { id: 'on-fire',    file: 'on-fire.mp3',    text: "You're on fire!",  mood: 'excited' },
]

// ─── L4 高光时刻（Combo x5+ / 单轮全对）───────────────────
export const L4_HIGHLIGHT = [
  { id: 'amazing',     file: 'amazing.mp3',     text: 'Amazing!',               mood: 'proud' },
  { id: 'superstar',   file: 'superstar.mp3',   text: "You're a superstar!",    mood: 'proud' },
]

// ─── L5 传奇时刻（全对通关 / 成就解锁）────────────────────
export const L5_LEGENDARY = [
  { id: 'incredible',  file: 'incredible.mp3',  text: 'Incredible!',                mood: 'celebrate' },
  { id: 'champion',    file: 'champion.mp3',     text: "You're a champion!",         mood: 'celebrate' },
  { id: 'wow-perfect', file: 'wow-perfect.mp3',  text: 'Wow, perfect!',              mood: 'celebrate' },
]

// ─── 特殊时刻 ──────────────────────────────────────────────
export const SPECIAL = [
  { id: 'first-time',    file: 'first-time.mp3',    text: 'You learned a new word!',    mood: 'proud'     },
  { id: 'welcome-back',  file: 'welcome-back.mp3',  text: 'Welcome back!',              mood: 'happy'     },
  { id: 'keep-going',    file: 'keep-going.mp3',    text: 'Keep going!',                mood: 'excited'   },
  { id: 'milestone',     file: 'milestone.mp3',     text: 'You reached a milestone!',   mood: 'celebrate' },
]

// ─── 快捷查找 ──────────────────────────────────────────────

/** 按 Level 获取随机一条语音文案 */
export function getPhraseByLevel(level) {
  const pools = {
    1: L1_ENCOURAGE,
    2: L2_CORRECT,
    3: L3_STREAK,
    4: L4_HIGHLIGHT,
    5: L5_LEGENDARY,
  }
  const pool = pools[level] || L2_CORRECT
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 按 ID 查找特定语音文案 */
export function getPhraseById(id) {
  const all = [
    ...L1_ENCOURAGE, ...L2_CORRECT, ...L3_STREAK,
    ...L4_HIGHLIGHT, ...L5_LEGENDARY, ...SPECIAL,
  ]
  return all.find(p => p.id === id) || null
}

/** 获取特殊时刻语音 */
export function getSpecialPhrase(id) {
  return SPECIAL.find(p => p.id === id) || null
}

/** 全部文案列表（用于预加载/调试） */
export const ALL_PHRASES = [
  ...L1_ENCOURAGE, ...L2_CORRECT, ...L3_STREAK,
  ...L4_HIGHLIGHT, ...L5_LEGENDARY, ...SPECIAL,
]
