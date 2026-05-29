import { ref, computed, onMounted, onUnmounted } from 'vue'

// 节日装饰配置（月份从1开始）
const FESTIVALS = [
  {
    key: 'spring-festival',
    name: '春节',
    check: (m, d) => (m === 1 && d >= 21) || (m === 2 && d <= 20),
    emoji: '🧧',
    decoration: '🧨',
    borderColor: '#E53935',
    bgColor: '#FFF3E0',
    bubbleText: '新年快乐！恭喜发财！🧧',
    yoyoAccessory: 'hat',
    particles: ['🧧', '🏮', '🎆', '🎇', '🧨', '🐲'],
    greeting: '新年快乐！祝你学习进步，天天开心~ 🧧',
    cssClass: 'season-spring-festival'
  },
  {
    key: 'qingming',
    name: '清明',
    check: (m, d) => m === 4 && d >= 4 && d <= 6,
    emoji: '🌿',
    decoration: '🌱',
    borderColor: '#4CAF50',
    bgColor: '#E8F5E9',
    bubbleText: '清明时节，万物生长~',
    cssClass: 'season-qingming'
  },
  {
    key: 'dragon-boat',
    name: '端午',
    check: (m, d) => (m === 5 && d >= 25) || (m === 6 && d <= 15),
    emoji: '🐉',
    decoration: '🥁',
    borderColor: '#2196F3',
    bgColor: '#E3F2FD',
    bubbleText: '端午节快乐！吃粽子了吗？🐉',
    cssClass: 'season-dragon-boat'
  },
  {
    key: 'national-day',
    name: '国庆',
    check: (m, d) => m === 10 && d >= 1 && d <= 7,
    emoji: '🇨🇳',
    decoration: '🎊',
    borderColor: '#E53935',
    bgColor: '#FFEBEE',
    bubbleText: '国庆快乐！🇨🇳',
    yoyoAccessory: 'hat',
    particles: ['🇨🇳', '🎊', '🎉', '🌟', '🎈'],
    greeting: '国庆快乐！今天也要好好学习哦~ 🇨🇳',
    cssClass: 'season-national-day'
  },
  {
    key: 'mid-autumn',
    name: '中秋',
    check: (m, d) => (m === 9 && d >= 15) || (m === 10 && d <= 5),
    emoji: '🥮',
    decoration: '🌕',
    borderColor: '#FFA726',
    bgColor: '#FFF8E1',
    bubbleText: '中秋快乐！月圆人团圆~ 🥮',
    cssClass: 'season-mid-autumn'
  },
  {
    key: 'halloween',
    name: '万圣节',
    check: (m, d) => m === 10 && d >= 25 && d <= 31,
    emoji: '🎃',
    decoration: '👻',
    borderColor: '#FF6D00',
    bgColor: '#FFF3E0',
    bubbleText: 'Trick or Treat! 🎃',
    particles: ['🎃', '👻', '🦇', '🕷️', '💀'],
    greeting: '不给糖果就捣蛋！今天学完有奖励哦~ 🎃',
    cssClass: 'season-halloween'
  },
  {
    key: 'thanksgiving',
    name: '感恩节',
    check: (m, d) => m === 11 && d >= 22 && d <= 28,
    emoji: '🦃',
    decoration: '🍂',
    borderColor: '#FF8F00',
    bgColor: '#FFF8E1',
    bubbleText: '感恩节快乐！🦃',
    cssClass: 'season-thanksgiving'
  },
  {
    key: 'christmas',
    name: '圣诞节',
    check: (m, d) => m === 12 && d >= 20 && d <= 26,
    emoji: '🎄',
    decoration: '⛄',
    borderColor: '#2E7D32',
    bgColor: '#E8F5E9',
    bubbleText: 'Merry Christmas! 🎄',
    yoyoAccessory: 'hat',
    particles: ['🎄', '⛄', '🎅', '🎁', '❄️', '🦌'],
    greeting: '圣诞快乐！呦呦给你准备了礼物~ 🎄',
    cssClass: 'season-christmas'
  },
  {
    key: 'new-year',
    name: '元旦',
    check: (m, d) => m === 1 && d >= 1 && d <= 3,
    emoji: '🎆',
    decoration: '🎉',
    borderColor: '#1565C0',
    bgColor: '#E3F2FD',
    bubbleText: '新年快乐！🎆',
    particles: ['🎆', '🎇', '🎉', '🎊', '✨'],
    greeting: '新年快乐！新的一年新的开始~ 🎆',
    cssClass: 'season-new-year'
  },
  {
    key: 'childrens-day',
    name: '儿童节',
    check: (m, d) => m === 6 && d >= 1 && d <= 2,
    emoji: '🎈',
    decoration: '🎪',
    borderColor: '#E91E63',
    bgColor: '#FCE4EC',
    bubbleText: '儿童节快乐！今天是你的节日~ 🎈',
    particles: ['🎈', '🎪', '🎠', '🎡', '🍭', '🍬'],
    greeting: '儿童节快乐！今天要多学一点哦~ 🎈',
    cssClass: 'season-childrens-day'
  },
  // 季节装饰
  {
    key: 'spring',
    name: '春季',
    check: (m, d) => m >= 3 && m <= 4,
    emoji: '🌸',
    decoration: '🌷',
    borderColor: '#F06292',
    bgColor: '#FCE4EC',
    bubbleText: '春天来啦！万物复苏~ 🌸',
    particles: ['🌸', '🌷', '🌺', '🦋', '🐝'],
    greeting: '春天来啦！和呦呦一起学英语吧~ 🌸',
    cssClass: 'season-spring'
  },
  {
    key: 'summer',
    name: '夏季',
    check: (m, d) => m >= 6 && m <= 8,
    emoji: '☀️',
    decoration: '🏖️',
    borderColor: '#FF8F00',
    bgColor: '#FFF8E1',
    bubbleText: '夏天好热，学点英语凉快一下~ ☀️',
    particles: ['☀️', '🌊', '🏖️', '🍦', '🐚'],
    greeting: '夏天到了！今天学几个新单词吧~ ☀️',
    cssClass: 'season-summer'
  },
  {
    key: 'autumn',
    name: '秋季',
    check: (m, d) => m === 9 || m === 10,
    emoji: '🍂',
    decoration: '🍁',
    borderColor: '#BF360C',
    bgColor: '#FBE9E7',
    bubbleText: '秋天到了，收获满满~ 🍂',
    particles: ['🍂', '🍁', '🌾', '🍎', '🌰'],
    greeting: '秋天来啦！和呦呦一起收获知识~ 🍂',
    cssClass: 'season-autumn'
  },
  {
    key: 'winter',
    name: '冬季',
    check: (m, d) => m === 11 || m === 12 || m === 1 || m === 2,
    emoji: '❄️',
    decoration: '⛄',
    borderColor: '#1565C0',
    bgColor: '#E3F2FD',
    bubbleText: '冬天好冷，学点英语暖暖心~ ❄️',
    particles: ['❄️', '⛄', '🌨️', '☃️', '🧣'],
    greeting: '冬天冷，呦呦陪你一起学习暖暖心~ ❄️',
    cssClass: 'season-winter'
  }
]

let currentFestival = null

export function useSeasonalDecorations() {
  const festival = ref(null)
  const particles = ref([])
  const showParticles = ref(false)
  let intervalId = null

  const isActive = computed(() => !!festival.value)
  const greeting = computed(() => festival.value?.greeting || '')
  const bubbleText = computed(() => festival.value?.bubbleText || '')
  const cssClass = computed(() => festival.value?.cssClass || '')
  const particlesList = computed(() => festival.value?.particles || [])

  function detectFestival() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // 优先匹配节日，其次匹配季节
    for (const f of FESTIVALS) {
      if (f.check(month, day)) {
        return f
      }
    }
    return null
  }

  function spawnParticles() {
    if (!festival.value?.particles) return
    particles.value = []
    for (let i = 0; i < 8; i++) {
      particles.value.push({
        emoji: festival.value.particles[Math.floor(Math.random() * festival.value.particles.length)],
        left: Math.random() * 100 + '%',
        delay: Math.random() * 3 + 's',
        duration: 3 + Math.random() * 4 + 's',
        size: 16 + Math.random() * 12 + 'px'
      })
    }
    showParticles.value = true
  }

  function init() {
    currentFestival = detectFestival()
    festival.value = currentFestival
    if (currentFestival) {
      // 添加CSS class到body
      document.body.classList.add(currentFestival.cssClass)
      // 生成漂浮装饰粒子
      spawnParticles()
      // 每30秒重新生成粒子
      intervalId = setInterval(spawnParticles, 30000)
    }
  }

  function cleanup() {
    if (intervalId) clearInterval(intervalId)
    if (currentFestival) {
      document.body.classList.remove(currentFestival.cssClass)
    }
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    festival,
    particles,
    showParticles,
    isActive,
    greeting,
    bubbleText,
    cssClass,
    particlesList
  }
}
