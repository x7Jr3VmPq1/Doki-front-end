import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/home' // 访问根路径时重定向到 /home
  },
  {
    path: '/home',
    component: () => import('../views/home/index.vue'),
  },
  {
    path: '/friends',
    component: () => import('../views/friends/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/following',
    component: () => import('../views/following/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my',
    name: 'my',
    component: () => import('../views/profiles/index.vue'),
  },
  {
    path: '/profiles',
    name: 'profiles',
    component: () => import('../views/profiles/index.vue'),
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/search/index.vue'),
  },
  {
    path: '/xiaomeng',
    name: 'xiaomeng',
    component: () => import('../views/xiaomeng/index.vue'),
  },
  {
    path: '/404',
    component: () => import('../views/404/index.vue'),
    meta: { fullPage: true }
  },

  {
    // 捕获所有未知路由并跳转到 404
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})
// 全局前置守卫：在每次导航之前检查 token
router.beforeEach((to, _, next): void => {
  const token = localStorage.getItem('token'); // 获取 token

  // 检查目标路由是否需要授权访问（meta.requiresAuth）
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      // 如果没有 token，重定向到登录页
      next({ path: '/login' });
    } else {
      // 如果有 token，继续访问目标页面
      next();
    }
  } else {
    // 如果目标路由不需要授权访问，继续访问
    next();
  }
});

router.beforeEach(async (to, _, next) => {
  const { useUserStore } = await import('../store/userInfoStore')
  const userStore = useUserStore()

  if (to.path === '/profiles' && Number(to.query.uid) === userStore.userInfo.id) {
    next('/my')
  } else {
    next()
  }
})
export default router
