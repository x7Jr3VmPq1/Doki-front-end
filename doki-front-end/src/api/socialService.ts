import { request } from './gateway.ts'
import type { userInfo } from './userService'

/**
 * 关注列表返回值类型
 */
export interface FollowListResponse {
  list: userInfo[]; // 关注用户列表
  hasMore: boolean; // 是否有更多数据
  cursor: string | null; // 分页游标
}

export default {
  /**
   * 关注用户
   * @param tid  目标用户ID
   * @returns  void
   */
  followUser: async (tid: number) => await request<void>('/social/follow', {
    method: 'GET',
    data: { tid }
  }),
  /**
   * 取消关注用户
   * @param tid  目标用户ID
   * @returns  void
   */
  unFollowUser: async (tid: number) => await request<void>('/social/unFollow', {
    method: 'GET',
    data: { tid }
  }),
  /**
   * 获取关注列表
   * @param param  请求参数
   * @returns  关注列表
   */
  getFollowList: async (param: {
    tid: number, // 目标用户ID
    mode: 1 | 2 | 3 // 1. 综合排序 2. 最近关注 3. 最早关注
    cursor?: string | null // 分页游标
  }) => await request<FollowListResponse>('/social/followings', {
    method: 'GET',
    data: param
  })
}