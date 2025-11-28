<!-- 迷你预览播放器 -->
<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import type { videoInfoWithStat } from '../api/videoInfoService'
import { Like } from '@icon-park/vue-next'
import Hls from 'hls.js';

const props = defineProps<{
  item: videoInfoWithStat,
  manage: boolean
}>();

const isPre = ref(false);

let hls: Hls | null = null;
const videoRef = ref<HTMLVideoElement | null>();



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

const showVideo = ref(false);

watch(isPre, async (val) => {
  if (val) {
    await nextTick();
    // 鼠标进入，video DOM 已经生成
    initHls();
  } else {
    // 鼠标离开，清理视频，避免内存泄漏
    if (hls) {
      stopPreview();
    }
    if (videoRef.value) {
      videoRef.value.pause();
      videoRef.value.removeAttribute("src");
      videoRef.value.load();
    }
  }
});

function initHls() {
  if (!videoRef.value) return;

  if (Hls.isSupported()) {
    hls = new Hls({
      maxMaxBufferLength: 20, // 避免网络极佳时缓冲过多
    });
    hls.loadSource(`${props.item.videoFilename}/master.m3u8`);
    hls.attachMedia(videoRef.value);
    hls.currentLevel = 0;

    hls.on(Hls.Events.FRAG_LOADED, function () {
      showVideo.value = true;
      videoRef.value?.play().catch(() => { });
      console.log(hls?.levels);
    });
  }
}

function stopPreview() {
  showVideo.value = false; // 隐藏video
  if (hls) {
    hls.destroy();
    hls = null;
  }
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.removeAttribute("src");
    videoRef.value.load();
  }
}


</script>
<template>
  <div @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div v-if="!showVideo || props.manage" class="image-container">
      <img :src=item.coverName class="work-image">
      <span class="like-count" v-if="item.statistics">
        <Like />
        {{ item.statistics.likeCount }}
      </span>
    </div>
    <video v-if="isPre" loop ref="videoRef" alt="" class="work-video-pre"></video>
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
