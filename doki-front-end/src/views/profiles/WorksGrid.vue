<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import videoInfoService from '../../api/videoInfoService.ts'
import type { VideoInfo } from '../../api/feedService.ts'
import { handleRequest } from '../../api/handleRequest.ts';
// 定义组件属性
const props = defineProps<{
  userId: number // 用户ID
}>();

onMounted(async () => {
  await handleRequest(videoInfoService.getVideosInfoByUserId, {
    onSuccess(data) {
      userWorks.list = data;
    },
    params: props.userId
  }
  )
})
const userWorks = reactive({
  list: [] as VideoInfo[]
})
</script>

<template>
  <div class="works-grid">
    <div v-for="item in userWorks.list" class="work-card">
      <div class="image-container">
        <img v-if="true" :src="item.coverName" alt="" class="work-image" />
        <video v-else autoplay controls class="work-video-pre"
          src="http://localhost:10010/video/play/dc160900-87b8-4522-9672-9087913bbbbd"></video>
      </div>
      <div class="work-description">{{ item.title }}</div>
    </div>
  </div>

  <div style="height: 100px;color: grey;" class="flex-center">没有更多了</div>


</template>

<style scoped>
/* 作品网格布局 */
.works-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

/* 单个作品卡片样式 */
.work-card {
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.image-container {
  aspect-ratio: 3 / 4;
  /* 宽高比 3:4 */
  position: relative;
  width: 100%;
  overflow: hidden;
}

.work-image,
.work-video-pre {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-description {
  color: #666;
  margin-top: 5px;
  overflow: hidden;
}
</style>
