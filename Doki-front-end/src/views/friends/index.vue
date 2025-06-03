<script setup lang="ts">

import Player from "../../components/Player.vue";
import instance from "../../api/axiosInstance.ts";
import {ref, onMounted} from "vue";
import type {Video} from "../../store/videoStore.ts";
import axios from "../../api/axiosInstance.ts";

const videos = ref<Video[]>([]);

onMounted(async () => {
  await axios.get('/videos')
      .then(Response => {
        // 保留完整的视频信息，同时处理 videoUrl
        videos.value = Response.data.data.map((item: any) => ({
          ...item,
          videoUrl: item.videoUrl.replace(/^"|"$/g, '').replace(/\\/g, '/')
        }));
      })
      .catch(Error => console.dir(Error));

  console.log(videos)
})
</script>

<template>
  <div v-for="(item,index) in 3" v-if="videos.length > 0">
    <div v-if="index == 0" class="friends">
      <Player></Player>
    </div>
  </div>
</template>

<style scoped>
.friends {
  width: 80vw;
  height: 90vh;
  overflow-y: hidden;
}


</style>
