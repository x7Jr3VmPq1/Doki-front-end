import instance from './axiosInstance'; // 引入axios实例
import request from './gateway.ts'

export interface userInfo {
    id: number,
    username: string,
    avatarUrl: string,
    bio: string,
    createdAt: number,
    updatedAt: number
}

export interface loginSuccessData {
    token: string,
    hasPassword: boolean
}

// 拉取当前登录用户的个人信息
const getUserInfoByToken = async () => {
    const response = await instance.get('/userInfoByToken');
    return response.data;
}
// 拉取个人信息
const getUserInfo = async (userName: string) => {
    const response = await instance.get(`/user/profiles/${userName}`);
    return response.data;
}

// 关注/取关用户
const followUser = async (userId: number) => {
    const response = await instance.post(`/user/follow/${userId}`);
    return response.data;
}


// 获取用户关注列表..
const getFollowList = async (userId: number, page?: number, lastUserId?: number) => {
    const response = await instance.get(
        '/user/followingList', {
            params: {
                userId,
                page,
                lastUserId
            }
        });
    return response.data.data;
}
// 获取用户粉丝列表
const getFansList = async (userId: number, page?: number, lastUserId?: number) => {
    const response = await instance.get(
        '/user/fansList', {
            params: {
                userId,
                page,
                lastUserId
            }
        });
    return response.data.data;
}
export {
    getUserInfoByToken,
    getUserInfo,
    followUser,
    getFollowList,
    getFansList
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
