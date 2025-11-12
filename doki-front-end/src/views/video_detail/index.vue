<script lang="ts" setup>
import { HeartFilled, StarFilled } from "@ant-design/icons-vue";
import { More, Back } from '@icon-park/vue-next'
import { ref, onMounted, reactive } from 'vue';
import SwiperPlayer from '../../components/player/index.vue';
import { handleRequest } from '../../api/handleRequest';
import type { VideoInfo } from '../../api/feedService';
import videoInfoService from '../../api/videoInfoService';
import { useRoute } from 'vue-router';
import DokiButton from "../../components/Doki-Button.vue";
import CommentItem from "./CommentItem.vue";
import Input from "./Input.vue";
import PageController from "./PageController.vue";
import commentService from "../../api/commentService.ts";
import type { VideoCommentsVO, CommentListResponse } from '../../api/commentService.ts'
import { useInfiniteScroll } from '../../utils/infiniteScroll.ts'
import DokiLoading from "../../components/Doki-Loading.vue";
const state = reactive({
  videoId: '',
  activeInput: -1, // 当前激活的评论输入框索引，-1表示没有激活
  loading: false,
  cursor: null as string | null,
  hasMore: true
});

const loadMoreRef = ref<HTMLElement | null>(null);
const mainRef = ref<HTMLElement | null>(null);

const videos = ref<VideoInfo[]>([]);
// 从路径参数中获取视频id
const route = useRoute();
const videoId = route.params.id as string;
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

  // 设置无限加载
  useInfiniteScroll(() => {
    state.loading = true;
    handleRequest(commentService.getComments, {
      onSuccess(data) {
        // 给每个元素加一个可能存在的回复列表
        data.list.forEach(comment => {
          comment.replies = {} as CommentListResponse;
        });
        commentsList.value.push(...data.list);
        state.cursor = data.cursor;
        state.hasMore = data.hasMore;
      }, params: {
        videoId: Number(videoId),
        cursor: state.cursor,
      },
      delay: 500,
    })
    state.loading = false;
  }, loadMoreRef, mainRef);
});

const showInput = (index: number) => {
  // 如果已经是激活状态，把它关闭
  if (state.activeInput === index) {
    return;
  }
  state.activeInput = -1;
  // 激活指定索引的输入框
  state.activeInput = index;
}
// 评论列表
const commentsList = ref<VideoCommentsVO[]>([]);

const handleGetReplies = (page: number, comment: VideoCommentsVO) => {
  handleRequest(commentService.getRepliesByPage, {
    params: {
      pid: comment.comments.id,
      page: page - 1
    },
    onSuccess(data) {
      comment.replies.list = data;
    }
  })
}
const handleChangePage = (page: number, comment: VideoCommentsVO) => {
  handleGetReplies(page, comment);
}


</script>

<template>
  <div class="main" ref="mainRef">
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
        <!-- 评论输入框 -->
        <div style="margin: 20px 0;">
          <Input />
        </div>
        <div class="comment-item" v-if="commentsList.length > 0" v-for="(comment, rootIndex) in commentsList">
          <CommentItem :comment-object="comment" @click-reply="showInput(rootIndex)" />
          <span @click="handleGetReplies(1, comment)" v-if="comment.comments.childCount > 0 && !comment.replies.list"
            class="has-replies-notice">
            ——展开{{ comment.comments.childCount }}条回复
          </span>
          <div v-if="comment.replies.list" class="replies-area">
            <div v-for="(reply, index) in comment.replies.list" :key="index">
              <CommentItem :comment-object="reply" :key="index" @click-reply="showInput(rootIndex)" />
            </div>
            <!-- 分页 -->
            <PageController @change-page="(page) => handleChangePage(page, comment)"
              :totalCount="comment.comments.childCount" />
          </div>
          <!-- 评论回复框 -->
          <div v-if="rootIndex === state.activeInput" style="padding-left: 40px;">
            <Input />
          </div>
        </div>
      </div>
      <!-- 加载标记 -->
      <DokiLoading v-if="state.loading" />
      <!-- 无限加载标记 -->
      <div v-show="!state.loading && state.hasMore" ref="loadMoreRef"></div>
      <div v-if="!state.hasMore" class="no-more-comments flex-center"
        style="text-align: center; color: grey; margin: 20px 0;">
        没有更多评论了
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

.replies-area {
  padding-left: 40px;
}

.has-replies-notice {
  padding-left: 50px;
  color: grey;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
}

.has-replies-notice:hover {
  color: #ff3c69;
}

.recommand {
  width: 20%;
}

.no-more-comments {
  font-size: 14px;
  color: grey;
  height: 50px;
}
</style>