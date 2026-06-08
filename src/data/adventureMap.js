/**
 * 呦呦英语启蒙 — 冒险地图数据 v2
 *
 * 冒险地图将学习内容可视化为一棵"冒险树"，每个节点代表一个学习场景。
 * 完成场景学习后解锁下一节点，形成清晰的学习路径。
 *
 * 数据结构：
 * - nodes: 地图节点数组
 *   - id: 节点唯一标识
 *   - scene: 对应场景分类 ID（与 words.js 中的 scene 对应）
 *   - categoryId: 对应的分类 ID（animal/fruit/food/clothes/emotions 等）
 *   - label: 显示名称
 *   - emoji: 节点图标
 *   - position: { x, y } 节点在地图中的位置（百分比坐标）
 *   - level: 难度等级 1-3
 *   - words: 单词数量
 *   - required: 前置节点 ID 列表（完成后解锁当前节点）
 *   - rewards: 完成奖励（星星、装扮等）
 *   - type: 节点类型（learn | review | boss | rest）
 *   - story: 场景小故事描述（增强代入感）
 *   - bgEmoji: 背景装饰 emoji
 */

export const ADVENTURE_MAP = {
  title: '呦呦冒险岛',
  description: '完成每个场景的学习，解锁新的冒险！',
  
  // 地图主题
  themes: {
    l1: { name: '新手村', bgGradient: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)', skyColor: '#87CEEB' },
    l2: { name: '奇幻镇', bgGradient: 'linear-gradient(180deg, #BBDEFB 0%, #90CAF9 100%)', skyColor: '#64B5F6' },
    l2_5: { name: '星空顶', bgGradient: 'linear-gradient(180deg, #D1C4E9 0%, #B39DDB 100%)', skyColor: '#7E57C2' },
    boss: { name: '城堡', bgGradient: 'linear-gradient(180deg, #FFCCBC 0%, #FFAB91 100%)', skyColor: '#FF7043' }
  },

  // 地图节点
  nodes: [
    // === L1 基础路径（5个学习 + 1个复习） ===
    {
      id: 'forest',
      scene: 'forest',
      categoryId: 'animal',
      label: '森林探险',
      emoji: '🌲',
      position: { x: 50, y: 90 },
      level: 1,
      words: 10,
      required: [], // 起始节点
      rewards: { stars: 10, xp: 50 },
      type: 'learn',
      story: '呦呦带你在森林里认识小动物们！🐕🐈🐦',
      bgEmoji: '🌿🌳🦊🐿️🍄'
    },
    {
      id: 'orchard',
      scene: 'orchard',
      categoryId: 'fruit',
      label: '果园采摘',
      emoji: '🍎',
      position: { x: 30, y: 75 },
      level: 1,
      words: 10,
      required: ['forest'],
      rewards: { stars: 10, xp: 50 },
      type: 'learn',
      story: '果园里有好多水果，摘一个苹果吧！🍇🍌🍊',
      bgEmoji: '🌳🍎🍐🍊🍋'
    },
    {
      id: 'rainbow',
      scene: 'rainbow',
      categoryId: 'color',
      label: '彩虹桥',
      emoji: '🌈',
      position: { x: 70, y: 75 },
      level: 1,
      words: 10,
      required: ['forest'],
      rewards: { stars: 10, xp: 50 },
      type: 'learn',
      story: '走过彩虹桥，找到所有的颜色！🔴🔵🟡',
      bgEmoji: '🌈☁️✨🎨🖌️'
    },
    {
      id: 'rest-1',
      scene: null,
      categoryId: null,
      label: '星星休息站',
      emoji: '⭐',
      position: { x: 50, y: 68 },
      level: 1,
      words: 0,
      required: ['orchard', 'rainbow'],
      rewards: { stars: 5, xp: 20, cosmetic: 'hat-star' },
      type: 'rest',
      story: '休息一下，呦呦送你一顶星星帽！',
      bgEmoji: '⭐✨💫🌟💤'
    },
    {
      id: 'mirror',
      scene: 'mirror',
      categoryId: 'body',
      label: '镜子屋',
      emoji: '🪞',
      position: { x: 50, y: 60 },
      level: 1,
      words: 10,
      required: ['rest-1'],
      rewards: { stars: 15, xp: 75 },
      type: 'learn',
      story: '照照镜子，认识我们的身体部位！👁️👃👄',
      bgEmoji: '🪞✨👀🧍🪟'
    },
    {
      id: 'home',
      scene: 'home',
      categoryId: 'family',
      label: '温馨小家',
      emoji: '🏠',
      position: { x: 50, y: 45 },
      level: 1,
      words: 10,
      required: ['mirror'],
      rewards: { stars: 15, xp: 75 },
      type: 'learn',
      story: '回到温暖的家，认识家人们！👩👨👶',
      bgEmoji: '🏠👪❤️🛋️🧸'
    },
    // L1 复习节点
    {
      id: 'review-l1',
      scene: null,
      categoryId: null,
      label: 'L1 复习大闯关',
      emoji: '📖',
      position: { x: 20, y: 45 },
      level: 1,
      words: 50,
      required: ['home'],
      rewards: { stars: 30, xp: 150, badge: 'l1-master' },
      type: 'review',
      story: '复习 L1 学过的所有单词，看看还记得吗？',
      bgEmoji: '📖✏️🎯🏆🌟'
    },

    // === L2 进阶路径（7个学习） ===
    {
      id: 'kitchen',
      scene: 'kitchen',
      categoryId: 'food',
      label: '魔法厨房',
      emoji: '🍽️',
      position: { x: 25, y: 30 },
      level: 2,
      words: 10,
      required: ['home'],
      rewards: { stars: 15, xp: 80 },
      type: 'learn',
      story: '厨房里飘出香味，认识各种食物吧！🍞🥛🍕',
      bgEmoji: '🍳👨‍🍳🍽️🥣🧁'
    },
    {
      id: 'city',
      scene: 'city',
      categoryId: 'transport',
      label: '城市街道',
      emoji: '🚗',
      position: { x: 75, y: 30 },
      level: 2,
      words: 10,
      required: ['home'],
      rewards: { stars: 15, xp: 80 },
      type: 'learn',
      story: '马路上的车来来往往，你认识它们吗？🚂✈️🚢',
      bgEmoji: '🏙️🚗🚌🚦🏠'
    },
    {
      id: 'outdoor',
      scene: 'outdoor',
      categoryId: 'weather',
      label: '户外天气',
      emoji: '🌤️',
      position: { x: 50, y: 15 },
      level: 2,
      words: 10,
      required: ['kitchen', 'city'],
      rewards: { stars: 20, xp: 100 },
      type: 'learn',
      story: '天气变化多端，晴天雨天都好玩！☀️🌧️🌨️',
      bgEmoji: '☀️🌧️🌈❄️💨'
    },
    {
      id: 'rest-2',
      scene: null,
      categoryId: null,
      label: '彩虹补给站',
      emoji: '🎁',
      position: { x: 50, y: 7 },
      level: 2,
      words: 0,
      required: ['outdoor'],
      rewards: { stars: 8, xp: 30, cosmetic: 'scarf-rainbow' },
      type: 'rest',
      story: '辛苦啦！呦呦给你一条彩虹围巾~',
      bgEmoji: '🎁🎀🌈✨🧣'
    },
    {
      id: 'classroom',
      scene: 'classroom',
      categoryId: 'numbers',
      label: '数字课堂',
      emoji: '🔢',
      position: { x: 25, y: 0 },
      level: 2,
      words: 10,
      required: ['rest-2'],
      rewards: { stars: 20, xp: 100 },
      type: 'learn',
      story: '一二三，数星星！一起来学数字吧！1️⃣2️⃣3️⃣',
      bgEmoji: '📐✏️🔢📊🎓'
    },
    {
      id: 'playground',
      scene: 'playground',
      categoryId: 'actions',
      label: '欢乐操场',
      emoji: '🏃',
      position: { x: 75, y: 0 },
      level: 2,
      words: 10,
      required: ['rest-2'],
      rewards: { stars: 20, xp: 100 },
      type: 'learn',
      story: '跑跑跳跳，学动作真开心！🏃🤸💃',
      bgEmoji: '🏃🤸⚽🎾🏆'
    },
    {
      id: 'bedroom',
      scene: 'bedroom',
      categoryId: 'clothes',
      label: '穿衣镜',
      emoji: '👕',
      position: { x: 38, y: -5 },
      level: 2,
      words: 10,
      required: ['classroom'],
      rewards: { stars: 20, xp: 100 },
      type: 'learn',
      story: '今天穿什么呢？漂亮的衣服在等你！👗🎩👟',
      bgEmoji: '👕👗👟🎩🧣'
    },
    {
      id: 'heart',
      scene: 'heart',
      categoryId: 'emotions',
      label: '心情花园',
      emoji: '😊',
      position: { x: 62, y: -5 },
      level: 2,
      words: 10,
      required: ['playground'],
      rewards: { stars: 20, xp: 100 },
      type: 'learn',
      story: '开心、难过、兴奋...认识你的情绪吧！😊😢🤩',
      bgEmoji: '😊💖🌸🦋🌻'
    },

    // === L2.5 复习节点 ===
    {
      id: 'review-l2',
      scene: null,
      categoryId: null,
      label: 'L2 复习大闯关',
      emoji: '📚',
      position: { x: 50, y: -2 },
      level: 2,
      words: 70,
      required: ['bedroom', 'heart'],
      rewards: { stars: 50, xp: 200, badge: 'l2-master' },
      type: 'review',
      story: 'L2 全部学完啦！来复习一下吧！',
      bgEmoji: '📚🏆🌟🎊✨'
    },

    // === Boss 关卡 ===
    {
      id: 'boss-castle',
      scene: null,
      categoryId: null,
      label: '最终挑战',
      emoji: '🏰',
      position: { x: 50, y: -15 },
      level: 3,
      words: 0,
      required: ['review-l2'],
      rewards: { stars: 100, xp: 500, badge: 'adventure-complete', cosmetic: 'crown-gold' },
      type: 'boss',
      story: '你准备好挑战最终 Boss 了吗？加油！💪🔥',
      bgEmoji: '🏰🔥⚔️👑🌟'
    }
  ],

  // 地图装饰（背景元素，不参与交互）
  decorations: [
    { emoji: '☁️', positions: [{ x: 15, y: 85 }, { x: 85, y: 80 }, { x: 40, y: 92 }] },
    { emoji: '🌸', positions: [{ x: 10, y: 70 }, { x: 90, y: 65 }] },
    { emoji: '🦋', positions: [{ x: 35, y: 72 }, { x: 65, y: 68 }] },
    { emoji: '🌻', positions: [{ x: 20, y: 50 }, { x: 80, y: 48 }] },
    { emoji: '🍄', positions: [{ x: 42, y: 85 }, { x: 58, y: 82 }] },
    { emoji: '⭐', positions: [{ x: 10, y: 20 }, { x: 90, y: 15 }, { x: 50, y: -10 }] },
    { emoji: '🌈', positions: [{ x: 50, y: 5 }] },
  ]
}

// 节点状态枚举
export const NODE_STATUS = {
  locked: 'locked',       // 未解锁
  available: 'available', // 可学习
  completed: 'completed', // 已完成
  current: 'current'      // 进行中
}

// 节点类型样式
export const NODE_STYLES = {
  learn: { color: '#4CAF50', emoji: '📚', label: '学习' },
  review: { color: '#2196F3', emoji: '🔄', label: '复习' },
  boss: { color: '#FF5722', emoji: '⭐', label: '挑战' },
  rest: { color: '#9C27B0', emoji: '🎁', label: '休息' }
}

/**
 * 计算节点状态
 * @param {Object} node - 节点数据
 * @param {Set} completedNodes - 已完成的节点 ID 集合
 * @returns {string} 节点状态
 */
export function getNodeStatus(node, completedNodes) {
  if (completedNodes.has(node.id)) {
    return NODE_STATUS.completed
  }
  
  // 检查前置节点是否都完成
  const allRequiredCompleted = node.required.every(reqId => completedNodes.has(reqId))
  if (!allRequiredCompleted) {
    return NODE_STATUS.locked
  }
  
  return NODE_STATUS.available
}

/**
 * 获取连接线路径
 * @param {Object} fromNode - 起始节点
 * @param {Object} toNode - 目标节点
 * @returns {string} SVG 路径
 */
export function getLinePath(fromNode, toNode) {
  const x1 = fromNode.position.x
  const y1 = fromNode.position.y
  const x2 = toNode.position.x
  const y2 = toNode.position.y
  
  // 创建曲线连接
  const midY = (y1 + y2) / 2
  return `M ${x1} ${y1} Q ${x1} ${midY} ${x2} ${y2}`
}
