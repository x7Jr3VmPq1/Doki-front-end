<script setup lang="ts">
import socialService from '../../api/socialService';
import { handleRequest } from '../../api/handleRequest';
// 定义一个属性，用于判断是否已经关注。
const props = defineProps<{
  isFollowing: boolean, // 是否已关注属性
  uid?: number // 可选的用户ID属性
}>()
// 定义一个事件发射器，更新关注状态
const emit = defineEmits<{
  (e: 'update:isFollowing', value: boolean): void
}>();
// 处理关注按钮点击
const handleClickFollow = async () => {
  await handleRequest(props.isFollowing ? socialService.unFollowUser : socialService.followUser, {
    onSuccess() {
      // 通知父组件更新状态
      emit('update:isFollowing', !props.isFollowing);
    },
    params: props.uid
  });
}
</script>

<template>
  <div class="user-details-row">
    <div class="user-action-buttons">

      <button @click="handleClickFollow" class="action-button follow-button" :class="{ following: props.isFollowing }">
        <span class="follow-icon">+</span> {{ props.isFollowing ? '已关注' : '关注' }}
      </button>

      <button class="action-button private-message-button">私信</button>
    </div>
  </div>
</template>

<style scoped>
/* 用户详细信息行 */
.user-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-action-buttons {
  width: 100%;
  justify-content: flex-end;
  display: flex;
  gap: 10px;
}


.user-action-buttons .action-button {
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.follow-button {
  background-color: #fe2c55;
  color: #fff;
}

/* 已关注按钮样式 */
.follow-button.following {
  background-color: #ccc;
  color: #666;
}

.private-message-button {
  background-color: #e0e0e0;
  color: #333;
}
</style>
