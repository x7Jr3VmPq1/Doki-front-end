<script setup lang="ts">
import { HeartFilled, MessageFilled, PlusCircleFilled, StarFilled } from "@ant-design/icons-vue";
import { More, Back } from '@icon-park/vue-next'
import LikeFavoriteService from "../../api/likeFavoriteService.ts";
import socialService from "../../api/socialService.ts";
import { handleRequest } from '../../api/handleRequest.ts'
import { useUserStore } from "../../store/userInfoStore.ts";
import type { VideoVO } from '../../api/videoInfoService.ts';
import type { userInfo } from "../../api/userService.ts";
import { computed } from "vue";
import likeFavoriteService from "../../api/likeFavoriteService.ts";

const userStore = useUserStore();
const props = defineProps<{
  video: VideoVO,
  onOpenComments: () => void,
}>()

const emit = defineEmits<{
  (e: 'openUserPage', value: void): void
}>();


const handleFollow = async (user: userInfo) => {
  const fn = !user.followed ? socialService.followUser : socialService.unFollowUser;

  await handleRequest(fn, {
    onSuccess() {
      user.followed = !user.followed;
    },
    params: user.id
  })
}


// 视频交互按钮方法
// 给视频点赞
const onLike = async (videoId: number) => {
  await handleRequest(LikeFavoriteService.videoLike, {
    onSuccess(_) {
      // 更改点赞的状态
      props.video.liked = !props.video.liked;
      // 增减或减少点赞数
      props.video.statistics.likeCount += (props.video.liked ? 1 : -1);
    },
    params: videoId
  })
}
// 收藏
const onFavorite = async (videoId: number) => {

  await handleRequest(likeFavoriteService.videoFavorite, {
    onSuccess() {
      // 更改收藏的状态
      props.video.favorited = !props.video.favorited;
      // 增减或减少收藏数
      props.video.statistics.favoriteCount += (props.video.favorited ? 1 : -1);
    },
    params: videoId
  })
}

const videoInfo = computed(() => {
  return props.video
})

const handleOpenUserPage = () => {
  emit('openUserPage');
}
</script>

<template>
  <div class="interaction-buttons" @click.stop>
    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          进入作者首页
          <div
            style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
            F
          </div>
        </div>
      </template>
      <div class="user-avatar" @click.stop="handleOpenUserPage">
        <div @click.stop="handleFollow(videoInfo.user)"
          v-if="!video.user.followed && video.user.id !== userStore.userInfo.id" class="follow-button">
          <PlusCircleFilled />
        </div>
        <a-avatar :src="videoInfo.user.avatarUrl" size="large" class="bounce-on-click" />
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          点赞
          <div
            style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
            Z
          </div>
        </div>
      </template>
      <div class="like bounce-on-click" @click="onLike(props.video.id)">
        <heart-filled v-if="videoInfo.liked" style="color: red" />
        <heart-filled v-else />
        <div style="font-size: 20px;padding-top: 5px">{{ videoInfo.statistics.likeCount }}</div>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          评论
          <div
            style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
            X
          </div>
        </div>
      </template>
      <div class="comment bounce-on-click" @click="props.onOpenComments">
        <message-filled />
        <div style="font-size: 20px;padding-top: 5px">{{ videoInfo.statistics.commentCount }}</div>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          收藏
          <div
            style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
            V
          </div>
        </div>
      </template>
      <div class="star bounce-on-click" @click.stop="onFavorite(props.video.id)">
        <star-filled v-if="videoInfo.favorited" style="color: goldenrod" />
        <star-filled v-else />
        <div style="font-size: 20px;padding-top: 5px">{{ videoInfo.statistics.favoriteCount }}</div>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          分享
        </div>
      </template>
      <div class="share bounce-on-click" style="transform: scaleX(-1)">
        <Back theme="filled" fill="#fff" />
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          更多
        </div>
      </template>
      <div class="more bounce-on-click flex-center">
        <More />
      </div>
    </a-tooltip>
  </div>
</template>

<style scoped>
.interaction-buttons {
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
  line-height: 1;
  font-size: 25px;
  color: white;
  position: absolute;
  z-index: 100;
  bottom: 10%;
  right: 3%;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
}

.interaction-buttons .like,
.interaction-buttons .comment,
.interaction-buttons .star,
.interaction-buttons .share {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.interaction-buttons .user-avatar {
  position: relative;
}

.interaction-buttons .user-avatar .follow-button {
  cursor: pointer;
  color: rgba(254, 44, 85);
  font-size: 20px;
  position: absolute;
  bottom: -8px;
  right: 10px;
  z-index: 1;
}
</style>
