<script setup lang="ts">
import {ref} from 'vue';

// Define the interface for a user profile
interface UserProfile {
  id: string;
  avatar: string;
  name: string;
  douyinId: string;
  likes: string;
  followers: string;
  bio?: string; // Optional field
  extraInfo?: string; // Optional field for things like "营销12年"
  isVIP?: boolean; // Optional, for the "私密账号" icon
}

// Mock data based on the provided image
const userProfiles = ref<UserProfile[]>([
  {
    id: 'user1',
    avatar: 'https://picsum.photos/id/1015/60/60', // Placeholder image
    name: '123',
    douyinId: 'dcr68',
    likes: '1.6万',
    followers: '89.4万',
    bio: '此用户没有填写简介',
  },
  {
    id: 'user2',
    avatar: 'https://picsum.photos/id/1018/60/60', // Placeholder image
    name: '123',
    douyinId: 'xj072020',
    likes: '5259',
    followers: '20.8万',
    extraInfo: '营销12年',
  },
  {
    id: 'user3',
    avatar: 'https://picsum.photos/id/1025/60/60', // Placeholder image
    name: '123',
    douyinId: '999ve',
    likes: '71.8万',
    followers: '20.2万',
    bio: '.',
  },
  {
    id: 'user4',
    avatar: 'https://picsum.photos/id/103/60/60', // Placeholder image
    name: '123',
    douyinId: '17750592Z',
    likes: '433.6万',
    followers: '21.5万',
    bio: '此用户没有填写简介',
    isVIP: true, // Example for the "私密账号" (private account) icon
    extraInfo: '新罗区群乐鞋店'
  },
  {
    id: 'user5',
    avatar: 'https://picsum.photos/id/1041/60/60', // Placeholder image
    name: '123@@@',
    douyinId: '21141097',
    likes: '138',
    followers: '66.4万',
    bio: '此用户没有填写简介',
  },
  {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  }, {
    id: 'user6',
    avatar: 'https://picsum.photos/id/1047/60/60', // Placeholder image
    name: '帅帅哒123',
    douyinId: '41188506767',
    likes: '3',
    followers: '30',
    bio: '此用户没有填写简介',
  },
]);

// Function to handle follow button click (optional)
const handleFollow = (userId: string) => {
  console.log(`Following user: ${userId}`);
  // In a real application, you would update the user's follow status here.
};
</script>

<template>
  <div class="user-profiles-container">
    <div v-for="user in userProfiles" :key="user.id" class="user-card">
      <div class="user-header">
        <img :src="user.avatar" alt="User Avatar" class="user-avatar"/>
        <div class="user-info">
          <div class="user-name-wrapper">
            <span class="user-name">{{ user.name }}</span>
            <span v-if="user.isVIP" class="vip-tag">☀️ 私密账号</span>
          </div>
          <div class="douyin-id">抖音号: {{ user.douyinId }}</div>
          <div class="user-stats">
            <span>{{ user.likes }}获赞</span>
            <span>{{ user.followers }}粉丝</span>
          </div>
          <div v-if="user.extraInfo" class="user-extra-info">
            {{ user.extraInfo }}
          </div>
          <div v-if="user.bio" class="user-bio">
            {{ user.bio }}
          </div>
        </div>
        <button @click="handleFollow(user.id)" class="follow-button">关注</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profiles-container {
  height: 70vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); /* Responsive grid */
  gap: 20px;
  padding: 20px;
}

.user-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease-in-out; /* Smooth transition for hover */
  min-width: 320px; /* Ensure cards don't get too small */
}

.user-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* Larger shadow on hover */
}

.user-header {
  display: flex;
  align-items: flex-start; /* Align items to the top to accommodate bio */
  gap: 15px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0; /* Prevent avatar from shrinking */
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
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.vip-tag {
  background-color: #fef0cd; /* Light yellow background */
  color: #d19f00; /* Darker yellow text */
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  white-space: nowrap; /* Prevent wrapping */
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
  /* Allow the bio to wrap, but keep it concise */
  word-break: break-word;
}

.follow-button {
  background-color: #fe2c55; /* TikTok/Douyin red */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap; /* Prevent text from wrapping */
  flex-shrink: 0; /* Prevent button from shrinking */
}

.follow-button:hover {
  background-color: #e0294c;
}
</style>
