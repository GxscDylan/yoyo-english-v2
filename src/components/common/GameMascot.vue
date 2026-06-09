<template>
  <div class="game-mascot">
    <!-- 老虎头像 -->
    <div class="gm-body" :class="`gm-mood-${mood}`">
      <!-- CSS 绘制的卡通小老虎 -->
      <div class="gm-face">
        <!-- 虎纹条纹 -->
        <span class="gm-stripe gm-stripe-l1"></span>
        <span class="gm-stripe gm-stripe-l2"></span>
        <span class="gm-stripe gm-stripe-r1"></span>
        <span class="gm-stripe gm-stripe-r2"></span>

        <!-- 耳朵 -->
        <span class="gm-ear gm-ear-left"></span>
        <span class="gm-ear gm-ear-right"></span>

        <!-- 眼睛 -->
        <span class="gm-eye gm-eye-left">
          <span class="gm-pupil"></span>
          <span class="gm-shine"></span>
        </span>
        <span class="gm-eye gm-eye-right">
          <span class="gm-pupil"></span>
          <span class="gm-shine"></span>
        </span>

        <!-- 鼻子 -->
        <span class="gm-nose"></span>

        <!-- 嘴巴 -->
        <span class="gm-mouth"></span>

        <!-- 腮红 -->
        <span class="gm-blush gm-blush-left"></span>
        <span class="gm-blush gm-blush-right"></span>
      </div>
    </div>

    <!-- 气泡 -->
    <div v-if="bubbleText" class="gm-bubble" :class="`gm-bubble--${mood}`">
      <div class="gm-bubble-shine"></div>
      <p>{{ bubbleText }}</p>
    </div>

    <!-- 星星粒子 -->
    <template v-if="showStars">
      <span v-for="i in 3" :key="i"
        class="gm-star"
        :style="{ animationDelay: `${i * 0.15}s`, left: `${25 + i * 22}%` }"></span>
    </template>
  </div>
</template>

<script setup>
defineProps({
  mood: {
    type: String,
    default: 'idle',
    validator: v => ['idle', 'thinking', 'happy', 'encourage', 'celebrate', 'sleepy'].includes(v)
  },
  bubbleText: { type: String, default: '' },
  showStars: { type: Boolean, default: false }
})
</script>

<style scoped>
/* ===== 容器 ===== */
.game-mascot {
  position: relative;
  display: flex;
  flex-direction: column-reverse; /* 气泡在头像上方 */
  align-items: center;
  padding: 12px 0;
}

/* ===== 老虎身体（渐变圆球） ===== */
.gm-body {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, #FFB74D 0%, #FF8F00 60%, #F57C00 100%);
  border-radius: 50%;
  box-shadow:
    0 4px 12px rgba(255, 140, 66, 0.3),
    inset 0 -2px 5px rgba(0, 0, 0, 0.07),
    inset 0 2px 5px rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

/* 呼吸动效 */
.gm-body.gm-mood-idle {
  animation: gmBreathe 2.8s ease-in-out infinite;
}
@keyframes gmBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* ===== 老虎脸部容器 ===== */
.gm-face {
  position: relative;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 虎纹条纹 */
.gm-stripe {
  position: absolute;
  background: #E65100;
  border-radius: 2px;
  opacity: 0.55;
}
.gm-stripe-l1 { width: 2px; height: 7px; top: 8px; left: 9px; transform: rotate(-20deg); }
.gm-stripe-l2 { width: 2px; height: 5px; top: 13px; left: 6px; transform: rotate(-10deg); }
.gm-stripe-r1 { width: 2px; height: 7px; top: 8px; right: 9px; transform: rotate(20deg); }
.gm-stripe-r2 { width: 2px; height: 5px; top: 13px; right: 6px; transform: rotate(10deg); }

/* 耳朵 */
.gm-ear {
  position: absolute;
  width: 13px;
  height: 13px;
  background: linear-gradient(145deg, #FFB74D, #FF8F00);
  border-radius: 50%;
  box-shadow: inset 0 1.5px 2.5px rgba(255, 255, 255, 0.28);
  z-index: 0;
}
.gm-ear::after {
  content: '';
  position: absolute;
  top: 2.5px; left: 2.5px;
  width: 8px; height: 8px;
  background: #FFCC80;
  border-radius: 50%;
}
.gm-ear-left { top: -2px; left: 4.5px; }
.gm-ear-right { top: -2px; right: 4.5px; }

/* 眼睛 */
.gm-eye {
  position: absolute;
  top: 13px;
  width: 9px;
  height: 9px;
  background: #333;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}
.gm-eye-left { left: 9.5px; }
.gm-eye-right { right: 9.5px; }

.gm-pupil {
  position: absolute;
  top: 1.5px; left: 2.5px;
  width: 4px; height: 4px;
  background: #111;
  border-radius: 50%;
}

.gm-shine {
  position: absolute;
  top: 0.8px; left: 5px;
  width: 3px; height: 3px;
  background: #FFF;
  border-radius: 50%;
  opacity: 0.9;
}

/* 鼻子 */
.gm-nose {
  position: absolute;
  top: 19px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 4px;
  background: #5D4037;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

/* 嘴巴 */
.gm-mouth {
  position: absolute;
  bottom: 9px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 5px;
  border-bottom: 1.8px solid #5D4037;
  border-radius: 0 0 10px 10px;
}

/* 腮红 */
.gm-blush {
  position: absolute;
  bottom: 12px;
  width: 7px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 138, 101, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
}
.gm-blush-left { left: 3px; }
.gm-blush-right { right: 3px; }

/* ===== 情绪状态 ===== */

/* happy — 弯眼 + 大嘴微笑 */
.gm-mood-happy .gm-body { animation: gmHappyBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes gmHappyBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.09); }
  100% { transform: scale(1); }
}
.gm-mood-happy .gm-eye {
  height: 3px;
  border-radius: 8px 8px 0 0;
  background: transparent;
  border-top: 2px solid #333;
}
.gm-mood-happy .gm-pupil,
.gm-mood-happy .gm-shine { display: none; }
.gm-mood-happy .gm-mouth {
  height: 7px;
  border-bottom-width: 2px;
  background: #E53935;
  border: none;
  border-radius: 0 0 10px 10px;
}
.gm-mood-happy .gm-blush { opacity: 1; }

/* celebrate — 星星眼 */
.gm-mood-celebrate .gm-body { animation: gmCelebrate 0.6s ease-in-out infinite; }
@keyframes gmCelebrate {
  0%, 100% { transform: scale(1) rotate(-3deg); }
  50% { transform: scale(1.06) rotate(3deg); }
}
.gm-mood-celebrate .gm-eye {
  background: #FFC107;
  width: 7px; height: 7px;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
.gm-mood-celebrate .gm-pupil,
.gm-mood-celebrate .gm-shine { display: none; }
.gm-mood-celebrate .gm-mouth {
  height: 8px;
  border-bottom-width: 2px;
  background: #E53935;
  border: none;
  border-radius: 0 0 8px 8px;
}
.gm-mood-celebrate .gm-blush { opacity: 1; }

/* encourage — 眨眼 + 点头 */
.gm-mood-encourage .gm-body { animation: gmNod 1.2s ease-in-out infinite; }
@keyframes gmNod {
  0%, 100% { transform: translateY(0) rotate(0); }
  30% { transform: translateY(-3px) rotate(-2deg); }
  60% { transform: translateY(0) rotate(2deg); }
}
.gm-mood-encourage .gm-eye-left {
  height: 1.5px;
  border-radius: 1.5px;
  background: #333;
  overflow: hidden;
}
.gm-mood-encourage .gm-eye-left .gm-pupil,
.gm-mood-encourage .gm-eye-left .gm-shine { display: none; }

/* thinking — 眼神上移 + 微微倾斜 */
.gm-mood-thinking .gm-body { animation: gmTilt 2s ease-in-out infinite; }
@keyframes gmTilt {
  0%, 100% { transform: rotate(0); }
  50% { transform: rotate(4deg); }
}
.gm-mood-thinking .gm-pupil { top: 0.5px; left: 3px; }

/* sleepy — 闭眼 + 缩小 */
.gm-mood-sleepy .gm-body { animation: gmSleepy 3s ease-in-out infinite; }
@keyframes gmSleepy {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.97); }
}
.gm-mood-sleepy .gm-eye {
  height: 1.5px;
  border-radius: 1.5px;
  background: #333;
}
.gm-mood-sleepy .gm-pupil,
.gm-mood-sleepy .gm-shine { display: none; }
.gm-mood-sleepy .gm-mouth {
  height: 3px;
  border-bottom-width: 1.2px;
}

/* ===== 气泡 ===== */
.gm-bubble {
  position: absolute;
  bottom: calc(100% + 8px); /* 气泡在头像上方 */
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF9E6 100%);
  border: 1.5px solid #FFD93D;
  border-radius: 14px 14px 4px 14px; /* 左下角为尖角 */
  padding: 7px 12px 8px;
  max-width: 280px; /* 增大宽度，让长文本尽量单行或少换行 */
  min-width: 80px;
  box-shadow:
    0 3px 12px rgba(255, 217, 61, 0.25),
    0 1px 3px rgba(0, 0, 0, 0.08);
  animation: gmBubblePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  z-index: 100;
}
@keyframes gmBubblePop {
  0% { transform: translateX(-50%) scale(0.6); opacity: 0; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

/* 气泡三角箭头 - 指向下方偏左 */
.gm-bubble::before {
  content: '';
  position: absolute;
  bottom: -7px; /* 箭头在底部 */
  left: 20px; /* 箭头偏左，对应圆角位置 */
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 7px solid #FFD93D;
}
.gm-bubble::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 20px;
  transform: rotate(180deg);
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 5.5px solid #FFF9E6;
}

/* 高光 */
.gm-bubble-shine {
  position: absolute;
  top: 3px;
  left: 4px;
  width: 11px;
  height: 6px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 5px;
  pointer-events: none;
}

/* 气泡文字 */
.gm-bubble p {
  font-size: 11.5px;
  color: #5D4E37;
  line-height: 1.45;
  margin: 0;
  font-weight: 600;
  word-break: break-word; /* 单词级别断行 */
  overflow-wrap: anywhere; /* 允许在任何位置换行 */
  min-height: 1em;
  white-space: normal; /* 允许正常换行 */
}

/* 气泡心情主题色 */
.gm-bubble--happy { border-color: #FFD93D; }
.gm-bubble--celebrate { border-color: #FFC107; box-shadow: 0 2px 12px rgba(255, 193, 7, 0.3), 0 1px 2px rgba(0,0,0,0.06); }
.gm-bubble--encourage { border-color: #FFAB40; }
.gm-bubble--thinking { border-color: #CE93D8; }
.gm-bubble--sleepy { border-color: #B0BEC5; }

/* ===== 星星粒子 ===== */
.gm-star {
  position: absolute;
  top: -3px;
  width: 6px;
  height: 6px;
  background: #FFD93D;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: gmStarTwinkle 1.5s ease-in-out infinite alternate;
  pointer-events: none;
  z-index: 5;
}
@keyframes gmStarTwinkle {
  0% { opacity: 0.3; transform: scale(0.7); }
  100% { opacity: 1; transform: scale(1); }
}
</style>
