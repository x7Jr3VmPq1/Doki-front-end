import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {
        path: '/',
        redirect: '/home' // 访问根路径时重定向到 /home
    },
    {
        path: '/home',
        component: () => import('../views/video/player.vue'),
    },
    {
        path: '/friends',
        component: () => import('../views/friends/index.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/login',
        component: () => import('../views/login/index.vue'),
        meta: {fullPage: true}
    },
    {
        path: "/@:username", // 这里的 `@:username` 让 Vue Router 匹配'@'开头的用户名
        name: "UserProfile",
        component: () => import('../views/profiles/index.vue'),
        props: true, // 让 `username` 作为组件的 prop 传递
    },
    {
        path: '/upload',
        component: () => import('../views/upload/index.vue'),
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('../views/search/index.vue'),
    },
    {
        path: '/following',
        name: 'Following',
        component: () => import('../views/following/index.vue'),
        meta: {requiresAuth: true}
    },
    {
        path: '/message',
        component: () => import('../views/message/index.vue'),
        children: [
            {
                path: 'my',
                name: 'my',
                component: () => import('../views/message/my.vue'),
            },
            {
                path: 'reply',
                name: 'reply',
                component: () => import('../views/message/reply.vue'),
            },
            {
                path: 'like',
                name: 'like',
                component: () => import('../views/message/like.vue'),
            },
            {
                path: 'mention',
                name: 'mention',
                component: () => import('../views/message/mention.vue'),
            },
            {
                path: 'system',
                name: 'system',
                component: () => import('../views/message/system.vue'),
            }
        ],
        redirect: '/message/my'
    },
    {
        path: '/404',
        component: () => import('../views/404/index.vue'),
        meta: {fullPage: true}
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
            next({path: '/login'});
        } else {
            // 如果有 token，继续访问目标页面
            next();
        }
    } else {
        // 如果目标路由不需要授权访问，继续访问
        next();
    }
});
export default router
