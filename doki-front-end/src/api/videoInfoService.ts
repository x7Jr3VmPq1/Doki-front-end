import request from './gateway.ts'
import type { VideoStatistics } from './analyticsService.ts'
import type { userInfo } from './userService.ts';
export interface VideoInfo {
  id: number;
  uploaderId: number;
  title: string;
  description: string;
  tags: string;
  categoryId: number | null;
  videoFilename: string;
  videoSize: number;
  videoDuration: number;
  videoFormat: string;
  videoWidth: number;
  videoHeight: number;
  videoBitrate: number;
  publishTime: number;
  permission: number;
  allowComment: number;
  createdTime: number;
  updatedTime: number;
  coverName: string;
  resolutions: number[];
}

export interface VideoVO extends VideoInfo {
  user: userInfo,
  liked: boolean,
  statistics: VideoStatistics
  followed: boolean,
  favorited: boolean,
  watchedTime: number,
  watchedAt: number
}

export interface videoInfoWithStat extends VideoInfo {
  statistics: VideoStatistics
}

export interface VideoCursorLoad {
  list: VideoVO[],
  hasMore: boolean,
  cursor: string | null
}
export interface videoInfoWithStatAndWatched extends videoInfoWithStat {
  watchedTime: number,
  watchedAt: number
}

export interface HistoryCursorLoad {
  list: VideoVO[],
  hasMore: boolean,
  cursor: string
}

/**
 * 获取视频元数据API
 */
export default {
  /**
   * 根据视频ID获取视频元数据
   * @param videoId  视频ID
   * @returns  视频元数据
   */
  getVideoInfo: (videoId: number) => request<VideoInfo>('/video/info', {
    method: 'GET',
    data: { videoId }
  }),
  /**
  * 根据视频ID获取视频元数据 v2
  * @param videoId  视频ID
  * @returns  视频元数据
  */
  getVideoInfoV2: (vid: number) => request<VideoVO>('/video/info/v2', {
    method: 'GET',
    data: { vid }
  }),
  /**
   * 根据用户ID获取该用户的所有视频元数据
   * @param userId  用户ID
   * @returns  视频元数据列表
   */
  getVideosInfoByUserId: (params: { tid: number, cursor: string | null }) => {
    return request<VideoCursorLoad>('/video/info/all', {
      method: 'GET',
      data: params
    })
  },
  /**
   * 根据用户ID获取该用户的所有点赞视频记录
   * @param params tid：目标用户id，cursor：游标
   * @returns 视频元数据列表
   */
  getLikeVideosInfoByUserId: (params: { tid: number, cursor: string | null }) => request<VideoCursorLoad>('/video/info/likes', {
    method: 'GET',
    data: params
  }),
  /**
   * 获取用户的历史观看记录
   * @param cursor 游标
   * @returns 
   */
  getHistory: (params: { tid: number, cursor: string | null }) => request<VideoCursorLoad>('/video/info/history', {
    method: 'GET',
    data: { cursor: params.cursor }
  }),

  /**
   * 获取用户最近的点赞记录
   * @param count 数量
   * @returns 
   */
  getRecentLikes: (count: number) => request<VideoInfo[]>('/video/info/recent/likes', {
    method: 'GET',
    data: { count }
  }),
  getRecentHistories: (count: number) => request<VideoInfo[]>('/video/info/recent/histories', {
    method: 'GET',
    data: { count }
  }),
  getRecentWorks: (count: number) => request<VideoInfo[]>('/video/info/recent/works', {
    method: 'GET',
    data: { count }
  }),
  getRandom: () => request<VideoVO[]>('/video/info/random', {
    method: 'GET',
  }),
  getFollowTimeline: () => request<VideoVO[]>('/video/info/timeline/follow', {
    method: 'GET'
  })
}
