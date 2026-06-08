<template>
  <Transition name="companion-bubble">
    <div v-if="showBubble && reaction" class="pet-companion">
      <div class="companion-bubble">
        <span class="companion-emoji">{{ reaction.emoji }}</span>
        <span class="companion-text">{{ reaction.text }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  showBubble: { type: Boolean, default: false },
  reaction: { type: Object, default: null }
})
</script>

<style scoped>
.pet-companion {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  pointer-events: none;
}
.companion-bubble {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  border: 2px solid #FFE082;
  backdrop-filter: blur(8px);
}
.companion-emoji {
  font-size: 1.8rem;
  animation: emojiPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.companion-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

@keyframes emojiPop {
  0% { transform: scale(0); }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.companion-bubble-enter-active {
  animation: bubbleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.companion-bubble-leave-active {
  animation: bubbleOut 0.3s ease forwards;
}
@keyframes bubbleIn {
  from { opacity: 0; transform: translateY(20px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes bubbleOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-10px) scale(0.9); }
}
</style>
