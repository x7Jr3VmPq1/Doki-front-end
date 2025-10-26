<template>
  <div class="user-info">
    <div class="user-name">{{ userStore.userInfo.username }}</div>
    <div class="user-stat">
      <span>{{ "关注 " + userStore.userInfo.followingCount }}</span>
      <span>{{ "粉丝 " + userStore.userInfo.followerCount }}</span>
      <span>{{ "获赞 " + userStore.userInfo.likeCount }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../store/userStore';
import analyticsService from '../../api/analyticsService';
import { handleRequest } from '../../api/handleRequest.ts';
import { onMounted, nextTick } from 'vue';
const userStore = useUserStore();
onMounted(async () => {
  // 获取用户统计数据
  console.log(userStore.userInfo.id);
  await nextTick();

  await handleRequest(analyticsService.getUserStatById, {
    onSuccess: (data) => {
      console.log("用户统计数据：", data);
      userStore.setUserStatistics(data);
    }, params: userStore.userInfo.id
  })
})


</script>
<style scoped>
.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 15px;
}

.user-stat {
  display: flex;
  gap: 5px;
  font-size: 14px;
  color: #777880;
}
</style>
