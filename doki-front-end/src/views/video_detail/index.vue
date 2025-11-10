<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import SwiperPlayer from '../../components/player/index.vue';
import { handleRequest } from '../../api/handleRequest';
import type { VideoInfo } from '../../api/feedService';
import videoInfoService from '../../api/videoInfoService';
import { useRoute } from 'vue-router';


const videos = ref<VideoInfo[]>([]);
// 从路径参数中获取视频id
const route = useRoute();
const videoId = route.params.id as string;
console.log('视频ID:', videoId);

onMounted(() => {
  handleRequest(videoInfoService.getVideoInfo, {
    params: Number(videoId), // 转换为number
    onSuccess: (data) => {
      videos.value[0] = data;
    },
    onError: (error) => {
      console.error('Failed to fetch video details:', error);
    }
  });
});

</script>

<template>
  <div class="video-detail-view">
    <SwiperPlayer :mode="2" :start-with="0" :videos="videos" />
  </div>
</template>


<style scoped>
.video-detail-view {
  width: 80%;
  height: 75vh;
  overflow: hidden;
  border-radius: 15px;
}
</style>