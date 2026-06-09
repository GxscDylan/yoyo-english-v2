<template>
  <Transition name="hatch-fade">
    <div v-if="visible" class="pet-hatch-overlay" @click="handleOverlayClick">
      <!-- 星星粒子背景 -->
      <div class="hatch-stars">
        <span
          v-for="i in 16"
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
        <!-- Phase 0: 蛋蛋抖动 (0~1.5s) -->
        <div v-if="phase === 0" class="hatch-phase hatch-egg-phase">🥚</div>

        <!-- Phase 1: 破壳爆发 (1.5~2s) -->
        <div v-if="phase === 1" class="hatch-phase hatch-burst-phase">💥</div>

        <!-- Phase 2: 精灵亮相 (2s~) -->
        <Transition name="pop">
          <div v-if="phase >= 2" class="hatch-phase hatch-creature-phase">
            <span class="hatch-creature-face">{{ speciesEmoji }}</span>
            <div class="hatch-creature-name">{{ speciesName }}</div>
            <div class="hatch-creature-desc">欢迎来到这个世界！</div>

            <!-- Phase 3: 命名弹窗 (3s~) -->
            <Transition name="pop">
              <div v-if="phase >= 3 && showNaming" class="naming-dialog">
                <div class="naming-card" @click.stop>
                  <span class="naming-emoji">{{ speciesEmoji }}</span>
                  <h3 class="naming-title">给宝宝取个名字吧！</h3>
                  <input
                    v-model="petNameInput"
                    type="text"
                    class="naming-input"
                    placeholder="输入名字..."
                    maxlength="10"
                    @keyup.enter="confirmNaming"
                    ref="nameInputRef"
                  />
                  <div class="naming-hint">最多 10 个字符</div>
                  <div class="naming-actions">
                    <button class="naming-btn naming-btn-cancel" @click="useDefaultName">
                      使用默认名
                    </button>
                    <button class="naming-btn naming-btn-confirm" @click="confirmNaming">
                      确认 ✨
                    </button>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Phase 4: 命名确认后展示精灵信息卡 + 撒花 -->
            <Transition name="pop">
              <div v-if="phase >= 4" class="hatch-info-card">
                <div class="info-card-emoji">{{ speciesEmoji }}</div>
                <div class="info-card-name">{{ confirmedName }}</div>
                <div class="info-card-species">{{ speciesName }}</div>
                <div class="info-card-date">{{ hatchDate }}</div>
                <div class="info-card-reward">🎁 奖励：50 ⭐ + 1 款装扮</div>
                <button class="info-card-reset" @click="handleDismiss">
                  🥚 再养一颗蛋？
                </button>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>

      <div v-if="phase < 3" class="hatch-dismiss">点击任意位置跳过动画 →</div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { triggerConfetti } from '@/composables/useConfetti'
import { sfxPetHatch, sfxApplause, sfxFanfare } from '@/composables/useSfx'
import { usePetStore } from '@/composables/usePetStore.js'

const props = defineProps({
  species: { type: String, default: null }
})

const emit = defineEmits(['dismiss'])

const { PET_SPECIES, petState, persist } = usePetStore()

const visible = ref(true)
const phase = ref(0) // 0=蛋抖动, 1=破壳, 2=精灵亮相, 3=命名, 4=展示

const speciesEmoji = ref('🐱')
const speciesName = ref('小猫咪')

// 命名相关
const showNaming = ref(false)
const petNameInput = ref('')
const confirmedName = ref('')
const nameInputRef = ref(null)
const hatchDate = ref('')

// 星星位置
const starPositions = Array.from({ length: 16 }, (_, i) => ({
  left: `${Math.random() * 80 + 10}%`,
  top: `${Math.random() * 80 + 10}%`,
  delay: `${Math.random() * 1.5}s`
}))

// 获取默认名字
function getDefaultName(speciesId) {
  const defaults = {
    cat: '小咪', dog: '旺财', rabbit: '小白', dragon: '小龙',
    unicorn: '彩虹', tiger: '小虎', lion: '辛巴', sheep: '绵绵',
  }
  return defaults[speciesId] || '蛋蛋'
}

// 使用默认名字
function useDefaultName() {
  petNameInput.value = getDefaultName(props.species)
  confirmNaming()
}

// 确认命名
function confirmNaming() {
  const name = petNameInput.value.trim() || getDefaultName(props.species)
  confirmedName.value = name

  // 保存到 petStore
  if (petState.value) {
    petState.value.petName = name

    // 🛡️ P1 修复: 更新历史记录中最新条目的名字（triggerHatch 先推入了默认名）
    const history = petState.value.petHistory
    if (history && history.length > 0) {
      const latest = history[history.length - 1]
      if (latest.species === props.species && (!latest.name || latest.name === getDefaultSpeciesName(props.species))) {
        latest.name = name
      }
    }

    persist()
  }

  // 进入展示阶段
  phase.value = 4
  hatchDate.value = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // 撒花 + 音效
  triggerConfetti(30)
  setTimeout(() => triggerConfetti(20, { x: '30%', y: '40%' }), 500)
  setTimeout(() => triggerConfetti(20, { x: '70%', y: '40%' }), 800)
}

function handleDismiss() {
  visible.value = false
  setTimeout(() => emit('dismiss'), 500)
}

// 允许点击背景跳过动画（phase < 3 时）
function handleOverlayClick(e) {
  if (phase.value < 2) {
    // 跳过动画直接到精灵亮相
    phase.value = 2
    setTimeout(() => {
      showNaming.value = true
      phase.value = 3
      nextTick(() => {
        nameInputRef.value?.focus()
      })
    }, 500)
  } else if (phase.value >= 4) {
    handleDismiss()
  }
}

onMounted(() => {
  // 🛡️ 附带修复: 家长关闭了破壳动画 → 直接跳过动画展示结果
  if (petState.value?.showHatchAnim === false) {
    phase.value = 4
    const sp = PET_SPECIES.find(s => s.id === props.species)
    if (sp) {
      speciesEmoji.value = sp.emoji
      speciesName.value = sp.name
    }
    confirmedName.value = getDefaultName(props.species)
    hatchDate.value = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
    return // 不启动定时动画
  }

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
    setTimeout(() => sfxFanfare(), 300)
    triggerConfetti(20)
  }, 2000)

  // 阶段 3: 弹出命名框 (3.5s)
  setTimeout(() => {
    showNaming.value = true
    phase.value = 3
    nextTick(() => {
      nameInputRef.value?.focus()
    })
  }, 3500)
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

/* ===== 命名弹窗 ===== */
.naming-dialog {
  position: relative;
  margin-top: 24px;
  z-index: 10;
}
.naming-card {
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-radius: 24px;
  padding: 24px 28px;
  border: 3px solid #FFD54F;
  box-shadow: 0 12px 48px rgba(255, 213, 79, 0.3);
  text-align: center;
  animation: namingPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: 320px;
}
@keyframes namingPop {
  0% { transform: scale(0.5) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.naming-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}
.naming-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 16px;
}
.naming-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  border: 2px solid #FFE082;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  background: white;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}
.naming-input:focus {
  border-color: #FF8C42;
  box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.2);
}
.naming-input::placeholder {
  color: #ccc;
  font-weight: 400;
}
.naming-hint {
  font-size: 0.6rem;
  color: var(--text-hint);
  margin-top: 6px;
}
.naming-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: center;
}
.naming-btn {
  padding: 10px 20px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.naming-btn-cancel {
  background: #F5F5F5;
  color: var(--text-secondary);
}
.naming-btn-cancel:hover {
  background: #E0E0E0;
  transform: scale(1.03);
}
.naming-btn-confirm {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}
.naming-btn-confirm:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.4);
}

/* ===== 精灵信息卡 ===== */
.hatch-info-card {
  position: relative;
  margin-top: 24px;
  z-index: 10;
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-radius: 24px;
  padding: 28px 32px;
  border: 3px solid #FFD54F;
  box-shadow: 0 12px 48px rgba(255, 213, 79, 0.3);
  text-align: center;
  animation: infoCardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-width: 320px;
}
@keyframes infoCardPop {
  0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.info-card-emoji {
  font-size: 4rem;
  display: block;
  margin-bottom: 8px;
  animation: creature-bounce 1.5s ease-in-out infinite;
}
.info-card-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.info-card-species {
  font-size: 0.9rem;
  color: var(--text-hint);
  margin-bottom: 8px;
}
.info-card-date {
  font-size: 0.7rem;
  color: #9E9E9E;
  margin-bottom: 12px;
  font-family: monospace;
}
.info-card-reward {
  font-size: 0.85rem;
  font-weight: 700;
  color: #FF9800;
  padding: 8px 16px;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12px;
  margin-bottom: 16px;
}
.info-card-reset {
  padding: 12px 24px;
  border-radius: 16px;
  border: 2px solid #FF9800;
  background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  font-size: 0.9rem;
  font-weight: 700;
  color: #E65100;
  cursor: pointer;
  transition: all 0.2s;
}
.info-card-reset:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}
.info-card-reset:active {
  transform: scale(0.97);
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
