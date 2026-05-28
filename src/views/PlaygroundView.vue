<template>
  <div class="playground-view">
    <!-- 顶部栏 -->
    <header class="pg-header">
      <button class="btn-back" @click="$router.push('/')">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-title">
        <span class="pg-title"> Playground</span>
        <span class="pg-difficulty" :class="`diff-${store.gameDifficulty}`">{{ difficultyLabel }}</span>
      </div>
      <div class="header-spacer"></div>
    </header>

    <!-- 游戏卡片网格 -->
    <main class="pg-main">
      <div class="pg-grid">
        <div
          v-for="game in GAME_LIST"
          :key="game.id"
          class="pg-card"
          :class="{ 'pg-card-locked': !game.unlocked }"
          @click="playGame(game.id)"
        >
          <div class="pg-card-inner">
            <div class="pg-card-icon-wrap" :style="{ background: game.bgColor }">
              <svg class="pg-card-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" v-html="game.icon"></svg>
            </div>
            <span class="pg-card-name">{{ game.name }}</span>
            <span class="pg-card-desc">{{ game.desc }}</span>
            <div class="pg-card-score" v-if="store.gameScores[game.id] > 0">
               {{ store.gameScores[game.id] }}
            </div>
            <div class="pg-card-badge" v-else>
              <span class="badge-new">NEW</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 呦呦 -->
    <YoyoMascot :mood="yoyoMood" :bubble-text="yoyoBubble"
      class="pg-yoyo" :show-hat="store.showHat" :show-glasses="store.showGlasses"
      :show-crown="store.showCrown" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import YoyoMascot from '@/components/common/YoyoMascot.vue'

const router = useRouter()
const store = useLearningStore()
const yoyoMood = ref('idle')
const yoyoBubble = ref('')

onMounted(() => {
  yoyoMood.value = 'happy'
  yoyoBubble.value = '选择一个游戏开始玩吧！🎮'
  setTimeout(() => { yoyoMood.value = 'idle'; yoyoBubble.value = '' }, 4000)
})

const GAME_LIST = [
  {
    id: 'match', name: 'Find It', desc: '听音选图，找出正确的单词',
    bgColor: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    icon: '<circle cx="26" cy="26" r="16" stroke-width="4"/><line x1="37" y1="37" x2="52" y2="52" stroke-width="5" stroke-linecap="round"/>'
  },
  {
    id: 'listen', name: 'Listen & Choose', desc: '听发音，选择正确的单词文字',
    bgColor: 'linear-gradient(135deg, #6C63FF, #8B7FFF)',
    icon: '<circle cx="32" cy="32" r="20" stroke-width="3"/><circle cx="32" cy="32" r="12" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="white" stroke="none"/>'
  },
  {
    id: 'memory', name: 'Memory Match', desc: '翻牌配对，锻炼记忆力',
    bgColor: 'linear-gradient(135deg, #FFB74D, #FFD54F)',
    icon: '<rect x="10" y="14" width="18" height="32" rx="3" stroke-width="3"/><rect x="36" y="14" width="18" height="32" rx="3" stroke-width="3"/><line x1="19" y1="28" x2="19" y2="34" stroke-width="2.5"/><line x1="16" y1="31" x2="22" y2="31" stroke-width="2.5"/>'
  },
  {
    id: 'balloon', name: 'Balloon Pop', desc: '听音戳气球，趣味练习',
    bgColor: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
    icon: '<ellipse cx="32" cy="26" rx="14" ry="18" stroke-width="3"/><path d="M32 44 L28 54" stroke-width="2.5"/><circle cx="26" cy="20" r="3" fill="white" stroke="none"/>'
  },
  {
    id: 'speed-rush', name: 'Speed Rush', desc: '限时答题，挑战反应速度',
    bgColor: 'linear-gradient(135deg, #FF6F00, #FFA726)',
    icon: '<polygon points="36,8 24,30 32,30 28,56 40,32 32,32" stroke-width="3" fill="white"/>'
  },
  {
    id: 'sort-it', name: 'Sort It!', desc: '分类单词，整理收纳',
    bgColor: 'linear-gradient(135deg, #66BB6A, #81C784)',
    icon: '<rect x="12" y="16" width="40" height="32" rx="4" stroke-width="3"/><line x1="12" y1="30" x2="52" y2="30" stroke-width="2.5"/><line x1="28" y1="30" x2="28" y2="48" stroke-width="2.5"/>'
  }
]

const difficultyLabel = computed(() => {
  const map = { simple: '简单', medium: '中等', hard: '困难' }
  return map[store.gameDifficulty] || '中等'
})

function playGame(id) {
  router.push(`/game/${id}`)
}
</script>

<style scoped>
.playground-view {
  width: 100vw; height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #FFF8E1 0%, var(--bg-main) 60%);
  overflow: hidden;
}

/* ===== 顶部栏 ===== */
.pg-header {
  display: flex; align-items: center; padding: var(--space-md) var(--space-xl);
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light); flex-shrink: 0;
}
.btn-back {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  background: var(--border-light);
  border: none; border-radius: 50%;
  cursor: pointer; transition: all 0.2s;
}
.btn-back:hover { background: var(--color-primary-light); transform: scale(1.05); }
.btn-back .back-icon { font-size: 1.3rem; }
.header-title { display: flex; align-items: center; gap: var(--space-sm); margin-left: var(--space-lg); }
.pg-title { font-size: var(--font-size-lg); font-weight: 800; color: var(--text-primary); }
.pg-difficulty {
  font-size: var(--font-size-xs); font-weight: 600; padding: 2px 10px;
  border-radius: 20px; background: var(--color-primary); color: #fff;
}
.header-spacer { flex: 1; }

/* ===== 主内容 ===== */
.pg-main {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: var(--space-xl); display: flex; align-items: center; justify-content: center;
}
.pg-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg); max-width: 820px; width: 100%;
}

.pg-card {
  cursor: pointer; perspective: 800px;
}
.pg-card-inner {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--space-sm); padding: var(--space-lg) var(--space-md);
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, #fff 0%, #FFF9E6 100%);
  border: 2px solid #FFE082;
  box-shadow: 0 4px 16px rgba(255,193,7,0.15);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 180px;
}
.pg-card:hover .pg-card-inner {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 28px rgba(255,193,7,0.25);
  border-color: #FFB74D;
}
.pg-card:active .pg-card-inner {
  transform: translateY(-2px) scale(0.98);
}

/* ===== 统一图标系统 ===== */
.pg-card-icon-wrap {
  width: 72px; height: 72px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 4px;
  color: white; /* SVG currentColor */
}
.pg-card-svg {
  width: 40px; height: 40px;
}

.pg-card-name { font-size: var(--font-size-md); font-weight: 800; color: var(--text-primary); }
.pg-card-desc { font-size: var(--font-size-xs); color: var(--text-secondary); text-align: center; line-height: 1.3; }

.pg-card-score {
  margin-top: 4px; font-size: var(--font-size-sm); font-weight: 700;
  color: #F57F17; background: #FFF3E0; padding: 2px 12px; border-radius: 12px;
}

.badge-new {
  font-size: 0.7rem; font-weight: 700; color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 108,99,255), 0.1);
  padding: 3px 10px; border-radius: 10px;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .pg-grid { grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
  .pg-card-inner { min-height: 150px; padding: var(--space-md) var(--space-sm); }
  .pg-card-icon-wrap { width: 60px; height: 60px; border-radius: 16px; }
  .pg-card-svg { width: 32px; height: 32px; }
}
@media (max-width: 480px) {
  .pg-grid { grid-template-columns: 1fr; }
  .pg-main { padding: var(--space-lg); align-items: flex-start; }
}

/* ===== 锁定状态 ===== */
.pg-card-locked .pg-card-inner {
  opacity: 0.5;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-color: #ccc;
  pointer-events: none;
}
.pg-card-locked .pg-card-icon-wrap {
  background: #999 !important;
  color: #ddd !important; /* SVG currentColor for locked state */
}
.pg-card-locked .pg-card-name,
.pg-card-locked .pg-card-desc { color: #999; }

/* ===== 呦呦 ===== */
.pg-yoyo {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
}
</style>
