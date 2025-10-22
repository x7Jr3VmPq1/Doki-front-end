import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/home/index.vue'
import Upload from '../views/upload/index.vue'
import Authpage from '../views/authpage/index.vue'

const routes = [
    {path: '/', redirect: '/home'},
    {path: '/home', component: Home},
    {path: '/upload', component: Upload},
    {path: '/authpage', component: Authpage}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
