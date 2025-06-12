<template>
  <div style="display: flex;width: 100vw;height: 100vh;">
    <!--侧边导航-->
    <div style="width: 10%;background-color: skyblue;">123</div>
    <!--  顶部工具栏和路由出口  -->
    <div style="width: 90%;display: flex;flex-direction: column">
      <TitleBar></TitleBar>
      <!-- 一级路由出口-->
      <div style="height: 90%">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import TitleBar from "./components/TitleBar.vue";
</script>
<style>

</style>
