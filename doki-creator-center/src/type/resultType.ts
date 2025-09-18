// 原始响应
export interface ApiResponseData<T = null> {
    code: number;        // 状态码
    msg: string;         // 提示信息
    data: T;         //
    timestamp: number;   // 时间戳
}

// 带方法的增强接口
export interface ApiResponse<T = null> extends ApiResponseData<T> {
    isSuccess: () => boolean;
}
