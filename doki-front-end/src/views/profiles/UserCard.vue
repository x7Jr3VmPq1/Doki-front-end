<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import userService from '../../api/userService.ts';
import analyticsService from '../../api/analyticsService.ts'
import type { UserStatistics } from '../../api/analyticsService.ts'
import type { userInfo } from '../../api/userService.ts'
import { handleRequest } from '../../api/handleRequest.ts';
import { useUserStore } from '../../store/userInfoStore.ts'
import FollowModal from '../../components/FollowModal.vue';
import EditProfileModal from './EditProfileModal.vue';
import { Edit } from '@icon-park/vue-next'
import router from '../../router/index.ts';
const userStore = useUserStore();

const props = defineProps<{
  mode: string,
  uid: number
}>()

const userInfo = reactive<userInfo>({
  id: -1,
  username: '',
  avatarUrl: '',
  bio: '',
});

const userStat = reactive<UserStatistics>({
  userId: -1,
  followingCount: 0,
  followerCount: 0,
  likeCount: 0,
  createdAt: 0,
  updatedAt: 0
});

const state = reactive({
  followModal: false,
  editModal: false
})

// 获取用户信息
onMounted(() => {
  handleRequest(userService.getUserinfoById, {
    onSuccess(data) {
      Object.assign(userInfo, data[0]);
    }, params: props.mode == 'my' ? [userStore.userInfo.id] : [props.uid]
  })

  handleRequest(analyticsService.getUserStatById, {
    onSuccess(data) {
      Object.assign(userStat, data);
    }, params: userStore.userInfo.id
  })


});

// 处理编辑按钮点击
const handleEditClick = () => {
  state.editModal = true;
}

// 处理资料更新
const handleProfileUpdated = (updatedData: any) => {
  Object.assign(userInfo, updatedData);
  // 可以在这里添加其他更新逻辑，比如重新获取统计数据
}

</script>

<template>
  <FollowModal :visible="state.followModal" @update:visible="state.followModal = $event"></FollowModal>
  <EditProfileModal :visible="state.editModal" :userInfo="userInfo" @update:visible="state.editModal = $event"
    @profileUpdated="handleProfileUpdated" />
  <div class="user-card">
    <div class="avatar-container">
      <img :src="userInfo.avatarUrl" class="avatar" />
    </div>
    <div class="user-info">
      <div class="name-change-info">
        <h1 class="user-name">{{ userInfo.username }}</h1>
        <div class="edit-button" @click="handleEditClick">
          <edit></edit>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item" @click="state.followModal = !state.followModal">关注 <span class="stat-value">{{
          userStat.followingCount }}</span></div>
        <div class="stat-item" @click="state.followModal = !state.followModal">粉丝 <span class="stat-value">{{
          userStat.followerCount }}</span></div>
        <div class="stat-item">获赞 <span class="stat-value">{{ userStat.likeCount }}</span></div>
      </div>
      <div class="user-bio">
        {{ userInfo.bio }}
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
