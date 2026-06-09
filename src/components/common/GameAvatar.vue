<template>
  <div class="game-avatar">
    <!-- 老虎头像 -->
    <div class="game-tiger" :class="`game-mood-${mood}`">
      <div class="game-tiger-body">
        <!-- 表情图标（游戏专属） -->
        <span v-if="gameIcon" class="game-icon">{{ gameIcon }}</span>
        
        <!-- 老虎脸部 -->
        <div class="game-face">
          <!-- 条纹 -->
          <span class="game-stripe game-stripe-l1"></span>
          <span class="game-stripe game-stripe-l2"></span>
          <span class="game-stripe game-stripe-r1"></span>
          <span class="game-stripe game-stripe-r2"></span>
          
          <!-- 耳朵 -->
          <span class="game-ear game-ear-left"></span>
          <span class="game-ear game-ear-right"></span>
          
          <!-- 眼睛 -->
          <span class="game-eye game-eye-left">
            <span class="game-pupil"></span>
            <span class="game-shine"></span>
          </span>
          <span class="game-eye game-eye-right">
            <span class="game-pupil"></span>
            <span class="game-shine"></span>
          </span>
          
          <!-- 鼻子 -->
          <span class="game-nose"></span>
          
          <!-- 嘴巴 -->
          <span class="game-mouth"></span>
          
          <!-- 腮红 -->
          <span class="game-blush game-blush-left"></span>
          <span class="game-blush game-blush-right"></span>
        </div>
      </div>
      
      <!-- 游戏进度徽章 -->
      <div v-if="showScore" class="game-score-badge">
        <span class="score-num">{{ score }}</span>
        <span class="score-label">分</span>
      </div>
    </div>
    
    <!-- 气泡 -->
    <div v-if="bubbleText" class="game-bubble" :class="`game-bubble--${mood}`">
      <div class="game-bubble-shine"></div>
      <p>{{ bubbleText }}</p>
    </div>
    
    <!-- 星星粒子 -->
    <template v-if="showStars">
      <span v-for="i in 3" :key="i" class="game-star"
        :style="{ animationDelay: `${i * 0.15}s`, left: `${25 + i * 22}%` }"></span>
    </template>
    
    <!-- 游戏特效：连击火花 -->
    <div v-if="showCombo" class="game-combo-spark">
      <span v-for="i in 5" :key="i" class="combo-particle"
        :style="{ animationDelay: `${i * 0.1}s` }"></span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mood: {
    type: String,
    default: 'idle',
    validator: v => ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy', 'excited', 'win', 'lose'].includes(v)
  },
  bubbleText: { type: String, default: '' },
  showStars: { type: Boolean, default: false },
  showScore: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  showCombo: { type: Boolean, default: false }
})

const gameIcon = computed(() => {
  const icons = {
    idle: '',
    thinking: '🎯',
    happy: '😄',
    encourage: '💪',
    celebrate: '🎉',
    sleepy: '😴',
    excited: '🔥',
    win: '🏆',
    lose: '😢'
  }
  return icons[props.mood] || ''
})
</script>

<style scoped>
.game-avatar {
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  padding: 12px 0;
  width: 80px;
}

/* ===== 老虎身体 ===== */
.game-tiger {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-tiger-body {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #FFB74D 0%, #FF8F00 60%, #F57C00 100%);
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(255, 140, 66, 0.3),
    inset 0 -2px 5px rgba(0, 0, 0, 0.07),
    inset 0 2px 5px rgba(255, 255, 255, 0.15);
  position: relative;
  transition: transform 0.3s ease;
}

.game-mood-idle .game-tiger-body {
  animation: gameBreathe 2.8s ease-in-out infinite;
}

@keyframes gameBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* ===== 游戏图标 ===== */
.game-icon {
  position: absolute;
  top: -16px;
  font-size: 1.2rem;
  animation: gameIconPop 0.5s ease-out;
  z-index: 10;
}

@keyframes gameIconPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

/* ===== 老虎脸部 ===== */
.game-face {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 条纹 */
.game-stripe {
  position: absolute;
  background: #E65100;
  border-radius: 2px;
  opacity: 0.55;
}
.game-stripe-l1 { width: 2px; height: 7px; top: 8px; left: 9px; transform: rotate(-20deg); }
.game-stripe-l2 { width: 2px; height: 5px; top: 13px; left: 6px; transform: rotate(-10deg); }
.game-stripe-r1 { width: 2px; height: 7px; top: 8px; right: 9px; transform: rotate(20deg); }
.game-stripe-r2 { width: 2px; height: 5px; top: 13px; right: 6px; transform: rotate(10deg); }

/* 耳朵 */
.game-ear {
  position: absolute;
  width: 14px;
  height: 14px;
  background: linear-gradient(145deg, #FFB74D, #FF8F00);
  border-radius: 50%;
  box-shadow: inset 0 1.5px 2.5px rgba(255, 255, 255, 0.28);
  z-index: 0;
}
.game-ear::after {
  content: '';
  position: absolute;
  top: 2.5px; left: 2.5px;
  width: 8px; height: 8px;
  background: #FFCC80;
  border-radius: 50%;
}
.game-ear-left { top: -2px; left: 4.5px; }
.game-ear-right { top: -2px; right: 4.5px; }

/* 眼睛 */
.game-eye {
  position: absolute;
  top: 13px;
  width: 10px;
  height: 10px;
  background: #333;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}
.game-eye-left { left: 10px; }
.game-eye-right { right: 10px; }

.game-pupil {
  position: absolute;
  top: 1.5px; left: 2.5px;
  width: 4px; height: 4px;
  background: #111;
  border-radius: 50%;
}

.game-shine {
  position: absolute;
  top: 0.8px; left: 5px;
  width: 3px; height: 3px;
  background: #FFF;
  border-radius: 50%;
  opacity: 0.9;
}

/* 鼻子 */
.game-nose {
  position: absolute;
  top: 21px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 4px;
  background: #5D4037;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

/* 嘴巴 */
.game-mouth {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 11px;
  height: 5px;
  border-bottom: 1.8px solid #5D4037;
  border-radius: 0 0 10px 10px;
}

/* 腮红 */
.game-blush {
  position: absolute;
  bottom: 13px;
  width: 7px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 138, 101, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
}
.game-blush-left { left: 4px; }
.game-blush-right { right: 4px; }

/* ===== 游戏分数徽章 ===== */
.game-score-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 12px;
  padding: 2px 8px;
  display: flex;
  align-items: baseline;
  gap: 2px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  animation: scoreBadgePop 0.3s ease-out;
}

@keyframes scoreBadgePop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.score-num {
  font-size: 0.8rem;
  font-weight: 800;
  color: #FFF;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.score-label {
  font-size: 0.5rem;
  color: rgba(255,255,255,0.9);
}

/* ===== 情绪状态 ===== */
.game-mood-happy .game-tiger-body {
  animation: gameHappyBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes gameHappyBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.09); }
  100% { transform: scale(1); }
}

.game-mood-happy .game-eye {
  height: 3px;
  border-radius: 8px 8px 0 0;
  background: transparent;
  border-top: 2px solid #333;
}
.game-mood-happy .game-pupil,
.game-mood-happy .game-shine { display: none; }
.game-mood-happy .game-mouth {
  height: 7px;
  border-bottom-width: 2px;
  background: #E53935;
  border: none;
  border-radius: 0 0 10px 10px;
}
.game-mood-happy .game-blush { opacity: 1; }

.game-mood-celebrate .game-tiger-body {
  animation: gameCelebrate 0.6s ease-in-out infinite;
}

@keyframes gameCelebrate {
  0%, 100% { transform: scale(1) rotate(-3deg); }
  50% { transform: scale(1.06) rotate(3deg); }
}

.game-mood-celebrate .game-eye {
  background: #FFC107;
  width: 8px; height: 8px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.game-mood-celebrate .game-pupil,
.game-mood-celebrate .game-shine { display: none; }
.game-mood-celebrate .game-mouth {
  height: 8px;
  background: #E53935;
  border: none;
  border-radius: 0 0 8px 8px;
}
.game-mood-celebrate .game-blush { opacity: 1; }

.game-mood-encourage .game-tiger-body {
  animation: gameNod 1.2s ease-in-out infinite;
}

@keyframes gameNod {
  0%, 100% { transform: translateY(0) rotate(0); }
  30% { transform: translateY(-3px) rotate(-2deg); }
  60% { transform: translateY(0) rotate(2deg); }
}

.game-mood-thinking .game-tiger-body {
  animation: gameTilt 2s ease-in-out infinite;
}

@keyframes gameTilt {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(4deg); }
}
.game-mood-thinking .game-pupil { top: 0.5px; left: 3px; }

.game-mood-sleepy .game-tiger-body {
  animation: gameSleepy 3s ease-in-out infinite;
}

@keyframes gameSleepy {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.97); }
}
.game-mood-sleepy .game-eye {
  height: 1.5px;
  border-radius: 1.5px;
  background: #333;
}
.game-mood-sleepy .game-pupil,
.game-mood-sleepy .game-shine { display: none; }
.game-mood-sleepy .game-mouth {
  height: 3px;
  border-bottom-width: 1.2px;
}

.game-mood-excited .game-tiger-body {
  animation: gameExcitedJump 0.4s ease-out infinite alternate;
}

@keyframes gameExcitedJump {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}
.game-mood-excited .game-eye {
  background: #FFC107;
  width: 8px; height: 8px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.game-mood-excited .game-pupil,
.game-mood-excited .game-shine { display: none; }
.game-mood-excited .game-mouth {
  height: 8px;
  background: #E53935;
  border: none;
  border-radius: 0 0 8px 8px;
}
.game-mood-excited .game-blush { opacity: 1; }

.game-mood-win .game-tiger-body {
  animation: gameWinBounce 0.5s ease-out;
}

@keyframes gameWinBounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.game-mood-win .game-eye {
  height: 3px;
  border-radius: 8px 8px 0 0;
  background: transparent;
  border-top: 2px solid #333;
}
.game-mood-win .game-pupil,
.game-mood-win .game-shine { display: none; }
.game-mood-win .game-mouth {
  height: 7px;
  background: #E53935;
  border: none;
  border-radius: 0 0 10px 10px;
}
.game-mood-win .game-blush { opacity: 1; }

.game-mood-lose .game-tiger-body {
  animation: gameLoseSwing 0.5s ease-out;
}

@keyframes gameLoseSwing {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.game-mood-lose .game-eye {
  height: 3px;
  border-radius: 0 0 8px 8px;
  background: transparent;
  border-bottom: 2px solid #333;
}
.game-mood-lose .game-pupil,
.game-mood-lose .game-shine { display: none; }
.game-mood-lose .game-mouth {
  width: 8px;
  height: 6px;
  border: none;
  border-top: 1.5px solid #5D4037;
  border-radius: 8px 8px 0 0;
}

/* ===== 气泡 ===== */
.game-bubble {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 1.5px solid #FFD93D;
  border-radius: 14px 14px 4px 14px;
  padding: 7px 12px 8px;
  max-width: 200px;
  min-width: 60px;
  box-shadow:
    0 3px 12px rgba(255, 217, 61, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.08);
  animation: gameBubblePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  z-index: 100;
}

@keyframes gameBubblePop {
  0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

.game-bubble::before {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 16px;
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #FFD93D;
}

.game-bubble::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 16px;
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 5.5px solid #FFF9E6;
}

.game-bubble-shine {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 11px;
  height: 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
  pointer-events: none;
}

.game-bubble p {
  font-size: 11px;
  color: #5D4E37;
  line-height: 1.45;
  margin: 0;
  font-weight: 600;
  word-break: break-word;
}

.game-bubble--happy { border-color: #FFD93D; }
.game-bubble--celebrate { 
  border-color: #FFC107; 
  box-shadow: 0 2px 12px rgba(255, 193, 7, 0.3), 0 1px 2px rgba(0,0,0,0.06);
  background: linear-gradient(180deg, #FFF9C4, #FFEB3B);
}
.game-bubble--encourage { border-color: #FFAB40; }
.game-bubble--thinking { border-color: #CE93D8; }
.game-bubble--lose { 
  border-color: #EF9A9A; 
  background: linear-gradient(180deg, #FFEBEE, #FFCDD2);
}

/* ===== 星星粒子 ===== */
.game-star {
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  background: #FFD93D;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: gameStarTwinkle 1.5s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 5;
}

@keyframes gameStarTwinkle {
  0% { opacity: 0.3; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
}

/* ===== 连击火花特效 ===== */
.game-combo-spark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  pointer-events: none;
  z-index: 20;
}

.combo-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD700;
  border-radius: 50%;
  animation: comboSpark 0.6s ease-out forwards;
  opacity: 0;
}

.combo-particle:nth-child(1) { top: 20%; left: 50%; }
.combo-particle:nth-child(2) { top: 50%; right: 10%; }
.combo-particle:nth-child(3) { bottom: 20%; left: 50%; }
.combo-particle:nth-child(4) { top: 50%; left: 10%; }
.combo-particle:nth-child(5) { top: 10%; left: 20%; }

@keyframes comboSpark {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(var(--tx, 20px), var(--ty, 20px));
  }
}

.combo-particle:nth-child(1) { --tx: 0; --ty: -30px; }
.combo-particle:nth-child(2) { --tx: 30px; --ty: 0; }
.combo-particle:nth-child(3) { --tx: 0; --ty: 30px; }
.combo-particle:nth-child(4) { --tx: -30px; --ty: 0; }
.combo-particle:nth-child(5) { --tx: -20px; --ty: -20px; }
</style>