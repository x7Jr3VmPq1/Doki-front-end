<script setup lang="ts">
import type { Video } from '../../store/videoStore';
import { dayUtils } from '../../utils/dayUtils';

defineProps<{ video: Video }>();
</script>

<template>
  <div class="video-info">
    <div style="display: flex">
      <div class="user-name">{{ '@' + video.userName }}</div>
      <div class="upload-time">{{ dayUtils.formatDate(video.createdAt) }}</div>
    </div>
    <div style="display: flex;flex-wrap: wrap;width: 100%">
      <div class="video-title">{{ video.title }}</div>
      <div class="video-tags" @click.stop>#若干标签...</div>
    </div>
  </div>
</template>

<style scoped>
.video-info {
  user-select: none;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 3%;
  bottom: 10%;
  z-index: 0;
}

.video-info .user-name {
  font-size: 1.5em;
  margin-right: 1em;
}

.video-info .upload-time {
  margin-top: 5px;
}

.video-info .video-title {
  font-size: 1.2em;
  margin-right: 0.5em;
}

.video-info .video-tags {
  font-size: 1.2em;
  color: gold;
}

.video-info .video-tags:hover {
  cursor: pointer;
  color: orange;
}
</style>


