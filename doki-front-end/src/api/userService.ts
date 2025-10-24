import request from './gateway.ts'

export interface userInfo {
    id: number,
    username: string,
    avatarUrl: string,
    bio: string,
    followed?: boolean,
}

export interface loginSuccessData {
    token: string,
    hasPassword: boolean
}

export default {
    getUserinfoById: async (ids: number[]) => await request<userInfo[]>('/user/userinfo', {
        method: 'POST',
        data: ids
    }),
    getSmsCode: async (phone: number) => await request('/user/getSmsCode', {
        method: 'GET',
        data: phone
    }),
    loginBySms: async (phoneAndCode: {
        phone: number,
        code: number
    }) => await request<loginSuccessData>('/user/loginBySms', {
        method: 'GET',
        data: phoneAndCode
    }),
    getUserinfoByToken: async () => await request<userInfo>('/user/userinfo', {
        method: 'GET'
    }),
    getAuthCode: async () => await request<string>('/user/auth/code', {
        method: 'GET'
    })
}
