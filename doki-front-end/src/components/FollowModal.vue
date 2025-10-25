<template>
  <Doki-Modal :visible="visible" :fullscreen="false" :closeOnOverlay="true" :showHeader="false" :showCloseButton="true"
    @update:visible="$emit('update:visible', $event)" @close="closeModal">
    <div class="follow-modal">
      <div class="modal-header">
        <div class="tabs">
          <div :class="['tab-item', { active: activeTab === 'following' }]" @click="activeTab = 'following'">
            关注 ({{ props.followCount }})
          </div>
          <div :class="['tab-item', { active: activeTab === 'followers' }]" @click="activeTab = 'followers'">
            粉丝 ({{ props.followerCount }})
          </div>
        </div>
      </div>

      <div class="modal-content">
        <div class="search-sort-bar">
          <!-- 搜索框 -->
          <div class="search-input-wrapper">
            <input type="text" placeholder="搜索用户名或简介" class="search-input" v-model="searchTerm" />
          </div>
          <!-- 排序选项 -->
          <div class="sort-option-wrapper" v-if="activeTab === 'following'" @mouseenter="showSortMenu = true"
            @mouseleave="showSortMenu = false">
            <div class="sort-option">
              <span class="sort-icon"></span>
              <span>{{ currentSortLabel }}</span>
            </div>
            <!-- 排序菜单 -->
            <div v-if="showSortMenu" class="sort-menu">
              <div v-for="option in sortOptions" :key="option.value"
                :class="['sort-menu-item', { active: currentSort === option.value }]"
                @click="selectSortOption(option.value)">
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
        <!-- 用户列表 -->
        <div class="user-list">
          <div v-if="isLoading" class="loading-sign">
            <DokiLoading></DokiLoading>
          </div>
          <div v-else>
            <div v-if="usersToDisplay.length > 0">
              <div v-for="user in usersToDisplay" :key="user.id" class="user-item">
                <img @click="handleClickUserInfo(user)" :src="user.avatarUrl" alt="User Avatar" class="user-avatar" />
                <div class="user-info">
                  <span class="user-name" @click="handleClickUserInfo(user)">{{ user.username }}</span>
                  <span class="user-description">{{ user.bio }}</span>
                </div>
                <!-- 操作按钮，如果这一项是自己，则不显示 -->
                <div v-if="user.id !== userStore.userInfo.id" @click="handleClickFollowButton(user)">
                  <button class="followed-button" v-if="user.followed">已关注
                  </button>
                  <button class="follow-button" v-else>关注</button>
                </div>
              </div>
            </div>
            <div v-else class="no-more-data">
              <p>暂时没有更多了</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Doki-Modal>
</template>

<script setup lang="ts">
// 组件说明：
// 这是一个关注/粉丝列表模态框组件，允许用户查看和管理他们的关注和粉丝列表。
// 用户可以在模态框中切换查看关注列表和粉丝列表，搜索用户，并根据不同的排序方式查看列表。
import { ref, computed, watch, onMounted } from 'vue';
import type { userInfo } from '../api/userService.ts'
import socialService from '../api/socialService.ts'
import DokiLoading from "./Doki-Loading.vue";
import DokiModal from "./Doki-Modal.vue";
import { handleRequest } from '../api/handleRequest';
import { useUserStore } from '../store/userInfoStore.ts';

const userStore = useUserStore();

// 定义 Props
interface FollowModalProps {
  visible?: boolean; // 可选的 visible 属性
  tid: number; // 目标用户 ID
  followCount?: number; // 可选的关注数
  followerCount?: number; // 可选的粉丝数
  tabIndex?: number; // 可选的初始标签页索引，0表示关注，1表示粉丝
}

// 定义默认值
const props = withDefaults(defineProps<FollowModalProps>(), {
  visible: false,
  tid: 0,
  followCount: 0,
  followerCount: 0,
  tabIndex: 0
});

// 定义 Emits
const emit = defineEmits(['update:visible']);

type SortOptionValue = 1 | 2 | 3; // 定义排序选项的值类型 1: 综合排序, 2: 最近关注, 3: 最早关注
const activeTab = ref<'following' | 'followers'>('following'); // 当前激活的标签页
const searchTerm = ref(''); // 搜索关键词
const showSortMenu = ref(false); // 控制排序菜单的显示/隐藏
const currentSort = ref<SortOptionValue>(1); // 当前选中的排序方式

const isLoading = ref(false); // 加载状态

// 定义排序选项
const sortOptions = [
  { label: '综合排序', value: 1 as SortOptionValue },
  { label: '最近关注', value: 2 as SortOptionValue },
  { label: '最早关注', value: 3 as SortOptionValue },
];

// 获取当前排序方式的显示文本
const currentSortLabel = computed(() => {
  const option = sortOptions.find(opt => opt.value === currentSort.value);
  return option ? option.label : '综合排序';
});

const followingList = ref<userInfo[]>([]); // 关注列表
const fansList = ref<userInfo[]>([]); // 粉丝列表

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
// 关闭模态框
const closeModal = () => {
  emit('update:visible', false);
};

// 分页游标
const cursor = ref('');

// 监听状态属性变化，加载数据
// 每当 visible、activeTab 或 currentSort 变化时，重新加载数据
watch(() => [props.visible, activeTab.value, currentSort.value], async ([open, newTab, newSort]) => {

  isLoading.value = true;
  await handleRequest(socialService.getFollowList, {
    onSuccess(data) {
      followingList.value = data.list;
    },
    delay: 300,
    params: { tid: props.tid, mode: newSort as SortOptionValue, cursor: cursor.value == '' ? null : cursor.value }
  });
  isLoading.value = false;

});
// 处理跳转到用户信息页面，从新窗口打开
const handleClickUserInfo = (user: userInfo) => {
  const userProfileUrl = `/profiles?uid=${user.id}`;
  window.open(userProfileUrl, '_blank');
}
// 处理关注/取消关注按钮点击
const handleClickFollowButton = async (user: userInfo) => {
  await handleRequest(user.followed ? socialService.unFollowUser : socialService.followUser, {
    onSuccess() {
      console.log("关注了吗？");

      user.followed = !user.followed;
    },
    params: user.id
  });
}
</script>

<style scoped>
.loading-sign {
  /* 居中显示标记 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.follow-modal {
  width: 600px;
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background-color: #fe2c55;
  /* TikTok red color */
  border-radius: 2px;
}

/* close-button 样式已由 Doki-Modal 提供 */

.modal-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.search-sort-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
  position: relative;
  /* 为排序菜单定位提供上下文 */
}

.search-input-wrapper {
  flex-grow: 1;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  padding-left: 35px;
  /* Space for search icon */
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
  top: 100%;
  /* 定位在 sort-option-wrapper 下方 */
  right: 0;
  /* 对齐到右侧 */
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
  cursor: pointer;
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
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.user-name:hover {
  /* 高亮 */
  color: #fe2c55;
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
