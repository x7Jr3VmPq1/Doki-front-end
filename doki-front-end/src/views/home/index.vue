<script setup lang="ts">

import SwiperPlayer from "../../components/player/index.vue";
import { onMounted, ref } from "vue";

import { handleRequest } from '../../api/handleRequest.ts'
import DokiLoading from "../../components/Doki-Loading.vue";
const emit = defineEmits(['_virtualUpdated'])

import videoInfoService from "../../api/videoInfoService.ts";

import type { VideoVO } from "../../api/videoInfoService.ts";

const isLoading = ref(true);
const videos = ref<VideoVO[]>([]);
onMounted(async () => {

  await handleRequest(videoInfoService.getRandom, {
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

  isLoading.value = false;

})
</script>

<template>
  <swiper-player :mode="0" :start-with="0" :videos="videos" v-if="videos.length > 0">
  </swiper-player>
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
