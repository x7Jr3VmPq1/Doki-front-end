<script setup lang="ts">
import Sidebar from "./components/sidebar.vue";
import Titlebar from "./components/titlebar.vue";
</script>

<template>
  <div style="display: flex;">
    <Sidebar></Sidebar>
    <div style="flex:1; background-color: #f9f9fa;">
      <div style="display: flex;flex-direction: column;">
        <div class="title-bar">
          <Titlebar></Titlebar>
        </div>
        <div class="content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.content {
  height: calc(100vh - 50px);
  overflow-y: auto;
}
</style>
