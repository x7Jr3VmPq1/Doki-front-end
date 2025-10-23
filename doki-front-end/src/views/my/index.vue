<script setup lang="ts">
import UserCard from "./UserCard.vue";
import HeaderActions from "./HeaderActions.vue";
import FollowAndDM from "./FollowAndDM.vue";
import MainMenu from "./MainMenu.vue";
import WorksFilters from "./WorksFilters.vue";
import WorksGrid from "./WorksGrid.vue";
import { useRoute } from 'vue-router'
import { onMounted, ref } from "vue";
const route = useRoute()

const mode = ref<string>('/my');

onMounted(() => {
  mode.value = route.path;
})
</script>
<!-- “我的”页面 -->
<template>
  <div class="profile-page">
    <header class="header">
      <!-- 用户信息 -->
      <user-card></user-card>
      <!-- 用户操作 -->
      <header-actions :mode="mode"></header-actions>
    </header>
    <!-- 关注/私信按钮 -->
    <follow-and-d-m v-if="mode != '/my'"></follow-and-d-m>
    <!-- 菜单按钮 -->
    <main-menu></main-menu>
    <!-- 筛选作品类型按钮 -->
    <works-filters></works-filters>
    <!-- 作品列表区域 -->
    <works-grid></works-grid>
  </div>
</template>

<style scoped>
/* 整个页面容器的样式 */
::-webkit-scrollbar {
  display: none;
}

.profile-page {
  height: 100%;
  width: 95%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 20px;
  margin: 0 auto;
  border-radius: 10px;
  overflow-y: auto;
}

/* 顶部用户卡片的样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
