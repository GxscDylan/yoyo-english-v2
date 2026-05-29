import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '呦呦英语', depth: 0 }
    },
    {
      path: '/learn/:categoryId?',
      name: 'learn',
      component: () => import('@/views/LearnView.vue'),
      meta: { title: '四步学习', depth: 1 }
    },
    {
      path: '/game/:gameId',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { title: '游戏工坊', depth: 1 }
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('@/views/PlaygroundView.vue'),
      meta: { title: '游乐场', transition: 'none', depth: 1 }
    },
    {
      path: '/review',
      name: 'review',
      component: () => import('@/views/ReviewView.vue'),
      meta: { title: '单词复习', depth: 1 }
    },
    {
      path: '/sentence/:categoryId?',
      name: 'sentence',
      component: () => import('@/views/SentenceView.vue'),
      meta: { title: '句型练习', depth: 1 }
    },
    {
      path: '/nursery',
      name: 'nursery',
      component: () => import('@/views/NurseryRhymeView.vue'),
      meta: { title: '英文童谣', depth: 1 }
    },
    {
      path: '/parent',
      name: 'parent',
      component: () => import('@/views/ParentView.vue'),
      meta: { title: '家长中心', depth: 2 }
    },
    {
      path: '/offline',
      name: 'offline',
      component: () => import('@/views/OfflineView.vue'),
      meta: { title: '网络断开' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '页面未找到' }
    }
  ]
})

/** 根据路由深度计算过渡方向 */
function computeTransition(from, to) {
  if (to.meta.transition === 'none') return 'none'
  const fromDepth = from?.meta?.depth ?? 0
  const toDepth = to?.meta?.depth ?? 0

  // 家长中心专属：从底部滑入
  if (to.name === 'parent' && from.name !== 'parent') return 'slide-up'
  if (from.name === 'parent') return 'slide-down'

  // 深度增加 → 向左滑入（前进）
  if (toDepth > fromDepth) return 'slide-left'
  // 深度减少 → 向右滑入（后退）
  if (toDepth < fromDepth) return 'slide-right'
  // 同级 → 向左滑入
  return 'slide-left'
}

router.beforeEach((to, from) => {
  document.title = to.meta.title || '呦呦英语'
  to.meta.transition = computeTransition(from, to)
})

export default router
