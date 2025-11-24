<script lang="ts" setup>
import toProfiles from '../../utils/toProfiles';
import { useUserStore } from '../../store/userInfoStore';
import { handleRequest } from '../../api/handleRequest';
import { Like } from '@icon-park/vue-next';

import socialService from '../../api/socialService';
import type { VideoVO } from '../../api/videoInfoService';
import type { userInfo } from '../../api/userService';
import videoInfoService from '../../api/videoInfoService';
import { onMounted, reactive } from 'vue';
import LimitWorksPlayer from './LimitWorksPlayer.vue';
const userStore = useUserStore();

const state = reactive({
  userWorks: [] as VideoVO[],
  currentPlay: 0,
  isModalVisible: false
})

const props = defineProps<{
  video: VideoVO
}>();

const emit = defineEmits(['close', 'pause'])


const handleFollow = async (user: userInfo) => {
  const fn = !user.followed ? socialService.followUser : socialService.unFollowUser;

  await handleRequest(fn, {
    onSuccess() {
      user.followed = !user.followed;
    },
    params: user.id
  })
}
onMounted(async () => {
  await fetchUserWorks();
})


const fetchUserWorks = async () => {
  await handleRequest(videoInfoService.getVideosInfoByUserId, {
    onSuccess(data) {
      state.userWorks.push(...data.list)
    },
    params: { tid: props.video.user.id, cursor: null }
  })
}

const handleClickWork = (index: number) => {
  emit('pause');
  state.isModalVisible = true;
  state.currentPlay = index;
}

const handleClose = () => {
  state.isModalVisible = false;
  emit('close');
}

</script>

<template>
  <Teleport to="body">
    <div v-if="state.isModalVisible" class="fullscreen-box">
      <LimitWorksPlayer :mode="2" @close="handleClose" :videos="state.userWorks"></LimitWorksPlayer>
    </div>
  </Teleport>

  <div style="display: flex;flex-direction: column;padding-bottom: 40px;width: 100%;height: 100%">
    <div class="title" style="display: flex">
      <div class="user-info" style="flex: 1;padding: 10px;">
        <div @click="toProfiles(video.user.id)" class="user-name" style="font-size: 20px;display: flex;">
          <a style="color: white">@{{ video.user.username }}</a>
        </div>
        <!-- <div class="user-like-number" style="font-size: 15px;display: flex;margin-left: 10%;color: white">
                  <span>1000粉丝 | </span>
                  <span>1000获赞</span>
                </div> -->
      </div>
      <div>
        <div v-if="video.user.id !== userStore.userInfo.id" @click="handleFollow(video.user)"
          style="margin-right: 50px">
          <button class="followed-button" v-if="video.user.followed">已关注
          </button>
          <button class="follow-button" v-else>关注</button>
        </div>
      </div>
    </div>
    <div style="overflow-y: auto;">
      <div class="user-videos">
        <div @click="handleClickWork(index)" class="user-video-item" v-for="(item, index) in state.userWorks">
          <img style="object-fit: cover;width: 100%;height: 100%" :src="item.coverName">
          <div class="like-number">
            <Like></Like>
            <span style="margin-left: 5px">{{ item.statistics.likeCount }}</span>
          </div>
        </div>
      </div>
      <div style="color: white;height: 50px;" class="flex-center">
        <span>没有更多了！</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-videos {

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px;
  align-content: start;
}

.user-video-item {
  overflow: hidden;
  background-color: #fff;
  border-radius: 20px;
  height: 150px;
  position: relative;

  .like-number {
    font-size: 20px;
    color: white;
    position: absolute;
    left: 20px;
    bottom: 10px;
  }
}


.user-video-item:hover {
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  /* transform: scale(1.05);
        transition: all 0.3s ease-in-out; */
}


.followed-button,
.follow-button {
  padding: 8px 15px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.followed-button {
  background-color: #e0e0e0;
  color: #666;
  border: 1px solid #d0d0d0;
}

.follow-button {
  background-color: #fe2c55;
  color: #fff;
  border: 1px solid #fe2c55;
}

.fullscreen-box {
  position: fixed;
  /* 固定在窗口，不随滚动移动 */
  top: 0;
  left: 0;
  width: 100vw;
  /* 覆盖整个宽度 */
  height: 100vh;
  /* 覆盖整个高度 */
  z-index: 20;
  /* 确保在最上层 */
}
</style>