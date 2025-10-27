<script setup lang="ts">

import SwiperPlayer from "./swiper-player.vue";
import { onMounted, ref } from "vue";

import feedService from '../../api/feedService.ts'
import type { VideoInfo } from '../../api/feedService.ts'
import { handleRequest } from '../../api/handleRequest.ts'
import videoProcessingService from '../../api/videoInfoService.ts'
import DokiLoading from "../../components/Doki-Loading.vue";

const isLoading = ref(true);
const videos = ref<VideoInfo[]>([]);
onMounted(async () => {

  // await handleRequest(feedService.getRandomVideos, {
  //   onSuccess(data) {
  //     videos.value = data; 
  //   },
  //   params: 10
  // })

  await handleRequest(videoProcessingService.getVideoInfo, {
    onSuccess(data) {
      videos.value[0] = data; // ID为10的视频用来测试
    },
    params: 10
  })

  isLoading.value = false;

})
</script>

<template>
  <swiper-player :videos="videos" v-if="videos.length > 0"></swiper-player>
  <!-- 加载动画 -->
  <div class="loading">
    <DokiLoading v-if="isLoading"></DokiLoading>
  </div>
</template>

<style scoped>
.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
