<script setup lang="ts">
import {defineProps, onMounted, ref, onBeforeUnmount, createVNode, watch} from 'vue'

import {type CommentListResponse, type VideoComments, type VideoCommentsVO} from '../../api/commentService.js'
import commentService from '../../api/commentService.js'
import {handleRequest} from '../../api/handleRequest.ts'
import {useUserStore} from '../../store/userInfoStore'
import CommentItem from './CommentItem.vue'
import type {commentStatus} from './CommentItem.vue'
import CommentInput from "./CommentInput.vue";
import DokiLoading from "../Doki-Loading.vue"
import {Modal, message} from 'ant-design-vue'

const userStore = useUserStore();


const loadMoreRef = ref(); // 需要判断这个DOM是否出现在视口内，决定是否触发加载评论
const commentLoaded = ref(false); // 初始评论是否加载完毕标记

// 父组件传递来的视频ID和评论区抽屉开启状态
const props = defineProps({
  videoId: Number,
  open: Boolean
})

// 根评论数组
const commentsArray = ref<CommentListResponse>({
  list: [], // 评论的列表
  hasMore: false // 是否还有更多评论
});
const InnerCommentsArea = ref<HTMLDivElement | null>(null); // 评论展示区盒子引用

// 初始化方法
let observer: IntersectionObserver | null = null;
const isRootLoading = ref(true); // 根评论正在加载标记
// 只有在评论抽屉打开，并且还没初始化评论时才开始加载评论
watch(() => props.open, async () => {
  if (!commentLoaded.value) {
    await handleRequest(commentService.getComments, {
      async onSuccess(data) {
        console.log(data)
        // 给每一条评论初始化一个可能存在的回复列表
        data.list.forEach(c => c.replies = {list: [], hasMore: c.comments.childCount > 0})
        commentsArray.value = data;
        loadCursor = data.list[data.list.length - 1]; // 保存最后一条评论作为游标
        commentLoaded.value = true; // 初始评论加载完毕
      },
      params: {videoId: props.videoId!}
    })
    isRootLoading.value = false;
  }
})

// 添加无限滚动方法
let loadCursor: VideoCommentsVO | null = null; // 游标评论对象，加载根评论时以这个为基准
let RepliesLoadCursors = new Map<string, string>(); // 这个map存储每条根评论上次加载回复时获取的最后一条评论id
onMounted(async () => {
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
            isRootLoading.value = true;
            handleRequest(commentService.getComments, {
              async onSuccess(data) {
                if (commentsArray.value) {
                  // 去重
                  data.list = data.list.filter(c => !userAddedComments.some(u => u.comments.id === c.comments.id));
                  // 追加更多评论
                  commentsArray.value.list.push(...data.list);
                  // 更新hasMore状态
                  commentsArray.value.hasMore = data.hasMore;
                  // 更新loadCursor
                  loadCursor = data.list[data.list.length - 1];
                  isRootLoading.value = false;
                }
              }, params: {
                videoId: props.videoId!,
                lastId: loadCursor?.comments.id,
                score: loadCursor?.comments.score
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
  if (!rootComment.replies.hasMore) {
    return;
  }
  await handleRequest(commentService.getComments, {
    onSuccess(data) {
      // 先对获取的数据做去重处理
      data.list = data.list.filter(c => !userAddedComments.some(u => u.comments.id === c.comments.id));
      // 获取根评论的id
      const rootId = rootComment.comments.id;
      // 获取拉取的回复数据的最后一条id作为新游标
      const cursorId = data.list[data.list.length - 1].comments.id;
      // 更新游标
      RepliesLoadCursors.set(rootId, cursorId);
      // 把新数据填充到回复列表中
      rootComment.replies.list.push(...(data.list))
      // 更新是否还有更多数据标记
      rootComment.replies.hasMore = data.hasMore;
    }, params: {
      videoId: rootComment.comments.videoId,
      parentCommentId: rootComment.comments.id,
      lastId: RepliesLoadCursors.get(rootComment.comments.id)
    }
  })

  // 减去两条总数
  rootComment.comments.childCount -= 2;
  // 加载完毕
  isRepliesLoading.value = '';
}

// 删除评论处理方法
const handleDelete = async (status: commentStatus) => {
  // 获取目标评论引用
  const targetComment = status.commentObject.comments
  Modal.confirm({
    content: createVNode('div', {style: 'color:black;'}, '确定要删除这条评论吗？'),
    onOk() {
      handleRequest(commentService.deleteComment, {
        onSuccess(_) {
          message.success("删除成功！")
          // 如果是根评论，从根评论数组中找到这个元素并移除
          if (targetComment.isRoot) {
            commentsArray.value.list = commentsArray.value.list.filter(c => c.comments.id !== targetComment.id);
            return;
          }
          // 如果是回复，先找到它所在的根评论，然后从这个评论的回复数组中移除它
          const find = commentsArray.value.list.find(c => c.comments.id === targetComment.parentCommentId)!;
          if (find.replies) {
            find.replies.list = find.replies.list.filter(c => c.comments.id !== targetComment.id);
          }
        },
        params: targetComment.id
      },)
    },
  });
  // 清除回复状态
  clearReplyStatus();
}
// 评论点赞处理方法
const handleLike = (status: commentStatus) => {
  const targetComment = status.commentObject;
  handleRequest(commentService.likeComment, {
    onSuccess(_) {
      targetComment.comments.likeCount += (targetComment.liked ? -1 : 1);
      targetComment.liked = !targetComment.liked;
    },
    params: targetComment.comments.id
  })
}

// 评论添加处理方法，添加逻辑在input组件内部，这里处理添加成功后的逻辑
// 新建一个保存“当前用户新添加的评论”的数组，因为服务器可能会返回刚刚添加的评论
// 那么这时候视图中就可能出现重复的评论，所以每次加载的时候，对新拉取的评论做一下去重。
const userAddedComments: VideoCommentsVO[] = [];
const handleAddReply = (comment: VideoComments) => {
  // 1. 构建一个新的VO对象用来存储新增加的评论，并将其添加到userAddedComments
  // 从userStore中获取用户信息
  const user = userStore.userInfo;
  const newComment: VideoCommentsVO = {
    comments: comment,
    user: {
      username: user.username,
      bio: user.bio,
      id: user.id,
      avatarUrl: user.avatarUrl
    },
    liked: false,
    replies: {
      list: [],
      hasMore: false
    }
  }
  userAddedComments.push(newComment);
  // 2. 把这个对象插入到合适的位置，如果它是根评论，插入到最上边
  if (comment.isRoot) {
    commentsArray.value.list.unshift(newComment);
  } else {
    // 如果它是回复，则把它插入到回复列表的最底部。
    // 先找到它的根评论
    const root = commentsArray.value.list.find(c => c.comments.id === newComment.comments.parentCommentId);
    // 在根评论的回复列表中，添加这条评论。
    if (root && root.replies) {
      root.replies.list.push(newComment);
    }
  }
  // 清除回复状态
  clearReplyStatus();
}
</script>

<template>
  <div class="comments">
    <div style="flex: 1;overflow-y: auto;position: relative" ref="InnerCommentsArea">
      <div class="comment-list" v-if="commentLoaded">
        <div
            v-for="(roots) in commentsArray?.list"
        >
          <!-- 根评论 -->
          <div class="root-comments">
            <CommentItem
                :commentObject="roots"
                :key="roots.comments.id"
                @clickReply="handleReply"
                @clickDelete="handleDelete"
                @clickLike="handleLike"
            />
          </div>
          <!-- 回复列表 -->
          <div class="replies">
            <div class="reply-list" v-if="roots.replies?.list">
              <CommentItem
                  v-for="(reply) in roots.replies.list"
                  :commentObject="reply"
                  :key="reply.comments.id"
                  @clickReply="handleReply"
                  @clickDelete="handleDelete"
                  @clickLike="handleLike"
              />
            </div>
            <span v-if="roots.comments.childCount > 0 && isRepliesLoading == ''"
                  class="getMoreText"
                  @click="handleGetReplies(roots)"
            >{{
                RepliesLoadCursors.get(roots.comments.id) ? "—— 展开更多" : "—— 展开" + roots.comments.childCount + "条回复"
              }}
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
        :status="currentCommentStatus ?? null"
        :videoId="props.videoId!"
        @deleteReply="handleDeleteReply"
        @addComment="handleAddReply"
    ></CommentInput>
  </div>
</template>

<style scoped>
/* 整体盒子样式 */
.comments {
  padding: 0 15px 15px;
  width: 100%;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column
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


