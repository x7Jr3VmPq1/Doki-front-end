<script setup lang="ts">
import { reactive } from 'vue';
import type { UserStatistics } from '../../api/analyticsService.ts'
import type { userInfo } from '../../api/userService.ts'
import { useUserStore } from '../../store/userInfoStore.ts'
import FollowModal from '../../components/FollowModal.vue';
import EditProfileModal from './EditProfileModal.vue';
import { Edit } from '@icon-park/vue-next'
const userStore = useUserStore();

const props = defineProps<{
  info: userInfo,
  stat: UserStatistics
}>()

const state = reactive<{
  followModal: boolean;
  editModal: boolean;
}>({
  followModal: false,
  editModal: false
})

// 处理编辑按钮点击
const handleEditClick = () => {
  state.editModal = true;
}
// 处理更新用户信息
const handleUpdateInfo = (_: userInfo) => {
  // 刷新页面
  window.location.reload();
}

</script>

<template>
  <!-- 关注/粉丝列表模态框 -->
  <FollowModal :tid="props.info.id" :visible="state.followModal" @update:visible="state.followModal = $event">
  </FollowModal>
  <!-- 编辑资料模态框 -->
  <EditProfileModal :visible="state.editModal" :userInfo="props.info" @update:user-info="handleUpdateInfo"
    @update:visible="state.editModal = $event" />
  <div class="user-card">
    <div class="avatar-container">
      <img :src="props.info.avatarUrl" class="avatar" />
    </div>
    <div class="user-info">
      <div class="name-change-info">
        <h1 class="user-name">{{ props.info.username }}</h1>
        <div class="edit-button" @click="handleEditClick" v-if="props.info.id === userStore.userInfo.id">
          <edit></edit>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item" @click="state.followModal = !state.followModal">关注 <span class="stat-value">{{
          stat.followingCount }}</span></div>
        <div class="stat-item" @click="state.followModal = !state.followModal">粉丝 <span class="stat-value">{{
          stat.followerCount }}</span></div>
        <div class="stat-item">获赞 
          <span class="stat-value">{{ stat.likeCount }}</span>
        </div>
      </div>
      <div class="user-bio">
        {{ props.info.bio }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.name-change-info {
  display: flex;
}

.edit-button {
  cursor: pointer;
  padding-top: 3px;
  margin-left: 10px;
  font-size: 20px;
}

.edit-button:hover {
  color: red;
}

/* 用户签名 */
.user-bio {
  height: 30px;
  line-height: 30px;
  text-align: start;
  /* 水平居中 */
  font-size: 14px;
  color: #666;
}

.stats {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.stat-item {
  cursor: pointer;
}

.stat-item:hover {
  color: #000;
}

.stat-value {
  font-weight: bold;
  color: #333;
}
</style>
