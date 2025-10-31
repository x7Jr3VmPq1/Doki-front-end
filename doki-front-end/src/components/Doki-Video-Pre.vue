<!-- 迷你预览播放器 -->
<script setup lang="ts">
import { ref } from 'vue';
import type { videoInfoWithStat } from '../api/videoInfoService'
import { Like } from '@icon-park/vue-next'

const props = defineProps<{
  item: videoInfoWithStat,
  manage: boolean
}>();

const isPre = ref(false);

let enterTimeout: number | null = null;

const handleMouseEnter = () => {
  // 清理可能存在的定时器
  if (enterTimeout) clearTimeout(enterTimeout);

  enterTimeout = window.setTimeout(() => {
    isPre.value = true;
    enterTimeout = null; // 清空引用
  }, 100);
}

const handleMouseLeave = () => {
  // 鼠标移出时立即隐藏，并清理延迟
  if (enterTimeout) {
    clearTimeout(enterTimeout);
    enterTimeout = null;
  }
  isPre.value = false;
}
</script>
<template>

  <div @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div v-if="!isPre || props.manage" class="image-container">
      <img :src=item.coverName class="work-image">
      <span class="like-count">
        <Like />
        {{ item.statistics.likeCount }}
      </span>
    </div>
    <video v-else muted autoplay loop :src=item.videoFilename alt="" class="work-video-pre"></video>
  </div>
</template>
<style scoped>
.work-image,
.work-video-pre {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.like-count {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 10;
  color: white;
}
</style>
