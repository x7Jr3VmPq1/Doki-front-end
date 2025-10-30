// 统计/分析服务

import request from './gateway.ts'

export interface VideoStatistics {
  id: number;
  videoId: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
  favoriteCount: number;
  downloadCount: number;
  createdTime: number;
  updatedTime: number;
  deleted: number;
  userLiked: boolean;
}

export interface UserStatistics {
  userId: number,
  followingCount: number,
  followerCount: number,
  likeCount: number,
  createdAt: number,
  updatedAt: number
}

const analyticsService = {
  // 获取指定视频的统计信息
  getVideoStatById: async (ids: number[]) =>
    await request<VideoStatistics[]>('/analytics/stat/videos', {
      method: 'POST',
      data: ids
    }),
  // 获取用户的粉丝/关注数量
  getUserStatById: async (id: number) =>
    await request<UserStatistics>('/analytics/stat/user', {
      method: 'GET',
      data: { id }
    }),
  /**
   * 上传播放记录
   * @param videoId 视频ID
   * @param time 时长
   * @returns 
   */
  updateVideoHistory: async (params: { videoId: number, time: number }) => await request<void>('/analytics/history/add', {
    method: 'GET',
    data: params
  })
}
export default analyticsService;
