<template>
  <a-modal
      :visible="visible"
      :width="`${100}vw`"
      :style="{ top: '3vh' }"
      :bodyStyle="{ height: '88vh' }"
      :footer="null"
      :title="null"
      :closable="true"
      :maskClosable="true"
      :maskStyle="{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }"
      @cancel="handleCancel"
  >
    <div v-if="props.visible" class="VideoDetails">
      <div class="videoArea">
        <video
            :src=videoStore.videos[videoStore.videoIndex].videoUrl
            ref="videoInstance"
            controls
            loop
        ></video>
      </div>
      <div class="functionButtons">
        <VideoDetailsFunctionButton></VideoDetailsFunctionButton>
      </div>
      <div class="changeButtons">
        <ChangeVideoButton @changeVideo="handleChange"></ChangeVideoButton>
      </div>
      <div class="commentsArea">
        <!-- 显示评论总数 -->
        <div class="commentCount" style="margin-bottom: 10px;">
          共 {{ videoStore.videos[videoStore.videoIndex].commentCount }} 条评论
        </div>
        <!-- 顶级评论输入区域 -->
        <div class="commentInput">
          <a-textarea
              class="inputArea"
              v-model:value="newComment"
              placeholder="请输入您的评论..."
              :rows="3"
              :maxlength="200"
              :autoSize="{ minRows: 2, maxRows: 6 }"
              :resizable="false"
              show-count
              addonAfter=""
          >
            <template #suffix>
            </template>
          </a-textarea>
          <!--  TODO 完善表情选择功能 -->
          <!-- 表情选择器 -->
          <emoji-picker
              v-if="showEmojiPicker"
              @select="onEmojiSelect"
              :style="{ position: 'absolute', zIndex: 1000, right: '10px', bottom: '60px' }"
          />
          <a-button type="primary" @click="submitComment" style="margin-left: 10px;">提交</a-button>
        </div>
        <!-- 评论渲染区 -->
        <a-list
            v-if="!isLoading"
            :data-source="comments"
            item-layout="vertical"
            class="commentList"
            :locale="{ emptyText: '暂无评论，快来发表你的看法吧！' }"
        >
          <!-- 循环渲染comments数组中的内容，每一个comment代表一条数据 -->
          <template #renderItem="{ item: comment, index }">
            <!-- 顶级评论的内容 -->
            <a-comment
                :author="comment.username"
                :datetime="dayUtils.formatDate(comment.createdAt)"
                :content="comment.content"
            >
              <!-- 顶级评论的回复点赞功能和头像显示 -->
              <template #actions>
                <span key="comment-basic-reply-to" @click="toggleReplyInput(index)">回复</span>
                <span key="comment-basic-like" @click="likeComment(comment.id)"
                      :style="{ color: comment.liked ? '#ff69b4' : '' }">
                  <HeartOutlined/>
                  <span v-if="comment.likeCount > 0">{{ ' ' + comment.likeCount }}</span>
                </span>
                <span v-if="comment.userId === currentUserId" key="comment-basic-delete"
                      @click="deleteComment(comment.id)">删除</span>
              </template>
              <template #avatar>
                <router-link :to="`@${comment.username}`">
                  <!-- TODO 增加头像气泡卡片 -->
                  <a-popover title="Title">
                    <template #content>
                      <p>头像</p>
                      <p>资料</p>
                    </template>
                    <a-avatar :src="comment.avatarUrl" alt="Han Solo"/>
                  </a-popover>
                </router-link>
              </template>
              <!-- 顶级评论的回复框区域 -->
              <a-comment
                  v-if="showReplyInput[index]"
                  :avatar="null"
              >
                <!-- 顶级评论回复框的头像和输入区域  -->
                <template #avatar>
                  <router-link :to="`@${currentUserName}`">
                    <a-avatar :src="currentUserAvatarUrl" alt="Han Solo"/>
                  </router-link>
                </template>
                <template #content>
                  <a-form-item>
                    <a-textarea
                        placeholder="在这里留下您的回复~"
                        style="resize: none"
                        v-model:value="replyContent[index]"
                        :rows="4"
                        :maxlength="200"
                        :autoSize="{ minRows: 4, maxRows: 6 }"
                        :resizable="false"
                        show-count
                    />
                  </a-form-item>
                  <a-form-item>
                    <a-button html-type="submit" :loading="submitting" type="primary"
                              @click="submitReply(comment.id, index)">
                      提交回复
                    </a-button>
                  </a-form-item>
                </template>
              </a-comment>
              <!-- 次级评论的渲染区域 -->
              <a-list
                  v-if="comment.replies.length > 0"
                  :data-source="comment.replies"
                  item-layout="vertical"
                  class="replyList"
              >
                <!-- 每一个reply代表一条次级评论 -->
                <template #renderItem="{ item: reply }">
                  <!-- 次级评论内容 -->
                  <a-comment
                      :author="reply.username"
                      :datetime="dayUtils.formatDate(reply.createdAt)"
                      :content="reply.content"
                  >
                    <!-- 次级评论的提交点赞按钮和头像 -->
                    <template #actions>
                      <span key="comment-basic-reply-to" @click="toggleSecondCommentReplyInput(reply.id)">回复</span>
                      <span key="comment-basic-like" @click="likeComment(reply.id)"
                            :style="{ color: reply.liked ? '#ff69b4' : '' }">
                                <HeartOutlined/>
                                <span v-if="reply.likeCount > 0">{{ ' ' + reply.likeCount }}</span>
                            </span>
                      <span v-if="reply.userId === currentUserId" key="comment-basic-delete"
                            @click="deleteComment(reply.id)">删除</span>
                    </template>
                    <template #avatar>
                      <router-link :to="`@${reply.username}`">
                        <a-avatar :src="reply.avatarUrl" alt="Han Solo"/>
                      </router-link>
                    </template>
                    <!-- 回复次级评论的输入框区域 -->
                    <a-comment
                        v-if="showSecondLevelReplyInput[reply.id]"
                        :avatar="null"
                    >
                      <!-- 次级评论输入框中的头像和内容区域 -->
                      <template #avatar>
                        <router-link :to="`@${currentUserName}`">
                          <a-avatar :src="currentUserAvatarUrl" alt="Han Solo"/>
                        </router-link>
                      </template>
                      <template #content>
                        <a-form-item>
                          <a-textarea
                              placeholder="在这里留下您的回复~"
                              style="resize: none"
                              v-model:value="replyContent[reply.id]"
                              :rows="4"
                              :maxlength="200"
                              :autoSize="{ minRows: 4, maxRows: 6 }"
                              :resizable="false"
                              show-count
                          />
                        </a-form-item>
                        <a-form-item>
                          <a-button html-type="submit" :loading="submitting" type="primary"
                                    @click="submitReply(reply.id, reply.id)">
                            提交回复
                          </a-button>
                        </a-form-item>
                      </template>
                    </a-comment>
                  </a-comment>
                </template>
              </a-list>
            </a-comment>
          </template>
        </a-list>
        <!-- 骨架屏 -->
        <a-skeleton v-else active :paragraph="{ rows: 5 }"/>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
// TODO 优化，当添加或删除评论时，不要向服务器重新拉取，只更新列表
import {HeartOutlined} from '@ant-design/icons-vue';
import {nextTick, ref, watch, onMounted, onUnmounted} from 'vue';
import {useVideoStore} from "../store/videoStore.js";
import VideoDetailsFunctionButton from "./VideoDetailsFunctionButton.vue";
import ChangeVideoButton from "./changeVideoButton.vue";
import {
  getVideoCommentsByVideoId,
  addVideoComment,
  deleteVideoComment,
  likeCommentByCommentId
} from "../api/commentService.js";
import {message, Modal} from "ant-design-vue"; // 引入 Modal 组件
import relativeTime from 'dayjs/plugin/relativeTime';
import {EmojiPicker} from 'emoji-picker-vue'; // 引入表情选择器组件
import {dayUtils} from "../utils/dayUtils.js";
// 当前登录用户的头像地址
const currentUserAvatarUrl = ref(localStorage.getItem('avatar'));
// 当前用户名
const currentUserName = ref(localStorage.getItem('username'));
// 视频播放器实例
const videoInstance = ref(null);
// 使用视频状态管理
const videoStore = useVideoStore();
// 接收父组件传来的参数
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  videoComments: {
    type: Array,
    default: () => []
  },
  isProfile: {
    type: Boolean,
    default: false
  }
});

// 定义事件发射器，用于更新 visible 状态
const emit = defineEmits(['update:visible']);

// 新增：加载状态
const isLoading = ref(true);

// 打开对话框后，初始化评论列表
const handleChange = () => {
  nextTick(async () => {
    isLoading.value = true; // 开始加载
    // 模拟一个短暂的延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    const res = await getVideoCommentsByVideoId(videoStore.videos[videoStore.videoIndex].id);
    comments.value = res.data;
    isLoading.value = false; // 加载完成
    videoInstance.value.play();
  });
};

// 监听 visible 状态变化，控制视频播放器
watch(() => props.visible, (newValue) => {
  nextTick(() => {
    if (newValue) {
      // 当对话框打开时，同步视频时间并播放,把评论内容赋值给comments
      comments.value = props.videoComments;
      isLoading.value = false; // 加载完成
      // 如果这个组件被个人资料页面使用时，不要进行这个行为
      if (!props.isProfile) {
        videoInstance.value.currentTime = videoStore.currentVideoTime;
      } else {
        videoInstance.value.currentTime = 0;
      }
      videoInstance.value.play();
    }
  });
});

// 处理对话框关闭事件
const handleCancel = () => {
  // 暂停视频并同步时间到 store
  videoInstance.value?.pause();
  // 如果这个组件被个人资料页面使用时，不要进行这个行为
  if (!props.isProfile) {
    videoStore.setCurrentVideoTime(videoInstance.value?.currentTime);
  } else {
    videoStore.setCurrentVideoTime(0);
  }
  emit('update:visible', false);
};

// 新评论内容
const newComment = ref('');
// 评论列表
const comments = ref([]);

// 控制评论展开状态的映射
const expandedComments = ref({});
// 控制回复输入框显示状态的数组，初始化为空对象
const showReplyInput = ref({});
// 回复内容对象，以评论的 id 为键
const replyContent = ref({});
// 控制二级回复输入框显示状态的数组
const showSecondLevelReplyInput = ref({});
// 提交内容数组
const submitContent = ref('');
const maxLength = ref(200);
// 当前登录用户的 ID
const currentUserId = ref(Number(localStorage.getItem('id')));

// 提交评论
const submitComment = async () => {
  if (newComment.value.trim()) {
    // 提交评论到服务器
    await addVideoComment(videoStore.videos[videoStore.videoIndex].id, newComment.value, null);
    // 让评论数加1
    videoStore.videos[videoStore.videoIndex].commentCount++;
    // 提交完毕之后，从服务器再次获取新的评论列表
    isLoading.value = true; // 开始加载
    const response = await getVideoCommentsByVideoId(videoStore.videos[videoStore.videoIndex].id);
    comments.value = response.data;
    isLoading.value = false; // 加载完成
    // 清空评论输入框
    newComment.value = '';
    message.success('评论成功！');
  } else {
    message.error('评论不能为空哦~！');
  }
};

// 提交回复
const submitReply = async (commentId, index) => {


  if (replyContent.value[index]?.trim()) {
    // 获取顶级评论的ID
    const topLevelCommentId = comments.value.find(comment =>
        comment.replies.some(reply => reply.id === commentId)
    )?.id || commentId;
    const commentData = {
      // 视频id
      videoId: videoStore.videos[videoStore.videoIndex].id,
      // 评论内容
      comment: replyContent.value[index],
      // 父评论id，始终使用顶级评论的ID
      parentCommentId: topLevelCommentId
    };
    // 提交回复到服务器
    await addVideoComment(...Object.values(commentData));
    // 让评论数加1
    videoStore.videos[videoStore.videoIndex].commentCount++;
    // 从服务器再次获取新的评论列表
    isLoading.value = true; // 开始加载
    await getVideoCommentsByVideoId(videoStore.videos[videoStore.videoIndex].id).then((response) => {
      comments.value = response.data;
      isLoading.value = false; // 加载完成
    });
    // 清空回复输入框和切换回复输入框显示状态
    replyContent.value[index] = '';
    showReplyInput.value[index] = false;
    // 关闭二级回复框，使用子评论的 ID
    showSecondLevelReplyInput.value[commentId] = false;
    message.success('回复成功！');
  } else {
    message.error('回复不能为空哦~！');
  }
};

// 切换回复输入框显示状态
const toggleReplyInput = (index) => {
  // 关闭所有其他回复框
  for (const key in showReplyInput.value) {
    if (key !== index.toString()) {
      showReplyInput.value[key] = false;
    }
  }
  showReplyInput.value[index] = !showReplyInput.value[index];
  if (showReplyInput.value[index]) {
    // 确保replyContent[index]被正确初始化为空字符串
    if (!replyContent.value[index]) {
      replyContent.value[index] = '';
    }
  }
};

// 切换二级回复输入框显示状态
const toggleSecondCommentReplyInput = (replyId) => {
  // 关闭所有其他二级回复框
  for (const key in showSecondLevelReplyInput.value) {
    if (key !== replyId.toString()) {
      showSecondLevelReplyInput.value[key] = false;
    }
  }
  showSecondLevelReplyInput.value[replyId] = !showSecondLevelReplyInput.value[replyId];
  if (showSecondLevelReplyInput.value[replyId]) {
    // 确保replyContent[replyId]被正确初始化为空字符串
    if (!replyContent.value[replyId]) {
      replyContent.value[replyId] = '';
    }
  }
};

// 新增：用于记录点赞状态的 Map
const likedComments = ref({});

// 点赞评论
const likeComment = async (commentId) => {
  try {
    // 调用 API 点赞
    const response = await likeCommentByCommentId(commentId);

    // 判断返回的 code 是否为 500
    if (response.code === 500) {
      message.error('不可以重复点赞哦');
      return;
    }
    // 递归查找并更新点赞状态
    const updateLikeStatus = (comments, status) => {
      return comments.map(comment => {
        // 增加对 comment 对象的判空处理
        if (!comment) return comment;
        if (comment.id === commentId) {
          // 更新点赞状态
          comment.liked = status;
          // 更新点赞数量
          comment.likeCount = status ? comment.likeCount + 1 : comment.likeCount - 1;
        }
        // 如果存在子评论，递归查找
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = updateLikeStatus(comment.replies, status);
        }
        return comment;
      });
    };
    // 判断返回的data是不是"取消点赞成功"，如果是，就取消点赞，否则就点赞
    if (response.data === '取消点赞成功') {
      // 更新本地评论数据
      comments.value = updateLikeStatus(comments.value, false);
      message.success('取消点赞成功');
    } else {
      comments.value = updateLikeStatus(comments.value, true);
      message.success('点赞成功');
    }

  } catch (error) {
    console.error('Error liking comment:', error);
    message.error('点赞失败，请稍后重试');
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  // 使用 a-modal 弹窗确认
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确认要删除吗？',
      okText: '删除',
      cancelText: '取消',
      maskClosable: true,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });

  if (!confirmed) return;

  try {
    // 调用 API 删除评论
    await deleteVideoComment(commentId);
    // 让评论数减1
    videoStore.videos[videoStore.videoIndex].commentCount--;

    // 递归删除评论或子回复
    const deleteCommentRecursively = (comments, commentId) => {
      return comments.filter(comment => {
        if (comment.id === commentId) {
          return false; // 删除匹配的评论
        }
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = deleteCommentRecursively(comment.replies, commentId); // 递归删除子回复
        }
        return true; // 保留不匹配的评论
      });
    };

    // 更新本地评论数据，过滤掉被删除的评论或子回复
    comments.value = deleteCommentRecursively(comments.value, commentId);
    message.success('删除成功！');
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

// 控制表情选择器显示状态
const showEmojiPicker = ref(false);

// 切换表情选择器显示状态
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// 选择表情后的回调函数
const onEmojiSelect = (emoji) => {
  newComment.value += emoji.i; // 将选中的表情添加到评论内容中
  showEmojiPicker.value = false; // 选择表情后关闭选择器
};

// 头像悬停事件
const isTooltipVisible = ref(false);
const showTooltip = () => {
  isTooltipVisible.value = true;
};
const hideTooltip = () => {
  isTooltipVisible.value = false;
};

</script>

<style scoped lang="less">
::v-deep .ant-comment-avatar {
  width: 32px !important;
  height: 32px !important;
}

::v-deep .ant-comment-inner {
  padding: 10px;
}

.VideoDetails {
  display: flex;
  flex-wrap: wrap; /* 让子元素换行，防止超出父容器 */
  height: 100%; /* 父容器的高度占 95% */

  .videoArea,
  .functionButtons,
  .changeButtons,
  .commentsArea {
    height: 100%; /* 每个子元素的高度占满父容器 */
  }

  .videoArea {
    flex: 0 0 60%; /* 固定占50% */
    background-color: #f0f0f0; /* 浅灰色背景 */
    box-sizing: border-box;

    video {
      width: 100%;
      height: 100%;
      background-color: black;
      object-fit: contain;
      border-radius: 15px;
    }
  }

  .functionButtons {
    display: flex;
    justify-content: center; /* 水平居中（可选） */
    align-items: center; /* 垂直居中 */
    flex: 0 0 5%;
    //background-color: #eff7be;
    padding: 10px;
    box-sizing: border-box;
  }

  .changeButtons {
    display: flex;
    justify-content: center; /* 水平居中（可选） */
    align-items: center; /* 垂直居中 */
    flex: 0 0 5%; /* 每个占 10% */
    //background-color: #d9f7be; /* 浅绿色背景 */
    padding: 10px;
    box-sizing: border-box;
  }

  .commentsArea {
    flex: 0 0 28%;
    //background-color: #e6f7ff;
    padding: 10px;
    box-sizing: border-box;

    .commentInput {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;

      .inputArea {
        flex: 1;
      }

      .ant-btn {
        margin-left: 10px;
        height: 56px; /* 设置按钮高度与输入框一致 */
        margin-top: 0;
      }
    }

    .commentList {
      max-height: 60vh;
      overflow-y: auto;

      .commentItem {
        margin-bottom: 20px;
        padding: 10px;
        background-color: #fff;
        border-radius: 5px;

        .commentHeader {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;

          .username {
            font-weight: bold;
          }

          .timestamp {
            color: #999;
          }
        }

        .commentContent {
          p {
            margin: 0;
            white-space: pre-wrap;
            max-height: v-bind('expandedComments[index] ? "none" : "3.6em"');
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: v-bind('expandedComments[index] ? "unset" : 2');
            -webkit-box-orient: vertical;
          }

          a {
            color: #1890ff;
            cursor: pointer;
          }
        }

        .commentActions {
          margin-top: 10px;

          .ant-btn {
            padding: 0;
            margin-right: 10px;
          }
        }

        .replyInput {
          .ant-btn {
            margin-top: 0;
          }
        }

        .replyList {
          margin-top: 10px;
          padding-left: 20px;
          border-left: 2px solid #ddd;

          .replyItem {
            margin-bottom: 10px;

            .replyHeader {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;

              .username {
                font-weight: bold;
              }

              .timestamp {
                color: #999;
              }
            }

            .replyContent {
              p {
                margin: 0;
                white-space: pre-wrap;
              }
            }
          }
        }
      }
    }
  }
}
</style>
