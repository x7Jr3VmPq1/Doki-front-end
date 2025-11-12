<script lang="ts" setup>
import DokiButton from '../../components/Doki-Button.vue';
import type { VideoCommentsVO } from '../../api/commentService';
import { ref } from 'vue';
import { useUserStore } from '../../store/userInfoStore';
import { handleRequest } from '../../api/handleRequest';
import commentService from '../../api/commentService';
const emit = defineEmits<{
  (e: 'send', value: VideoCommentsVO): void
}>();

const props = defineProps<{
  targetComment?: VideoCommentsVO | null,
  videoId: number
}>();

const userStore = useUserStore();
const placeholders = [
  "良言一句三冬暖，恶语伤人六月寒~",
  "留下你的精彩评论吧！",
  "友善的交流是温暖的源泉~",
  "期待听到您的声音",
  "分享你的想法，让交流更美好~",
  "用温暖的话语，传递真诚的心意",
  "每一个评论都是珍贵的交流",
  "说出你的观点，我们一起讨论~"
]
const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]

const inputString = ref(''); // 评论框中的内容

const handleSendComment = () => {
  // 不传递空串
  if (!inputString.value.trim())
    return;

  let tid = null;
  let pid = null;
  if (props.targetComment) {
    tid = props.targetComment.comments.id;
    // 如果目标是根评论，那么父评论就是它，如果目标不是根评论，则父评论是目标评论的父评论
    pid = props.targetComment.comments.isRoot ?
      props.targetComment.comments.id :
      props.targetComment.comments.parentCommentId
  }


  handleRequest(commentService.addComment, {
    onSuccess(data) {
      emit('send', {
        comments: data,
        liked: false,
        user: {
          username: userStore.userInfo.username,
          avatarUrl: userStore.userInfo.avatarUrl,
          id: userStore.userInfo.id,
          bio: userStore.userInfo.bio,
          reply_to: null
        },
        replies: {
          list: [],
          hasMore: false,
          cursor: ''
        }
      });
    }, params: {
      videoId: props.videoId,
      content: inputString.value,
      replyTargetId: tid,
      parentCommentId: pid,
      image: null
    }
  });


  inputString.value = '';
}

</script>

<template>
  <div class="comment-input">
    <div>
      <img class="avatar" :src="userStore.userInfo.avatarUrl" alt="">
    </div>
    <div class="input-wrapper">
      <div class="reply-target" v-if="targetComment">{{ '回复@' + targetComment.user.username + ':' +
        targetComment.comments.content }}</div>
      <textarea v-model="inputString" :placeholder="targetComment ? '' : randomPlaceholder" type="text"
        style="all: unset;caret-color: black;" />
    </div>
    <div>
      <DokiButton @click="handleSendComment" :buttonType="inputString.trim() ? 'confirm' : 'cancel'">发送</DokiButton>
    </div>
  </div>
</template>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: grey;
}

.comment-input {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 80%;
}

.input-wrapper {
  flex: 1;
  line-height: 20px;
  /* 字体行高 */
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px 15px;
}

.input-wrapper>textarea {
  white-space: pre-wrap !important;
  /* 保留换行并允许自动换行 */
  word-wrap: break-word !important;
  /* 在单词过长时也换行 */
  overflow-x: hidden !important;
  /* 隐藏水平滚动条 */
  width: 100% !important;
}

.reply-target {
  color: grey;
  margin-bottom: 10px;
}
</style>