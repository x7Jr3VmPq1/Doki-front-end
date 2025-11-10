<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import searchService from '../../api/searchService';
import type { userSearchResult } from '../../api/searchService';
import socialService from '../../api/socialService.ts';
import { handleRequest } from '../../api/handleRequest';
import { useRoute } from 'vue-router';
import toProfiles from '../../utils/toProfiles.ts'
import { useUserStore } from '../../store/userInfoStore.ts';

const userStore = useUserStore();

const userProfiles = ref<userSearchResult[]>([]);

// 从地址栏上获取搜索关键词
const route = useRoute();
const keyword = route.query.keyword as string;

const handleFollow = (userId: number) => {
  const user = userProfiles.value.find(u => u.id === userId);
  if (!user) return;
  handleRequest(user.followed ? socialService.followUser : socialService.unFollowUser, {
    onSuccess: () => {
      if (user) {
        user.followed = !user.followed;
      }
    },
    onError: (error) => {
      console.error('Failed to follow user:', error);
    }, params: userId
  });
};

onMounted(() => {
  handleRequest(searchService.searchUser, {
    onSuccess: (data) => {
      userProfiles.value = data;
    },
    onError: (error) => {
      console.error('Failed to fetch user profiles:', error);
    }, params: keyword
  });
});
</script>

<template>
  <div class="user-profiles-container" v-if="userProfiles.length">
    <div v-for="user in userProfiles" :key="user.id" class="user-card">
      <div class="user-header">
        <img :src="user.avatarUrl" alt="User Avatar" class="user-avatar" @click="toProfiles(user.id)" />
        <div class="user-info">
          <div class="user-name-wrapper">
            <span class="user-name" @click="toProfiles(user.id)">{{ user.username }}</span>
          </div>
          <div class="user-stats">
            <span>{{ user.stat.likeCount ?? ' - ' }}获赞</span>
            <span>{{ user.stat.followerCount ?? ' - ' }}粉丝</span>
          </div>

          <div v-if="user.bio" class="user-bio">
            {{ user.bio }}
          </div>
        </div>
        <button v-if="user.id !== userStore.userInfo.id" class="follow-button" @click="handleFollow(user.id)"
          :class="{ followed: user.followed }">
          {{ user.followed ? '已关注' : '关注' }}
        </button>
      </div>
    </div>
  </div>
  <div class="empty flex-center" v-else>
    暂无更多
  </div>
</template>

<style scoped>
.user-profiles-container {
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.user-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-width: 320px;
}

.user-header {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.user-avatar {
  cursor: pointer;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  cursor: pointer;
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.user-name:hover {
  color: #fe2c55;
}

.vip-tag {
  background-color: #fef0cd;
  color: #d19f00;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  white-space: nowrap;
}

.douyin-id {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 4px;
}

.user-stats span {
  font-size: 0.8em;
  color: #999;
  margin-right: 10px;
}

.user-extra-info {
  font-size: 0.85em;
  color: #555;
  margin-top: 5px;
}

.user-bio {
  font-size: 0.85em;
  color: #888;
  margin-top: 5px;
  word-break: break-word;
}

.follow-button {
  /* 红色 */
  background-color: #fe2c55;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.followed {
  background-color: #ccc;
}


.empty {
  text-align: center;
  color: #888;
  margin-top: 20px;
}
</style>
