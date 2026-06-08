/**
 * 宠物学习伴侣 — 在英语学习过程中提供实时互动反馈
 * 
 * 功能：
 * - 答对时：宠物开心/鼓掌/撒花
 * - 答错时：宠物安慰/鼓励
 * - 连续答对：宠物兴奋/特殊动画
 * - 完成课程：宠物庆祝/凯旋
 * - 长时间未操作：宠物打哈欠/提醒
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePetStore } from './usePetStore.js'
import { sfxApplause, sfxFanfare, sfxCheer, sfxTada, sfxYawn } from './useSfx.js'

// 宠物反应配置
const REACTIONS = {
  correct: [
    { emoji: '😊', text: '太棒了！', duration: 2000 },
    { emoji: '👏', text: 'Good job!', duration: 2000 },
    { emoji: '🎉', text: 'Excellent!', duration: 2500 },
    { emoji: '✨', text: 'Amazing!', duration: 2000 },
    { emoji: '💪', text: 'You\'re strong!', duration: 2500 },
  ],
  wrong: [
    { emoji: '😢', text: 'Don\'t worry~', duration: 2500 },
    { emoji: '💪', text: 'Try again!', duration: 2000 },
    { emoji: '🤗', text: 'It\'s ok~', duration: 2500 },
    { emoji: '📚', text: 'Let\'s learn together!', duration: 3000 },
  ],
  streak: [
    { emoji: '🔥', text: 'On fire!', duration: 3000 },
    { emoji: '⭐', text: 'Super star!', duration: 3000 },
    { emoji: '👑', text: 'You\'re a genius!', duration: 3500 },
    { emoji: '🚀', text: 'Unstoppable!', duration: 3000 },
  ],
  complete: [
    { emoji: '🎊', text: 'Lesson complete!', duration: 3500 },
    { emoji: '🏆', text: 'Champion!', duration: 4000 },
    { emoji: '🎉', text: 'Great work today!', duration: 3500 },
  ],
  idle: [
    { emoji: '😴', text: 'Are you still there?', duration: 3000 },
    { emoji: '🥱', text: 'Let\'s continue~', duration: 2500 },
  ],
  milestone: [
    { emoji: '🌟', text: 'New record!', duration: 4000 },
    { emoji: '🎯', text: 'Perfect!', duration: 3500 },
  ]
}

export function usePetCompanion() {
  const petStore = usePetStore()
  
  // 当前反应状态
  const activeReaction = ref(null)
  const showPetBubble = ref(false)
  const streakCount = ref(0)
  let idleTimer = null
  let reactionTimer = null

  // 检查宠物是否已孵化且启用
  const isPetActive = () => {
    const s = petStore.petState.value
    return s && s.enabled && s.petSpecies && !s.isSleeping
  }

  // 获取随机反应
  function getRandomReaction(type) {
    const reactions = REACTIONS[type]
    if (!reactions || reactions.length === 0) return null
    return reactions[Math.floor(Math.random() * reactions.length)]
  }

  // 显示宠物反应
  function showReaction(type, options = {}) {
    if (!isPetActive()) return
    
    // 如果是 streak 类型，检查是否达到阈值
    if (type === 'correct') {
      streakCount.value++
      if (streakCount.value >= 5) {
        type = 'streak'
      } else if (streakCount.value >= 3) {
        // 3连对时偶尔显示 streak 反应
        if (Math.random() < 0.5) type = 'streak'
      }
    }

    const reaction = getRandomReaction(type)
    if (!reaction) return

    activeReaction.value = {
      ...reaction,
      ...options,
      type
    }
    showPetBubble.value = true

    // 播放对应音效
    if (type === 'streak' || type === 'milestone') {
      try { sfxFanfare() } catch(e) {}
    } else if (type === 'complete') {
      try { sfxFanfare(); setTimeout(() => sfxCheer(), 500) } catch(e) {}
    } else if (type === 'correct') {
      try { sfxApplause() } catch(e) {}
    } else if (type === 'idle') {
      try { sfxYawn() } catch(e) {}
    }

    // 自动隐藏
    clearTimeout(reactionTimer)
    reactionTimer = setTimeout(() => {
      hideReaction()
    }, reaction.duration || 2500)
  }

  // 隐藏反应
  function hideReaction() {
    showPetBubble.value = false
    activeReaction.value = null
  }

  // 学习事件处理器
  function onAnswerCorrect() {
    resetIdleTimer()
    showReaction('correct')
    // 给宠物增加少量点赞
    if (isPetActive() && Math.random() < 0.3) {
      petStore.addLikes(1)
    }
  }

  function onAnswerWrong() {
    resetIdleTimer()
    showReaction('wrong')
  }

  function onLessonComplete(lessonData) {
    streakCount.value = 0
    resetIdleTimer()
    showReaction('complete')
    
    // 完成课程时给宠物额外奖励
    if (isPetActive()) {
      petStore.addLikes(3)
    }
  }

  function onMilestone(milestone) {
    streakCount.value = 0
    showReaction('milestone', { text: milestone.text || 'New milestone!' })
  }

  // 空闲计时器
  function resetIdleTimer() {
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      if (isPetActive() && !showPetBubble.value) {
        showReaction('idle')
      }
    }, 60000) // 60秒未操作显示 idle
  }

  onMounted(() => {
    resetIdleTimer()
  })

  onUnmounted(() => {
    clearTimeout(idleTimer)
    clearTimeout(reactionTimer)
  })

  // 重置连击
  function resetStreak() {
    streakCount.value = 0
  }

  return {
    // 状态
    activeReaction,
    showPetBubble,
    streakCount,
    isPetActive,
    
    // 方法
    showReaction,
    hideReaction,
    onAnswerCorrect,
    onAnswerWrong,
    onLessonComplete,
    onMilestone,
    resetStreak,
    resetIdleTimer
  }
}
