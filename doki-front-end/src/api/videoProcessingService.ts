import request from './gateway.ts'
import type {VideoInfo} from './feedService.ts'
/**
 * 获取视频元数据API
 */
export default {
    getVideoInfo: (videoId: number) => request<VideoInfo>('/video/info', {
        method: 'GET',
        data: {videoId}
    })
}
