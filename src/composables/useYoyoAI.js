/**
 * P3: AI 情境对话系统 + 个性化场景 + 动态难度调节
 *
 * - 根据学习进度、连续天数、游戏成绩智能生成鼓励语
 * - 根据宝贝头像风格个性化称呼
 * - 根据表现动态调整呦呦语气（自信时挑战更高，犹豫时更多鼓励）
 */

// ============================================================
// P3-1: AI 情境对话 — 智能文案生成引擎
// ============================================================

// 学习阶段判定
function getLearningStage(mastered) {
  if (mastered === 0) return 'newbie'
  if (mastered < 10) return 'beginner'
  if (mastered < 30) return 'growing'
  if (mastered < 60) return 'intermediate'
  if (mastered < 100) return 'advanced'
  return 'master'
}

// 情绪状态检测（基于正确率和连击）
function detectMood(recentCorrectRate, streak) {
  if (recentCorrectRate < 0.4) return 'frustrated'
  if (recentCorrectRate >= 0.8 && streak >= 3) return 'confident'
  if (recentCorrectRate >= 0.6) return 'steady'
  return 'encouraging'
}

// 时间段
function getTimePeriod() {
  const h = new Date().getHours()
  if (h >= 5 && h < 9) return 'early_morning'
  if (h >= 9 && h < 12) return 'morning'
  if (h >= 12 && h < 14) return 'noon'
  if (h >= 14 && h < 18) return 'afternoon'
  if (h >= 18 && h < 21) return 'evening'
  return 'night'
}

const timeGreetings = {
  early_morning: ['这么早就来学习，太厉害了！🌅', '早安！新的一天，新的冒险~', '小太阳起得真早！☀️'],
  morning: ['上午好！准备好学新单词了吗？📚', '早上好呀！今天想学点什么呢？', '精神满满的上午，开始吧！💪'],
  noon: ['中午好~ 吃饱了更有力气学习！🍱', '午休前来学几个单词吧~'],
  afternoon: ['下午好！继续加油吧~ 🌈', '下午茶时间~ 学几个单词当点心 🍪'],
  evening: ['晚上好！今天学得怎么样？🌙', '傍晚好~ 再来复习一下吧！'],
  night: ['哇，这么晚还在学习！注意休息哦~ 🌟', '睡前再复习一下，记得更牢哦！🌙']
}

// AI 对话模板（阶段 × 情绪 矩阵）
const AI_TEMPLATES = {
  newbie: {
    encouraging: [
      '你好呀！我是呦呦~ 今天是我们第一次见面呢！🐯',
      '欢迎来到英语世界！我会陪你一起学习的~ 🌟',
      '第一次来就很有勇气呢！我们慢慢学~ 💪'
    ],
    steady: [
      '你学得真不错！第一次来就这么棒！⭐',
      '哇，学得真快！继续保持哦~ 🚀',
      '刚开始就做得很好，呦呦好开心~ 🎉'
    ],
    confident: [
      '哇！学得真快！你太聪明了~ 🚀',
      '你是学习小天才！继续冲呀~ 🔥'
    ],
    frustrated: [
      '别着急呀！慢慢来~ 呦呦陪你一起学 💪',
      '没关系！每个人都有一开始学不会的时候~ 🌈'
    ]
  },
  beginner: {
    frustrated: [
      '别着急呀！才学了几个单词，慢慢来~ 💪',
      '没关系！每个人都有一开始学不会的时候~ 🌈',
      '呦呦相信你！再试一次就好了~ 🐯'
    ],
    encouraging: [
      '已经学会了一些单词呢！继续加油~ ⭐',
      '你在进步哦！每天学一点就会越来越多~ 📈',
      '学得真棒！呦呦为你骄傲~ 🎉'
    ],
    steady: [
      '进步真快！已经会了不少单词了~ 🌟',
      '你学得好认真呀！继续保持~ 💪',
      '又学会新单词了！太厉害了！👏'
    ],
    confident: [
      '哇！学得真快！你太聪明了~ 🚀',
      '这么短时间就学会了这么多！厉害！⭐',
      '你是学习小天才！继续冲呀~ 🔥'
    ]
  },
  growing: {
    frustrated: [
      '已经学了这么多单词，偶尔忘几个没关系~ 🌈',
      '没关系！复习一下就会记起来的~ 💪',
      '别灰心！你已经比很多小朋友厉害了~ 🐯'
    ],
    encouraging: [
      '已经会了 {mastered} 个单词了！继续加油~ ⭐',
      '你的进步真明显！每天都能看到你的成长~ 📈',
      '学了这么多，真了不起！继续吧~ 🎉'
    ],
    steady: [
      '{mastered} 个单词！你在稳步前进呢~ 🌟',
      '每天都在进步！这种节奏很好~ 💪',
      '学得又快又好！继续保持哦~ 🚀'
    ],
    confident: [
      '{mastered} 个单词！你越来越厉害了！🔥',
      '太猛了！这个速度下去很快就能通关了！⭐',
      '你是学习小火箭！冲呀~ 🚀'
    ]
  },
  intermediate: {
    frustrated: [
      '已经这么厉害了，偶尔错几个没关系的~ 🌈',
      '你可是会 {mastered} 个单词的人呢！小问题~ 💪',
      '休息一下再继续！你已经很棒了~ 🐯'
    ],
    encouraging: [
      '{mastered} 个单词！已经超过很多小朋友了~ ⭐',
      '你在英语的路上越走越远了！继续加油~ 📚',
      '学了这么多，真不容易！呦呦佩服你~ 🎉'
    ],
    steady: [
      '{mastered} 个单词！稳扎稳打，节奏很好~ 🌟',
      '你在持续进步！继续保持这个速度~ 💪',
      '又向前一步了！离目标越来越近了~ 🚀'
    ],
    confident: [
      '{mastered} 个单词！你是英语小达人！🔥',
      '这么厉害！离通关不远了~ ⭐',
      '太棒了！你是呦呦见过的最厉害的小朋友！👑'
    ]
  },
  advanced: {
    frustrated: [
      '都学到这个程度了，小失误不算什么~ 🌈',
      '你已经很了不起了！放松一下就好~ 💪',
      '呦呦相信你！你可是会 {mastered} 个单词的人~ 🐯'
    ],
    encouraging: [
      '{mastered} 个单词！快到大师级别了！⭐',
      '就差一点点！你马上就是英语大师了~ 📈',
      '哇！学了这么多！继续加油~ 🎉'
    ],
    steady: [
      '{mastered} 个单词！你已经是小老师了~ 🌟',
      '这个水平已经很棒了！继续保持~ 💪',
      '又快又准！你是真正的学习者~ 🚀'
    ],
    confident: [
      '{mastered} 个单词！马上就要通关了！🔥',
      '你是英语小超人！谁也挡不住你！⭐',
      '太厉害了！呦呦要给你鼓掌！👏👏👏'
    ]
  },
  master: {
    frustrated: [
      '你可是英语大师呀！偶尔出错很正常~ 🌈',
      '{mastered} 个单词！你已经超级厉害了~ 💪',
      '休息一下！你已经比大多数人都强了~ 🐯'
    ],
    encouraging: [
      '{mastered} 个单词！你是真正的英语大师！⭐',
      '太了不起了！学了这么多单词~ 🎉',
      '你已经是英语小专家了！继续挑战吧~ 🚀'
    ],
    steady: [
      '{mastered} 个单词！你已经是学霸级别了~ 🌟',
      '每天都在进步！你的坚持太棒了~ 💪',
      '这么厉害！呦呦为你骄傲！👑'
    ],
    confident: [
      '{mastered} 个单词！你是无敌的英语王者！🔥',
      '全部单词都快被你拿下了！太猛了！⭐',
      '呦呦宣布：你是最棒的学习者！🏆'
    ]
  }
}

// 工具函数
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 生成智能鼓励语（P3-1 + P3-3）
 * @param {object} store - learning store
 * @param {object} context - { recentCorrectRate, currentCombo, scenario }
 */
export function generateAIBubble(store, context = {}) {
  const { recentCorrectRate = 0.7, currentCombo = 0, scenario = 'learn' } = context

  const mastered = store.masteredWordCount || 0
  const streak = store.consecutiveDays || 0
  const stage = getLearningStage(mastered)
  const mood = detectMood(recentCorrectRate, currentCombo)

  // 特殊场景优先
  if (scenario === 'welcome') {
    // 连续学习里程碑
    if ([3, 7, 14, 21, 30].includes(streak)) {
      return generateStreakMilestone(streak)
    }
    // 时间段关怀 + 学习阶段文案
    const period = getTimePeriod()
    const timeSpecial = randomPick(timeGreetings[period] || timeGreetings.morning)
    const stageTemplates = AI_TEMPLATES[stage] || AI_TEMPLATES.beginner
    const moodTemplates = stageTemplates[mood] || stageTemplates.encouraging
    let template = randomPick(moodTemplates)
    template = template.replace('{mastered}', mastered)
    // 30% 概率追加个性化称呼
    if (Math.random() > 0.7) {
      const name = getPersonalizedName(store)
      template += '，' + name + '！'
    }
    return timeSpecial + ' ' + template
  }

  // 常规场景
  const stageTemplates = AI_TEMPLATES[stage] || AI_TEMPLATES.beginner
  const moodTemplates = stageTemplates[mood] || stageTemplates.encouraging
  let template = randomPick(moodTemplates)
  template = template.replace('{mastered}', mastered)

  // 30% 概率追加个性化称呼
  if (Math.random() > 0.7) {
    const name = getPersonalizedName(store)
    template += '，' + name + '！'
  }

  return template
}

// 连续学习里程碑文案
function generateStreakMilestone(days) {
  if (days >= 30) return `连续学习${days}天！你是真正的毅力大师！🏆 呦呦为你骄傲！`
  if (days >= 21) return `${days}天了！据说21天养成好习惯！你已经做到了！⭐`
  if (days >= 14) return `连续两周！太厉害了！🔥 坚持的力量太大了！`
  if (days >= 7) return `连续一周啦！🎉 好习惯正在养成呢！`
  if (days >= 3) return `连续${days}天了！继续加油~ ⭐`
  return ''
}

// ============================================================
// P3-2: 个性化场景 — 根据宝贝头像风格个性化称呼
// ============================================================

function getPersonalizedName(store) {
  const avatar = store.avatar
  const gender = store.childGender || 'neutral'

  const names = {
    boy: ['小帅哥', '小男子汉', '小超人', '小勇士'],
    girl: ['小公主', '小仙女', '小甜心', '小天使'],
    neutral: ['小勇士', '小探险家', '小达人', '小明星']
  }

  const pool = names[gender] || names.neutral
  return randomPick(pool)
}

// ============================================================
// P3-3: 动态难度调节 — 根据表现调整呦呦语气
// ============================================================

/**
 * 根据孩子表现动态调整呦呦语气
 * @param {number} recentCorrectRate - 最近正确率 (0-1)
 * @param {number} currentCombo - 当前连击
 * @param {number} masteredCount - 已掌握单词数
 * @returns {object} { mood, tone, bubble }
 */
export function getDynamicTone(recentCorrectRate, currentCombo, masteredCount) {
  const mood = detectMood(recentCorrectRate, currentCombo)

  // 根据情绪决定语气策略
  const toneMap = {
    frustrated: {
      tone: 'gentle', // 温柔鼓励型
      yoyoMood: 'encourage',
      showStars: false,
      bubble: '没关系！再试一次，你可以的~ 💪'
    },
    encouraging: {
      tone: 'supportive', // 支持鼓励型
      yoyoMood: 'happy',
      showStars: true,
      bubble: '加油！你学得真快！⭐'
    },
    steady: {
      tone: 'normal', // 正常互动
      yoyoMood: 'idle',
      showStars: false,
      bubble: '做得好！继续~ 🌟'
    },
    confident: {
      tone: 'challenge', // 挑战激励型
      yoyoMood: 'excited',
      showStars: true,
      bubble: '太猛了！要不要挑战更难一点的？🔥'
    }
  }

  return toneMap[mood] || toneMap.steady
}

/**
 * 生成游戏结果智能点评
 */
export function generateGameFeedback(gameName, score, maxScore, combo) {
  const ratio = score / maxScore

  if (ratio === 1) {
    return `${gameName}满分通关！你是游戏王者！👑`
  }
  if (ratio >= 0.8) {
    if (combo >= 5) {
      return `${gameName}得了${score}分！还有${maxScore - score}分就满分了！刚才的${combo}连击太猛了！🔥`
    }
    return `${gameName}得了${score}分！差一点就满分了！再玩一次吧~ ⭐`
  }
  if (ratio >= 0.6) {
    return `${gameName}得了${score}分！不错的成绩！多玩几次会更好~ 💪`
  }
  return `${gameName}得了${score}分！没关系，多练习就会进步的！呦呦相信你~ 🌈`
}

/**
 * 生成复习结果智能点评
 */
export function generateReviewFeedback(correctCount, totalCount, masteredCount) {
  if (totalCount === 0) return '还没有复习过呢~ 去复习吧！📝'

  const ratio = correctCount / totalCount

  if (ratio === 1) {
    const templates = [
      `全部答对！${totalCount}个单词都记住了！你是记忆大师！🧠`,
      '满分！一个都没忘！太厉害了！🎉',
      `全部正确！你的记忆力真强！已经掌握${masteredCount}个单词了！`
    ]
    return randomPick(templates)
  }
  if (ratio >= 0.8) {
    return `${correctCount}/${totalCount}答对了！大部分都记住了！继续巩固~ ⭐`
  }
  if (ratio >= 0.5) {
    return `答对了${correctCount}个！有些忘了没关系，多复习几次就记住了~ 💪`
  }
  return `答对了${correctCount}个！没关系，复习就是为了记住的！我们再来一次~ 📚`
}
