<template>
  <div class="app-container">
    <!--侧边导航-->
    <div class="sidebar-container">
      <sidebar-menu></sidebar-menu>
    </div>
    <!--  顶部工具栏和路由出口  -->
    <div class="main-container">
      <div class="title-bar">
        <TitleBar></TitleBar>
      </div>
      <!-- 一级路由出口!-->
      <div class="router-view">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { useUserStore } from "./store/userInfoStore";
import TitleBar from "./components/titleBar/TitleBar.vue";
import userService from './api/userService'
import { handleRequest } from './api/handleRequest'
import SidebarMenu from "./components/SidebarMenu.vue";

const userStore = useUserStore();
onMounted(async () => {
  // 如果存在token，获取用户信息
  if (localStorage.getItem('token')) {
    await handleRequest(userService.getUserinfoByToken, {
      onSuccess(data) {
        userStore.setBaseUserinfo(data)
        userStore.userInfo.isLogin = true;
      },
    })
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();   // 禁用焦点跳转
  }
});


</script>
<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
}


.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* 防止flex子项溢出 */
}

.router-view {
  flex: 1;
  overflow: hidden;
  background-color: #f8f9fa;
  /* 比白色稍微深一点的浅灰色 */
}


.sidebar-container {
  background-color: skyblue;
  transition: width 0.3s ease;
}
</style>
