<script setup lang="ts">
// 顶部标题栏组件，包括搜索框，功能按钮
// (通知按钮，消息按钮，投稿按钮，登录/个人信息按钮)

import {Message, Remind, AddMusic} from '@icon-park/vue-next';
import {ref, onMounted, watch, computed} from "vue";
import {useSharedState} from "../../store/useSharedState.ts";
import {getHotSearchList} from "../../api/searchService.ts";
import type {SelectProps} from "ant-design-vue";
import profileCard from "../profile-card.vue";
import {useUserStore} from "../../store/userInfoStore.ts";

const userStore = useUserStore();
const avatarUrl = ref('');
// 监视用户信息变化，改变头像
watch(() => userStore.userInfo, (newValue) => {
  if (newValue) {
    avatarUrl.value = newValue.avatarUrl;
  } else {
    avatarUrl.value = 'http://localhost:8081/avatars/defaultAvatar.png';
  }
});
// 搜索信息区域显示
const searchInfoBoxShow = ref(false);
// 热搜列表
const hotSearchList = ref([]);

onMounted(async () => {
  hotSearchList.value = (await getHotSearchList());
})

// 搜索方法
const sharedState = useSharedState();
const onSearch = async (content: string) => {
  // 如果搜索为空则返回
  if (!content.trim()) return;
  // 添加搜索记录
  sharedState.addSearchHistory(content);
}
import {getNotifications} from '../../api/notificationService.ts'
import MyDirectMessage from "../direct-message/MyDirectMessage.vue";
import MyPopover from "../MyPopover.vue";
import SearchComponent from "./searchComponent.vue";
import Notification from "../notification.vue";
import LoginRegisterDialog from "../LoginRegisterDialog.vue";

// 通知列表
const notificationList = ref([]);
// 通知类型选择回调
const handleChange: SelectProps['onChange'] = async (value) => {
  if (value === '0') {
    const res = await getNotifications('all');
    notificationList.value.push(...res.data);
  }
};
// 是否登录标记
const isLoggedIn = computed(() => userStore.userInfo !== null);

// 打开登录页面对话框
const showDialog = ref(false);
const showLoginDialog = () => {
  showDialog.value = true;
}
const toCreator = () => {
  const url = 'http://localhost:5174';
  window.open(url, '_blank'); //
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
      <my-popover v-if="isLoggedIn">
        <template #content>
          <profile-card></profile-card>
        </template>
        <template #trigger>
          <div style="width: 40px;height: 40px">
            <div class="avatar-wrapper">
              <img style="object-fit: contain;width:100%;height: 100%;"
                   :src="avatarUrl">
            </div>
          </div>
        </template>
      </my-popover>
      <!-- 未登录,显示登录按钮 -->
      <a-button v-else @click="showLoginDialog">登录</a-button>

      <LoginRegisterDialog :visible="showDialog" @close="showDialog = false"/>

      <!-- 投稿按钮 -->
      <div class="function" @click="toCreator">
        <add-music theme="outline" size="24"/>
        <div style="text-align: center">投稿</div>
      </div>
      <!-- 消息按钮 -->
      <my-popover>
        <template #trigger>
          <div class="function">
            <Message theme="outline" size="24"/>
            <div style="text-align: center">消息</div>
          </div>
        </template>
        <template #content>
          <MyDirectMessage></MyDirectMessage>
        </template>
      </my-popover>
      <!-- 通知按钮 -->
      <my-popover
      >
        <template #content>
          <Notification></Notification>
        </template>
        <template #trigger>
          <div class="function">
            <Remind theme="outline" size="24"/>
            <div style="text-align: center">通知</div>
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
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;

  .search-input-area {
    width: 80%;
    text-align: center;
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    position: relative;
  }

  .functions {
    display: flex;
    width: 20%;
    flex-direction: row-reverse;
    padding-top: 10px;
    padding-right: 20px;
    gap: 20px;
    box-sizing: border-box;

    .avatar-wrapper {
      cursor: pointer;
    }

    .function {
      display: flex;
      flex-direction: column;
      align-items: center;

      div {
        flex: 1;
      }
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
</style>
