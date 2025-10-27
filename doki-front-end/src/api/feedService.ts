/**
 * 推荐流服务：
 * 获取推荐视频（目前完全随机五个）
 */

import request from './gateway.ts'

// 视频信息接口类型定义
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
}

export default {
  getRandomVideos: () => request<VideoInfo[]>('/feed/random', {
    method: 'GET'
  })
}
