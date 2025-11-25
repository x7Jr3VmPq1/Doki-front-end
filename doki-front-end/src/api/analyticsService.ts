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
  likedCount: number,
  worksCount: number,
  favoriteCount: number,
  historyCount: number,
}

export interface VideoWatched {
  videoId: number,
  time: number
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
  }),
  /**
   * 清空播放记录
   * @param close 如果传入close=1，则会关闭记录功能。
   * @returns 
   */
  clearVideoHistory: async (close: number) => await request<void>('/analytics/history/clear', {
    method: 'DELETE',
    data: { close }
  }),
  /**
   * 获取上次的播放时长
   * @param vid 视频ID
   * @returns 
   */
  getVideoWatched: async (params: { videoId: number, userId: number }) => await request<VideoWatched[]>('/analytics/history/watched', {
    method: 'GET',
    data: params
  })

}
export default analyticsService;
