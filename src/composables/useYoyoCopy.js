/**
 * P2-1: 情境微文案系统
 *
 * 根据当前场景（首次/复习/游戏/完成/错误/时间段/进度）
 * 动态生成呦呦气泡文案，替换固定文案
 */

import { computed } from 'vue'

// ============================================================
// 时间段问候
// ============================================================

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
  early_morning: [
    '这么早就来学习，太厉害了！🌅',
    '早安！新的一天，新的冒险~',
    '小太阳起得真早！呦呦也醒了 ☀️'
  ],
  morning: [
    '上午好！准备好学新单词了吗？📚',
    '早上好呀！今天想学点什么呢？',
    '精神满满的上午，开始吧！💪'
  ],
  noon: [
    '中午好~ 吃饱了更有力气学习！🍱',
    '午休前来学几个单词吧~',
    '吃完午饭休息一下，然后继续探险~'
  ],
  afternoon: [
    '下午好！继续加油吧~ 🌈',
    '下午茶时间~ 学几个单词当点心 🍪',
    '阳光暖暖的，和你一起学刚刚好 ☀️'
  ],
  evening: [
    '晚上好！今天学得怎么样？🌙',
    '傍晚好~ 再来复习一下吧！',
    '辛苦一天了，再巩固一下~ ⭐'
  ],
  night: [
    '哇，这么晚还在学习！注意休息哦~ 🌟',
    '睡前再复习一下，记得更牢哦！',
    '夜深了，学完这几个就休息吧~ 🌙'
  ]
}

// ============================================================
// 场景文案库
// ============================================================

const contextCopy = {
  // 首次使用
  first_use: [
    '你好呀！我是呦呦~ 我们做朋友吧！🐯',
    '欢迎来到英语世界！和我一起探险吧~',
    '第一次见面！我好开心呀~ 🎉'
  ],

  // 回归（非首次）
  welcome_back: [
    '你回来啦！我好想你~ 🐯',
    '又见面了！今天学点什么呢？',
    '等你好久了！我们开始吧~ ⭐',
    '哇！今天又来啦，真棒！👏'
  ],

  // 学习中 — 鼓励
  learning_encourage: [
    '加油！你学得真快！',
    '这个单词你会了吗？试试看~',
    '认真学习的你最可爱！📚',
    '再来一个！你可以的~ 💪',
    '哇，你越来越厉害了！'
  ],

  // 学习中 — 完成一个步骤
  step_complete: [
    '太棒了！继续~ ⭐',
    '做得好！下一个！',
    '完美！你真聪明~ 🧠',
    '又学会了一步！加油~ 🚀',
    '厉害！keep going! 🌟'
  ],

  // 学习中 — 读对了
  pronounce_correct: [
    '发音真标准！像小老外一样~ 🌍',
    '太厉害了！说得好好！',
    'perfect！你的英语真好！👏',
    '哇！读得好棒！再来一次~ 🎤'
  ],

  // 学习中 — 读错了/需要重试
  pronounce_retry: [
    '没关系，再试一次~ 你可以的！',
    '差一点点就对啦，再试试~ 💪',
    '不着急，慢慢来~ 跟我再读一次',
    '加油！再来一遍肯定行！🌟'
  ],

  // 复习 — 开始
  review_start: [
    '复习时间到！看看还记得多少~ 📝',
    '来复习吧！记忆大师就是你~',
    '温故知新，复习也很重要哦！'
  ],

  // 复习 — 全对
  review_perfect: [
    '全部答对了！记忆超人！🦸',
    '太厉害了！一个都没忘！🎉',
    '满分！你的记忆力超强！🧠'
  ],

  // 复习 — 有遗忘
  review_missed: [
    '有几个忘了，不过没关系~ 多复习就好！',
    '忘掉的再学一遍，下次一定记住！💪',
    '复习就是为了记住，继续加油~'
  ],

  // 游戏 — 开始
  game_start: [
    '游戏时间！准备好了吗？🎮',
    '开始玩啦！看看能得多少分~',
    'Let\'s play! 你能行的！🎯'
  ],

  // 游戏 — 答对
  game_correct: [
    '答对了！你真聪明！⭐',
    'Perfect！就是这样~ 🎯',
    '太棒了！继续保持~ 🔥',
    'Bingo！答对啦！🌟'
  ],

  // 游戏 — 答错
  game_wrong: [
    '没关系！下一题一定行！',
    '答错了也没关系，学到了就好~ 💪',
    '再想想，你可以的！🤔',
    'Oops！下次一定对~ 🌈'
  ],

  // 游戏 — Combo 连击
  game_combo: [
    '连击！你太猛了！🔥',
    'Combo！根本停不下来！⚡',
    '厉害厉害！连续答对！💥',
    '无敌连击！谁也挡不住你！🚀'
  ],

  // 游戏 — 满分通关
  game_perfect: [
    '满分通关！你是游戏王者！👑',
    '全部答对！太了不起了！🏆',
    'Perfect Game！无人能敌！🌟'
  ],

  // 完成一节课
  lesson_complete: [
    '太棒了！这节课学完啦！🎉',
    '恭喜你完成了！真了不起！🌟',
    '学完了！你今天好努力呀！💪',
    '又完成一课！离目标更近了！🚀'
  ],

  // 解锁新分类
  category_unlock: [
    '新关卡解锁！快去看看吧！🔓',
    '恭喜解锁新内容！冒险继续~ 🗺️',
    '新的一页打开了！准备好了吗？📖'
  ],

  // 获得星星
  star_earned: [
    '又得到一颗星星！继续收集吧~ ⭐',
    '闪闪发光的星星是你的！🌟',
    '好棒！星星越来越多啦~ ✨'
  ],

  // 连续打卡
  streak_celebrate: [
    '连续打卡！坚持就是胜利！🔥',
    '每天都在进步，真了不起！📈',
    '坚持学习的好习惯！呦呦为你骄傲~ 💪'
  ],

  // 空状态 — 没学过
  empty_no_learn: [
    '还没有开始学习呢~ 选个分类开始吧！',
    '新的冒险在等你！点一个分类试试~',
    '万事开头难，但呦呦相信你可以的~ 💪'
  ],

  // 空状态 — 全部掌握
  empty_all_mastered: [
    '所有单词都掌握了！太厉害了！🎉',
    '你是单词大师！要不要挑战游戏？',
    '全部通关！去找点新挑战吧~ 🗺️'
  ],

  // 休息时间提醒
  rest_remind: [
    '学了这么久，休息一下眼睛吧~ 👀',
    '该让眼睛放松一下啦！看看远处~ 🌿',
    '休息也是学习的一部分哦~ 💤'
  ]
}

// ============================================================
// 工具函数
// ============================================================

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ============================================================
// 主 composable
// ============================================================

/**
 * 情境微文案系统
 * @param {object} store - Pinia learning store 实例
 */
export function useYoyoCopy(store) {
  /** 根据上下文获取欢迎文案 */
  function getWelcomeBubble() {
    // 首次使用
    if (store.isFirstUse) {
      return randomPick(contextCopy.first_use)
    }
    // 根据时间段 + 学习状态组合
    const period = getTimePeriod()
    const greeting = randomPick(timeGreetings[period] || timeGreetings.morning)

    // 如果有进度，加上进度相关
    const mastered = store.masteredWordCount || 0
    if (mastered >= 100) {
      return greeting + ' 已经掌握' + mastered + '个单词了，太厉害了！'
    }
    if (mastered >= 50) {
      return greeting + ' 学会了' + mastered + '个单词，继续加油~'
    }
    if (mastered > 0) {
      return greeting
    }
    // 还没学过
    return greeting + ' 选一个分类开始吧~'
  }

  /** 根据场景获取文案 */
  function getBubble(context) {
    const pool = contextCopy[context]
    if (!pool) return ''
    return randomPick(pool)
  }

  /** 获取学习过程中的鼓励文案（根据进度动态调整） */
  function getLearningBubble(stepIndex, totalSteps) {
    const progress = stepIndex / totalSteps
    if (progress < 0.25) return getBubble('learning_encourage')
    if (progress < 0.5) return getBubble('step_complete')
    if (progress < 0.75) return randomPick(['过半了！你真棒！继续~ 🌟', '一半都学完了！加油！💪', '超过一半了，太厉害了！'])
    return randomPick(['快要学完了！冲刺！🚀', '最后几个了！加油加油！🔥', '马上就完成啦！你太棒了！⭐'])
  }

  /** 获取游戏过程中的文案 */
  function getGameBubble(result, combo = 0) {
    if (result === 'correct') {
      if (combo >= 5) return getBubble('game_combo')
      if (combo >= 3) return randomPick(['连击！继续保持！🔥', '连续答对！太厉害了！⚡'])
      return getBubble('game_correct')
    }
    if (result === 'wrong') return getBubble('game_wrong')
    if (result === 'perfect') return getBubble('game_perfect')
    return getBubble('game_start')
  }

  /** 获取复习结果文案 */
  function getReviewBubble(correctCount, totalCount) {
    if (totalCount === 0) return getBubble('review_start')
    const ratio = correctCount / totalCount
    if (ratio >= 1) return getBubble('review_perfect')
    if (ratio >= 0.7) return randomPick(['大部分都记住了！真棒！⭐', '记得不错哦！继续巩固~ 📚'])
    return getBubble('review_missed')
  }

  /** 获取成就解锁庆祝文案 */
  function getAchievementBubble(achievementName) {
    return `恭喜解锁成就「${achievementName}」！你太棒了！🎉`
  }

  /** 获取连续打卡庆祝文案 */
  function getStreakBubble(days) {
    if (days >= 30) return '连续学习30天！你是真正的学习达人！🏆'
    if (days >= 14) return '连续两周！坚持的力量太可怕了！🔥'
    if (days >= 7) return '连续一周了！好习惯正在养成~ 💪'
    if (days >= 3) return `已经连续${days}天啦！继续坚持~ ⭐`
    return `连续学习${days}天！好的开始！🌟`
  }

  /** 获取休息时间文案 */
  function getRestBubble() {
    return randomPick(contextCopy.rest_remind)
  }

  /** 获取 LearnView 各步骤的情境文案 */
  function getLearnStepBubble(round, step) {
    // Round 0: 初次展示
    if (round === 0) {
      return randomPick([
        '看，这是什么呀？👀',
        '仔细看看这个~ 🔍',
        '认识一下新朋友吧~ 🐯'
      ])
    }
    // Round 1: 测试找一找
    if (round === 1) {
      return randomPick([
        '听一听，找一找！👂',
        '哪个是对的呢？🤔',
        '竖起耳朵听哦~ 🎧'
      ])
    }
    // Round 2: 集体跟读
    if (round === 2) {
      return randomPick([
        '跟我一起读！🎤',
        '大声读出来~ 💪',
        '该你说了！我在听哦~ 👂'
      ])
    }
    // Round 3: 独立回忆
    if (round === 3) {
      return randomPick([
        '你能说出来吗？🧠',
        '试试看，还记得吗？💭',
        '不看书，还能说出来吗~ 🌟'
      ])
    }
    return ''
  }

  /** 获取完成课程庆祝文案（带分类名） */
  function getCompleteBubble(categoryName) {
    const templates = [
      `全部完成！${categoryName}太棒了！🎉`,
      `${categoryName}学完了！你太厉害了！🌟`,
      `恭喜！${categoryName}全部拿下！💪`,
      `${categoryName}通关！呦呦为你骄傲！🏆`
    ]
    return randomPick(templates)
  }

  /** 获取答错后的鼓励文案 */
  function getWrongBubble() {
    return randomPick([
      '没关系，听一听记住它~ 👂',
      '答错了也没关系，学到了就好 💪',
      '再想想，你可以的！🤔',
      'Oops！下次一定对~ 🌈'
    ])
  }

  /** 获取跟读中的文案 */
  function getSpeakingBubble() {
    return randomPick([
      '我在听你说… 👂',
      '大声说出来！🎤',
      '嗯嗯，继续~ 💬'
    ])
  }

  /** 获取跟读结果文案 */
  function getSpeakResultBubble(success) {
    if (success) {
      return randomPick(contextCopy.pronounce_correct)
    }
    return randomPick(contextCopy.pronounce_retry)
  }

  return {
    getWelcomeBubble,
    getBubble,
    getLearningBubble,
    getGameBubble,
    getReviewBubble,
    getAchievementBubble,
    getStreakBubble,
    getRestBubble,
    getTimeGreeting: () => randomPick(timeGreetings[getTimePeriod()] || timeGreetings.morning),
    getLearnStepBubble,
    getCompleteBubble,
    getWrongBubble,
    getSpeakingBubble,
    getSpeakResultBubble
  }
}
