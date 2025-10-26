<script setup lang="ts">
import { useUserStore } from '../store/userStore';
const userStore = useUserStore();
</script>

<template>
  <div class="main-wrapper">
    <a-avatar>
      <img :src="userStore.userInfo.avatarUrl"></img>
    </a-avatar>
  </div>
</template>

<style scoped>
.main-wrapper {
  display: flex;
  flex-direction: row-reverse;
  width: 100%;
  height: 50px;
  padding-right: 10px;
  padding-top: 5px;
}
</style>
