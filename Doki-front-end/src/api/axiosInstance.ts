import axios from 'axios';
import router from "../router";
import {message} from "ant-design-vue";

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 0,
    headers: {'X-Custom-Header': 'foobar'}
});

// 添加请求拦截器
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    // 这些接口不需要 token
    const noAuthUrls = ['/login', '/register'];

    // 如果当前请求 URL 不在 `noAuthUrls` 里面，并且 `token` 存在，就添加 `Authorization` 头
    if (!noAuthUrls.includes(config.url!) && token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 如果是 POST 请求，并且 `token` 为空，则拦截请求并跳转到登录页
    if (config.method === 'post' && !noAuthUrls.includes(config.url!)) {
        if (!token) {
            message.warn('请先登录~');
            router.push('/login');
            return Promise.reject(new Error('没有权限'));
        }
    }

    return config;
}, error => {
    return Promise.reject(error);
});

export default instance;
