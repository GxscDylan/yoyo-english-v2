<template>
  <Transition name="hatch-fade">
    <div v-if="visible" class="pet-hatch-overlay" @click="handleDismiss">
      <div class="hatch-stars">
        <span
          v-for="i in 12"
          :key="i"
          class="hatch-star"
          :style="{
            left: starPositions[i - 1]?.left,
            top: starPositions[i - 1]?.top,
            animationDelay: starPositions[i - 1]?.delay
          }"
        >⭐</span>
      </div>

      <div class="hatch-content">
        <!-- Phase 1: 蛋蛋抖动 -->
        <div v-if="phase === 0" class="hatch-phase hatch-egg-phase">🥚</div>

        <!-- Phase 2: 破壳爆发 -->
        <div v-if="phase === 1" class="hatch-phase hatch-burst-phase">🎉</div>

        <!-- Phase 3: 精灵亮相 -->
        <Transition name="pop">
          <div v-if="phase >= 2" class="hatch-phase hatch-creature-phase">
            <span class="hatch-creature-face">{{ speciesEmoji }}</span>
            <div class="hatch-creature-name">{{ speciesName }}</div>
            <div class="hatch-creature-desc">欢迎来到这个世界！</div>
          </div>
        </Transition>
      </div>

      <div class="hatch-dismiss">点击任意位置继续 →</div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { triggerConfetti } from '@/composables/useConfetti'
import { sfxPetHatch, sfxApplause } from '@/composables/useSfx'
import { usePetStore } from '@/composables/usePetStore.js'

const props = defineProps({
  species: { type: String, default: null }
})

const emit = defineEmits(['dismiss'])

const { PET_SPECIES } = usePetStore()

const visible = ref(true)
const phase = ref(0)

const speciesEmoji = ref('🐱')
const speciesName = ref('小猫咪')

// 星星位置
const starPositions = Array.from({ length: 12 }, (_, i) => ({
  left: `${Math.random() * 80 + 10}%`,
  top: `${Math.random() * 80 + 10}%`,
  delay: `${Math.random() * 1}s`
}))

function handleDismiss() {
  visible.value = false
  setTimeout(() => emit('dismiss'), 500)
}

onMounted(() => {
  // 确定精灵
  const sp = PET_SPECIES.find(s => s.id === props.species)
  if (sp) {
    speciesEmoji.value = sp.emoji
    speciesName.value = sp.name
  }

  // 阶段 0: 蛋蛋抖动 (0s)
  // 阶段 1: 破壳爆发 (1.5s)
  setTimeout(() => {
    phase.value = 1
    try { sfxPetHatch() } catch(e) {}
  }, 1500)

  // 阶段 2: 精灵亮相 (2s)
  setTimeout(() => {
    phase.value = 2
    try { sfxApplause() } catch(e) {}
    triggerConfetti(20)
  }, 2000)
})
</script>

<style scoped>
.pet-hatch-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #1A1A2E 0%, #0D0D1A 100%);
  cursor: pointer;
}
.hatch-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.hatch-star {
  position: absolute;
  font-size: 1.5rem;
  animation: hatchStarAnim 1.5s ease-out forwards;
}
@keyframes hatchStarAnim {
  0% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.6; transform: scale(1); }
}
.hatch-content {
  text-align: center;
  z-index: 1;
}
.hatch-egg-phase {
  font-size: 6rem;
  animation: egg-shake 0.5s ease-in-out infinite;
}
.hatch-burst-phase {
  font-size: 8rem;
  animation: hatchBurst 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes hatchBurst {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  40% { transform: scale(1.5) rotate(5deg); opacity: 1; }
  70% { transform: scale(0.9) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
.hatch-creature-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hatch-creature-face {
  font-size: 6rem;
  display: block;
  animation: creature-bounce 1.5s ease-in-out infinite;
}
.hatch-creature-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #FFD54F;
  margin-top: 16px;
}
.hatch-creature-desc {
  font-size: 1rem;
  color: #E0E0E0;
  margin-top: 8px;
}
.hatch-dismiss {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 32px;
  animation: fadeIn 1s ease 2s forwards;
  opacity: 0;
}
.hatch-fade-enter-active {
  animation: fadeIn 0.5s ease;
}
.hatch-fade-leave-active {
  animation: fadeOut 0.5s ease;
}
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
