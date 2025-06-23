<script setup lang="ts">

import SwiperPlayer from "./swiper-player.vue";
import {onMounted, ref} from "vue";
import axios from "../../api/axiosInstance.ts";

const videos = ref([]);
onMounted(async () => {
  await axios.get('/videos')
      .then(Response => {
        // 保留完整的视频信息，同时处理 videoUrl
        videos.value = Response.data.data.map((item: any) => ({
          ...item,
          videoUrl: item.videoUrl.replace(/^"|"$/g, '').replace(/\\/g, '/')
        }));
      })

})
</script>

<template>
  <swiper-player :videos="videos" v-if="videos.length > 0"></swiper-player>
</template>

<style scoped>

</style>
