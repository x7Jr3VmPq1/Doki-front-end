<script setup lang="ts">
// 顶部标题栏组件，包括搜索框，功能按钮
// (通知按钮，消息按钮，投稿按钮，登录/个人信息按钮)
import MyDirectMessage from "./MyDirectMessage.vue";
import MyPopover from "../MyPopover.vue";
import SearchComponent from "./SearchComponent.vue";
import Notification from "./Notification.vue";
import LoginRegisterDialog from "./LoginRegisterDialog.vue";
import { Message, Remind, AddMusic } from '@icon-park/vue-next';
import { ref, onMounted, watch, reactive } from "vue";
import { getHotSearchList } from "../../api/searchService.ts";
import notification_dmService from "../../api/notification_dmService.ts";
import profileCard from "./ProfileCard.vue";
import { useUserStore } from "../../store/userInfoStore.ts";
import userService from '../../api/userService.ts'
import { handleRequest } from '../../api/handleRequest.ts'
import { useShareData } from "./shareData.ts";
const shareData = useShareData();
const userStore = useUserStore();
const avatarUrl = ref('');
const state = reactive({
  messageUnread: 0,
  notificationUnread: 0
})

onMounted(async () => {
  watch(() => userStore.userInfo.isLogin, async (newValue) => {
    if (newValue) {
      const getUnread = async () => {
        handleRequest(notification_dmService.getUnreadMessageCount, {
          onSuccess(data) {
            shareData.messageUnread = data;
          }
        })
      }
      await getUnread();
      setInterval(getUnread, 5000)
    }
  })
})

// 获取头像
watch(() => userStore.userInfo.isLogin, () => {
  avatarUrl.value = userStore.userInfo.avatarUrl;
})

const DMRef = ref();
watch(() => shareData.requestCreatConversationUID, (uid) => {
  if (uid > 0) {
    shareData.openMessageFromDMButton = true;
    DMRef.value.handleEnter();
  }
})

// 打开登录页面对话框
const showDialog = ref(false);
const showLoginDialog = () => {
  showDialog.value = true;
}
const toCreator = async () => {
  const url = 'http://localhost:5174/authpage';
  await handleRequest(userService.getAuthCode, {
    onSuccess(data) {
      // 构建跳转url
      const target = url + ("?auth=" + data) + "&" + ("userId=" + userStore.userInfo.id)
      window.open(target, '_blank');
    },
  })
}
</script>

<template>
  <div class="title-bar">
    <!-- 搜索输入框组件 -->
    <div class="search-input-area">
      <search-component></search-component>
    </div>
    <!-- 功能区域 -->
    <div class="functions">
      <!-- 当前已登录,显示头像 -->
      <my-popover v-if="userStore.userInfo.isLogin">
        <template #content>
          <profile-card></profile-card>
        </template>
        <template #trigger>
          <div style="height: 40px">
            <div class="avatar-wrapper">
              <img style="object-fit: contain;width:100%;height: 100%;" :src="avatarUrl" :alt="''">
            </div>
          </div>
        </template>
      </my-popover>
      <!-- 未登录,显示登录按钮 -->
      <a-button v-else @click="showLoginDialog">登录</a-button>

      <LoginRegisterDialog :visible="showDialog" @close="showDialog = false" />

      <!-- 投稿按钮 -->
      <div class="function" @click="toCreator">
        <add-music theme="outline" size="24" />
        <div class="function-label">投稿</div>
      </div>
      <!-- 消息按钮 -->
      <my-popover ref="DMRef">
        <template #trigger>
          <div class="function">
            <div class="unread-wrapper flex-center" v-if="shareData.messageUnread > 0">
              <span>{{ shareData.messageUnread }}</span>
            </div>
            <Message theme="outline" size="24" />
            <div class="function-label">消息</div>
          </div>
        </template>
        <template #content>
          <MyDirectMessage></MyDirectMessage>
        </template>
      </my-popover>
      <!-- 通知按钮 -->
      <my-popover>
        <template #content>
          <Notification></Notification>
        </template>
        <template #trigger>
          <div class="function">
            <div class="unread-wrapper flex-center" v-if="shareData.notificationUnread > 0">
              <span>{{ shareData.notificationUnread }}</span>
            </div>
            <Remind theme="outline" size="24" />
            <div class="function-label">通知</div>
          </div>
        </template>
      </my-popover>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;


  .search-input-area {
    width: 80%;
    text-align: center;
    display: flex;
    position: relative;
  }

  .functions {
    display: flex;
    width: 20%;
    flex-direction: row-reverse;
    margin-top: 5px;
    gap: 20px;
    box-sizing: border-box;

    .avatar-wrapper {
      cursor: pointer;
    }

    .function {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;

      div {
        flex: 1;
      }
    }

    .function-label {
      text-align: center;
      font-size: 12px;
      transition: opacity 0.3s ease;
    }

    .function:hover {
      cursor: pointer;
      color: #fe2c55;
    }

    .avatar-wrapper {
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}

@media (max-width: 1024px) {
  .title-bar {
    .search-input-area {
      width: 75%;
    }

    .functions {
      width: 25%;
      gap: 15px;
    }
  }
}

@media (max-width: 768px) {
  .title-bar {
    .search-input-area {
      width: 70%;
    }

    .functions {
      width: 30%;
      gap: 12px;
      padding-right: 15px;
    }

    .function-label {
      font-size: 10px;
    }
  }
}

@media (max-width: 480px) {
  .title-bar {
    .search-input-area {
      width: 60%;
    }

    .functions {
      width: 40%;
      gap: 8px;
      padding-right: 10px;
    }

    .function {
      .function-label {
        display: none;
        /* 隐藏文字，只显示图标 */
      }
    }

    .function-label {
      font-size: 9px;
    }
  }
}

.unread-wrapper {
  bottom: 15px;
  right: -2px;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  width: 15px;
  height: 15px;
  background-color: #fe2c55;
  position: absolute;
}
</style>
