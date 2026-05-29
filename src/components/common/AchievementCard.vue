<template>
  <!-- 成就分享卡 — Canvas 生成，无个人信息 -->
  <div class="achievement-card-wrapper" ref="wrapperRef">
    <canvas ref="canvasRef" :width="cardWidth" :height="cardHeight" class="achievement-canvas"></canvas>
    <div class="card-actions">
      <button class="btn-elastic btn-share" @click="downloadCard">📥 保存图片</button>
      <button class="btn-elastic btn-close" @click="$emit('close')">✕ 关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  achievement: { type: Object, required: true },
  masteredWordCount: { type: Number, default: 0 },
  totalStars: { type: Number, default: 0 },
  consecutiveDays: { type: Number, default: 0 },
  themeColor: { type: String, default: 'orange' }
})

defineEmits(['close'])

const canvasRef = ref(null)
const wrapperRef = ref(null)
const cardWidth = 600
const cardHeight = 800

const themeColors = {
  orange: { primary: '#FF8C42', secondary: '#FFB347', accent: '#FF6B6B', bg: '#FFF8F0' },
  purple: { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#EC4899', bg: '#F5F3FF' },
  blue: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#06B6D4', bg: '#EFF6FF' },
  green: { primary: '#10B981', secondary: '#34D399', accent: '#F59E0B', bg: '#ECFDF5' },
  pink: { primary: '#EC4899', secondary: '#F472B6', accent: '#8B5CF6', bg: '#FDF2F8' }
}

function drawCard() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const colors = themeColors[props.themeColor] || themeColors.orange
  const achievement = props.achievement

  // 背景渐变
  const bgGrad = ctx.createLinearGradient(0, 0, 0, cardHeight)
  bgGrad.addColorStop(0, colors.bg)
  bgGrad.addColorStop(1, '#FFFFFF')
  ctx.fillStyle = bgGrad
  ctx.roundRect(0, 0, cardWidth, cardHeight, 24)
  ctx.fill()

  // 顶部装饰条
  ctx.fillStyle = colors.primary
  ctx.roundRect(0, 0, cardWidth, 120, [24, 24, 0, 0])
  ctx.fill()

  // 顶部装饰圆点
  const dots = [
    { x: 60, y: 40, r: 20, color: colors.secondary },
    { x: 500, y: 30, r: 30, color: colors.accent },
    { x: 150, y: 80, r: 15, color: colors.accent },
    { x: 450, y: 90, r: 25, color: colors.secondary }
  ]
  dots.forEach(d => {
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fillStyle = d.color + '40'
    ctx.fill()
  })

  // 标题
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🐯 呦呦英语', cardWidth / 2, 55)
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('YoYo English', cardWidth / 2, 85)

  // 成就图标（大 emoji）
  ctx.font = '100px serif'
  ctx.textAlign = 'center'
  ctx.fillText(achievement.icon, cardWidth / 2, 240)

  // 成就名称
  ctx.fillStyle = '#1A1A2E'
  ctx.font = 'bold 42px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(achievement.name, cardWidth / 2, 320)

  // 成就英文名称
  ctx.fillStyle = '#6B7280'
  ctx.font = '24px "Inter", "PingFang SC", sans-serif'
  ctx.fillText(achievement.nameEn, cardWidth / 2, 355)

  // 成就条件
  ctx.fillStyle = colors.primary
  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(`🏆 ${achievement.condition}`, cardWidth / 2, 420)

  // 分隔线
  ctx.strokeStyle = colors.primary + '30'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, 460)
  ctx.lineTo(cardWidth - 80, 460)
  ctx.stroke()

  // 学习统计
  ctx.fillStyle = '#374151'
  ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
  const stats = [
    `📚 已掌握 ${props.masteredWordCount} 个单词`,
    `⭐ 累计获得 ${props.totalStars} 颗星`,
    `🔥 连续学习 ${props.consecutiveDays} 天`
  ]
  stats.forEach((s, i) => {
    ctx.fillText(s, cardWidth / 2, 510 + i * 45)
  })

  // 底部日期
  ctx.fillStyle = '#9CA3AF'
  ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif'
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  ctx.fillText(today, cardWidth / 2, 700)

  // 底部标语
  ctx.fillStyle = colors.primary
  ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('每天进步一点点！', cardWidth / 2, 745)
}

function downloadCard() {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `呦呦成就卡-${props.achievement.name}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  // roundRect polyfill
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
      const r = typeof radii === 'number' ? [radii, radii, radii, radii] : radii
      this.beginPath()
      this.moveTo(x + r[0], y)
      this.lineTo(x + w - r[1], y)
      this.quadraticCurveTo(x + w, y, x + w, y + r[1])
      this.lineTo(x + w, y + h - r[2])
      this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h)
      this.lineTo(x + r[3], y + h)
      this.quadraticCurveTo(x, y + h, x, y + h - r[3])
      this.lineTo(x, y + r[0])
      this.quadraticCurveTo(x, y, x + r[0], y)
      this.closePath()
      return this
    }
  }
  drawCard()
})

watch(() => props.achievement, drawCard, { deep: true })
watch(() => props.themeColor, drawCard)
</script>

<style scoped>
.achievement-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.achievement-canvas {
  border-radius: var(--radius-lg);
  max-width: 100%;
  height: auto;
}

.card-actions {
  display: flex;
  gap: var(--space-md);
}

.btn-share {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-share:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 140, 66, 0.3);
}

.btn-close {
  padding: var(--space-md) var(--space-xl);
  background: var(--bg-main);
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
