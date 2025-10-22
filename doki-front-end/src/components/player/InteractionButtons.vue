<script setup lang="ts">
import {HeartFilled, MessageFilled, PlusCircleFilled, StarFilled} from "@ant-design/icons-vue";
import {IconMore, IconShareInternal} from '@arco-design/web-vue/es/icon';
import type {VideoInfo} from '../../api/feedService.ts'
import {onMounted} from 'vue';
import analyticsService from '../../api/analyticsService.ts';
import userService from '../../api/userService.ts'
import type {VideoStatistics} from '../../api/analyticsService.ts'
import type {userInfo} from '../../api/userService.ts'
import {ref} from 'vue'
import LikeFavoriteService from "../../api/likeFavoriteService.ts";
import {handleRequest} from '../../api/handleRequest.ts'

const props = defineProps<{
  video: VideoInfo,
  onOpenComments: () => void,
}>()

// 视频统计信息
const stat = ref<VideoStatistics>({
  id: 0,
  videoId: 0,
  viewCount: 0,
  likeCount: 0,
  dislikeCount: 0,
  commentCount: 0,
  shareCount: 0,
  favoriteCount: 0,
  downloadCount: 0,
  createdTime: 0,
  updatedTime: 0,
  deleted: 0,
  userLiked: false
});
// 上传者信息
const uploaderInfo = ref<userInfo>({
  id: 0,
  username: '',
  avatarUrl: '',
  bio: '',
  createdAt: 0,
  updatedAt: 0
})

const loaded = ref(false);
onMounted(() => {
  // 获取视频统计信息
  handleRequest(analyticsService.getVideoStatById, {
    onSuccess(data) {
      stat.value = data;
    },
    params: [props.video.id]
  })
  // 获取上传者信息
  handleRequest(userService.getUserinfoById, {
    onSuccess(data) {
      uploaderInfo.value = data[0];
    },
    params: [props.video.uploaderId]
  })

  loaded.value = true;

})

// 视频交互按钮方法
// 给视频点赞
const onLike = async (videoId: number) => {
  await handleRequest(LikeFavoriteService.videoLike, {
    onSuccess(_) {
      // 更改点赞的状态
      stat.value.userLiked = !stat.value.userLiked;
      // 增减或减少点赞数
      stat.value.likeCount += (stat.value.userLiked ? 1 : -1);
    },
    params: videoId
  })
}
</script>

<template>
  <div v-if="loaded" class="interaction-buttons" @click.stop>
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
      <div class="user-avatar">
        <div class="follow-button">
          <PlusCircleFilled/>
        </div>
        <a-avatar :src="uploaderInfo.avatarUrl" size="large" class="bounce-on-click"/>
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
        <heart-filled v-if="stat.userLiked" style="color: red"/>
        <heart-filled v-else/>
        <div style="font-size: 20px;padding-top: 5px">{{ stat.likeCount }}</div>
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
        <message-filled/>
        <div style="font-size: 20px;padding-top: 5px">{{ stat.commentCount }}</div>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          收藏
          <div
              style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
            X
          </div>
        </div>
      </template>
      <div class="star bounce-on-click">
        <star-filled v-if="false" style="color: goldenrod"/>
        <star-filled v-else/>
        <div style="font-size: 20px;padding-top: 5px">{{ stat.favoriteCount }}</div>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          进入作者首页
          <div
              style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
            F
          </div>
        </div>
      </template>
      <div class="share bounce-on-click">
        <icon-share-internal/>
      </div>
    </a-tooltip>

    <a-tooltip placement="left" color="grey">
      <template #title>
        <div style="display: flex;line-height: 1.2em;padding: 8px">
          进入作者首页
          <div
              style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
            F
          </div>
        </div>
      </template>
      <div class="more bounce-on-click">
        <icon-more/>
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

.interaction-buttons .like, .interaction-buttons .comment, .interaction-buttons .star, .interaction-buttons .share {
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


