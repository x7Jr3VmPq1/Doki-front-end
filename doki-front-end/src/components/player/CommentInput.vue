<script setup lang="ts">
import {GrinningFace, AtSign, Picture, ArrowCircleUp, Delete, CloseOne} from '@icon-park/vue-next'
import {ref, type Ref, defineProps, defineEmits, reactive, watch} from 'vue';
import {handleRequest} from "../../api/handleRequest.ts";
import commentService from "../../api/commentService.ts";
import type {commentStatus} from './CommentItem.vue'
import type {VideoCommentDTO, VideoComments, User} from '../../api/commentService.ts'

const props = defineProps<{
  status: commentStatus | null, // 父组件传递的被点击回复按钮评论的对象引用
  videoId: number
}>();

const emit = defineEmits<{
  (event: 'deleteReply'): void,
  (event: 'addComment', comments: {
    newComment: VideoComments,
    userInfo: User | null
  }): void
}>()

// 评论收集表单
const commentForm = reactive<VideoCommentDTO>({
  videoId: props.videoId,
  content: '',
  image: ''
});

// 字符限制
const MAX_CHARS = 200;
const isOverLimit = ref(false);

// 删除回复目标事件
const onClickDeleteReply = () => {
  // 删除表单中可能存在的父评论和回复目标评论id
  delete commentForm.parentCommentId;
  delete commentForm.replyTargetId;
  emit('deleteReply')
}

// 图片上传与预览
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const triggerFileSelect = () => {
  fileInput.value?.click()
}
const handlePictureUpload = (event: Event) => {
  if (!event.target) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      commentForm.image = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    alert('请选择图片文件')
  }
};

// 获取目标评论对象和用户信息
let targetComment: any;
let userInfo: User | null;
watch(() => props.status, () => {
  targetComment = props.status?.commentObject.comments;
  userInfo = props.status?.commentObject.user ?? null;
})

// 处理提交评论
const handleClickSend = async () => {
  // 检查字符限制
  if (commentForm.content.length > MAX_CHARS) {
    isOverLimit.value = true;
    return;
  }
  
  // 如果存在回复目标，添加根评论ID和目标评论ID
  if (targetComment) {
    // 从status中获取回复目标评论对象
    commentForm.parentCommentId = targetComment.isRoot ?
        targetComment.id : targetComment.parentCommentId
    commentForm.replyTargetId = targetComment.id;
  }
  // 发送请求
  await handleRequest(commentService.addComment, {
    onSuccess(data) {
      // 把添加的评论发回父组件
      emit('addComment', {newComment: data, userInfo: userInfo})
    },
    params: commentForm
  })
  // 清空表单
  commentForm.content = '';
  commentForm.image = '';
  delete commentForm.parentCommentId;
  delete commentForm.replyTargetId;
  isOverLimit.value = false;
}
</script>

<template>
  <div class="comment-input" style="max-height: 50%;display: flex;flex-direction: column">
    <div class="reply-target" v-if="status">
      <div class="reply-target-content">{{
          '回复@' + (userInfo?.username + ': ' + targetComment.content) + (targetComment.imgUrl ? '[图片]' : '')
        }}
      </div>
      <Delete class="delete-btn" @click="onClickDeleteReply"></Delete>
    </div>
    <div style="flex: 1">
      <!-- 评论输入框 -->
      <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }" @keyup.stop
                  v-model:value="commentForm.content"
                  :maxlength="MAX_CHARS"
                  style="background-color: transparent;color: white;border: none;outline: none;box-shadow: none;"
                  placeholder="留下你的评论吧~"/>
    </div>
    <div class="functions">
      <!-- 提交评论按钮 -->
      <div class="send-button" @click="handleClickSend" v-if="(commentForm.content || commentForm.image) && !isOverLimit">
        <arrow-circle-up/>
      </div>
      <!-- 表情选择器（暂不可用） -->
      <div class="emoji-picker">
        <a-popover trigger="click">
          <template #content>
          </template>
          <GrinningFace/>
        </a-popover>
      </div>
      <!-- @其他用户 -->
      <AtSign/>
      <!-- 上传图片按钮 -->
      <div @click="triggerFileSelect">
        <Picture/>
        <input type="file" ref="fileInput" accept="image/*" @change="handlePictureUpload" style="display: none"/>
      </div>
      <!-- 字符计数器 -->
      <div class="char-counter" :class="{ 'over-limit': isOverLimit }" v-if="commentForm.content">
        {{ commentForm.content.length }}/{{ MAX_CHARS }}
      </div>
      <div class="upload-picture" v-if="commentForm.image!=''">
        <a-image :src="commentForm.image" :height="80" :width="80" :preview-mask="false"
                 style="object-fit: cover;border-radius: 10px;"/>
        <div class="delete-btn" @click="commentForm.image=''">
          <CloseOne/>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
/* 评论输入框样式 */
.comment-input {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.comment-input .reply-target {
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  text-indent: 1em;
  position: relative;
  color: #bbbfc6;
}

.comment-input .reply-target .reply-target-content {
  text-align: left;
  width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.comment-input .reply-target .delete-btn {
  cursor: pointer;
  width: 15px;
  position: absolute;
  right: 20px;
}

.comment-input .reply-target .delete-btn:hover {
  color: white;
}

.comment-input .functions {
  user-select: none;
  display: flex;
  align-items: flex-end;
  flex-direction: row-reverse;
  gap: 10px;
  font-size: 20px;
  margin-right: 10px;
}

.comment-input .functions span {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
}

.comment-input .functions span:hover {
  color: white;
}

.comment-input .functions .send-button .arrow-circle-up {
  color: red;
}

.comment-input .functions > div {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
}

.comment-input .functions > div:hover {
  color: white;
}

.comment-input .functions .send-button {
  color: red;
}

.comment-input .functions .upload-picture {
  display: flex;
  position: relative;
  padding: 10px;
}

.upload-picture {
  flex: 1;
  cursor: default !important;
}

.comment-input .functions .upload-picture .delete-btn {
  cursor: pointer;
  width: 20px;
  height: 20px;
  position: absolute;
  left: 80px;
  top: -2px;
  color: white;
}

.comment-input:hover {
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* 字符计数器样式 */
.char-counter {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
  white-space: nowrap;
  cursor: default;
}

.char-counter.over-limit {
  color: #ff4d4f;
}
</style>
