import request from './gateway.ts'
import type { VideoInfo } from './feedService.ts'
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
  getVideosInfoByUserId: (tid: number) => request<VideoInfo[]>('/video/info/all', {
    method: 'GET',
    data: { tid }
  })
}
