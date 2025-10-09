<script setup lang="ts">
import { nextTick, onMounted, ref, type Ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { IconCloseCircleFill } from '@arco-design/web-vue/es/icon'
import {
  getVideoCommentsByVideoId,
  likeCommentByCommentId,
  deleteVideoComment,
  addVideoComment
} from '../../api/commentService.js'
import { dayUtils } from '../../utils/dayUtils'
import EmojiPicker from 'vue3-emoji-picker'
// @ts-ignore
import 'vue3-emoji-picker/css'
import { useUserStore } from '../../store/userInfoStore'
import { GrinningFace, AtSign, Picture, ArrowCircleUp } from '@icon-park/vue-next'
import CommentItem from './CommentItem.vue'

type VideoComment = {
  id: number,
  videoId?: number,
  userId: number,
  username: string,
  avatarUrl: string,
  content: string,
  createdAt: string | Date,
  likeCount: number,
  replyCount?: number,
  liked: boolean,
  imgUrl?: string,
  parentCommentId?: number | null,
  replies: VideoComment[]
}

const props = defineProps<{
  videoId: number,
  userId?: number,
}>()

const emits = defineEmits<{
  (e: 'countChange', delta: number): void,
}>()

const userStore = useUserStore();

// 评论数据与加载状态
const comments = ref<VideoComment[]>([])
const isInitCommentsLoaded = ref(false)
const isCommentLoading = ref(false)

// 滚动容器与 loadMore 观察
const commentsArea = ref<HTMLElement | null>(null)
const InnerCommentsArea = ref<HTMLDivElement | null>(null)
const loadMore = ref<HTMLElement | null>(null)

onMounted(async () => {
  // 首次进入时加载首屏评论
  if (!isInitCommentsLoaded.value) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const res = await getVideoCommentsByVideoId(props.videoId, 0)
    comments.value.push(...res.data)
    isInitCommentsLoaded.value = true
  }

  // 设置 IntersectionObserver 进行分页加载
  nextTick(() => {
    const options = { root: commentsArea.value, threshold: 0, rootMargin: '100px' } as const
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      if (InnerCommentsArea.value && commentsArea.value && InnerCommentsArea.value.scrollHeight < commentsArea.value.scrollHeight) return
      if (comments.value.length === 0) return
      isCommentLoading.value = true
      await new Promise(resolve => setTimeout(resolve, 800))
      const lastId = comments.value[comments.value.length - 1].id
      const more = await getVideoCommentsByVideoId(props.videoId, lastId)
      comments.value.push(...more.data)
      isCommentLoading.value = false
    }, options)
    if (loadMore.value) observer.observe(loadMore.value)
  })
})

// 图片上传与预览
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const previewUrl = ref('')
const triggerFileSelect = () => { fileInput.value?.click() }
const handlePictureUpload = (event: Event) => {
  if (!event.target) return
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => { previewUrl.value = e.target?.result as string }
    reader.readAsDataURL(file)
  } else {
    alert('请选择图片文件')
  }
}

// 回复/高亮逻辑
const replyTargetDOM: Ref<HTMLElement | null> = ref(null)
const replyTargetObject = ref<VideoComment | null>(null)
const isReplying = ref(false)
const handleClickComments = (event: Event, targetComment: VideoComment) => {
  const target = event.target as HTMLElement
  if (target?.classList.contains('reply-btn')) {
    // 阻止事件冒泡，避免影响父级评论
    event.stopPropagation()
    
    if (isReplying.value) {
      replyTargetDOM.value?.classList.remove('comment-highlight')
      replyTargetDOM.value = null
      replyTargetObject.value = null
    }
    isReplying.value = true
    // 高亮整条评论（包括头像和用户名）
    // 从当前目标向上查找最近的 comment-item 元素
    const currentTarget = event.currentTarget as HTMLElement
    const commentItem = currentTarget.closest('.comment-item') as HTMLElement
    if (commentItem) {
      replyTargetDOM.value = commentItem
      replyTargetObject.value = targetComment
      commentItem.classList.add('comment-highlight')
    }
  } else {
    removeHighlight()
  }
}
const removeHighlight = () => {
  replyTargetDOM.value?.classList.remove('comment-highlight')
  replyTargetDOM.value = null
  replyTargetObject.value = null
  isReplying.value = false
}

// 输入与提交
const commentContent = ref('')
const onEmojiSelect = (emoji: any) => {
  const picked = (emoji && (emoji.i || emoji.native || emoji.emoji)) ?? ''
  commentContent.value += picked
}
const submitComment = async () => {
  if (commentContent.value.trim() === '' && previewUrl.value === '') return

  let parentCommentId: number | null
  if (replyTargetObject.value == null) parentCommentId = null
  else if (replyTargetObject.value.parentCommentId) parentCommentId = replyTargetObject.value.parentCommentId
  else parentCommentId = replyTargetObject.value.id

  const res = await addVideoComment(props.videoId, commentContent.value, parentCommentId, previewUrl.value ?? null)
  if (res.code === 200) {
    const me = userStore.userInfo
    const newComment: VideoComment = {
      id: res.data.id,
      videoId: props.videoId,
      userId: me?.userId as number,
      username: me?.userName as string,
      avatarUrl: me?.avatarUrl as string,
      content: commentContent.value,
      createdAt: new Date(),
      likeCount: 0,
      replyCount: 0,
      liked: false,
      replies: [],
      imgUrl: res.data.imgUrl,
      parentCommentId: parentCommentId ?? undefined
    }
    if (parentCommentId) {
      const parent = comments.value.find(c => c.id === parentCommentId)
      if (parent) {
        parent.replies.unshift(newComment)
        emits('countChange', 1)
        commentContent.value = ''
        previewUrl.value = ''
        return
      }
    }
    comments.value.unshift(newComment)
    emits('countChange', 1)
  }
  commentContent.value = ''
  previewUrl.value = ''
}

// 点赞与删除
const likeComment = async (comment: VideoComment) => {
  const res = await likeCommentByCommentId(comment.id)
  if (res.code === 200) {
    comment.liked = !comment.liked
    comment.liked ? comment.likeCount++ : comment.likeCount--
  }
}
const handleDeleteComment = async (comment: VideoComment) => {
  Modal.confirm({
    title: '确认要删除这条评论吗?',
    okText: '确认',
    cancelText: '取消',
    maskClosable: true,
    async onOk() {
      const res = await deleteVideoComment(comment.id)
      if (res.code === 200) {
        if (comment.parentCommentId) {
          const parent = comments.value.find(c => c.id === comment.parentCommentId)
          if (!parent) return
          parent.replies = parent.replies.filter(r => r.id !== comment.id)
          parent.replyCount = Math.max(0, (parent.replyCount ?? 0) - 1)
          emits('countChange', -1)
        } else {
          const target = comments.value.find(c => c.id === comment.id)
          comments.value = comments.value.filter(c => c.id !== comment.id)
          const removed = (target?.replies.length ?? 0) + 1
          emits('countChange', -removed)
        }
      }
    },
  })
}
</script>

<template>
  <div class="comments" ref="commentsArea" style="height: 100%; display: flex;flex-direction: column">
    <div style="flex: 1;overflow-y: auto" ref="InnerCommentsArea">
      <a-skeleton v-if="!isInitCommentsLoaded" avatar :paragraph="{ rows: 4 }"/>
      <a-skeleton v-if="!isInitCommentsLoaded" avatar :paragraph="{ rows: 4 }"/>
      <div class="comment-list">
        <CommentItem 
          v-for="item in comments" 
          :key="item.id" 
          :comment="item"
          :reply-target-object="replyTargetObject"
          :user-id="props.userId"
          :day-utils="dayUtils"
          @click-comments="handleClickComments"
          @like-comment="likeComment"
          @delete-comment="handleDeleteComment"
        />
      </div>
      <span v-if="comments.length==0 && isInitCommentsLoaded" style="color: white">还没有评论哦~快来发一条吧！</span>
      <div ref="loadMore" style="height: 5px"></div>
      <a-spin spinning v-if="isCommentLoading"></a-spin>
    </div>
    <div class="comment-input" style="max-height: 50%;display: flex;flex-direction: column">
      <div class="reply-target" v-if="replyTargetObject">
        <div class="reply-target-content">{{ '回复@' + (replyTargetObject.username + ': ' + replyTargetObject.content) + (replyTargetObject.imgUrl ? '[图片]' : '') }}</div>
        <icon-close-circle-fill class="delete-btn" @click="removeHighlight"></icon-close-circle-fill>
      </div>
      <div style="flex: 1">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }" @keyup.stop style="background-color: transparent;color: white;border: none;outline: none;box-shadow: none;" placeholder="留下你的评论吧~" v-model:value="commentContent" />
      </div>
      <div class="functions">
        <div class="send-button" @click="submitComment" v-if="commentContent || previewUrl"><arrow-circle-up/></div>
        <div class="emoji-picker">
          <a-popover trigger="click">
            <template #content>
              <EmojiPicker :hide-search="true" :hide-group-names="true" :disable-skin-tones="true" :picker-type="'emoji'" :theme="'auto'" @select="onEmojiSelect" />
            </template>
            <GrinningFace />
          </a-popover>
        </div>
        <AtSign />
        <div @click="triggerFileSelect">
          <Picture />
          <input type="file" ref="fileInput" accept="image/*" @change="handlePictureUpload" style="display: none" />
        </div>
        <div class="upload-picture" v-if="previewUrl!=''">
          <a-image :src="previewUrl" :height="80" :width="80" :preview-mask="false" style="object-fit: cover;border-radius: 10px;" />
          <div class="delete-btn" @click="previewUrl=''"><icon-close-circle-fill/></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comments { padding: 15px; width: 100%; }

/* 评论列表样式 */
.comment-list { width: 100%; }

/* 评论输入框样式 */
.comment-input { border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; }
.comment-input .reply-target { background-color: rgba(255, 255, 255, 0.1); display: flex; text-indent: 1em; position: relative; color: #bbbfc6; }
.comment-input .reply-target .reply-target-content { text-align: left; width: 80%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.comment-input .reply-target .delete-btn { color: grey; cursor: pointer; width: 15px; position: absolute; right: 10px; top: 3px; }
.comment-input .reply-target .delete-btn:hover { color: white; }
.comment-input .functions { user-select: none; display: flex; align-items: flex-end; flex-direction: row-reverse; gap: 10px; font-size: 20px; margin-right: 10px; }
.comment-input .functions span { cursor: pointer; color: rgba(255, 255, 255, 0.5); }
.comment-input .functions span:hover { color: white; }
.comment-input .functions .send-button .arrow-circle-up { color: red; }
.comment-input .functions > div { cursor: pointer; color: rgba(255, 255, 255, 0.5); }
.comment-input .functions > div:hover { color: white; }
.comment-input .functions .send-button { color: red; }
.comment-input .functions .upload-picture { display: flex; position: relative; padding: 10px; flex: 1; }
.comment-input .functions .upload-picture .delete-btn { cursor: pointer; width: 20px; height: 20px; position: absolute; left: 80px; top: -2px; color: white; }
.comment-input:hover { border: 2px solid rgba(255, 255, 255, 0.2); }
.report-delete-btn { cursor: pointer; position: absolute; right: 10px; top: 0; opacity: 0; }
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


