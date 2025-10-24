<script setup lang="ts">
import UserCard from "./UserCard.vue";
import HeaderActions from "./HeaderActions.vue";
import FollowAndDM from "./FollowAndDM.vue";
import MainMenu from "./MainMenu.vue";
import WorksFilters from "./WorksFilters.vue";
import WorksGrid from "./WorksGrid.vue";
import { useRoute } from 'vue-router'
import { onMounted, ref } from "vue";
import DokiLoading from "../../components/Doki-Loading.vue";
const route = useRoute()

const mode = ref<string>('my'); // 页面的模式，分为当前用户和其它用户

const currentUid = ref(0);  // 如果是其它用户，需要获取地址栏上的查询参数

const loading = ref(false);

onMounted(async () => {
  // 等待一下。
  await new Promise(resolve => setTimeout(resolve, 500));
  loading.value = true;

  // 获取路径名
  mode.value = route.path;
  if (route.path.startsWith('/my')) {
    mode.value = 'my';
    return;
  }

  if (route.path.startsWith('/profiles')) {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');

    if (uid) {
      const numUid = Number(uid);

      // 检查是否为有效数字（不是 NaN 且为正整数）
      if (!isNaN(numUid) && Number.isInteger(numUid) && numUid > 0) {
        currentUid.value = numUid;
      } else {
        // 无效 UID，跳转到 404
        window.location.href = '/404';
      }
    } else {
      // 缺少 uid 参数，跳转到 404
      window.location.href = '/404';
    }
    return;
  }
  // 即不是/my开头也不是/profiles开头，跳转到 404
  window.location.href = '/404';
})
</script>
<!-- “我的”页面 -->
<template>
  <div class="profile-page" v-if="loading">
    <header class="header">
      <!-- 用户信息 -->
      <user-card :uid="currentUid" :mode="mode"></user-card>
      <!-- 用户操作 -->
      <header-actions :mode="mode"></header-actions>
    </header>
    <!-- 关注/私信按钮 -->
    <follow-and-d-m v-if="mode != 'my'"></follow-and-d-m>
    <!-- 菜单按钮 -->
    <main-menu></main-menu>
    <!-- 筛选作品类型按钮 -->
    <works-filters></works-filters>
    <!-- 作品列表区域 -->
    <works-grid></works-grid>
  </div>
  <DokiLoading v-if="!loading"></DokiLoading>
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
