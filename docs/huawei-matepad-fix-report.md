# 华为 MatePad 11.5S 兼容性修复报告

## 修复概览

| 项目编号 | 问题描述 | 修复状态 |
|---------|---------|---------|
| W1 | 缺少 ≥1600px 断点 | ✅ 已修复 |
| W2 | FourStepLearningView 使用 100vh | ✅ 已修复 |
| W3 | PWA manifest orientation | ✅ 已存在（无需修复） |
| W4 | TTS 回退增强（HarmonyOS UA 检测） | ✅ 已修复 |
| W5 | 核心容器无 max-width | ✅ 已修复 |

**额外修复**: AdventureMapView 和 PlaygroundView 的 `100vh` → `100dvh`

## 详细修复

### W1: 添加超宽屏断点

**文件**: `src/assets/styles/base.css`

```css
/* 超宽屏适配 (≥1600px) — 华为 MatePad 11.5S (2800×1840) 等 */
@media (min-width: 1600px) {
  html {
    font-size: 18px;
  }
  #app {
    max-width: 1600px;
    margin: 0 auto;
  }
  /* 核心容器 max-width 限制，防止 2800px 宽度下内容拉伸 */
  .home-page,
  .learning-steps-view,
  .playground-view,
  .adventure-map-view {
    max-width: 1440px;
    margin-left: auto;
    margin-right: auto;
  }
}
```

### W2: 100vh → 100dvh

**文件**: 
- `src/views/FourStepLearningView.vue` (line 352)
- `src/views/AdventureMapView.vue` (line 555)
- `src/views/PlaygroundView.vue` (line 118)

修复原因：HarmonyOS 浏览器 UI 会占用视口空间，`100vh` 会导致内容被遮挡。

### W3: PWA orientation

**状态**: 已在 `vite.config.js` line 29 配置为 `"orientation": "landscape-primary"`，无需修改。

### W4: HarmonyOS TTS 回退增强

**文件**: `src/composables/useSpeech.js`

```js
// 新增 HarmonyOS UA 检测
const isHarmonyOS = typeof navigator !== 'undefined' &&
  /HarmonyOS|HuaweiBrowser/i.test(navigator.userAgent)

const shouldSkipFallbackTTS = isHarmonyOS

// fallbackTTS 函数中增加跳过逻辑
function fallbackTTS(path, onEnd) {
  if (shouldSkipFallbackTTS) {
    isSpeaking.value = false
    if (onEnd) onEnd()
    return
  }
  // ...原有逻辑
}
```

修复原因：华为平板内置浏览器的 Web Speech API TTS 通常无声，跳过无效回退避免用户等待。

### W5: 核心容器 max-width

**文件**: `src/assets/styles/base.css`

已在 W1 的超宽屏断点中一并修复，添加 `.home-page`, `.learning-steps-view`, `.playground-view`, `.adventure-map-view` 的 `max-width: 1440px` 限制。

## 构建验证

```
✓ built in 5.00s
PWA v0.19.8
precache 246 entries (3486.21 KiB)
```

**生产构建通过，无错误。**
