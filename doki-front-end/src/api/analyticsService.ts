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
    await request<VideoStatistics>('/analytics/stat/videos', {
      method: 'POST',
      data: ids
    }),
  // 获取用户的粉丝/关注数量
  getUserStatById: async (id: number) =>
    await request<UserStatistics>('/analytics/stat/user', {
      method: 'GET',
      data: { id }
    })
}
export default analyticsService;
