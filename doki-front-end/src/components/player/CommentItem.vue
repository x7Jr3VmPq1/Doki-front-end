<template>
  <div class="comment-item">
    <div class="comment-content">
      <!-- 自定义评论组件 -->
      <div class="custom-comment"
           :class="{'comment-highlight':status.isReplying}">
        <div class="comment-avatar">
          <a-avatar src="http://localhost:8081/avatars/defaultAvatar.png"/>
        </div>
        <div class="comment-body">
          <div class="comment-author">{{ commentObject.user.username }}</div>
          <div class="comment-text">
            <p>{{ commentObject.comments.content }}</p>
            <p class="comment-time">{{ dayUtils.formatTimestamp(commentObject.comments.createdAt) }}</p>
            <div class="comment-actions">
              <!-- 回复按钮 -->
              <span class="action-btn reply-btn" @click="onClickReply">
                <Message style="margin-right: 3px"></Message>
                {{ status.isReplying ? '回复中' : '回复' }}
              </span>
              <!-- 点赞按钮 -->
              <span class="action-btn" @click="onClickLike">
                <Like v-if="commentObject.liked" theme="filled" fill="#FF0000"></Like>
                <Like v-else/>
                <span v-if="commentObject.comments.likeCount>0" style="padding-left: 5px">
                {{ commentObject.comments.likeCount }}
                </span>
              </span>
              <!-- 不喜欢 -->
              <span class="action-btn"><Dislike/></span>
              <!-- 分享 -->
              <a-popover trigger="click" :arrow="false" :overlayInnerStyle="{backgroundColor:'#252632'}"
                         style="user-select: none" :destroyTooltipOnHide="true">
                <template #content>
                  <div style="color: white">
                    <div
                        style="display: flex;text-align: center;background-color: grey;padding: 5px;border-radius: 10px">
                      <div style="display: flex;flex-direction: column; justify-content: center;padding: 2px">
                        <Search/>
                      </div>
                      <a-input style="outline: none;border: none;background-color: transparent;color: white"
                               placeholder="搜索"/>
                    </div>
                    <div style="margin-top: 10px;padding-bottom: 10px; color: grey">分享给朋友</div>
                    <div class="share-targets">
                      <div style="display: flex;gap: 10px;padding-bottom: 10px" v-for="_ in 3">
                        <a-avatar src="https://joeschmoe.io/api/v1/random"/>
                        <div style="height: 32px;line-height: 32px;flex: 1">昵称1</div>
                        <div style="height: 32px;line-height: 32px">分享</div>
                      </div>
                    </div>
                  </div>
                </template>
                <span class="action-btn"><ShareTwo style="margin-right: 3px"/>分享</span>
              </a-popover>
            </div>
          </div>
          <div class="report-delete-btn">
            <a-popover :arrow="false" :overlayInnerStyle="{backgroundColor:'#252632'}" :destroyTooltipOnHide="true">
              <template #content>
                <span
                    style="color: white;cursor: pointer;user-select: none"
                    v-if="commentObject.user.id === userStore.userInfo.id"
                    @click="onClickDelete"
                >
                  删除
                </span>
                <span style="color: white" v-else>举报</span>
              </template>
              <More/>
            </a-popover>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {Message, ShareTwo, Like, Dislike, Search, More} from '@icon-park/vue-next'
import type {VideoCommentsVO} from '../../api/commentService.ts'
import {defineProps, defineEmits, ref} from 'vue';
import {dayUtils} from '../../utils/dayUtils.ts'
import {useUserStore} from '../../store/userInfoStore.ts'

const userStore = useUserStore();

// 定义组件状态类型
export interface commentStatus {
  commentObject: VideoCommentsVO,// 评论本体
  isReplying: boolean,
  rootIndex: number, // 该评论在评论数组中的索引
  replyIndex?: number // 该回复在根评论回复数组中的索引
}

// 定义评论属性对象，由父组件提供
const props = defineProps<{
  commentObject: VideoCommentsVO,
  rootIndex: number,
  replyIndex?: number
}>()

// 定义评论状态对象，返回给父组件用于控制评论状态
const status = ref<commentStatus>({
  commentObject: props.commentObject,
  rootIndex: props.rootIndex,
  replyIndex: props.replyIndex,
  isReplying: false
})
// 定义点击回复事件，传递状态对象
const emit = defineEmits<{
  (e: 'clickReply', status: commentStatus): void,
  (e: 'clickDelete', status: commentStatus): void,
  (e: 'clickLike', status: commentStatus): void,
}>();

const onClickReply = () => {
  emit('clickReply', status.value); // 把状态对象返回
}

const onClickDelete = () => {
  emit('clickDelete', status.value);
}

const onClickLike = () => {
  emit('clickLike', status.value);
}


</script>

<style scoped>
/* 自定义评论组件样式 */
.comment-item {
  margin-bottom: 5px;
}

.comment-content {
  position: relative;
}

.custom-comment {
  width: 100%;
  display: flex;
  gap: 12px;
}


.comment-avatar {
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
  width: 100%;
}

.comment-author {
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
  font-size: 14px;
}

.comment-text {
  width: 100%;
}

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

.action-btn:hover {
  color: white;
}

.reply-btn:active {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

.report-delete-btn {
  color: white;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 0;
  opacity: 0;
}

.comment-content:hover .report-delete-btn {
  opacity: 1;
}

.comment-highlight {
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 8px;
  box-sizing: border-box;
  width: calc(100% - 16px);
  max-width: 100%;
}

.comment-highlight .reply-btn {
  background-color: transparent !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

</style>
