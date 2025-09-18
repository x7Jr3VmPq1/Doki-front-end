import {Message} from "@arco-design/web-vue";
import type {ApiResponse} from "../type/resultType.ts"

// 通用请求处理器
interface HandleRequestOptions<T, P> {
    params?: P; // 接口的参数是可选的
    onSuccess?: (data: T) => any; // 成功回调也是可选的
}

const SERVER_UNKNOWN_WRONG = '服务器未知错误';
const NETWORK_WRONG = '网络异常';

export async function handleRequest<T, P>(
    requestFn: (params: P) => Promise<ApiResponse<T>>,
    options?: HandleRequestOptions<T, P>
) {
    const {params, onSuccess} = options || {};

    try {
        const response = await requestFn(params!);
        if (response.isSuccess()) {
            onSuccess?.(response.data!);
        } else {
            Message.error(response.msg || SERVER_UNKNOWN_WRONG);
        }
    } catch (err) {
        console.error(err);
        Message.error(NETWORK_WRONG);
    }
}
