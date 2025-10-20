<script setup lang="ts">
import {GrinningFace, AtSign, Picture, ArrowCircleUp, Delete} from '@icon-park/vue-next'
import {ref, type Ref, defineProps, defineEmits} from 'vue';
import type {VideoCommentsVO} from '../../api/commentService.ts'


const props = defineProps<{
  replyTargetObject: VideoCommentsVO | undefined
}>();

const emit = defineEmits<{
  (event: 'deleteReply', replyTargetObject: VideoCommentsVO | undefined): void
}>()

// 删除回复目标事件
const onClickDeleteReply = () => {
  emit('deleteReply', props.replyTargetObject)
}

// 图片上传与预览
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const previewUrl = ref('')
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
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    alert('请选择图片文件')
  }
};
</script>

<template>
  <div class="comment-input" style="max-height: 50%;display: flex;flex-direction: column">
    <div class="reply-target" v-if="replyTargetObject">
      <div class="reply-target-content">{{
          '回复@' + (replyTargetObject.user.username + ': ' + replyTargetObject.comments.content) + (replyTargetObject.comments.imgUrl ? '[图片]' : '')
        }}
      </div>
      <Delete class="delete-btn" @click="onClickDeleteReply"></Delete>
    </div>
    <div style="flex: 1">
      <!-- 评论输入框 -->
      <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }" @keyup.stop
                  style="background-color: transparent;color: white;border: none;outline: none;box-shadow: none;"
                  placeholder="留下你的评论吧~"/>
    </div>
    <div class="functions">
      <!-- 提交评论按钮 -->
      <div class="send-button">
        <arrow-circle-up/>
      </div>
      <div class="emoji-picker">
        <a-popover trigger="click">
          <template #content>
          </template>
          <GrinningFace/>
        </a-popover>
      </div>
      <AtSign/>
      <div @click="triggerFileSelect">
        <Picture/>
        <input type="file" ref="fileInput" accept="image/*" @change="handlePictureUpload" style="display: none"/>
      </div>
      <div class="upload-picture" v-if="previewUrl!=''">
        <a-image :src="previewUrl" :height="80" :width="80" :preview-mask="false"
                 style="object-fit: cover;border-radius: 10px;"/>
        <div class="delete-btn" @click="previewUrl=''">
          <!--          <icon-close-circle-fill/>-->
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
  flex: 1;
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
</style>
