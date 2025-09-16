<template>
  <div style="display: flex;width: 100vw;height: 100vh;">
    <!--侧边导航-->
    <div style="width: 10%;background-color: skyblue;">
      <sidebar-menu></sidebar-menu>
    </div>
    <!--  顶部工具栏和路由出口  -->
    <div style="width: 90%;display: flex;flex-direction: column">
      <TitleBar></TitleBar>
      <!-- 一级路由出口!-->
      <div style="height: 90%">
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
<style>

</style>
