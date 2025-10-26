import { defineStore } from 'pinia';
import type { userInfo } from '../api/userService.ts'
import type { UserStatistics } from '../api/analyticsService.ts'
import userService from '../api/userService'
import { handleRequest } from '../api/handleRequest'
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: {
      isLogin: false, // 是否登录
      id: 0, // 用户ID
      username: '', // 用户名
      avatarUrl: '', // 头像URL
      bio: '', // 个人简介
      followingCount: 0, // 关注数
      followerCount: 0, // 粉丝数
      likeCount: 0, // 获赞数
    }
  }),
  actions: {
    async fetchUserInfo() {
      // 如果存在token，获取用户信息
      if (localStorage.getItem('token')) {
        await handleRequest(userService.getUserinfoByToken, {
          onSuccess: (data) => {
            this.setBaseUserinfo(data)
            this.userInfo.isLogin = true;
          },
        })
      }
    },
    setBaseUserinfo(data: userInfo) {
      this.userInfo.id = data.id;
      this.userInfo.username = data.username;
      this.userInfo.avatarUrl = data.avatarUrl;
      this.userInfo.bio = data.bio;
    },
    setUserStatistics(data: UserStatistics) {
      this.userInfo.followingCount = data.followingCount;
      this.userInfo.followerCount = data.followerCount;
      this.userInfo.likeCount = data.likeCount;
    },
    logout() {
      this.userInfo.isLogin = false;
      this.userInfo.id = 0;
      this.userInfo.username = '';
      this.userInfo.avatarUrl = '';
      this.userInfo.bio = '';
    },
  },
});
