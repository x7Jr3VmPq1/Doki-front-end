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
  /**
   * 获取用户信息，根据用户ID列表
   * @param ids  用户ID列表
   * @returns  用户信息列表
   */
  getUserinfoById: async (ids: number[]) => await request<userInfo[]>('/user/userinfo', {
    method: 'POST',
    data: ids
  }),
  /**
   * 获取短信验证码
   * @param phone  手机号
   * @returns  void
   */
  getSmsCode: async (phone: number) => await request('/user/getSmsCode', {
    method: 'GET',
    data: phone
  }),
  /**
   * 短信验证码登录
   * @param phoneAndCode  包含手机号和验证码的对象
   * @returns  登录成功数据
   */
  loginBySms: async (phoneAndCode: {
    phone: number,
    code: number
  }) => await request<loginSuccessData>('/user/loginBySms', {
    method: 'GET',
    data: phoneAndCode
  }),
  /**
   * 获取当前登录用户信息
   * @returns  用户信息
   */
  getUserinfoByToken: async () => await request<userInfo>('/user/userinfo', {
    method: 'GET'
  }),
  /**
   * 获取跳转授权码
   * @returns  授权码码字符串
   */
  getAuthCode: async () => await request<string>('/user/auth/code', {
    method: 'GET'
  }),
  /**
   * 修改个人资料
   * @param profileData  个人资料数据
   * @returns  更新后的用户信息
   */
  updateProfile: async (profileData: userInfo) => await request<userInfo>('/user/update', {
    method: 'PUT',
    data: profileData
  })
}
