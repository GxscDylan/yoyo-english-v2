<template>
  <button class="like-btn" :class="{ liked: liked, large: large }" @click.stop="handleLike" :aria-label="liked ? '已点赞' : '点赞'">
    <span class="like-icon">{{ liked ? '👍' : '👍🏻' }}</span>
    <span v-if="showCount" class="like-count">{{ count }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThumbsUp } from '@/composables/useThumbsUp'

const props = defineProps({
  large: { type: Boolean, default: false },
  showCount: { type: Boolean, default: true },
  source: { type: String, default: '' },    // 'match' | 'listen' | 'memory' | etc.
})

const { thumbsUpState, doManualLike } = useThumbsUp()

const liked = computed(() => {
  if (props.source) {
    return thumbsUpState.value[`liked_${props.source}`] || false
  }
  return false
})

const count = computed(() => thumbsUpState.value.todayLikes)

function handleLike() {
  if (props.source && !liked.value) {
    doManualLike()
    thumbsUpState.value[`liked_${props.source}`] = true
  }
}
</script>

<style scoped>
.like-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 14px; border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.8);
  border: 1.5px solid rgba(255, 140, 66, 0.2);
  font-size: var(--font-size-sm); font-weight: 600;
  cursor: pointer; transition: all 0.25s;
  color: var(--text-secondary);
}
.like-btn:hover { background: #FFF3E0; border-color: rgba(255, 140, 66, 0.4); transform: scale(1.05); }
.like-btn:active { transform: scale(0.95); }
.like-btn.liked { background: linear-gradient(135deg, #FFECB3, #FFE082); border-color: #FFB300; color: #E65100; }
.like-btn.large { padding: 10px 24px; font-size: var(--font-size-lg); }
.like-icon { font-size: 1.2em; transition: transform 0.3s; }
.like-btn.liked .like-icon { animation: likePop 0.4s var(--ease-bounce); }
.like-count { font-variant-numeric: tabular-nums; }

@keyframes likePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3) rotate(-10deg); }
  100% { transform: scale(1) rotate(0deg); }
}
</style>
