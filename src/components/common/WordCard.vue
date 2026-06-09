<template>
  <div class="word-card" @click="handleClick">
    <div class="word-card__emoji">{{ word.emoji }}</div>
    <div class="word-card__content">
      <span class="word-card__en">{{ word.en }}</span>
      <span class="word-card__cn">{{ word.cn }}</span>
    </div>
    <div v-if="isPlaying" class="word-card__wave">
      <span v-for="i in 4" :key="i" class="wave-bar" :style="{ animationDelay: `${i * 0.1}s` }"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTTS } from '@/composables/useTTS'

const props = defineProps({
  word: {
    type: Object,
    default: () => ({ en: 'word', cn: '单词', emoji: '📚' })
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['played', 'click'])

const isPlaying = ref(false)
const { speak } = useTTS()

onMounted(() => {
  if (props.autoPlay && props.word?.en) {
    playAudio()
  }
})

function playAudio() {
  if (!props.word?.en) return
  isPlaying.value = true
  emit('played')
  speak(props.word.en, { rate: 0.8 })
    .then(() => {
      setTimeout(() => {
        isPlaying.value = false
      }, 300)
    })
}

function handleClick() {
  if (!isPlaying.value) {
    playAudio()
  }
  emit('click')
}
</script>

<style scoped>
.word-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 48px;
  background: linear-gradient(145deg, #FFFFFF 0%, #FFF8F0 100%);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(139, 115, 85, 0.12),
    0 2px 8px rgba(139, 115, 85, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  user-select: none;
}

.word-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 40px rgba(139, 115, 85, 0.16),
    0 4px 12px rgba(139, 115, 85, 0.1);
}

.word-card:active {
  transform: translateY(-2px);
}

.word-card__emoji {
  font-size: 4.5rem;
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.word-card:hover .word-card__emoji {
  transform: scale(1.1);
}

.word-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.word-card__en {
  font-size: 2rem;
  font-weight: 700;
  color: #2C1810;
  letter-spacing: 2px;
}

.word-card__cn {
  font-size: 1.125rem;
  color: #8B7355;
  font-weight: 500;
}

.word-card__wave {
  position: absolute;
  bottom: 24px;
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 20px;
}

.wave-bar {
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #FF8C42 0%, #FF6B35 100%);
  border-radius: 2px;
  animation: waveAnimate 0.6s ease-in-out infinite;
}

@keyframes waveAnimate {
  0%, 100% { height: 8px; }
  50% { height: 20px; }
}
</style>