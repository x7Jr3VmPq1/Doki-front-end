<script setup lang="ts">
import UserCard from "./UserCard.vue";
import HeaderActions from "./HeaderActions.vue";
import FollowAndDM from "./FollowAndDM.vue";
import MainMenu from "./MainMenu.vue";
import WorksFilters from "./WorksFilters.vue";
import WorksGrid from "./WorksGrid.vue";
import { useRoute } from 'vue-router'
import { onMounted, reactive, ref } from "vue";
import DokiLoading from "../../components/Doki-Loading.vue";
import { handleRequest } from "../../api/handleRequest";
import userService from "../../api/userService";
import type { userInfo } from "../../api/userService";
import { useUserStore } from "../../store/userInfoStore.ts";
const route = useRoute()

const mode = ref<string>('my'); // 页面的模式，分为当前用户和其它用户

const currentUid = ref(0);  // 如果是其它用户，需要获取地址栏上的查询参数

const loading = ref(false);

// 定义用户对象
const userInfoData = reactive<userInfo>({
  id: 0,
  username: '',
  avatarUrl: '',
  bio: '',
  followed: false
});


onMounted(async () => {
  // 等待一下。
  await new Promise(resolve => setTimeout(resolve, 500));
  loading.value = true;

  // 设置页面模式
  mode.value = route.path.startsWith('/my') ? 'my' : 'other';

  // 如果是'/my'模式，直接使用store中的用户信息
  if (mode.value === 'my') {
    const store = useUserStore();
    Object.assign(userInfoData, store.userInfo);
    return;
  }
  // 如果是'/profiles?id=xxx'模式，获取id参数，获取失败则跳转到404
  if (mode.value === 'other' && route.query.uid) {
    // 获取URL上的查询参数，并且判断它是不是一个合法的正整数
    const idParam = route.query.uid as string;
    const idNumber = Number(idParam);
    if (!isNaN(idNumber) && Number.isInteger(idNumber) && idNumber > 0) {
      currentUid.value = idNumber;
    } else {
      // 无效 UID，跳转到 404
      window.location.href = '/404';
    }
  }
  // 如果currentUid.value是自己，跳转到'/my'页面
  const store = useUserStore();
  if (currentUid.value === store.userInfo.id) {
    window.location.href = '/my';
    return;
  }
  await handleRequest(userService.getUserinfoById, {
    onSuccess(data) {
      Object.assign(userInfoData, data[0]);
    }, params: [currentUid.value],
    onError() {
      // 获取用户信息失败，跳转到404页面
      window.location.href = '/404';
    }
  })
})
const handleUpdateFollowState = (newState: boolean) => {
  userInfoData.followed = newState;
}
</script>
<!-- “我的”页面 -->
<template>
  <div class="profile-page" v-if="loading">
    <header class="header">
      <!-- 用户信息 -->
      <user-card :info="userInfoData"></user-card>
      <!-- 用户操作 -->
      <header-actions :mode="mode"></header-actions>
    </header>
    <!-- 关注/私信按钮 -->
    <follow-and-d-m @update:is-following="handleUpdateFollowState" :uid="userInfoData.id" v-if="mode !== 'my'"
      :is-following="userInfoData.followed ?? false"></follow-and-d-m>
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
