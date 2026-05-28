<template>
  <Teleport to="body">
    <div v-if="visible" class="cropper-overlay" @click.self="cancel">
      <div class="cropper-dialog">
        <div class="cropper-header">
          <h3>✂️ 裁剪头像</h3>
          <button class="btn-close" @click="cancel">✕</button>
        </div>

        <div class="cropper-body" @touchstart.prevent="onPointerDown" @touchmove.prevent="onPointerMove" @touchend.prevent="onPointerUp" @mousedown="onPointerDown" @mousemove="onPointerMove" @mouseup="onPointerUp" @mouseleave="onPointerUp">
          <div ref="containerRef" class="cropper-image-wrap">
            <canvas ref="canvasRef" class="cropper-canvas"></canvas>
          </div>

          <div class="cropper-preview">
            <p class="preview-label">预览效果</p>
            <div class="preview-circle">
              <img v-if="previewUrl" :src="previewUrl" class="preview-img" alt="预览" />
            </div>
          </div>
        </div>

        <div class="cropper-footer">
          <button class="btn-cropper btn-cancel" @click="cancel">取消</button>
          <button class="btn-cropper btn-confirm" @click="doCrop">✓ 确认裁剪</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  imageSrc: { type: String, default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const containerRef = ref(null)
const canvasRef = ref(null)
const previewUrl = ref('')

// 裁剪状态
let img = null
let imgDisplay = { x: 0, y: 0, w: 0, h: 0 }
let cropBox = { x: 0, y: 0, w: 0, h: 0 }
let isDragging = false
let isResizing = false
let resizeEdge = ''
let dragStart = { x: 0, y: 0 }
let cropStart = { x: 0, y: 0, w: 0, h: 0 }

function getImageRatio(src) {
  return new Promise((resolve) => {
    const i = new Image()
    i.onload = () => resolve({ w: i.width, h: i.height, el: i })
    i.onerror = () => resolve(null)
    i.src = src
  })
}

async function init() {
  if (!canvasRef.value || !containerRef.value) return
  const info = await getImageRatio(props.imageSrc)
  if (!info) return
  img = info.el

  const containerW = containerRef.value.clientWidth
  const containerH = containerRef.value.clientHeight

  const imgRatio = info.w / info.h
  const conRatio = containerW / containerH

  if (imgRatio > conRatio) {
    imgDisplay = { w: containerW, h: containerW / imgRatio, x: 0, y: (containerH - containerW / imgRatio) / 2 }
  } else {
    imgDisplay = { w: containerH * imgRatio, h: containerH, x: (containerW - containerH * imgRatio) / 2, y: 0 }
  }

  const cropSize = Math.min(imgDisplay.w, imgDisplay.h) * 0.8
  cropBox = {
    x: imgDisplay.x + (imgDisplay.w - cropSize) / 2,
    y: imgDisplay.y + (imgDisplay.h - cropSize) / 2,
    w: cropSize,
    h: cropSize
  }

  draw()
  updatePreview()
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !img) return
  const ctx = canvas.getContext('2d')
  const cw = containerRef.value.clientWidth
  const ch = containerRef.value.clientHeight
  canvas.width = cw * 2
  canvas.height = ch * 2
  canvas.style.width = cw + 'px'
  canvas.style.height = ch + 'px'
  ctx.scale(2, 2)

  // 绘制背景
  ctx.fillStyle = '#f0f0f0'
  ctx.fillRect(0, 0, cw, ch)

  // 绘制图片
  ctx.drawImage(img, imgDisplay.x, imgDisplay.y, imgDisplay.w, imgDisplay.h)

  // 绘制遮罩层（裁剪框外变暗）— 使用四块矩形替代 destination-out（iOS Safari 兼容）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  const cx = cropBox.x, cy = cropBox.y, cw2 = cropBox.w, ch2 = cropBox.h
  ctx.fillRect(0, 0, cw, cy)             // 上
  ctx.fillRect(0, cy + ch2, cw, ch - cy - ch2) // 下
  ctx.fillRect(0, cy, cx, ch2)            // 左
  ctx.fillRect(cx + cw2, cy, cw - cx - cw2, ch2) // 右

  // 绘制裁剪框边框
  ctx.strokeStyle = '#FF8C42'
  ctx.lineWidth = 2
  ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)

  // 绘制九宫格参考线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(cropBox.x + cropBox.w * i / 3, cropBox.y)
    ctx.lineTo(cropBox.x + cropBox.w * i / 3, cropBox.y + cropBox.h)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cropBox.x, cropBox.y + cropBox.h * i / 3)
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h * i / 3)
    ctx.stroke()
  }
  ctx.setLineDash([])
}

function updatePreview() {
  if (!img || !cropBox.w) return
  const scaleX = img.naturalWidth / imgDisplay.w
  const scaleY = img.naturalHeight / imgDisplay.h

  const sx = (cropBox.x - imgDisplay.x) * scaleX
  const sy = (cropBox.y - imgDisplay.y) * scaleY
  const sw = cropBox.w * scaleX
  const sh = cropBox.h * scaleY

  const c = document.createElement('canvas')
  c.width = 200
  c.height = 200
  const ctx = c.getContext('2d')
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 200)
  previewUrl.value = c.toDataURL('image/jpeg', 0.85)
}

function clampCropBox() {
  cropBox.w = Math.max(40, cropBox.w)
  cropBox.h = cropBox.w // 1:1 正方形
  cropBox.x = Math.max(imgDisplay.x, Math.min(cropBox.x, imgDisplay.x + imgDisplay.w - cropBox.w))
  cropBox.y = Math.max(imgDisplay.y, Math.min(cropBox.y, imgDisplay.y + imgDisplay.h - cropBox.h))
}

function onPointerDown(e) {
  const pos = getPos(e)
  const cx = cropBox.x + cropBox.w / 2
  const cy = cropBox.y + cropBox.h / 2
  const halfW = cropBox.w / 2
  const halfH = cropBox.h / 2

  // 检测是否在边缘（拖拽调整大小）
  const edgeMargin = 15
  const nearLeft = Math.abs(pos.x - cropBox.x) < edgeMargin
  const nearRight = Math.abs(pos.x - (cropBox.x + cropBox.w)) < edgeMargin
  const nearTop = Math.abs(pos.y - cropBox.y) < edgeMargin
  const nearBottom = Math.abs(pos.y - (cropBox.y + cropBox.h)) < edgeMargin

  if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
    isResizing = true
    resizeEdge = (nearLeft ? 'l' : 'r') + (nearTop ? 't' : 'b')
  } else if (pos.x >= cropBox.x && pos.x <= cropBox.x + cropBox.w && pos.y >= cropBox.y && pos.y <= cropBox.y + cropBox.h) {
    isDragging = true
  }

  dragStart = { x: pos.x, y: pos.y }
  cropStart = { x: cropBox.x, y: cropBox.y, w: cropBox.w, h: cropBox.h }
}

function onPointerMove(e) {
  if (!isDragging && !isResizing) return
  const pos = getPos(e)
  const dx = pos.x - dragStart.x
  const dy = pos.y - dragStart.y

  if (isDragging) {
    cropBox.x = cropStart.x + dx
    cropBox.y = cropStart.y + dy
    clampCropBox()
    draw()
    updatePreview()
  } else if (isResizing) {
    let newW = cropStart.w
    if (resizeEdge.includes('r')) newW = cropStart.w + dx
    else if (resizeEdge.includes('l')) newW = cropStart.w - dx

    newW = Math.max(40, Math.min(newW, Math.min(imgDisplay.w, imgDisplay.h)))

    // 保持 1:1 正方形
    cropBox.w = newW
    cropBox.h = newW

    if (resizeEdge.includes('r')) cropBox.x = cropStart.x
    else cropBox.x = cropStart.x + cropStart.w - newW

    if (resizeEdge.includes('b')) cropBox.y = cropStart.y
    else cropBox.y = cropStart.y + cropStart.h - newW

    clampCropBox()
    draw()
    updatePreview()
  }
}

function onPointerUp() {
  isDragging = false
  isResizing = false
}

function getPos(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

function doCrop() {
  updatePreview()
  emit('confirm', previewUrl.value)
  cleanup()
}

function cancel() {
  emit('cancel')
  cleanup()
}

function cleanup() {
  img = null
  previewUrl.value = ''
}

// 监听 visible 变化
watch(() => props.visible, async (val) => {
  if (val && props.imageSrc) {
    await nextTick()
    requestAnimationFrame(() => init())
  } else if (!val) {
    cleanup()
  }
})

// 窗口大小变化时重绘
const onResize = () => {
  if (props.visible && img) {
    init()
  }
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  cleanup()
})
</script>

<style scoped>
.cropper-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.cropper-dialog {
  background: var(--bg-card, #fff);
  border-radius: 16px;
  width: 90vw; max-width: 700px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.cropper-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light, #e5e5e5);
}

.cropper-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }

.btn-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--border-light, #f0f0f0);
  border: none; font-size: 1rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover { background: var(--color-danger, #ff4757); color: #fff; }

.cropper-body {
  display: flex; gap: 16px; padding: 16px 20px;
  flex: 1; min-height: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
}

.cropper-image-wrap {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: #f8f8f8; border-radius: 12px; overflow: hidden;
  min-height: 280px;
  touch-action: none;
  user-select: none;
}

.cropper-canvas {
  display: block;
  touch-action: none;
  cursor: move;
}

.cropper-preview {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 140px;
}

.preview-label {
  font-size: 0.75rem; color: var(--text-hint, #999);
  margin-bottom: 12px; font-weight: 600;
}

.preview-circle {
  width: 120px; height: 120px;
  border-radius: 50%; overflow: hidden;
  border: 3px solid var(--color-primary, #FF8C42);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.preview-img {
  width: 100%; height: 100%; object-fit: cover;
}

.cropper-footer {
  display: flex; gap: 12px; justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light, #e5e5e5);
}

.btn-cropper {
  padding: 10px 28px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 700;
  border: none; cursor: pointer; transition: all 0.2s;
}

.btn-cancel {
  background: var(--border-light, #f0f0f0); color: var(--text-secondary, #666);
}

.btn-cancel:hover { background: #e0e0e0; }

.btn-confirm {
  background: var(--color-primary, #FF8C42); color: #fff;
}

.btn-confirm:hover { filter: brightness(1.1); transform: translateY(-1px); }
</style>
