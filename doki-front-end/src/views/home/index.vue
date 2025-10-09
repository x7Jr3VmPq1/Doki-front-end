<script setup lang="ts">

import SwiperPlayer from "./swiper-player.vue";
import {onMounted, ref} from "vue";
import axios from "../../api/axiosInstance.ts";

import feedService from '../../api/feedService.ts'
import type {VideoInfo} from '../../api/feedService.ts'
import {handleRequest} from '../../api/handleRequest.ts'

const videos = ref<VideoInfo[]>([]);
onMounted(async () => {
  await axios.get('/videos')
      .then(Response => {
        // 保留完整的视频信息，同时处理 videoUrl
        videos.value = Response.data.data.map((item: any) => ({
          ...item,
          videoUrl: item.videoUrl.replace(/^"|"$/g, '').replace(/\\/g, '/')
        }));
      })
  await handleRequest(feedService.getRandomVideos, {
    onSuccess(data) {
      console.log(data);
    },
  })
})
</script>

<template>
  <swiper-player :videos="videos" v-if="videos.length > 0"></swiper-player>
</template>

<style scoped>

</style>
