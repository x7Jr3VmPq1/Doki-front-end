<script setup lang="ts">
import {
  DislikeOutlined,
  ExclamationCircleOutlined,
  HeartFilled,
  MoreOutlined,
  ShareAltOutlined,
  StarFilled
} from "@ant-design/icons-vue";
import {computed} from "vue";
import {useVideoStore} from "../store/videoStore.js";
import {PlusCircleOutlined} from '@ant-design/icons-vue';
import {message} from "ant-design-vue";
import {likeVideoByVideoId, favoriteVideoByVideoId} from '../api/videoService.ts';
// 使用视频状态管理
const videoStore = useVideoStore();
// 从 videoStore 中获取当前视频的点赞、收藏数量
const likeNumber = computed(() => videoStore.videos[videoStore.videoIndex]?.likeCount || 0);
const favoritesNumber = computed(() => videoStore.videos[videoStore.videoIndex]?.favoriteCount || 0);

// 添加点赞状态
const isLiked = computed(() => videoStore.videos[videoStore.videoIndex]?.liked);
// 添加收藏状态
const isFavorited = computed(() => videoStore.videos[videoStore.videoIndex]?.favorited);
// 该视频的用户名
const userName = computed(() => videoStore.videos[videoStore.videoIndex]?.userName);
// 该视频的用户头像
const avatarUrl = computed(() => videoStore.videos[videoStore.videoIndex]?.avatarUrl);

// 点赞/取消点赞请求
const toggleLike = async () => {
  try {
    const videoId = videoStore.videos[videoStore.videoIndex].id;
    const response = await likeVideoByVideoId(videoId);
    if (response.data === '取消点赞成功') {
      videoStore.videos[videoStore.videoIndex].likeCount--;
      videoStore.videos[videoStore.videoIndex].liked = false;
      message.success('取消点赞成功');
    } else {
      videoStore.videos[videoStore.videoIndex].likeCount++;
      videoStore.videos[videoStore.videoIndex].liked = true;
      message.success('点赞成功');
    }
  } catch (error) {
    console.error(error);
  }
}
// 收藏/取消收藏请求
const toggleFavorite = async () => {
  try {
    const videoId = videoStore.videos[videoStore.videoIndex].id;
    const response = await favoriteVideoByVideoId(videoId);
    if (response.data === '取消收藏成功') {
      videoStore.videos[videoStore.videoIndex].favoriteCount--;
      videoStore.videos[videoStore.videoIndex].favorited = false;
      message.success('取消收藏成功');
    } else {
      videoStore.videos[videoStore.videoIndex].favoriteCount++;
      videoStore.videos[videoStore.videoIndex].favorited = true;
      message.success('收藏成功');
    }
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <!--  功能按钮-->
  <div class="functionArea">
    <!-- 用户头像 -->
    <div class="buttonBox" style="position: relative; display: inline-block;">
      <router-link :to="`@${userName}`">
        <a-avatar :src="avatarUrl"
                  size="large" alt="Han Solo"></a-avatar>
      </router-link>
      <PlusCircleOutlined
          style="
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(30%, -30%);
        color: white;
        background: #e48484;
        border-radius: 50%;
        font-size: 16px;
        padding: 2px;
      "
      />
    </div>
    <!--  点赞-->
    <div class="buttonBox">
      <a-button type="default" class="button" @click="toggleLike">
        <HeartFilled :style="{ color: isLiked ? '#ff69b4' : '' }"/>
        <div>{{ likeNumber }}</div>
      </a-button>
    </div>
    <!--  收藏-->
    <div class="buttonBox">
      <a-button type="default" class="button" @click="toggleFavorite">
        <StarFilled :style="{ color: isFavorited ? 'gold' : '' }"/>
        <div>{{ favoritesNumber }}</div>
      </a-button>
    </div>
    <!-- 更多功能 -->
    <a-dropdown placement="rightTop">
      <a-button type="default">
        <MoreOutlined/>
      </a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item key="1">
            <template #icon>
              <ShareAltOutlined/>
            </template>
            转发
          </a-menu-item>
          <a-menu-item key="2">
            <template #icon>
              <DislikeOutlined/>
            </template>
            不感兴趣
          </a-menu-item>
          <a-menu-item key="3">
            <template #icon>
              <ExclamationCircleOutlined/>
            </template>
            举报
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<style scoped>
.functionArea {
  margin-left: 5%;
  margin-top: 50%;
  gap: 20px;
  display: flex;
  flex-wrap: wrap; /* 使按钮换行显示 */
  flex-direction: row; /* 改为行排列 */


  .button {
    border-radius: 50%;
    display: flex;
    text-align: center;
    flex-direction: column;
    align-items: center;
    height: 100%;

    &.liked {
      color: red;
    }
  }
}
</style>
