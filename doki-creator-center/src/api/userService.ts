import request from './axiosInstanse.ts'

export default {
    getTokenByAuthCode: (params: { code: string, userId: string }) => request<string>('/user/auth/token', {
        method: 'GET', data: params
    })
}
