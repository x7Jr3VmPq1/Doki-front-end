<script setup lang="ts">
import {defineProps, onMounted, ref, onBeforeUnmount, createVNode} from 'vue'

import CommentService, {type CommentListResponse, type VideoCommentsVO} from '../../api/commentService.js'
import commentService from '../../api/commentService.js'
import {handleRequest} from '../../api/handleRequest.ts'
import {useUserStore} from '../../store/userInfoStore'
import CommentItem from './CommentItem.vue'
import type {commentStatus} from './CommentItem.vue'
import CommentInput from "./CommentInput.vue";
import {Modal, message} from 'ant-design-vue';
import DokiLoading from "../Doki-Loading.vue"
import {ToTop} from '@icon-park/vue-next'


const userStore = useUserStore();


const loadMoreRef = ref();
const commentLoaded = ref(false); // 评论是否加载完毕标记

// 父组件传递来的视频ID
const props = defineProps({
  videoId: Number,
})

const commentsArray = ref<CommentListResponse>(); // 评论数组

const InnerCommentsArea = ref<HTMLDivElement | null>(null); // 评论展示区盒子引用

// 初始化钩子
let observer: IntersectionObserver | null = null;

const isRootLoading = ref(true); // 根评论正在加载标记

onMounted(async () => {
  // 模拟加载效果
  await new Promise(resolve => setTimeout(resolve, 500));
  await handleRequest(commentService.getComments, {
    async onSuccess(data) {
      commentsArray.value = data;
      commentLoaded.value = true; // 初始评论加载完毕
    },
    params: {videoId: props.videoId!}
  })
  isRootLoading.value = false;
  // 添加无限加载方法
  if (!loadMoreRef.value) return;

  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 滚动到底触发拉取更多评论
        if (entry.isIntersecting) {
          if (commentsArray.value) {
            // 没有更多了，不再加载。
            if (!commentsArray.value.hasMore)
              return;
            // 获取最后一条评论
            let lastComment = commentsArray.value.list[commentsArray.value.list.length - 1];
            handleRequest(commentService.getComments, {
              async onSuccess(data) {
                if (commentsArray.value) {
                  // 模拟加载效果
                  isRootLoading.value = true;
                  await new Promise(resolve => setTimeout(resolve, 500));
                  // 追加更多评论
                  commentsArray.value.list.push(...data.list);
                  // 更新hasMore状态
                  commentsArray.value.hasMore = data.hasMore;

                  isRootLoading.value = false;
                }
              }, params: {
                videoId: lastComment.comments.videoId,
                lastId: lastComment.comments.id,
                score: lastComment.comments.score
              }
            })
          }
        }
      },
      {
        root: InnerCommentsArea.value, // 监听评论展示盒子
        rootMargin: "50px", // 距离底部50px时触发加载
        threshold: 0,
      }
  );
  observer.observe(loadMoreRef.value);
})
onBeforeUnmount(() => {
  if (observer && loadMoreRef.value) {
    observer.unobserve(loadMoreRef.value);
    observer.disconnect();
  }
});

// 当前active评论组件的状态
const currentCommentStatus = ref<commentStatus | null>();
// 工具方法 清除当前评论回复状态
const clearReplyStatus = () => {
  if (currentCommentStatus.value) {
    currentCommentStatus.value.isReplying = false;
    currentCommentStatus.value = null;
  }
}
// 响应点击回复按钮事件
const handleReply = (status: commentStatus) => {
  // 先清除之前的回复状态
  clearReplyStatus();
  // 设置新的状态
  currentCommentStatus.value = status;
  currentCommentStatus.value.isReplying = true;
}
// 响应删除回复目标事件
const handleDeleteReply = () => {
  clearReplyStatus();
}

// 获取回复方法
const isRepliesLoading = ref(''); // 空串代表加载完毕，如果正在加载中，它的值是根评论的id
const handleGetReplies = async (rootComment: VideoCommentsVO) => {
  // 模拟加载效果
  isRepliesLoading.value = rootComment.comments.id;
  await new Promise(resolve => setTimeout(resolve, 500));
  // 已经存在回复列表，进行追加逻辑
  if (rootComment.replies) {
    // 没有更多回复，不再加载
    if (!rootComment.replies.hasMore)
      return;
    await handleRequest(commentService.getComments, {
      onSuccess(data) {
        if (rootComment.replies) {
          rootComment.replies?.list.push(...(data.list))
          rootComment.replies.hasMore = data.hasMore;
        }
      }, params: {
        videoId: rootComment.comments.videoId,
        parentCommentId: rootComment.comments.id,
        lastId: rootComment.replies?.list[rootComment.replies?.list.length - 1].comments.id
      }
    })
    // 还没有回复列表，创建一个新数组
  } else {
    await handleRequest(commentService.getComments, {
      onSuccess(data) {
        rootComment.replies = data;
      }, params: {
        videoId: rootComment.comments.videoId,
        parentCommentId: rootComment.comments.id,
      }
    })
  }
  // 减去两条总数
  rootComment.comments.childCount -= 2;
  // 加载完毕
  isRepliesLoading.value = '';
}

// 删除评论处理方法
const handleDelete = (status: commentStatus) => {
  console.log(status)
  Modal.confirm({
    content: createVNode('div', {style: 'color:black;'}, '确定要删除这条评论吗？'),
    onOk() {
      handleRequest(CommentService.deleteComment, {
        onSuccess(_) {
          message.success("删除成功！")
          // 删除回复
          if (status.rootIndex != null && status.replyIndex != null) {
            commentsArray.value?.list[status.rootIndex].replies?.list.splice(status.replyIndex, 1);
          } else {
            // 删除根评论
            commentsArray.value?.list.splice(status.rootIndex, 1);
          }
        },
        params: status.commentObject.comments.id
      },)
    },
  });
}
// 评论点赞处理方法
const handleLike = (status: commentStatus) => {
  handleRequest(commentService.likeComment, {
    onSuccess(_) {
      status.commentObject.comments.likeCount += (status.commentObject.liked ? -1 : 1);
      status.commentObject.liked = !status.commentObject.liked;
    },
    params: status.commentObject.comments.id
  })
}
</script>

<template>
  <div class="comments" ref="commentsArea" style="height: 100%; display: flex;flex-direction: column">
    <div style="flex: 1;overflow-y: auto;position: relative" ref="InnerCommentsArea">
      <div class="comment-list" v-if="commentLoaded">
        <div
            v-for="(roots,rootIndex) in commentsArray?.list"
        >
          <!-- 根评论 -->
          <div class="root-comments">
            <CommentItem
                :commentObject="roots"
                :key="rootIndex"
                :root-index="rootIndex"
                @clickReply="handleReply"
                @clickDelete="handleDelete"
                @clickLike="handleLike"
            />
          </div>
          <!-- 回复列表 -->
          <div class="replies" v-if="roots.comments.isRoot">
            <div class="reply-list" v-if="roots.replies?.list">
              <CommentItem
                  v-for="(reply,replyIndex) in roots.replies.list"
                  :commentObject="reply"
                  :key="replyIndex"
                  :root-index="rootIndex"
                  :reply-index="replyIndex"
                  @clickReply="handleReply"
                  @clickDelete="handleDelete"
                  @clickLike="handleLike"
              />
            </div>
            <span v-if="roots.comments.childCount > 0 && isRepliesLoading == ''"
                  class="getMoreText"
                  @click="handleGetReplies(roots)"
            >—— 展开{{ roots.comments.childCount }}条回复
            </span>
            <!-- 加载动画 -->
            <DokiLoading v-if="isRepliesLoading == roots.comments.id"></DokiLoading>
          </div>
        </div>
      </div>
      <!-- 加载动画 -->
      <DokiLoading v-if="isRootLoading"></DokiLoading>
      <!-- 加载更多标记 -->
      <div ref="loadMoreRef" v-show="!isRootLoading"></div>
      <!-- 没有更多评论提示语 -->
      <div class="noMoreText" v-if="!commentsArray?.hasMore && isRootLoading==false">没有更多了~！</div>
    </div>
    <!-- 评论输入框 -->
    <CommentInput
        :reply-target-object="currentCommentStatus?.commentObject"
        @deleteReply="handleDeleteReply"
    ></CommentInput>
  </div>
</template>

<style scoped>
.comments {
  padding: 15px;
  width: 100%;
  position: relative;
}

/* 评论列表样式 */
.comment-list {
  width: 100%;
}

/* 回复列表给一点缩进 */
.replies {
  padding-left: 15%;
}

.noMoreText {
  color: #bdbdbd;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

.getMoreText {
  padding: 5px 0;
  color: #bdbdbd;
  display: inline-block;
  align-items: center;
  cursor: pointer;
}

.getMoreText:hover {
  color: white;
}

.to-top {
  position: absolute;
  right: 50px;
  bottom: 50px;
}

</style>


