<template>
  <div class="adventure-map">
    <!-- 顶部标题 -->
    <div class="map-header">
      <h2 class="map-title">{{ mapData.title }}</h2>
      <p class="map-desc">{{ mapData.description }}</p>
      <div class="map-stats">
        <span class="stat">📚 {{ completedCount }}/{{ totalNodes }} 完成</span>
        <span class="stat">⭐ {{ totalStars }} 星星</span>
      </div>
      <div class="map-theme-badge">{{ currentTheme.name }}</div>
    </div>

    <!-- SVG 地图 -->
    <div class="map-container">
      <svg
        :viewBox="`0 0 800 1200`"
        class="map-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- 背景装饰 -->
        <defs>
          <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E3F2FD" />
            <stop offset="100%" stop-color="#BBDEFB" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.2" />
          </filter>
        </defs>

        <!-- 背景 -->
        <rect x="0" y="0" width="800" height="1200" :fill="themeGradient" rx="24" />

        <!-- 地图装饰元素 -->
        <g class="decorations" font-size="24" opacity="0.4">
          <template v-for="(decor, di) in mapData.decorations" :key="'d' + di">
            <template v-for="(pos, pi) in decor.positions" :key="'p' + pi">
              <text
                :x="pos.x * 8"
                :y="pos.y * 12"
                text-anchor="middle"
              >{{ decor.emoji }}</text>
            </template>
          </template>
        </g>

        <!-- 连接线 -->
        <g class="lines" :style="{ transition: 'opacity 0.3s' }">
          <template v-for="line in lines" :key="line.id">
            <path
              :d="line.path"
              :stroke="line.status === 'completed' ? '#4CAF50' : '#9E9E9E'"
              :stroke-width="line.status === 'completed' ? 4 : 2"
              :stroke-dasharray="line.status === 'locked' ? '8,4' : 'none'"
              fill="none"
              stroke-linecap="round"
            />
          </template>
        </g>

        <!-- 节点 -->
        <g class="nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            :transform="`translate(${node.svgX}, ${node.svgY})`"
            :class="`node-group node-${node.status}`"
            @click="handleNodeClick(node)"
          >
            <g class="node-content">
              <!-- 节点圆形背景 -->
              <circle
                :r="node.isBoss ? 42 : 36"
                :fill="getNodeBgColor(node)"
                :stroke="getNodeStrokeColor(node)"
                :stroke-width="node.status === 'current' ? 4 : 2"
                :filter="node.status === 'current' ? 'url(#glow)' : 'url(#shadow)'"
                :class="`node-circle node-${node.status}`"
              />

              <!-- 节点图标 -->
              <text
                y="-2"
                text-anchor="middle"
                font-size="28"
                :opacity="node.status === 'locked' ? 0.4 : 1"
              >
                {{ node.status === 'locked' ? '🔒' : node.emoji }}
              </text>

              <!-- 节点类型标签 -->
              <text
                v-if="node.status !== 'locked'"
                y="22"
                text-anchor="middle"
                font-size="10"
                :fill="getNodeStrokeColor(node)"
                font-weight="600"
              >
                {{ NODE_STYLES[node.type]?.emoji || '' }}
              </text>

              <!-- 状态指示器 -->
              <circle
                v-if="node.status === 'completed'"
                cx="24" cy="-24" r="10"
                fill="#4CAF50"
              />
              <text
                v-if="node.status === 'completed'"
                x="24" y="-20"
                text-anchor="middle"
                font-size="12"
                fill="white"
                font-weight="bold"
              >✓</text>

              <!-- 进行中脉冲环 -->
              <circle
                v-if="node.status === 'current'"
                :r="node.isBoss ? 48 : 42"
                fill="none"
                :stroke="NODE_STYLES[node.type]?.color || '#FF9800'"
                stroke-width="2"
                class="pulse-ring"
              />

              <!-- 标签 -->
              <text
                y="56"
                text-anchor="middle"
                font-size="12"
                font-weight="700"
                fill="#424242"
              >
                {{ node.label }}
              </text>
              <!-- 单词数量 -->
              <text
                v-if="node.words > 0 && node.status !== 'locked'"
                y="70"
                text-anchor="middle"
                font-size="9"
                fill="#9E9E9E"
              >
                {{ node.words }}词
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
            <span class="panel-type">{{ NODE_STYLES[selectedNode.type]?.label || '' }}</span>
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
              🚀 开始学习
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

const router = useRouter()
const store = useLearningStore()
const selectedNode = ref(null)

const mapData = ADVENTURE_MAP

// 当前主题（根据已完成节点数量判断）
const currentTheme = computed(() => {
  const count = completedNodes.value.size
  if (count >= 14) return mapData.themes.boss
  if (count >= 8) return mapData.themes.l2_5
  if (count >= 4) return mapData.themes.l2
  return mapData.themes.l1
})

// 动态背景渐变（computed 不直接用在 SVG，但可以用于主题切换提示）
const themeGradient = computed(() => {
  const theme = currentTheme.value
  // 解析 bgGradient 字符串中的颜色
  return theme.skyColor || '#87CEEB'
})

const completedCount = computed(() => completedNodes.value.size)
const totalNodes = mapData.nodes.length
const totalStars = computed(() =>
  mapData.nodes.reduce((sum, n) => sum + (completedNodes.value.has(n.id) ? n.rewards.stars : 0), 0)
)

// 已完成节点集合（从 store 读取学习记录）
const completedNodes = computed(() => {
  const completed = new Set()
  const records = store.wordRecords || {}
  mapData.nodes.forEach(node => {
    // Boss/Review/Rest 节点特殊处理
    if (node.type === 'boss') return // boss 节点需要单独判断
    if (node.type === 'rest') return // 休息节点自动解锁
    if (node.type === 'review') {
      // 复习节点：检查对应等级的所有学习节点是否完成
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
    // 学习节点：检查对应分类是否完成
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

// 计算节点状态
const nodes = computed(() =>
  mapData.nodes.map(node => {
    const status = getNodeStatus(node, completedNodes.value)
    const x = node.position.x
    const y = Math.max(8, 95 - node.position.y) // 翻转 Y 轴，使 Y 越大越靠上
    return {
      ...node,
      status,
      svgX: x * 8, // 百分比转像素 (800 / 100 = 8)
      svgY: y * 12, // 百分比转像素 (1200 / 100 = 12)
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
  const midY = (y1 + y2) / 2
  const dx = Math.abs(x2 - x1) * 0.3
  return `M ${x1} ${y1} C ${x1} ${y1 - dx}, ${x2} ${y2 + dx}, ${x2} ${y2}`
}

function getNodeBgColor(node) {
  if (node.status === 'locked') return '#F5F5F5'
  if (node.status === 'completed') return '#E8F5E9'
  if (node.status === 'current' || node.status === 'available') return NODE_STYLES[node.type].color + '33'
  return '#FFF'
}

function getNodeStrokeColor(node) {
  if (node.status === 'locked') return '#E0E0E0'
  if (node.status === 'completed') return '#4CAF50'
  return NODE_STYLES[node.type].color
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
  min-height: 100vh;
  background: linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%);
  position: relative;
  padding-bottom: 20px;
}

.map-header {
  text-align: center;
  padding: 16px 20px 12px;
  background: rgba(255,255,255,0.85);
  border-bottom: 2px solid #E3F2FD;
}
.map-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 4px;
}
.map-desc {
  font-size: 0.75rem;
  color: var(--text-hint);
  margin: 0 0 8px;
}
.map-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.stat {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 4px 10px;
  background: #FFF8E1;
  border-radius: 12px;
}
.map-theme-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.map-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 8px;
}
.map-svg {
  width: 100%;
  display: block;
}

.node-group {
  cursor: pointer;
}
.node-content {
  transition: transform 0.2s ease;
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
}

.pulse-ring {
  animation: pulse 2s ease-in-out infinite;
  transform-origin: center;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.15); }
}

/* ===== 底部操作面板 ===== */
.node-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-width: 500px;
  margin: 0 auto;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #F5F5F5;
}
.panel-emoji {
  font-size: 2.2rem;
}
.panel-info {
  flex: 1;
}
.panel-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}
.panel-type {
  font-size: 0.65rem;
  color: var(--text-hint);
  background: #F5F5F5;
  padding: 2px 8px;
  border-radius: 8px;
}
.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #F5F5F5;
  color: #757575;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background: #E0E0E0;
}

.panel-story {
  padding: 10px 20px;
  background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
  border-bottom: 1px dashed #FFE082;
}
.panel-story p {
  margin: 0;
  font-size: 0.8rem;
  color: #F57C00;
  font-weight: 600;
  text-align: center;
  font-style: italic;
}

.panel-body {
  padding: 12px 20px 20px;
}
.panel-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.8rem;
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
  margin-top: 12px;
}
.btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 0.85rem;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}
.btn-review {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: white;
}
.btn-review:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}
.btn-continue {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
}
.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
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