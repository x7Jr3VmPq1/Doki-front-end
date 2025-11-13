<script lang="ts" setup>
import { HeartFilled, StarFilled } from "@ant-design/icons-vue";
import { More, Back } from '@icon-park/vue-next'
import { ref, onMounted, reactive, nextTick } from 'vue';
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
  target: null as VideoCommentsVO | null, // 回复目标评论
  currentPage: 1,
  loading: false,
  cursor: null as string | null,
  hasMore: true,
  cacheCommentIds: new Set<string>() // 本地缓存，用来去重评论
});

const loadMoreRef = ref<HTMLElement | null>(null);
const mainRef = ref<HTMLElement | null>(null);
const commentsRef = ref<HTMLElement | null>(null);

const videos = ref<VideoInfo[]>([]);
// 从路径参数中获取视频id
const route = useRoute();
const videoId = route.params.id as string;
const cid = route.query.cid as string;

// 评论列表
const commentsList = ref<VideoCommentsVO[]>([]);

const fetchComments = async () => {
  state.loading = true;

  handleRequest(commentService.getComments, {
    onSuccess(data) {

      data.list = data.list.filter(c => !state.cacheCommentIds.has(c.comments.id))

      // 给每个元素加一个可能存在的回复列表
      data.list.forEach(comment => {
        comment.replies = {
          list: [],
          hasMore: false,
          cursor: ''
        } as CommentListResponse;
      });
      commentsList.value.push(...data.list);
      state.cursor = data.cursor;
      state.hasMore = data.hasMore;
    }, params: {
      videoId: Number(videoId),
      cursor: state.cursor,
    },
  })
  state.loading = false;
}

onMounted(async () => {

  if (cid) {
    await handleRequest(commentService.getSingle, {
      async onSuccess(data) {
        data.replies = {
          list: [],
          hasMore: false,
          cursor: ''
        } as CommentListResponse;
        commentsList.value.push(data);
        state.cacheCommentIds.add(data.comments.id)// 保存这条评论ID用于去重
        if (data.page >= 0) {
          handleGetReplies(data.page, data);
        }
        // TODO: 如果接口反应慢，这个方法不可靠，待优化。
        await new Promise(resolve => setTimeout(resolve, 500));
        nextTick(() => {
          const el = document.getElementById(`comment-${cid}`)
          console.log(el);

          if (el) {
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
            // 添加高亮样式
            el.classList.add('highlight-comment');
            // 一秒后移除
            setTimeout(() => {
              el.classList.remove('highlight-comment');
            }, 1000);
          }
        })
      },
      params: cid
    })
  }

  // 加载初始评论
  await fetchComments();


  // 获取视频信息
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
  useInfiniteScroll(fetchComments, loadMoreRef, mainRef);
});

const showInput = (index: number, target: VideoCommentsVO) => {
  state.target = target;
  // 如果已经是激活状态，把它关闭
  if (state.activeInput === index) {
    return;
  }
  state.activeInput = -1;
  // 激活指定索引的输入框
  state.activeInput = index;
}

const handleGetReplies = async (page: number, comment: VideoCommentsVO) => {
  state.currentPage = page;
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
  state.activeInput = -1;
  handleGetReplies(page, comment);
}

const handleSendComment = (newComment: VideoCommentsVO) => {
  commentsList.value.unshift(newComment);
}

const handleSendReply = (target: VideoCommentsVO, newComment: VideoCommentsVO) => {
  target.replies.list.push(newComment);
}

const clearReplies = (target: VideoCommentsVO) => {
  state.activeInput = -1;
  target.replies.list = [];
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
      <div class="comments" ref="commentsRef">
        <div class="comments-count">评论( 10 )</div>
        <!-- 评论输入框 -->
        <div style="margin: 20px 0;">
          <Input @send="handleSendComment" :video-id="Number(videoId)" />
        </div>
        <div class="comment-item" v-if="commentsList.length > 0" v-for="(comment, rootIndex) in commentsList">
          <CommentItem :id="`comment-${comment.comments.id}`" :comment-object="comment"
            @click-reply="showInput(rootIndex, comment)" />
          <span @click="handleGetReplies(1, comment)"
            v-if="comment.comments.childCount > 0 && comment.replies.list.length === 0" class="has-replies-notice">
            ——展开{{ comment.comments.childCount }}条回复
          </span>
          <span v-if="comment.replies.list.length > 0" class="has-replies-notice"
            @click="clearReplies(comment)">——收起</span>
          <div v-if="comment.replies.list" class="replies-area">
            <div v-for="(reply, index) in comment.replies.list" :key="index">
              <CommentItem :id="`comment-${reply.comments.id}`" :comment-object="reply" :key="index"
                @click-reply="showInput(rootIndex, reply)" />
            </div>
            <!-- 分页 -->
            <PageController :current-page="state.currentPage"
              v-if="comment.replies.list.length > 0 && comment.comments.childCount > 5"
              @change-page="(page) => handleChangePage(page, comment)" :totalCount="comment.comments.childCount" />
          </div>
          <!-- 评论回复框 -->
          <div v-if="rootIndex === state.activeInput" style="padding-left: 40px;">
            <Input :target-comment="state.target" :video-id="Number(videoId)"
              @send="(inputSring) => handleSendReply(comment, inputSring)" />
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
  height: 200px;
}


@keyframes highlightFade {
  0% {
    background-color: #e8f4ff;
  }

  100% {
    background-color: transparent;
    box-shadow: none;
  }
}

.highlight-comment {
  animation: highlightFade 4s ease forwards;
  border-radius: 8px;
}
</style>