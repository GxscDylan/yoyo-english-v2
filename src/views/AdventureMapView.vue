<template>
  <div class="adventure-map">
    <!-- 顶部标题 -->
    <header class="map-header">
      <div class="header-top">
        <div class="header-avatar">
          <HomeAvatar 
            :mood="yoyoMood" 
            :bubble-text="yoyoBubble" 
            :show-stars="showYoyoStars"
            :show-hat="store.showHat"
            :show-glasses="store.showGlasses"
            :show-crown="store.showCrown"
          />
        </div>
        <div class="header-right">
          <div class="header-text">
            <h2 class="map-title">{{ mapData.title }}</h2>
            <p class="map-desc">{{ mapData.description }}</p>
          </div>
          <div class="header-stats">
            <span class="stat-chip progress-chip">
              <span class="chip-num">{{ completedCount }}</span>
              <span class="chip-total">/{{ totalNodes }}</span>
            </span>
            <span class="stat-chip stars-chip">
              ⭐ <span class="chip-num">{{ totalStars }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="theme-bar" :style="{ background: currentTheme.bgGradient }">
        <span class="theme-icon">{{ currentTheme.icon }}</span>
        <span class="theme-name">{{ currentTheme.name }}</span>
      </div>
    </header>

    <!-- SVG 地图 -->
    <div class="map-container">
      <svg
        :viewBox="`0 0 800 1200`"
        class="map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <!-- 天空渐变 -->
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="currentTheme.skyTop" />
            <stop offset="60%" :stop-color="currentTheme.skyMid" />
            <stop offset="100%" :stop-color="currentTheme.skyBottom" />
          </linearGradient>

          <!-- 草地渐变 -->
          <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="currentTheme.grassTop" />
            <stop offset="100%" :stop-color="currentTheme.grassBottom" />
          </linearGradient>

          <!-- 路径渐变（完成/可用/锁定） -->
          <linearGradient id="pathCompleted" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4CAF50" />
            <stop offset="100%" stop-color="#66BB6A" />
          </linearGradient>
          <linearGradient id="pathAvailable" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="currentTheme.pathColor" />
            <stop offset="100%" stop-color="#FFB74D" />
          </linearGradient>
          <linearGradient id="pathLocked" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#BDBDBD" />
            <stop offset="100%" stop-color="#E0E0E0" />
          </linearGradient>

          <!-- 节点阴影 -->
          <filter id="nodeShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.12" />
          </filter>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bossGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Boss节点渐变 -->
          <radialGradient id="bossBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#FFD54F" />
            <stop offset="100%" stop-color="#FF9800" />
          </radialGradient>

          <!-- 完成节点渐变 -->
          <radialGradient id="completedBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#A5D6A7" />
            <stop offset="100%" stop-color="#66BB6A" />
          </radialGradient>

          <!-- 可用节点渐变 -->
          <radialGradient id="availableBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#FFE0B2" />
            <stop offset="100%" stop-color="#FF9800" />
          </radialGradient>

          <!-- 锁定节点渐变 -->
          <radialGradient id="lockedBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#EEEEEE" />
            <stop offset="100%" stop-color="#BDBDBD" />
          </radialGradient>

          <!-- 当前节点渐变 -->
          <radialGradient id="currentBg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" :stop-color="currentTheme.glowColor || '#FFC107'" stop-opacity="0.6" />
            <stop offset="100%" :stop-color="currentTheme.nodeColor || '#FF9800'" />
          </radialGradient>
        </defs>

        <!-- 天空背景 -->
        <rect x="0" y="0" width="800" height="1200" fill="url(#skyGrad)" rx="0" />

        <!-- 主题区域色带（背景装饰条 - 更淡） -->
        <g class="zone-bands" opacity="0.05">
          <!-- L1 绿色区域 -->
          <rect x="140" y="650" width="520" height="320" rx="30" fill="#4CAF50" />
          <!-- L2 蓝色区域 -->
          <rect x="120" y="200" width="560" height="400" rx="30" fill="#2196F3" />
          <!-- L2.5 紫色区域 -->
          <rect x="160" y="50" width="480" height="170" rx="25" fill="#9C27B0" />
          <!-- Boss 金色区域 -->
          <rect x="220" y="0" width="360" height="100" rx="20" fill="#FF9800" />
        </g>

        <!-- 地面装饰元素（更淡更小） -->
        <g class="ground-decorations" font-size="18" opacity="0.4">
          <text x="60" y="850" font-size="22" opacity="0.45">🌸</text>
          <text x="720" y="780" font-size="20" opacity="0.35">🌻</text>
          <text x="150" y="700" font-size="16" opacity="0.3">🍄</text>
          <text x="350" y="950" font-size="14" opacity="0.25">🌿</text>
          <text x="180" y="400" font-size="16" opacity="0.35">🦋</text>
          <text x="620" y="450" font-size="14" opacity="0.3">🦋</text>
        </g>

        <!-- 星星装饰 -->
        <g class="sky-stars" font-size="14" opacity="0.35">
          <text x="200" y="60" opacity="0.4">⭐</text>
          <text x="550" y="90" opacity="0.3">✨</text>
          <text x="720" y="350" opacity="0.35">⭐</text>
          <text x="80" y="500" opacity="0.2">✨</text>
        </g>

        <!-- 草地地面 -->
        <ellipse cx="400" cy="1200" rx="450" ry="280" fill="url(#grassGrad)" opacity="0.6" />

        <!-- 连接线（更细更淡） -->
        <g class="lines">
          <template v-for="line in lines" :key="line.id">
            <!-- 路径底色 -->
            <path
              :d="line.path"
              :stroke="line.status === 'completed' ? 'url(#pathCompleted)' : line.status === 'available' || line.status === 'current' ? 'url(#pathAvailable)' : 'url(#pathLocked)'"
              stroke-width="5"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="line.status === 'locked' ? '6,8' : 'none'"
              opacity="0.2"
            />
            <!-- 路径高亮线 -->
            <path
              :d="line.path"
              :stroke="line.status === 'completed' ? '#4CAF50' : line.status === 'available' || line.status === 'current' ? '#FF9800' : '#BDBDBD'"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="line.status === 'locked' ? '6,8' : 'none'"
            />
            <!-- 流动光点（仅完成路径） -->
            <circle v-if="line.status === 'completed'" r="2" fill="#81C784">
              <animateMotion :path="line.path" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </template>
        </g>

        <!-- 节点（更小更精致） -->
        <g class="nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            :transform="`translate(${node.svgX}, ${node.svgY})`"
            :class="`node-group node-${node.status} node-type-${node.type}`"
            @click="handleNodeClick(node)"
          >
            <g class="node-content" :style="node.isBoss ? 'filter: url(#bossGlow)' : ''">
              <!-- Boss节点特殊造型 -->
              <g v-if="node.isBoss" class="boss-node">
                <!-- 外圈装饰 -->
                <circle :r="40" fill="none" :stroke="node.status === 'locked' ? '#E0E0E0' : '#FFB300'" stroke-width="2" stroke-dasharray="4,4" opacity="0.5">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="25s"
                    repeatCount="indefinite"
                  />
                </circle>
                <!-- 主圆形 -->
                <circle
                  :r="34"
                  :fill="node.status === 'locked' ? 'url(#lockedBg)' : node.status === 'completed' ? 'url(#completedBg)' : 'url(#bossBg)'"
                  :stroke="node.status === 'locked' ? '#BDBDBD' : '#FF9800'"
                  :stroke-width="node.status === 'current' ? 3 : 2"
                  filter="url(#nodeShadow)"
                />
                <!-- 皇冠装饰 -->
                <text y="-44" text-anchor="middle" font-size="22">👑</text>
              </g>

              <!-- 普通节点 -->
              <template v-else>
                <!-- 脉冲光环（当前/可用节点） -->
                <circle
                  v-if="node.status === 'current' || node.status === 'available'"
                  :r="34"
                  fill="none"
                  :stroke="NODE_STYLES[node.type]?.color || '#FF9800'"
                  stroke-width="1.5"
                  opacity="0.4"
                  class="pulse-ring"
                />

                <!-- 主圆形 -->
                <circle
                  :r="node.isBoss ? 34 : 28"
                  :fill="node.status === 'locked' ? 'url(#lockedBg)' : node.status === 'completed' ? 'url(#completedBg)' : node.status === 'available' ? 'url(#availableBg)' : 'url(#currentBg)'"
                  :stroke="node.status === 'locked' ? '#BDBDBD' : node.status === 'completed' ? '#4CAF50' : NODE_STYLES[node.type]?.color || '#FF9800'"
                  :stroke-width="node.status === 'current' ? 3 : node.status === 'completed' ? 2 : 1.5"
                  filter="url(#nodeShadow)"
                />
              </template>

              <!-- 节点图标 -->
              <text
                y="-2"
                text-anchor="middle"
                :font-size="node.isBoss ? 26 : 20"
                :opacity="node.status === 'locked' ? 0.3 : 1"
              >
                {{ node.status === 'locked' ? '🔒' : node.emoji }}
              </text>

              <!-- 完成标记（缩小） -->
              <g v-if="node.status === 'completed'">
                <circle cx="20" cy="-20" r="9" fill="#4CAF50" filter="url(#nodeShadow)" />
                <text x="20" y="-17" text-anchor="middle" font-size="11" fill="white" font-weight="bold">✓</text>
              </g>

              <!-- 标签 -->
              <text
                y="42"
                text-anchor="middle"
                font-size="11"
                font-weight="700"
                :fill="node.status === 'locked' ? '#9E9E9E' : '#424242'"
              >
                {{ node.label }}
              </text>
              <!-- 单词数量 -->
              <text
                v-if="node.words > 0 && node.status !== 'locked'"
                y="54"
                text-anchor="middle"
                font-size="9"
                fill="#9E9E9E"
                font-weight="500"
              >
                {{ node.words }} 词
              </text>
              <!-- Boss奖励提示 -->
              <text
                v-if="node.isBoss && node.status !== 'locked'"
                y="54"
                text-anchor="middle"
                font-size="9"
                fill="#FF9800"
                font-weight="700"
              >
                🏆 终极挑战
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- 底部操作面板 -->
    <Transition name="slide-up">
      <div v-if="selectedNode" class="node-panel">
        <div class="panel-header">
          <span class="panel-emoji">{{ selectedNode.emoji }}</span>
          <div class="panel-info">
            <h3 class="panel-title">{{ selectedNode.label }}</h3>
            <span class="panel-type" :style="{ background: NODE_STYLES[selectedNode.type]?.color + '22', color: NODE_STYLES[selectedNode.type]?.color }">{{ NODE_STYLES[selectedNode.type]?.label || '' }}</span>
          </div>
          <button class="close-btn" @click="selectedNode = null">✕</button>
        </div>

        <!-- 场景小故事 -->
        <div v-if="selectedNode.story" class="panel-story">
          <p>{{ selectedNode.story }}</p>
        </div>

        <div class="panel-body">
          <div class="panel-row">
            <span class="row-label">难度</span>
            <span class="row-value">{{ '⭐'.repeat(selectedNode.level) }}</span>
          </div>
          <div class="panel-row">
            <span class="row-label">单词</span>
            <span class="row-value">{{ selectedNode.words }} 个</span>
          </div>
          <div class="panel-row">
            <span class="row-label">奖励</span>
            <span class="row-value">{{ selectedNode.rewards.stars }} ⭐ / {{ selectedNode.rewards.xp }} XP</span>
          </div>
          <!-- 装扮奖励 -->
          <div v-if="selectedNode.rewards.cosmetic" class="panel-row">
            <span class="row-label">装扮</span>
            <span class="row-value">🎁 {{ selectedNode.rewards.cosmetic }}</span>
          </div>
          <!-- 徽章奖励 -->
          <div v-if="selectedNode.rewards.badge" class="panel-row">
            <span class="row-label">徽章</span>
            <span class="row-value">🏅 {{ selectedNode.rewards.badge }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="panel-actions">
            <button
              v-if="selectedNode.status === 'available'"
              class="btn btn-start"
              @click="startLearning"
            >
               开始学习
            </button>
            <button
              v-else-if="selectedNode.status === 'completed'"
              class="btn btn-review"
              @click="reviewLearning"
            >
              🔄 复习
            </button>
            <button
              v-else-if="selectedNode.status === 'current'"
              class="btn btn-continue"
              @click="continueLearning"
            >
              📖 继续学习
            </button>
            <button
              v-else
              class="btn btn-locked"
              disabled
            >
              🔒 未解锁
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ADVENTURE_MAP, NODE_STATUS, NODE_STYLES, getNodeStatus } from '@/data/adventureMap.js'
import { ALL_CATEGORIES } from '@/data/words'
import { useLearningStore } from '@/stores/learning'
import HomeAvatar from '@/components/common/HomeAvatar.vue'

const router = useRouter()
const store = useLearningStore()
const selectedNode = ref(null)

const yoyoMood = ref('idle')
const yoyoBubble = ref('')
const showYoyoStars = ref(false)

function setYoyo(mood, text, stars = false) {
  yoyoMood.value = mood
  yoyoBubble.value = text
  showYoyoStars.value = stars
  setTimeout(() => { showYoyoStars.value = false }, 1500)
}

const mapData = ADVENTURE_MAP

// 类型图标映射
function getNodeIcon(type) {
  const icons = { learn: '📚', review: '🔄', boss: '⭐', rest: '🎁' }
  return icons[type] || '?'
}

// 已完成节点集合（从 store 读取学习记录）
const completedNodes = computed(() => {
  const completed = new Set()
  const records = store.wordRecords || {}
  mapData.nodes.forEach(node => {
    if (node.type === 'boss') return
    if (node.type === 'rest') return
    if (node.type === 'review') {
      const levelNodes = mapData.nodes.filter(n => n.level === node.level && n.type === 'learn')
      const allLevelDone = levelNodes.every(n => {
        const catId = n.categoryId || n.scene
        const cat = ALL_CATEGORIES.find(c => c.id === catId)
        if (!cat) return false
        const mastered = cat.words.filter(w => records[w.id]?.mastered).length
        return mastered >= n.words * 0.6
      })
      if (allLevelDone) completed.add(node.id)
      return
    }
    if (!node.scene && !node.categoryId) return
    const catId = node.categoryId || node.scene
    const cat = ALL_CATEGORIES.find(c => c.id === catId)
    if (!cat) return
    const mastered = cat.words.filter(w => records[w.id]?.mastered).length
    if (mastered >= node.words * 0.6) {
      completed.add(node.id)
    }
  })
  return completed
})

// 当前主题（根据已完成节点数量判断）
const currentTheme = computed(() => {
  const count = completedNodes.value.size
  if (count >= 14) return mapData.themes.boss
  if (count >= 8) return mapData.themes.l2_5
  if (count >= 4) return mapData.themes.l2
  return mapData.themes.l1
})

const completedCount = computed(() => completedNodes.value.size)
const totalNodes = computed(() => mapData.nodes.filter(n => n.type === 'learn').length)
const totalStars = computed(() =>
  mapData.nodes.reduce((sum, n) => sum + (completedNodes.value.has(n.id) ? n.rewards.stars : 0), 0)
)

// 初始化呦呦欢迎语
setYoyo('excited', `冒险地图开启！你已经完成了 ${ADVENTURE_MAP.nodes.filter(n => n.type === 'learn').length} 个学习关卡中的 ${completedCount.value} 个！`, true)

// 计算节点状态
const nodes = computed(() =>
  mapData.nodes.map(node => {
    const status = getNodeStatus(node, completedNodes.value)
    const x = node.position.x
    const y = Math.max(8, 95 - node.position.y)
    return {
      ...node,
      status,
      svgX: x * 8,
      svgY: y * 12,
      isBoss: node.type === 'boss'
    }
  })
)

// 计算连线
const lines = computed(() => {
  const lineList = []
  nodes.value.forEach(node => {
    node.required.forEach(reqId => {
      const fromNode = nodes.value.find(n => n.id === reqId)
      if (!fromNode) return
      const bothCompleted = completedNodes.value.has(fromNode.id) && completedNodes.value.has(node.id)
      const isAvailable = node.status === 'available' || node.status === 'current'
      lineList.push({
        id: `${reqId}-${node.id}`,
        path: getLinePath(fromNode, node),
        status: bothCompleted ? 'completed' : isAvailable ? 'available' : 'locked'
      })
    })
  })
  return lineList
})

function getLinePath(from, to) {
  const x1 = from.svgX
  const y1 = from.svgY
  const x2 = to.svgX
  const y2 = to.svgY
  const dx = Math.abs(x2 - x1) * 0.3
  return `M ${x1} ${y1} C ${x1} ${y1 - dx}, ${x2} ${y2 + dx}, ${x2} ${y2}`
}

function handleNodeClick(node) {
  if (node.status === 'locked') return
  selectedNode.value = node
}

function startLearning() {
  if (!selectedNode.value?.scene) {
    selectedNode.value = null
    return
  }
  router.push({ name: 'learn', query: { category: selectedNode.value.scene } })
  selectedNode.value = null
}

function reviewLearning() {
  if (!selectedNode.value?.scene) {
    selectedNode.value = null
    return
  }
  router.push({ name: 'review', query: { category: selectedNode.value.scene } })
  selectedNode.value = null
}

function continueLearning() {
  if (!selectedNode.value?.scene) {
    selectedNode.value = null
    return
  }
  router.push({ name: 'learn', query: { category: selectedNode.value.scene } })
  selectedNode.value = null
}
</script>

<style scoped>
.adventure-map {
  min-height: 100dvh;
  background: #E3F2FD;
  position: relative;
  padding-bottom: 20px;
}

/* ===== 顶部栏 ===== */
.map-header {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-top {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
}

.header-avatar {
  flex-shrink: 0;
  transform: scale(0.7);
  transform-origin: top left;
  margin-top: -4px;
}

.header-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.header-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.map-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
}
.map-desc {
  font-size: 0.65rem;
  color: var(--text-hint);
  margin: 1px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-stats {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 10px;
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 700;
}
.progress-chip {
  background: #FFF8E1;
  color: #F57C00;
}
.stars-chip {
  background: #E3F2FD;
  color: #1565C0;
}
.chip-num { font-size: 0.8rem; }
.chip-total { opacity: 0.5; font-weight: 500; }

.theme-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 3px 0 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.theme-icon { font-size: 0.9rem; }

/* ===== SVG地图容器 ===== */
.map-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 4px 20px;
}
.map-svg {
  width: 100%;
  display: block;
}

/* ===== 节点 ===== */
.node-group {
  cursor: pointer;
}
.node-content {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
}
.node-group:hover:not(.node-locked) .node-content {
  transform: scale(1.1);
}
.node-group:active:not(.node-locked) .node-content {
  transform: scale(0.95);
}
.node-locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.pulse-ring {
  animation: pulse 2.5s ease-in-out infinite;
  transform-origin: center;
}
.node-group:hover .pulse-ring {
  animation-play-state: paused;
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; r: 34; }
  50% { opacity: 0.15; r: 38; }
}

.boss-node circle {
  transition: all 0.3s;
}
.node-group:hover:not(.node-locked) .boss-node circle {
  transform: scale(1.06);
}

/* ===== 底部操作面板 ===== */
.node-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-width: 500px;
  margin: 0 auto;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px 10px;
  border-bottom: 1px solid #F5F5F5;
}
.panel-emoji {
  font-size: 2rem;
}
.panel-info {
  flex: 1;
}
.panel-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}
.panel-type {
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 700;
}
.close-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #F5F5F5;
  color: #757575;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background: #E0E0E0;
}

.panel-story {
  padding: 8px 18px;
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-bottom: 1px dashed #FFE082;
}
.panel-story p {
  margin: 0;
  font-size: 0.75rem;
  color: #F57C00;
  font-weight: 600;
  text-align: center;
  font-style: italic;
}

.panel-body {
  padding: 10px 18px 16px;
}
.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 0.75rem;
}
.row-label {
  color: var(--text-hint);
  font-weight: 600;
}
.row-value {
  color: var(--text-primary);
  font-weight: 700;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.btn {
  flex: 1;
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-start {
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
}
.btn-start:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.25);
}
.btn-review {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}
.btn-review:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(33, 150, 243, 0.25);
}
.btn-continue {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
}
.btn-continue:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(255, 152, 0, 0.25);
}
.btn-locked {
  background: #F5F5F5;
  color: #9E9E9E;
  cursor: not-allowed;
}

.slide-up-enter-active {
  animation: slideUp 0.3s ease;
}
.slide-up-leave-active {
  animation: slideUp 0.3s ease reverse;
}
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
