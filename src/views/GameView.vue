<template>
  <component :is="gameComponent" @game-complete="onGameComplete" />

  <!-- Catch Stars 奖励游戏覆盖层 -->
  <CatchStars
    v-if="showCatchStars"
    :category-index="catchCategoryIndex"
    :trigger-label="catchTriggerLabel"
    @done="closeCatchStars"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useLearningStore } from '@/stores/learning'
import MatchGame from '@/components/games/MatchGame.vue'
import ListenGame from '@/components/games/ListenGame.vue'
import MemoryGame from '@/components/games/MemoryGame.vue'
import BalloonPop from '@/components/games/BalloonPop.vue'
import SpeedRush from '@/components/games/SpeedRush.vue'
import SortIt from '@/components/games/SortIt.vue'
import CatchStars from '@/components/rewards/CatchStars.vue'

const route = useRoute()
const store = useLearningStore()

const gameMap = {
  match: MatchGame,
  listen: ListenGame,
  memory: MemoryGame,
  balloon: BalloonPop,
  'speed-rush': SpeedRush,
  'sort-it': SortIt
}

const gameComponent = computed(() => gameMap[route.params.gameId] || MatchGame)

// Catch Stars 状态
const showCatchStars = ref(false)
const catchCategoryIndex = ref(-1)
const catchTriggerLabel = ref('')

function onGameComplete() {
  // 游戏通关时检查是否触发 Catch Stars
  if (canTriggerCatchStars()) {
    showCatchStars.value = true
    catchCategoryIndex.value = -1
    catchTriggerLabel.value = 'game-clear'
  }
}

function canTriggerCatchStars() {
  // 简化版：每次游戏通关都尝试，Cooldown 由 store 管理
  return store.gameScores[route.params.gameId] > 0
}

function closeCatchStars() {
  showCatchStars.value = false
}
</script>
