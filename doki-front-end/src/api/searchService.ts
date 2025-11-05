import request from './gateway';
import type { VideoInfo } from './feedService'
import type { VideoStatistics } from './analyticsService'
import type { userInfo } from './userService';

export interface searchHistory {
  id: number;
  keyword: string;
  count: number;
  createdAt: number;
  updatedAt: number;
}

export interface searchResult {
  video: VideoInfo,
  statistics: VideoStatistics,
  user: userInfo,
  highlight: string | null,
}


export default {
  /**
   * 获取搜索历史记录
   * @returns 
   */
  getSearchHistoryList: () => request<searchHistory[]>('/search/history', {
    method: 'GET',
  }),
  /**
   * 搜索
   * @param keyword 
   * @returns 
   */
  search: (keyword: string) => request<searchResult[]>('/search', {
    method: 'GET',
    data: { keyword },
  }),
}
