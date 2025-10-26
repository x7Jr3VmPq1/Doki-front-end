import request from './axiosInstanse.ts'

export interface userInfo {
  id: number,
  username: string,
  avatarUrl: string,
  bio: string,
}

export default {
  /**
   * 通过授权码获取token
   * @param params  包含code和userId的对象
   * @returns  token字符串
   */
  getTokenByAuthCode: (params: { code: string, userId: string }) => request<string>('/user/auth/token', {
    method: 'GET', data: params
  }),
  /**
   * 获取当前登录用户信息
   * @returns  用户信息
   */
  getUserinfoByToken: async () => await request<userInfo>('/user/userinfo', {
    method: 'GET'
  }),
}
