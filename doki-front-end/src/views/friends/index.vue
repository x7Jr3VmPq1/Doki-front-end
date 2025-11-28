<script setup lang="ts">

import SwiperPlayer from "../../components/player/index.vue";
import { onMounted, ref } from "vue";

import feedService from '../../api/feedService.ts'
import type { VideoInfo } from '../../api/feedService.ts'
import { handleRequest } from '../../api/handleRequest.ts'
import videoProcessingService from '../../api/videoInfoService.ts'
import DokiLoading from "../../components/Doki-Loading.vue";

import Hls from 'hls.js';
const emit = defineEmits(['_virtualUpdated'])

const isLoading = ref(true);
const videos = ref<VideoInfo[]>([]);

const videoRef = ref<HTMLMediaElement | null>();

onMounted(async () => {

  // await handleRequest(feedService.getRandomVideos, {
  //   onSuccess(data) {
  //     videos.value = data;
  //     console.log(data);
  //   },
  // })

  // await handleRequest(videoProcessingService.getVideoInfo, {
  //   onSuccess(data) {
  //     videos.value[0] = data; // ID为10的视频用来测试
  //   },
  //   params: 10
  // })

  if (Hls.isSupported()) {
    var hls = new Hls();

    if (videoRef.value) {
      hls.attachMedia(videoRef.value);
    }
    hls.loadSource('http://localhost:10011/video/play/m3u8/3c989be2-8ea5-4745-a6c2-76a234437268/master.m3u8');

  }


  isLoading.value = false;

})


</script>

<template>
  <!-- <swiper-player :mode="0" :start-with="0" :videos="videos" v-if="videos.length > 0">
  </swiper-player> -->
  <!-- 加载动画 -->
  <!-- <div class="loading">
    <DokiLoading v-if="isLoading"></DokiLoading>
  </div> -->

  <video src="" controls ref="videoRef"></video>
</template>

<style scoped>
.loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
