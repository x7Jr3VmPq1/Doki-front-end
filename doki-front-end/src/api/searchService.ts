import request from './gateway';
import type { VideoInfo } from './feedService'
import type { VideoStatistics } from './analyticsService'
import type { userInfo } from './userService';
import type { UserStatistics } from './analyticsService'

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

export interface userSearchResult {
  id: number,
  username: string,
  avatarUrl: string,
  bio: string,
  stat: UserStatistics,
  followed: boolean,
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
  /**
   * 搜索建议
   * @param pre 
   * @returns 
   */
  suggest: (pre: string) => request<string[]>('/search/suggest', {
    method: 'GET',
    data: { pre }
  }),

  /**
   * 搜索用户
   * @param keyword 
   * @returns 
   */
  searchUser: (keyword: string) => request<userSearchResult[]>('/search/user', {
    method: 'GET',
    data: { keyword },
  }),
}
