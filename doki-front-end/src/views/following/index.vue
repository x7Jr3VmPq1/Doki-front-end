<script setup lang="ts">

import SwiperPlayer from "../../components/player/index.vue";
import { onMounted, ref, reactive } from "vue";
import { MenuFold, MenuUnfold } from "@icon-park/vue-next";

import { useUserStore } from '../../store/userInfoStore.ts'
import feedService from '../../api/feedService.ts'
import videoInfoService from "../../api/videoInfoService.ts";
import socialService from '../../api/socialService.ts'
import { handleRequest } from '../../api/handleRequest.ts'
import DokiLoading from "../../components/Doki-Loading.vue";

import { useInfiniteScroll } from '../../utils/infiniteScroll.ts'

import type { VideoInfo } from '../../api/feedService.ts'
import type { userInfo } from '../../api/userService.ts'
import type { FollowListResponse } from '../../api/socialService.ts'
import type { VideoCursorLoad, videoInfoWithStat } from '../../api/videoInfoService.ts'

const userStore = useUserStore();
const emit = defineEmits(['_virtualUpdated'])

const isLoading = ref(true);
const listRef = ref<HTMLElement | null>(null);
const loadMoreRef = ref<HTMLElement | null>(null);
const videos = ref<VideoInfo[]>([]);

const state = reactive({
  currentActive: 0,
  fold: true,
  isUserLoading: false,
  isModalVisible: false,
  followList: {
    list: [] as userInfo[],
    hasMore: false,
    cursor: null
  } as FollowListResponse,
  activeUserList: {} as VideoCursorLoad
})
onMounted(async () => {

  await handleRequest(feedService.getRandomVideos, {
    onSuccess(data) {
      videos.value = data;
      console.log(data);
    },
  })

  // await handleRequest(videoProcessingService.getVideoInfo, {
  //   onSuccess(data) {
  //     videos.value[0] = data; // ID为10的视频用来测试
  //   },
  //   params: 10
  // })

  state.isUserLoading = true;
  await fetchFollowings();

  state.isUserLoading = false;
  isLoading.value = false;

  useInfiniteScroll(fetchFollowings, loadMoreRef, listRef);
})

async function fetchFollowings() {
  await handleRequest(socialService.getFollowingList, {
    onSuccess(data) {
      state.followList.list.push(...data.list);
      state.followList.cursor = data.cursor;
    },
    params: {
      tid: userStore.userInfo.id,
      mode: 1,
      cursor: state.followList.cursor
    }
  });
}

const handleClickUser = async (user: userInfo) => {
  console.log(user);
  await handleRequest(videoInfoService.getVideosInfoByUserId, {
    onSuccess(data) {
      if (data.list.length === 0) {
        return;
      }
      state.activeUserList = data;
      state.isModalVisible = true;
    },
    params: {
      tid: user.id,
      cursor: null
    }
  })

}

const handleFold = () => {
  state.fold = !state.fold;
}
</script>

<template>
  <div class="main">
    <div ref="listRef" class="following-list" :class="{ fold: state.fold }">
      <!-- 折叠按钮 -->
      <span class="fold-button" @click="handleFold">
        <menu-unfold theme="outline" size="35" fill="#c7c8ca" v-if="state.fold" />
        <menu-fold theme="outline" size="35" fill="#c7c8ca" v-else />
      </span>
      <!-- 关注列表 -->
      <div v-for="(user) in state.followList.list" class="user" @click="handleClickUser(user)">
        <img :src="user.avatarUrl" alt="">
        <div class="flex-center username">{{ user.username }}</div>
      </div>
      <!-- 加载更多关注用户标记 -->
      <div ref="loadMoreRef" v-show="!state.isUserLoading"></div>
    </div>
    <div class="video-container">
      <!-- 播放器 -->
      <swiper-player :mode="0" :start-with="0" :videos="videos" v-if="videos.length > 0">
      </swiper-player>
      <!-- 加载动画 -->
      <div class="loading">
        <DokiLoading v-if="isLoading"></DokiLoading>
      </div>
    </div>

    <div v-if="state.isModalVisible" class="fullscreen-box">
      <SwiperPlayer :start-with="0" :videos="state.activeUserList.list" :mode="1" @close="state.isModalVisible = false">
      </SwiperPlayer>
    </div>
  </div>

</template>

<style scoped>
.main {
  height: 100%;
  width: 100%;
  display: flex;
}

.following-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  width: 15%;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: ease-in-out 0.3s;
}

.video-container {
  flex: 1;
}

/* 
.following-list::-webkit-scrollbar {
  display: none;
} */

.following-list.fold {
  width: 60px;
}

.fold-button {
  padding-left: 10px;
  padding-top: 20px;
  align-self: flex-start;
  cursor: pointer;
}

.user {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.user:hover {
  background-color: #eeeeee;
  border-radius: 20px;
  cursor: pointer;
}

.user img {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.username {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.following-list.fold .user .username {
  /* 折叠状态不显示用户名 */
  display: none;
}

.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fullscreen-box {
  position: fixed;
  /* 固定在窗口，不随滚动移动 */
  top: 0;
  left: 0;
  width: 100vw;
  /* 覆盖整个宽度 */
  height: 100vh;
  /* 覆盖整个高度 */
  z-index: 20;
  /* 确保在最上层 */
}
</style>
