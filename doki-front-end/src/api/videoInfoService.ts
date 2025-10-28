import request from './gateway.ts'
import type { VideoInfo } from './feedService.ts'
import type { VideoStatistics } from './analyticsService.ts'
export interface videoInfoWithStat extends VideoInfo {
  statistics: VideoStatistics
}

export interface VideoCursorLoad {
  list: videoInfoWithStat[],
  hasMore: boolean,
  cursor: string | null
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
   * 根据用户ID获取该用户的所有视频元数据
   * @param userId  用户ID
   * @returns  视频元数据列表
   */
  getVideosInfoByUserId: (params: { tid: number, cursor: string | null }) => request<VideoCursorLoad>('/video/info/all', {
    method: 'GET',
    data: params
  }),
  /**
   * 根据用户ID获取该用户的所有点赞视频记录
   * @param params tid：目标用户id，cursor：游标
   * @returns 视频元数据列表
   */
  getLikeVideosInfoByUserId: (params: { tid: number, cursor: string | null }) => request<VideoCursorLoad>('/video/info/likes', {
    method: 'GET',
    data: params
  })
}
