<script setup lang="ts">
import {defineProps, onMounted, ref} from 'vue'
import type {CommentListResponse, VideoCommentsVO} from '../../api/commentService.js'
import commentService from '../../api/commentService.js'
import {handleRequest} from '../../api/handleRequest.ts'
import {useUserStore} from '../../store/userInfoStore'
import CommentItem from './CommentItem.vue'
import CommentInput from "./CommentInput.vue";

const userStore = useUserStore();

const commentLoaded = ref(false); // 评论是否加载完毕标记

// 父组件传递来的视频ID
const props = defineProps({
  videoId: Number
})

const commentsArray = ref<CommentListResponse>(); // 评论数组

const InnerCommentsArea = ref<HTMLDivElement | null>(null); // 评论展示区盒子引用

const commentRefs = ref<(InstanceType<typeof CommentItem> | null)[]>([]) // 评论组件引用
// 初始化钩子
onMounted(async () => {
  await handleRequest(commentService.getComments, {
    onSuccess(data) {
      commentsArray.value = data;
      commentLoaded.value = true; // 评论加载完毕
    },
    params: {videoId: props.videoId!}
  })
})

// 响应点击回复按钮事件
const currentReplyComment = ref<InstanceType<typeof CommentItem> | null>(null);
const handleReply = (index: number) => {
  if (currentReplyComment && currentReplyComment.value) {
    // 1. 先取消之前评论对象的高亮状态
    currentReplyComment.value.isReplying = false;
  }
  // 2. 获取当前要操作的评论组件对象
  currentReplyComment.value = commentRefs.value[index];
  if (currentReplyComment && currentReplyComment.value) {
    // 3. 改变新的高亮状态
    currentReplyComment.value.isReplying = true;
  }
}

// 响应删除回复目标事件
const handleDeleteReply = () => {
  if (currentReplyComment.value) {
    // 清除高亮及引用
    currentReplyComment.value.isReplying = false;
    currentReplyComment.value = null;
  }
}
</script>

<template>
  <div class="comments" ref="commentsArea" style="height: 100%; display: flex;flex-direction: column">
    <div style="flex: 1;overflow-y: auto" ref="InnerCommentsArea">
      <div class="comment-list" v-if="commentLoaded">
        <CommentItem
            v-for="(item,index) in commentsArray?.list"
            :ref="(el) =>{ commentRefs[index] = el as InstanceType<typeof CommentItem>}  "
            :commentObject="item"
            :key="index"
            @clickReply="() => handleReply(index)"
        >
        </CommentItem>
      </div>

      <!-- 加载更多标记 -->
      <div ref="loadMore" style="height: 5px"></div>
    </div>
    <!-- 评论输入框 -->
    <CommentInput
        :reply-target-object="currentReplyComment?.commentObject"
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


.report-delete-btn {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 0;
  opacity: 0;
}

.comment-highlight {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
  box-sizing: border-box;
  width: calc(100% - 16px);
  max-width: 100%;
}

.comment-highlight .reply-btn {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 确保子评论不会被父评论的高亮影响 */
.comment-highlight .replies-list .comment-item {
  background-color: transparent !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  width: auto !important;
  max-width: none !important;
}
</style>


