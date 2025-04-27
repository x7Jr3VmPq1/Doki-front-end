<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useRouter, useRoute} from 'vue-router'
import {getNotifications, getDirectMessages} from "../../api/notificationService.ts";
import {useNotificationsStore} from "../../store/notificationsStore.ts";
import type {Dialog} from "../../store/notificationsStore.ts";

const router = useRouter();
const route = useRoute();
const selectedKey = computed(() => route.name);
const handleMenuClick = ({key}: { key: string }) => {
  router.push({name: key})  // 对应下面的路由配置 name
}
const notificationsStore = useNotificationsStore();
const isLoading = ref(true);
onMounted(async () => {
  notificationsStore.likeNotifications = (await getNotifications('like')).data;
  notificationsStore.commentNotifications = (await getNotifications('comment')).data;

  // 获取对话列表并添加未读消息数量
  const dialogs = (await getDirectMessages()).data.map((dialog: Dialog) => {
    dialog.unreadCount = dialog.messages.filter(message => !message.read).length;
    return dialog;
  });
  notificationsStore.dialogs.push(...dialogs);
  // 模拟延迟
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
})

// 退出时清除对话列表
onUnmounted(() => {
  notificationsStore.dialogs = [];
})
</script>

<template>
  <div style="height: 100%;width: 100%;">
    <div v-if="isLoading" class="loading-container">
      <!-- 加载动画 -->
      <a-spin :spinning="true" size="large" tip="加载中...">
      </a-spin>
    </div>
    <a-row v-else style="height: 100%">
      <a-col :span="4" style="color: black">
        <a-menu
            theme="light"
            mode="vertical"
            :selected-keys="[selectedKey]"
            @click="handleMenuClick"
        >
          <a-menu-item key="my"
                       @click="notificationsStore.messagesMarkAsRead()"
          >我的消息
            <span v-if="notificationsStore.messageUnreadCount>0"> ({{ notificationsStore.messageUnreadCount }})</span>
          </a-menu-item>
          <a-menu-item
              key="reply"
              @click="notificationsStore.commentsMarkAsRead()"
          >回复我的
            <span v-if="notificationsStore.commentUnreadCount>0">({{ notificationsStore.commentUnreadCount }})</span>
          </a-menu-item>
          <a-menu-item
              key="like"
              @click="notificationsStore.likesMarkAsRead()"
          >收到的赞
            <span v-if="notificationsStore.likeUnreadCount>0">({{ notificationsStore.likeUnreadCount }})</span>
          </a-menu-item>
          <a-menu-item key="mention">@我</a-menu-item>
          <a-menu-item key="system">系统通知</a-menu-item>
        </a-menu>
      </a-col>
      <a-col :span="20" style="color: black">
        <router-view :key="$route.fullPath"/>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100vh; /* 占满整个视口高度 */
  width: 100%; /* 占满整个视口宽度 */
}

</style>
