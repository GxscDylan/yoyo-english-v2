import { watch } from 'vue'
import { useLearningStore } from '@/stores/learning'

const THEME_COLORS = {
  orange: '#FF8C42',
  blue: '#4A90D9',
  pink: '#F08CAE',
  green: '#5BAA6B',
  purple: '#8B6FC0'
}

export function useThemeColorSync() {
  const store = useLearningStore()
  const initialColor = THEME_COLORS[store.themeColor] || THEME_COLORS.orange
  syncThemeColor(initialColor)
  watch(() => store.themeColor, (newTheme) => {
    const color = THEME_COLORS[newTheme] || THEME_COLORS.orange
    syncThemeColor(color)
  })
}

function syncThemeColor(color) {
  let metaTag = document.getElementById('meta-theme-color')
  if (metaTag) {
    metaTag.setAttribute('content', color)
  } else {
    const tag = document.createElement('meta')
    tag.name = 'theme-color'
    tag.content = color
    tag.id = 'meta-theme-color'
    document.head.appendChild(tag)
  }
}
