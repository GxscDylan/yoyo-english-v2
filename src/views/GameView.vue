<template>
  <component :is="gameComponent" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MatchGame from '@/components/games/MatchGame.vue'
import ListenGame from '@/components/games/ListenGame.vue'
import MemoryGame from '@/components/games/MemoryGame.vue'

const route = useRoute()

const gameMap = {
  match: MatchGame,
  listen: ListenGame,
  memory: MemoryGame
}

const gameComponent = computed(() => gameMap[route.params.gameId] || MatchGame)
</script>