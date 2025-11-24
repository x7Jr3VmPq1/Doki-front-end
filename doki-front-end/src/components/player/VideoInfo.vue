<script setup lang="ts">

import type { VideoInfo } from '../../api/feedService.ts'
import type { userInfo } from '../../api/userService.ts'
import { handleRequest } from '../../api/handleRequest.ts'
import userService from '../../api/userService.ts'

import { dayUtils } from '../../utils/dayUtils.ts'
import { onMounted, ref } from "vue";
import toProfiles from '../../utils/toProfiles.ts'

const props = defineProps<{ video: VideoInfo }>();

// 上传者信息
const uploaderInfo = ref<userInfo>({
  id: 0,
  username: '',
  avatarUrl: '',
  bio: '',
  createdAt: 0,
  updatedAt: 0
})
onMounted(() => {
  // 获取上传者信息
  handleRequest(userService.getUserinfoById, {
    onSuccess(data) {
      uploaderInfo.value = data[0]
    },
    params: [props.video.uploaderId]
  })
})


</script>

<template>
  <div class="video-info">
    <div style="display: flex">
      <div class="user-name" @click="toProfiles(uploaderInfo.id)">{{ '@' + uploaderInfo.username }}</div>
      <div class="upload-time">{{ dayUtils.formatTimestamp(video.publishTime) }}</div>
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
  cursor: pointer;
}

.video-info .user-name:hover {
  color: #f5f5f5;
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
