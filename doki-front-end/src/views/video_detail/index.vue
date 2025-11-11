<script lang="ts" setup>
import { HeartFilled, MessageFilled, PlusCircleFilled, StarFilled } from "@ant-design/icons-vue";
import { More, Back, Star } from '@icon-park/vue-next'
import { ref, onMounted, reactive } from 'vue';
import SwiperPlayer from '../../components/player/index.vue';
import { handleRequest } from '../../api/handleRequest';
import type { VideoInfo } from '../../api/feedService';
import videoInfoService from '../../api/videoInfoService';
import { useRoute } from 'vue-router';
import DokiButton from "../../components/Doki-Button.vue";
import CommentItem from "./CommentItem.vue";
import type { VideoCommentsVO } from '../../api/commentService.ts'
const state = reactive({
  videoId: ''
});


const videos = ref<VideoInfo[]>([]);
// 从路径参数中获取视频id
const route = useRoute();
const videoId = route.params.id as string;
console.log('视频ID:', videoId);

onMounted(() => {
  handleRequest(videoInfoService.getVideoInfo, {
    params: Number(videoId), // 转换为number
    onSuccess: (data) => {
      videos.value[0] = data;
    },
    onError: (error) => {
      console.error('Failed to fetch video details:', error);
    }
  });
});

const showInput = (status: any) => {
  console.log('回复评论:', status);
}

const mockVideoCommentsVO: VideoCommentsVO = {
  comments: {
    id: "cmt_001",
    userId: 101,
    videoId: 5001,
    content: "这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！这个视频真的很不错，节奏刚刚好！",
    imgUrl: "",
    createdAt: Date.now(),
    likeCount: 42,
    childCount: 3,
    parentCommentId: "",
    replyTargetId: "",
    isRoot: true
  },
  liked: false,
  user: {
    username: "StarTraveler",
    bio: "在像素与光影之间寻找灵感。",
    id: 101,
    avatarUrl: "http://localhost:10011/image/avatar/41f4d31f-3263-4706-8eb4-03cd334c1260.jpg"
  }
};


</script>

<template>
  <div class="main">
    <div class="video-detail-view">
      <div class="player-wapper">
        <!-- 视频播放器 -->
        <SwiperPlayer :mode="2" :start-with="0" :videos="videos" />
      </div>
      <div class="video-info">
        <span class="video-title">{{ "震惊！这个人居然..." }}</span>
        <!-- 交互按钮 -->
        <div class="operation">
          <div>
            <More></More>
          </div>
          <div style="transform: scaleX(-1)">
            <Back theme="filled" />
          </div>
          <div>
            <StarFilled />
            <span>{{ 50 }}</span>
          </div>
          <div>
            <HeartFilled />
            <span>{{ 100 }}</span>
          </div>
        </div>
      </div>
      <div class="user-info">
        <!-- 用户信息 -->
        <div class="uploader">
          <div class="avatar"></div>
          <div class="user-name">用户名</div>
          <div class="follow-button">
            <DokiButton buttonType="confirm">关注</DokiButton>
            <!-- <DokiButton buttonType="cancel">已关注</DokiButton> -->
          </div>
        </div>
      </div>
      <!-- 评论区 -->
      <div class="comments">
        <div class="comments-count">评论( 10 )</div>
        <div>评论输入处</div>
        <div class="comment-item" v-for="item in 10">
          <CommentItem :comment-object="mockVideoCommentsVO" @click-reply="showInput" />
          <!-- 评论回复框 -->
          <div>在这里输入回复...</div>
        </div>
      </div>
    </div>

    <div class="recommand">推荐视频区域</div>
  </div>
</template>


<style scoped>
.main {
  height: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  overflow-y: auto;
}

.video-detail-view {
  width: 80%;
}

.video-info {
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.video-title {
  font-size: 24px;
  font-weight: bold;
}

.player-wapper {
  height: 75vh;
  border-radius: 15px;
  overflow: hidden;
}

.user-info {
  display: flex;
}

.user-info>div {
  flex: 1;
}

.uploader {
  display: flex;
  gap: 20px;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: grey;
}

.avatar:hover {
  cursor: pointer;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
}

.user-name:hover {
  cursor: pointer;
  color: #ff3c69;
}


.operation {
  display: flex;
  /* 反方向 */
  flex-direction: row-reverse;
  gap: 20px;
  font-size: 25px;
  align-items: flex-end;
  /* 所有子元素底部对齐 */
  margin-right: 20px;
}

.operation>div>span {
  margin-left: 5px;
}

.comments-count {
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
}

.recommand {
  width: 20%;
}
</style>