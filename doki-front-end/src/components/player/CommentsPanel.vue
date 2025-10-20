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


const userStore = useUserStore();


const loadMoreRef = ref();
const commentLoaded = ref(false); // 评论是否加载完毕标记

// 父组件传递来的视频ID
const props = defineProps({
  videoId: Number
})

const commentsArray = ref<CommentListResponse>(); // 评论数组

const InnerCommentsArea = ref<HTMLDivElement | null>(null); // 评论展示区盒子引用

// 初始化钩子
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await handleRequest(commentService.getComments, {
    onSuccess(data) {
      commentsArray.value = data;
      commentLoaded.value = true; // 评论加载完毕
    },
    params: {videoId: props.videoId!}
  })
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
              onSuccess(data) {
                if (commentsArray.value) {
                  // 追加更多评论
                  commentsArray.value.list.push(...data.list);
                  // 更新hasMore状态
                  commentsArray.value.hasMore = data.hasMore;
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
        root: null, // 监听整个视口
        rootMargin: "0px",
        threshold: 0.1,
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
const handleGetReplies = (rootComment: VideoCommentsVO) => {
  // 已经存在回复列表，进行追加逻辑
  if (rootComment.replies) {
    // 没有更多回复，不再加载
    if (!rootComment.replies.hasMore)
      return;
    handleRequest(commentService.getComments, {
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
    handleRequest(commentService.getComments, {
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
    <div style="flex: 1;overflow-y: auto" ref="InnerCommentsArea">
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
            <div v-if="roots.comments.childCount > 0" class="getMoreText" @click="handleGetReplies(roots)">—— 展开{{
                roots.comments.childCount
              }}条回复
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多标记 -->
      <div ref="loadMoreRef" style="height: 5px"></div>
      <!-- 没有更多评论提示语 -->
      <div class="noMoreText" v-if="!commentsArray?.hasMore">没有更多了~！</div>
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
  color: #bdbdbd;
  display: flex;
  align-items: center;
  height: 20px;
  padding-left: 20%;
  cursor: pointer;
}

.getMoreText:hover {
  color: white;
}

</style>


