<template>
  <div class="comment-item">
    <div class="comment-content" @click.stop="handleClickComments($event, comment)">
      <!-- 自定义评论组件 -->
      <div class="custom-comment">
        <div class="comment-avatar">
          <a-avatar :src="comment.avatarUrl" />
        </div>
        <div class="comment-body">
          <div class="comment-author">{{ comment.username }}</div>
          <div class="comment-text">
            <p>{{ comment.content }}</p>
            <p v-if="comment.imgUrl">
              <a-image :src="comment.imgUrl" :height="80" :width="80" :preview-mask="false" style="object-fit: cover;border-radius: 10px;" />
            </p>
            <p class="comment-time">{{ dayUtils.formatDate(comment.createdAt) }}</p>
            <div class="comment-actions">
              <span class="action-btn reply-btn" @click.stop="handleClickComments($event, comment)">
                <Message style="margin-right: 3px"></Message>
                {{ replyTargetObject == null ? '回复' : (replyTargetObject.id == comment.id ? '回复中' : '回复') }}
              </span>
              <a-popover trigger="click" :arrow="false" :overlayInnerStyle="{backgroundColor:'#252632'}" style="user-select: none" :destroyTooltipOnHide="true">
                <template #content>
                  <div style="color: white">
                    <div style="display: flex;text-align: center;background-color: grey;padding: 5px;border-radius: 10px">
                      <div style="display: flex;flex-direction: column; justify-content: center;padding: 2px"><Search/></div>
                      <a-input style="outline: none;border: none;background-color: transparent;color: white" placeholder="搜索" />
                    </div>
                    <div style="margin-top: 10px;padding-bottom: 10px; color: grey">分享给朋友</div>
                    <div class="share-targets">
                      <div style="display: flex;gap: 10px;padding-bottom: 10px" v-for="_ in 3">
                        <a-avatar src="https://joeschmoe.io/api/v1/random" />
                        <div style="height: 32px;line-height: 32px;flex: 1">昵称1</div>
                        <div style="height: 32px;line-height: 32px">分享</div>
                      </div>
                    </div>
                  </div>
                </template>
                <span class="action-btn"><ShareTwo style="margin-right: 3px"/>分享</span>
              </a-popover>
              <span class="action-btn" @click="likeComment(comment)">
                <Like v-if="comment.liked" theme="filled" fill="#ff0000"></Like>
                <Like v-else />
                {{ comment.likeCount ? comment.likeCount : '' }}
              </span>
              <span class="action-btn"><Dislike/></span>
            </div>
          </div>
          <div class="report-delete-btn">
            <a-popover :arrow="false" :overlayInnerStyle="{backgroundColor:'#252632'}" :destroyTooltipOnHide="true">
              <template #content>
                <div style="color: white;cursor: pointer" v-if="comment.userId != userId">举报</div>
                <div style="color: white;cursor: pointer" v-else @click="handleDeleteComment(comment)">删除</div>
              </template>
              <More/>
            </a-popover>
          </div>
        </div>
      </div>
      
      <!-- 回复列表 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
        <CommentItem 
          v-for="reply in comment.replies" 
          :key="reply.id" 
          :comment="reply"
          :reply-target-object="replyTargetObject"
          :user-id="userId"
          :day-utils="dayUtils"
          @click-comments="handleClickComments"
          @like-comment="likeComment"
          @delete-comment="handleDeleteComment"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message, ShareTwo, Like, Dislike, Search, More } from '@icon-park/vue-next'

// 定义 VideoComment 类型
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
  replies: VideoComment[],
  imgUrl?: string,
  parentCommentId?: number | null
}

// 定义组件属性
const props = defineProps<{
  comment: VideoComment
  replyTargetObject: VideoComment | null
  userId: number | undefined
  dayUtils: any
}>()

// 定义事件
const emit = defineEmits<{
  clickComments: [event: Event, comment: VideoComment]
  likeComment: [comment: VideoComment]
  deleteComment: [comment: VideoComment]
}>()

// 事件处理函数
const handleClickComments = (event: Event, comment: VideoComment) => {
  emit('clickComments', event, comment)
}

const likeComment = (comment: VideoComment) => {
  emit('likeComment', comment)
}

const handleDeleteComment = (comment: VideoComment) => {
  emit('deleteComment', comment)
}
</script>

<style scoped>
/* 自定义评论组件样式 */
.comment-item { margin-bottom: 16px; }
.comment-content { position: relative; }
.custom-comment { display: flex; gap: 12px; }
.comment-avatar { flex-shrink: 0; }
.comment-body { flex: 1; width: 100%; }
.comment-author { 
  font-weight: 500; 
  color: white; 
  margin-bottom: 4px; 
  font-size: 14px;
}
.comment-text { width: 100%; }
.comment-text p { 
  margin: 0 0 8px 0; 
  color: white; 
  line-height: 1.4;
}
.comment-time { 
  color: #bbbfc6; 
  font-size: 12px; 
  margin-bottom: 8px !important;
}
.comment-actions { 
  display: flex; 
  gap: 10px; 
  line-height: 1; 
  text-align: center;
}
.action-btn { 
  cursor: pointer; 
  user-select: none; 
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  transition: color 0.2s;
}
.action-btn:hover { color: white; }
.reply-btn:active { 
  background-color: transparent !important; 
  color: rgba(255, 255, 255, 0.5) !important;
}
.replies-list { 
  margin-left: 40px; 
  margin-top: 8px; 
  padding-left: 16px;
}
.reply-item { margin-bottom: 12px; }
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
