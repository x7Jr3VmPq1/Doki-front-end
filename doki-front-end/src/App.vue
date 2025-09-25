<template>
  <div class="app-container">
    <!--侧边导航-->
    <div class="sidebar-container">
      <sidebar-menu></sidebar-menu>
    </div>
    <!--  顶部工具栏和路由出口  -->
    <div class="main-container">
      <TitleBar></TitleBar>
      <!-- 一级路由出口!-->
      <div class="router-view">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {onMounted} from "vue";
import {useUserStore} from "./store/userInfoStore.ts";
import TitleBar from "./components/titleBar/TitleBar.vue";
import {getUserInfoByToken} from './api/userService.ts'
import SidebarMenu from "./components/SidebarMenu.vue";

const userStore = useUserStore();
onMounted(async () => {
  // 获取用户信息
  const userInfo = await getUserInfoByToken();
  if (userInfo.code === 200) {
    userStore.setUser(userInfo.data);
  }
});

</script>
<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.sidebar-container {
  width: 200px;
  background-color: skyblue;
  transition: width 0.3s ease;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止flex子项溢出 */
}

.router-view {
  flex: 1;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar-container {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .sidebar-container {
    width: 60px;
  }
}
</style>
