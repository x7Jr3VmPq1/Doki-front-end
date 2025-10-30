import axios from 'axios';
import type {AxiosResponse} from 'axios';
import type {ApiResponseData, ApiResponse} from '../type/resultType.ts'

const instance = axios.create({
    baseURL: 'http://localhost:10011', // 网关地址
    timeout: 0,
    headers: {'X-Custom-Header': 'foobar'}
});

// 添加请求拦截器
instance.interceptors.request.use(config => {
    // 获取token
    const token = localStorage.getItem('token');
    // 添加到请求头
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
}, error => {
    return Promise.reject(error);
});

// 支持的 HTTP 方法
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 通用封装函数
export const request = async <T>(
    url: string,
    options?: { method?: HttpMethod; data?: any }
): Promise<ApiResponse<T>> => {
    const method = options?.method ?? 'GET';

    let axiosResponse: AxiosResponse<ApiResponseData<T>>;

    switch (method) {
        case 'POST':
            axiosResponse = await instance.post(url, options?.data);
            break;
        case 'PUT':
            axiosResponse = await instance.put(url, options?.data);
            break;
        case 'DELETE':
            axiosResponse = await instance.delete(url, {params: options?.data});
            break;
        default: // GET
            axiosResponse = await instance.get(url, {params: options?.data});
    }

    const res = axiosResponse.data;

    return {
        ...res,
        isSuccess: () => res.code === 200
    };
};


export default request;
