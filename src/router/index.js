import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '呦呦英语' }
    },
    {
      path: '/learn/:categoryId?',
      name: 'learn',
      component: () => import('@/views/LearnView.vue'),
      meta: { title: '四步学习' }
    },
    {
      path: '/game/:gameId',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { title: '游戏工坊' }
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('@/views/PlaygroundView.vue'),
      meta: { title: '游乐场', transition: 'none' }
    },
    {
      path: '/parent',
      name: 'parent',
      component: () => import('@/views/ParentView.vue'),
      meta: { title: '家长中心' }
    },
    {
      path: '/review',
      name: 'review',
      component: () => import('@/views/ReviewView.vue'),
      meta: { title: '单词复习' }
    },
    {
      path: '/sentence/:categoryId?',
      name: 'sentence',
      component: () => import('@/views/SentenceView.vue'),
      meta: { title: '句型练习' }
    },
    {
      path: '/nursery',
      name: 'nursery',
      component: () => import('@/views/NurseryRhymeView.vue'),
      meta: { title: '英文童谣' }
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

router.beforeEach((to, from) => {
  document.title = to.meta.title || '呦呦英语'
})

export default router
