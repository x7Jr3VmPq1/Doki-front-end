import request from './axiosInstanse.ts'

export default {
    getTokenByAuthCode: (code: string) => request<string>('/user/auth/token', {
        method: 'GET', data: {code}
    })
}
