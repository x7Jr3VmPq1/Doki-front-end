<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick" @click.stop>
    <div class="follow-modal">
      <div class="modal-header">
        <div class="tabs">
          <div :class="['tab-item', { active: activeTab === 'following' }]" @click="activeTab = 'following'">
            关注 ({{ followingCount }})
          </div>
          <div :class="['tab-item', { active: activeTab === 'followers' }]" @click="activeTab = 'followers'">
            粉丝 ({{ followersCount }})
          </div>
        </div>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-content">
        <div class="search-sort-bar">
          <div class="search-input-wrapper">
            <input type="text" placeholder="搜索用户名或简介" class="search-input" v-model="searchTerm"/>
          </div>
          <div class="sort-option-wrapper" @mouseenter="showSortMenu = true" @mouseleave="showSortMenu = false">
            <div class="sort-option">
              <span class="sort-icon"></span>
              <span>{{ currentSortLabel }}</span></div>
            <div v-if="showSortMenu" class="sort-menu">
              <div
                  v-for="option in sortOptions"
                  :key="option.value"
                  :class="['sort-menu-item', { active: currentSort === option.value }]"
                  @click="selectSortOption(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="user-list">
          <div v-if="isLoading" class="loading-sign">
            <DokiLoading></DokiLoading>
          </div>
          <div v-else>
            <div v-if="usersToDisplay.length > 0">
              <div v-for="user in usersToDisplay" :key="user.id" class="user-item">
                <img :src="user.avatarUrl" alt="User Avatar" class="user-avatar"/>
                <div class="user-info">
                  <div class="user-name">{{ user.userName }}</div>
                  <div class="user-description">{{ user.bio }}</div>
                </div>
                <button class="followed-button" v-if="user.isFollowing" @click="handleFollowButtonClick(user)">已关注
                </button>
                <button class="follow-button" v-else @click="handleFollowButtonClick(user)">关注</button>
              </div>
            </div>
            <div v-else class="no-more-data">
              <p>暂时没有更多了</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from 'vue';
import {getFansList, getFollowList, followUser} from "../api/userService.ts";
import {useUserStore} from "../store/userInfoStore.ts";
import DokiLoading from "./Doki-Loading.vue";

const userStore = useUserStore();

interface User {
  id: number;
  userName: string;
  bio: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  likedCount: number;
  isFollowing: boolean;
}

type SortOptionValue = 'default' | 'latest_followed' | 'earliest_followed';

// 定义 Props
interface FollowModalProps {
  visible?: boolean; // 可选的 visible 属性
}

// 定义默认值
const props = withDefaults(defineProps<FollowModalProps>(), {
  visible: false,
});

// 定义 Emits
const emit = defineEmits(['update:visible']);

const activeTab = ref<'following' | 'followers'>('following');
const searchTerm = ref('');
const showSortMenu = ref(false); // 控制排序菜单的显示/隐藏
const currentSort = ref<SortOptionValue>('default'); // 当前选中的排序方式

const isLoading = ref(false);

watch(() => props.visible, async () => {
  if (props.visible) {
    isLoading.value = true;
    followingList.value = await getFollowList(userStore.userInfo?.userId);
    fansList.value = await getFansList(userStore.userInfo?.userId);
    // 500ms 延迟，确保数据已加载
    await new Promise(resolve => setTimeout(resolve, 500));
    isLoading.value = false;
  }
})

// 定义排序选项
const sortOptions = [
  {label: '综合排序', value: 'default'},
  {label: '最近关注', value: 'latest_followed'},
  {label: '最早关注', value: 'earliest_followed'},
];

// 获取当前排序方式的显示文本
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value);
  return option ? option.label : '综合排序';
});

const followingList = ref<User[]>([]);
const fansList = ref<User[]>([]);
const followingCount = computed(() => followingList.value.length);
const followersCount = computed(() => fansList.value.length);

// 根据当前选中的tab显示用户列表
const usersToDisplay = computed(() => {
  if (activeTab.value === 'following') {
    return followingList.value;
  } else {
    return fansList.value;
  }
});


// 选择排序方式并关闭菜单
const selectSortOption = (optionValue: SortOptionValue) => {
  currentSort.value = optionValue;
  showSortMenu.value = false; // 选择后关闭菜单
};

const closeModal = () => {
  emit('update:visible', false);
};

// 点击模态框外部关闭模态框
const handleOverlayClick = () => {
  emit('update:visible', false);
};

const handleFollowButtonClick = async (user: User) => {
  const res = await followUser(user.id);
  if (res.code == 200) {
    user.isFollowing = !user.isFollowing;
  }
};
</script>

<style scoped>
.loading-sign {
  /* 居中显示标记 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景，形成遮罩效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保模态框在最上层 */
}

.follow-modal {
  width: 600px; /* Adjust width as needed */
  height: 600px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1001; /* 比 overlay 高一点确保内容在遮罩上 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.tabs {
  padding-top: 20px;
  display: flex;
  gap: 20px;
}

.tab-item {
  font-size: 18px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  padding-bottom: 5px;
  position: relative;
}

.tab-item.active {
  color: #000;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background-color: #fe2c55; /* TikTok red color */
  border-radius: 2px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.modal-content {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
}

.search-sort-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  position: relative; /* 为排序菜单定位提供上下文 */
}

.search-input-wrapper {
  flex-grow: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  padding-left: 35px; /* Space for search icon */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f0f0f0;
}

.search-input::placeholder {
  color: #aaa;
}

.search-input-wrapper::before {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"%3e%3cpath d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/%3e%3c/svg%3e');
  background-size: contain;
  background-repeat: no-repeat;
}

/* 排序选项容器，现在 mouseenter 和 mouseleave 作用于它 */
.sort-option-wrapper {
  position: relative;
  cursor: pointer;
  padding: 5px 0;
  border-radius: 4px;
}

.sort-option {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
}

.sort-icon {
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"%3e%3cpath d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/%3e%3c/svg%3e');
  background-size: contain;
  background-repeat: no-repeat;
}

/* 排序菜单样式 */
.sort-menu {
  position: absolute;
  top: 100%; /* 定位在 sort-option-wrapper 下方 */
  right: 0; /* 对齐到右侧 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 120px;
  z-index: 10;
}

.sort-menu-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
}

.sort-menu-item:hover {
  background-color: #f5f5f5;
}

.sort-menu-item.active {
  color: #fe2c55;
  font-weight: bold;
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
}

.user-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.user-description {
  font-size: 13px;
  color: #777;
  margin-top: 2px;
}

.user-works-count {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.followed-button,
.follow-button {
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.followed-button {
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid #d0d0d0;
}

.follow-button {
  background-color: #fe2c55;
  color: #fff;
  border: 1px solid #fe2c55;
}

.no-more-data {
  text-align: center;
  padding: 20px;
  color: #999;
}
</style>
