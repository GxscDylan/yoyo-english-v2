<template>
  <div class="playground-view">
    <!-- 顶部栏 -->
    <header class="pg-header">
      <button class="btn-back" @click="$router.push('/')">
        <span class="back-icon">🏠</span>
      </button>
      <div class="header-title">
        <span class="pg-title">Playground</span>
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
    <GameAvatar :mood="yoyoMood" :bubble-text="yoyoBubble"
      class="pg-yoyo" :show-hat="store.showHat" :show-glasses="store.showGlasses"
      :show-crown="store.showCrown" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import GameAvatar from '@/components/common/GameAvatar.vue'

const router = useRouter()
const store = useLearningStore()
const yoyoMood = ref('happy')
const yoyoBubble = ref('选择一个游戏开始玩吧！🎮')

onMounted(() => {
  // 4秒后隐藏气泡，鼠标悬停时重新显示
  setTimeout(() => { yoyoBubble.value = '' }, 4000)
})

const GAME_LIST = [
  {
    id: 'match', name: 'Find It', desc: '听音选图，找出正确的单词',
    bgColor: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    unlocked: true,
    icon: '<circle cx="32" cy="32" r="20" stroke-width="4"/><line x1="46" y1="46" x2="56" y2="56" stroke-width="5"/>'
  },
  {
    id: 'listen', name: 'Listen & Choose', desc: '听发音，选择正确的单词文字',
    bgColor: 'linear-gradient(135deg, #6C63FF, #8B7FFF)',
    unlocked: true,
    icon: '<path d="M32 8 L32 56" stroke-width="4"/><path d="M20 20 C20 20, 12 28, 12 32 C12 36, 20 44, 20 44" stroke-width="4" fill="none"/><path d="M44 20 C44 20, 52 28, 52 32 C52 36, 44 44, 44 44" stroke-width="4" fill="none"/>'
  },
  {
    id: 'memory', name: 'Memory Match', desc: '翻牌配对，锻炼记忆力',
    bgColor: 'linear-gradient(135deg, #FFB74D, #FFD54F)',
    unlocked: true,
    icon: '<rect x="10" y="14" width="18" height="32" rx="3"/><rect x="36" y="14" width="18" height="32" rx="3"/><circle cx="19" cy="30" r="4" fill="currentColor"/><circle cx="45" cy="30" r="4" fill="currentColor"/>'
  },
  {
    id: 'balloon', name: 'Balloon Pop', desc: '听音戳气球，趣味练习',
    bgColor: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
    unlocked: true,
    icon: '<path d="M32 12 C20 12, 16 24, 16 32 C16 40, 22 46, 32 46 C42 46, 48 40, 48 32 C48 24, 44 12, 32 12Z" stroke-width="3"/><path d="M32 46 L28 56" stroke-width="3"/><polygon points="22,18 26,22 20,24" fill="currentColor" stroke="none"/>'
  },
  {
    id: 'speed-rush', name: 'Speed Rush', desc: '限时答题，挑战反应速度',
    bgColor: 'linear-gradient(135deg, #FF6F00, #FFA726)',
    unlocked: true,
    icon: '<polygon points="38,8 22,32 34,32 30,56 46,30 34,30" stroke-width="3" fill="currentColor" opacity="0.8"/>'
  },
  {
    id: 'sort-it', name: 'Sort It!', desc: '分类单词，整理收纳',
    bgColor: 'linear-gradient(135deg, #66BB6A, #81C784)',
    unlocked: true,
    icon: '<rect x="12" y="16" width="40" height="32" rx="4"/><line x1="12" y1="30" x2="52" y2="30" stroke-width="2.5"/><line x1="28" y1="30" x2="28" y2="48" stroke-width="2.5"/>'
  }
]

const difficultyLabel = computed(() => {
  const map = { simple: '简单', medium: '中等', hard: '困难' }
  return map[store.gameDifficulty] || '中等'
})

function playGame(id) {
  const game = GAME_LIST.find(g => g.id === id)
  if (!game || !game.unlocked) return
  router.push(`/game/${id}`)
}
</script>

<style scoped>
.playground-view {
  width: 100%; min-height: 100dvh; display: flex; flex-direction: column;
  background: linear-gradient(180deg, #FFF8E1 0%, var(--bg-main) 60%);
  overflow-x: hidden;
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
/* 难度标签颜色 */
.diff-simple { background: #4CAF50; }
.diff-medium { background: var(--color-primary); }
.diff-hard { background: #F44336; }
.header-spacer { flex: 1; }

/* ===== 主内容 ===== */
.pg-main {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: var(--space-xl); display: flex; align-items: flex-start; justify-content: center;
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
  color: #fff;
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
  animation: badge-pulse 2s ease-in-out infinite;
}
@keyframes badge-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
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
  cursor: not-allowed;
}
.pg-card-locked:hover .pg-card-inner {
  transform: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.pg-card-locked .pg-card-icon-wrap {
  background: #999 !important;
  color: #ddd !important;
}
.pg-card-locked .pg-card-name,
.pg-card-locked .pg-card-desc { color: #999; }

/* ===== 呦呦 ===== */
.pg-yoyo {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  animation: yoyo-float 3s ease-in-out infinite;
}
@keyframes yoyo-float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-8px); }
}
</style>
