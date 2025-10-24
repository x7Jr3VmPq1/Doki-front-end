import { defineStore } from 'pinia';
import type { userInfo } from '../api/userService.ts'
import type { UserStatistics } from '../api/analyticsService.ts'
import userService from '../api/userService'
import { handleRequest } from '../api/handleRequest'
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      isLogin: false,
      id: 0,
      username: '',
      avatarUrl: '',
      bio: '',
      followingCount: 0,
      followerCount: 0
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
    setFollowCount(data: UserStatistics) {
      this.userInfo.followingCount = data.followingCount;
      this.userInfo.followerCount = data.followerCount;
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
