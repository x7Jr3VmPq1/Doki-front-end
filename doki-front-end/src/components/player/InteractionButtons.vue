<script setup lang="ts">
import {HeartFilled, MessageFilled, PlusCircleFilled, StarFilled} from "@ant-design/icons-vue";
import { IconMore, IconShareInternal } from '@arco-design/web-vue/es/icon';
import type { Video } from '../../store/videoStore';

const props = defineProps<{
  video: Video,
  onOpenComments: () => void,
  onLike: (videoId: number) => void,
  onFavorite: (videoId: number) => void,
}>()
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
      <div class="user-avatar">
        <div class="follow-button">
          <PlusCircleFilled/>
        </div>
        <a-avatar :src="props.video.avatarUrl" size="large" class="bounce-on-click" />
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
      <div class="like bounce-on-click" @click="props.onLike(props.video.id)">
        <heart-filled v-if="props.video.liked" style="color: red"/>
        <heart-filled v-else/>
        <div style="font-size: 20px;padding-top: 5px">{{ props.video.likeCount }}</div>
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
        <div style="font-size: 20px;padding-top: 5px">{{ props.video.commentCount }}</div>
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
      <div class="star bounce-on-click" @click="props.onFavorite(props.video.id)">
        <star-filled v-if="props.video.favorited" style="color: goldenrod"/>
        <star-filled v-else/>
        <div style="font-size: 20px;padding-top: 5px">{{ props.video.favoriteCount }}</div>
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


