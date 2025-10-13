<template>
  <div class="profile-card" ref="container">
    <div class="profile-header">
      <img :src="user.avatarUrl" alt="User Avatar" class="user-avatar"/>
      <div class="user-details">
        <div class="username">{{ userStore.userInfo.username }}</div>
        <div class="follow-info">
          <follow-modal
              v-model:visible="openFollowingList"
              :fans-list="fansList"
              :following-list="followingList">
          </follow-modal>
          <span class="follow-item" @click="openFollowingList = true">关注 {{
              userStore.userInfo.followingCount
            }}</span>
          <span class="follow-divider">|&nbsp;</span>
          <span class="follow-item" @click="openFollowingList = true">粉丝 {{ userStore.userInfo.followerCount }}</span>
        </div>
      </div>
    </div>

    <div class="section my-likes"
         @mouseenter="expandSection('likes')">
      <div class="section-header">
        <div class="section-title">
          <span class="icon red-heart"></span>
          我的喜欢
        </div>
        <div class="section-count">
          {{ 123 }}
          <span class="arrow-right" :class="{ 'rotated': expandedSection === 'likes' }"></span>
        </div>
      </div>
      <transition name="expand">
        <div v-if="expandedSection === 'likes'" class="likes-grid-wrapper">
          <div class="likes-grid">
            <div v-for="item in placeholderItems" :key="item.id" class="like-item">
              <img :src="item.image" :alt="item.title" class="like-item-image"/>
              <div class="like-item-title">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div class="section-list">
      <div class="section-item-wrapper">
        <div class="section-item"
             @mouseenter="expandSection('collections')">
          <div class="section-title">
            <span class="icon yellow-star"></span>
            我的收藏
          </div>
          <div class="section-count">
            {{ user.collectionsCount }}
            <span class="arrow-right" :class="{ 'rotated': expandedSection === 'collections' }"></span>
          </div>
        </div>
        <transition name="expand">
          <div v-if="expandedSection === 'collections'" class="likes-grid-wrapper">
            <div class="likes-grid">
              <div v-for="item in placeholderItems" :key="item.id" class="like-item">
                <img :src="item.image" :alt="item.title" class="like-item-image"/>
                <div class="like-item-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="section-item-wrapper">
        <div class="section-item"
             @mouseenter="expandSection('watchHistory')">
          <div class="section-title">
            <span class="icon green-history"></span>
            观看历史
          </div>
          <div class="section-count">
            {{ "30天内" }}
            <span class="arrow-right" :class="{ 'rotated': expandedSection === 'watchHistory' }"></span>
          </div>
        </div>
        <transition name="expand">
          <div v-if="expandedSection === 'watchHistory'" class="likes-grid-wrapper">
            <div class="likes-grid">
              <div v-for="item in placeholderItems" :key="item.id" class="like-item">
                <img :src="item.image" :alt="item.title" class="like-item-image"/>
                <div class="like-item-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="section-item-wrapper">
        <div class="section-item"
             @mouseenter="expandSection('watchLater')">
          <div class="section-title">
            <span class="icon purple-watch-later"></span>
            稍后再看
          </div>
          <div class="section-count">
            {{ user.watchLaterCount }}
            <span class="arrow-right" :class="{ 'rotated': expandedSection === 'watchLater' }"></span>
          </div>
        </div>
        <transition name="expand">
          <div v-if="expandedSection === 'watchLater'" class="likes-grid-wrapper">
            <div class="likes-grid">
              <div v-for="item in placeholderItems" :key="item.id" class="like-item">
                <img :src="item.image" :alt="item.title" class="like-item-image"/>
                <div class="like-item-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="section-item-wrapper">
        <div class="section-item"
             @mouseenter="expandSection('myWorks')">
          <div class="section-title">
            <span class="icon blue-my-works"></span>
            我的作品
          </div>
          <div class="section-count">
            {{ user.myWorksCount }}
            <span class="arrow-right" :class="{ 'rotated': expandedSection === 'myWorks' }"></span>
          </div>
        </div>
        <transition name="expand">
          <div v-if="expandedSection === 'myWorks'" class="likes-grid-wrapper">
            <div class="likes-grid">
              <div v-for="item in placeholderItems" :key="item.id" class="like-item">
                <img :src="item.image" :alt="item.title" class="like-item-image"/>
                <div class="like-item-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="logout-section">
      <div class="logout-button" @click="handleLogout">
        <span class="icon red-logout"></span>
        退出登录
      </div>
      <div class="remember-login">
        <span>保存登录信息</span>
        <label class="switch">
          <input type="checkbox" v-model="rememberLogin"/>
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {createVNode, ref, onMounted} from 'vue';
import FollowModal from "./follow-modal.vue";
import {useUserStore} from "../store/userInfoStore.ts";
import analyticsService from '../api/analyticsService.ts';
import {handleRequest} from '../api/handleRequest.ts'
import {Modal} from "ant-design-vue";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";

onMounted(async () => {
  await handleRequest(analyticsService.getUserStatById, {
    onSuccess: (data) => {
      userStore.setFollowCount(data);
    },
    params: userStore.userInfo.id
  })
})

interface LikedItem {
  id: number;
  image: string;
  title: string;
}

const userStore = useUserStore();
const user = userStore.userInfo!;

const container = ref(null); // 卡片容器引用，用于指定对话框的挂载点

const followingList = ref([]); // 关注列表
const fansList = ref([]); // 粉丝列表

const openFollowingList = ref(false); // 控制 FollowModal 的显示/隐藏

const rememberLogin = ref(false);
const expandedSection = ref<string | null>(null); // State to track which section is expanded

const placeholderItems: LikedItem[] = [
  {id: 101, image: 'http://localhost:8081/videos/defaultCover.jpg', title: '占位内容一'},
  {id: 102, image: 'http://localhost:8081/videos/defaultCover.jpg', title: '占位内容二'},
  {id: 103, image: 'http://localhost:8081/videos/defaultCover.jpg', title: '占位内容三'},
];

const expandSection = (sectionName: string) => {
  // 检查鼠标是否在当前的 expandedSection 上，如果是，则不改变
  // 否则，如果是一个新的 section，就展开它
  // 如果是同一个 section，这行代码不会改变 expandedSection.value
  // 如果你需要点击同一个 section 来关闭它，这里需要额外的逻辑
  // 比如：expandedSection.value = expandedSection.value === sectionName ? null : sectionName;
  expandedSection.value = sectionName;
};

const handleLogout = () => {
  // 退出登录逻辑
  // 清除用户信息、重定向到登录页面等
  Modal.confirm({
    title: '确认退出登录吗？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    getContainer: container.value,
    cancelText: '取消',
    maskClosable: true,
    async onOk() {
      localStorage.clear();
      window.location.reload();
    }
  });

};

</script>
<style scoped>
.profile-card {
  width: 375px;
  background-color: #f8f8f8;
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid #fff; /* White border for avatar */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.follow-info {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
}

.follow-item {
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    color: #fe2c55;
  }
}

.follow-divider {
  margin: 0 4px;
  color: #ccc;
}

.section {
  background-color: #fff;
  margin-top: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #fff;
}

.section-item-wrapper .section-item {
  border-bottom: none;
}


.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-count {
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
}

.arrow-right {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-top: 1.5px solid #ccc;
  border-right: 1.5px solid #ccc;
  transform: rotate(45deg);
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.arrow-right.rotated {
  transform: rotate(135deg);
}

/* Icons */
.icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* Specific icon styles (from previous code) */
.red-heart {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FE2C55"%3e%3cpath d="M12 21.35l-1.84-1.69C4.04 15.36 2 13.05 2 10.5 2 7.42 4.42 5 7.5 5c1.74 0 3.41.81 4.5 2.09C13.09 5.81 14.76 5 16.5 5 19.58 5 22 7.42 22 10.5c0 2.55-2.04 4.86-8.16 10.16L12 21.35z"/%3e%3c/svg%3e');
}

.yellow-star {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFC107"%3e%3cpath d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/%3e%3c/svg%3e');
}

.green-history {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"%3e%3cpath d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.87-3.13 7-7 7-1.51 0-2.91-.49-4.06-1.3l-1.42 1.42C8.36 19.9 10.04 20.5 12 20.5c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/%3e%3c/svg%3e');
}

.purple-watch-later {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239C27B0"%3e%3cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V7h2v10zm3.5-9.5V14h-2V7.5h2z"/%3e%3c/svg%3e');
}

.blue-my-works {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232196F3"%3e%3cpath d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/%3e%3c/svg%3e');
}

.gray-bell {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3e%3cpath d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2.5h-3v.18C7.63 3.36 6 5.93 6 9v7l-2 2v1h16v-1l-2-2z"/%3e%3c/svg%3e');
}

.gray-order {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3e%3cpath d="M16 6h-2v2h2V6zm-5 0H9v2h2V6zm-2 5H7v2h2v-2zm-2 5H3v2h2v-2zm-2-5H1v2h2v-2zm18-5v14H3V3h18l2-2H1v18h22V5h-2z"/%3e%3c/svg%3e');
}

.red-logout {
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FE2C55"%3e%3cpath d="M17 7L15.59 8.41 18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/%3e%3c/svg%3e');
}


/* My Likes Specific Styling */
.my-likes {
  margin-bottom: 0; /* Ensures it sits tightly with other sections when collapsed */
}

.likes-grid-wrapper {
  padding: 0 20px 15px; /* Padding for the content inside the expanded section */
}

.likes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.like-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.like-item-image {
  width: 100%;
  height: 100px; /* Fixed height for images */
  object-fit: cover;
  border-radius: 8px;
}

.like-item-title {
  font-size: 13px;
  color: #555;
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.section-item-wrapper {
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.section-item-wrapper:last-child {
  border-bottom: none;
}

.section-list,
.additional-options {
  margin-top: 10px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.option-item {
  justify-content: flex-start;
}

.option-item .section-count {
  margin-left: auto;
}

.logout-section {
  background-color: #fff;
  margin-top: 10px;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px; /* Space at the bottom */
}

.logout-button {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #fe2c55; /* TikTok red */
  cursor: pointer;
  font-weight: 500;
}

.remember-login {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #333;
}

/* Toggle Switch Styling (from previous code) */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #fe2c55;
}

input:focus + .slider {
  box-shadow: 0 0 1px #fe2c55;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}


/* Transition Styles for Expansion */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 200px; /* Adjust max-height based on content height */
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
