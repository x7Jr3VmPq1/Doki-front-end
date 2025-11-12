<template>
  <div class="notification-container">
    <div class="notification-header">
      <h2>互动消息</h2>
      <div class="all-messages-dropdown" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
        <span>全部消息</span>
        <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <div v-if="showDropdown" class="dropdown-content">
          <div v-for="(option, index) in dropdownOptions" :key="index" class="dropdown-item">
            {{ option }}
          </div>
        </div>
      </div>
    </div>

    <div class="notification-list">
      <div @click="handleJump(item)" v-for="item in list" class="notification-item">
        <div class="user-avatar" @click.stop="toProfiles(item.user.id)">
          <img :src="item.user.avatarUrl" alt="User Avatar" />
        </div>
        <div class="message-content">
          <div class="user-info">
            <span class="username" @click.stop="toProfiles(item.user.id)">{{ item.user.username }}</span>
            <!-- <span class="author-tag">作者</span> -->
          </div>
          <div class="reply-timestamp">{{ changeNotice(item.type) }}</div>
          <div class="message-text">{{ item.content }}</div>
          <div class="reply-timestamp"> {{ dayUtils.formatTimestamp(item.createdAt) }}</div>
        </div>
        <div class="message-thumbnail" v-if="item.sourceInfo">
          <img :src="item.sourceInfo.coverName" alt="Message Thumbnail" />
        </div>
      </div>

      <div class="no-more-messages">
        <span>暂时没有更多了</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { handleRequest } from '../../api/handleRequest';
import type { Notification } from '../../api/notification_dmService';
import notification_dmService from '../../api/notification_dmService';
import toProfiles from '../../utils/toProfiles';
import { dayUtils } from '../../utils/dayUtils';
import toVideoDetail from '../../utils/toVideoDetail';
const showDropdown = ref(false);
const dropdownOptions = ref([
  '全部消息',
  '粉丝',
  // '@我的',
  '评论',
  '赞',
  // '弹幕'
]);

const list = ref<Notification[]>([]);

onMounted(async () => {
  await handleRequest(notification_dmService.getNotifications, {
    onSuccess(data) {
      console.log(data);

      list.value = data;
    }
  })
})

const changeNotice = (type: number) => {

  let str = '';
  switch (type) {
    case 1: str = "关注了你"
      break;
    case 2: str = "赞了你的视频"
      break;
    case 3: str = "赞了你的评论"
      break;
    case 4: str = "评论了你的视频"
      break;
    case 5: str = "回复了你的评论"
      break;
  }
  return str;
}

const handleJump = (n: Notification) => {
  if (n.sourceVideoId) {
    toVideoDetail(n.sourceVideoId);
  }
}
</script>

<style scoped>
.notification-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 300px;
  height: 500px;
  overflow: hidden;

}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
}

.notification-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.all-messages-dropdown {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.all-messages-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-content {
  padding: 15px;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 10;
  margin-top: 2px;
  /* Space between trigger and dropdown */
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.dropdown-item:hover {
  border-radius: 10px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.notification-list {
  padding: 15px 20px;
  height: 100%;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.notification-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.user-avatar {
  cursor: pointer;
  position: relative;
  margin-right: 15px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.username {
  cursor: pointer;
  font-weight: bold;
  color: #333;
  margin-right: 8px;
}

.username:hover {
  color: #fe2c55;
}

.author-tag {
  background-color: #e0e0e0;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.message-content {
  flex: 1;
}

.message-text {
  margin: 0 0 5px 0;
  color: #333;
  line-height: 1.5;
}

.reply-timestamp {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.message-thumbnail {
  margin-left: 15px;
  flex-shrink: 0;
}

.message-thumbnail img {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.no-more-messages {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}
</style>
