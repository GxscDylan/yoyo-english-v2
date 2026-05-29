<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="loading-overlay" @click="handleClick">
      <div class="loading-content">
        <!-- 呦呦思考动画 -->
        <div class="yoyo-thinking">
          <div class="yoyo-bounce">🐯</div>
          <div class="thought-bubble">
            <span class="thought-dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.3}s` }">.</span>
          </div>
        </div>
        
        <!-- 趣味文案 -->
        <p class="loading-text">{{ loadingText }}</p>
        
        <!-- 进度点动画 -->
        <div class="loading-dots">
          <span class="dot" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.2}s` }"></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['timeout'])

// 趣味加载文案
const loadingTexts = [
  '呦呦正在整理单词卡片...',
  '正在给英语学习加点魔法✨',
  '稍等一下，呦呦在准备惊喜~',
  '正在加载有趣的英语内容...',
  '呦呦在知识的海洋里打捞~',
  '马上就好，呦呦在努力中...',
  '正在打开英语冒险大门...',
  '呦呦说：好戏即将上演！🎬',
  '正在召唤英语小精灵~',
  '别急，呦呦在给你准备礼物🎁',
  '英语学习列车即将出发~ 🚂',
  '呦呦在后台忙得团团转~',
  '正在施放英语魔法咒语~ ✨',
  '嘘...呦呦在准备秘密武器🤫'
]

const textIndex = ref(0)
const loadingText = computed(() => loadingTexts[textIndex.value])

let intervalId = null
let timeoutId = null

onMounted(() => {
  // 每 3 秒切换一次文案
  intervalId = setInterval(() => {
    textIndex.value = (textIndex.value + 1) % loadingTexts.length
  }, 3000)
  
  // 超过 10 秒自动超时
  timeoutId = setTimeout(() => {
    emit('timeout')
  }, 10000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (timeoutId) clearTimeout(timeoutId)
})

// 点击可提前结束
function handleClick() {
  emit('timeout')
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg, 16px);
}

/* 呦呦弹跳动画 */
.yoyo-thinking {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.yoyo-bounce {
  font-size: 4rem;
  animation: yoyoBounce 1.2s ease-in-out infinite;
  user-select: none;
}

@keyframes yoyoBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-15px) rotate(-3deg); }
  75% { transform: translateY(-5px) rotate(3deg); }
}

/* 思考气泡点 */
.thought-bubble {
  display: flex;
  gap: 2px;
  font-size: 2rem;
  color: var(--color-primary, #FF8C42);
  font-weight: bold;
}

.thought-dot {
  animation: thoughtPop 1.5s ease-in-out infinite;
}

@keyframes thoughtPop {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.3; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* 加载文案 */
.loading-text {
  font-size: var(--font-size-lg, 16px);
  color: var(--text-primary, #1d1d1f);
  font-weight: 500;
  text-align: center;
  animation: fadeInText 0.5s ease;
}

@keyframes fadeInText {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 进度点 */
.loading-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary, #FF8C42);
  animation: dotBounce 1.4s ease-in-out infinite;
}

.dot:nth-child(2) { animation-delay: 0.16s; }
.dot:nth-child(3) { animation-delay: 0.32s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* 过渡动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
