import {message} from 'ant-design-vue';
import type {ApiResponse} from "../type/resultType.ts"

// 通用请求处理器
interface HandleRequestOptions<T, P> {
    params?: P; // 接口的参数是可选的
    onSuccess?: (data: T) => any; // 成功回调也是可选的
    onError?: (data: T) => any; //失败回调也是可选的
}

const SERVER_UNKNOWN_WRONG = '服务器未知错误';
const NETWORK_WRONG = '网络异常';

export async function handleRequest<T, P>(
    requestFn: (params: P) => Promise<ApiResponse<T>>,
    options?: HandleRequestOptions<T, P>
) {
    const {params, onSuccess, onError} = options || {};

    try {
        // 模拟一点延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = await requestFn(params!);
        if (response.isSuccess()) {
            if (onSuccess) {
                onSuccess?.(response.data!);
            }
        } else {
            if (onError) {
                onError(response.data!);
                return;
            }
            console.log(requestFn + "请求失败了！")
            console.log(response.msg);
            message.error(response.msg || SERVER_UNKNOWN_WRONG);
        }
    } catch (err) {
        console.error(err);
        message.error(NETWORK_WRONG);
    }
}
