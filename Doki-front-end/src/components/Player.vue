<script setup lang="ts">
import {onMounted, type Ref, ref} from 'vue'
import {HeartFilled, MessageFilled, PlusCircleFilled, StarFilled} from "@ant-design/icons-vue";
import {
  IconFullscreen,
  IconFullscreenExit,
  IconMore,
  IconMuteFill,
  IconPause,
  IconPlayArrowFill,
  IconShareInternal,
  IconSound,
  IconSoundFill,
  IconCloseCircleFill
} from '@arco-design/web-vue/es/icon';
import {
  Close,
  Dislike,
  Like,
  Message,
  ShareTwo,
  GrinningFace,
  AtSign,
  Picture,
  ArrowCircleUp,
  Search,
  More
} from '@icon-park/vue-next';

import {
  getVideoCommentsByVideoId,
  likeCommentByCommentId,
  deleteVideoComment,
  addVideoComment
} from "../api/commentService.js";
import {likeVideoByVideoId, favoriteVideoByVideoId} from "../api/videoService.ts";
import {dayUtils} from "../utils/dayUtils.ts";
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import type {Video} from '../store/videoStore.ts'
// 获取视频数据
const {video} = defineProps<{
  video: Video
}>()
// 获取视频标签HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);
// 视频评论
const comments = ref([]);
onMounted(async () => {
  if (videoRef.value) {
    // 获取视频时长
    videoRef.value.addEventListener('loadedmetadata', () => {
      durationTime.value = videoRef.value?.duration ?? 0;
      currentTime.value = videoRef.value?.currentTime ?? 0;
    });
    // 监听进度，获得更新的视频时间
    videoRef.value.addEventListener('timeupdate', () => {
      currentTime.value = videoRef.value?.currentTime ?? 0;
      progressPercent.value = (currentTime.value / durationTime.value) * 100;
    });
  }

  const videoCommentsByVideoId = await getVideoCommentsByVideoId(video.id);
  comments.value = videoCommentsByVideoId.data;
})

// 评论区抽屉控制
const open = ref(false)
const showDrawer = () => {
  open.value = !open.value;
}

// 播放暂停控制
const isPlaying = ref(false);
const onPlay = () => {
  isPlaying.value = !isPlaying.value;
  if (videoRef.value) {
    isPlaying.value ? videoRef.value.play() : videoRef.value.pause();
  }
}
// 向外暴露播放器的播放和暂停方法
defineExpose({
  play: () => {
    videoRef.value?.play();
    isPlaying.value = true;
  },
  pause: () => {
    videoRef.value?.pause();
    isPlaying.value = false;
  }
});

// 时长
const durationTime = ref(0);
const currentTime = ref(0);
// 进度条
const progressPercent = ref(0);
// 音量
const volume = ref(100);
const muteVolume = ref(0.01);
// 改变音量方法
const handleVolumeChange = () => {
  if (videoRef.value) {
    videoRef.value.muted = false;
    videoRef.value.volume = (volume.value / 100) + 0.01; // 0.01 是为了防止频繁静音卡顿
  }
}
// 切换静音方法
const toggleMute = () => {
  if (videoRef.value) {
    const temp = volume.value;
    volume.value = muteVolume.value;
    muteVolume.value = temp;
    videoRef.value.volume = volume.value / 100;
  }
};
// 切换全屏显示方法
const isFullScreen = ref(false);
const toggleFullScreen = () => {
  const element = document.querySelector('.player-container');

  if (!document.fullscreenElement) {
    // 进入全屏
    if (element) {
      element.requestFullscreen?.();
      isFullScreen.value = true;
    }
  } else {
    // 退出全屏
    document.exitFullscreen?.();
    isFullScreen.value = false;
  }
};
// 监听全屏状态
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    isFullScreen.value = false;
  }
});
// 倍速相关
const speeds = [2, 1.75, 1.5, 1, 0.75, 0.5]; // 倍速列表
const currentSpeed = ref(1); // 当前的速度
// 设置倍速
const setSpeed = (speed: number) => {
  if (!videoRef.value) return;
  currentSpeed.value = speed;
  videoRef.value.playbackRate = speed;
};
// 播放进度相关
const setVideoTime = (time: number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = time;
    currentTime.value = time;
  }
}


// 控制清屏标记
const clearScreen = ref(false);

// 拓展面板key
const activeKey = ref('2');

// 打开用户信息选项卡
const openUserPage = () => {
  // TODO 后续在这里发异步请求获取用户信息
  if (open.value && activeKey.value == '2') {
    activeKey.value = '1';
    return;
  }
  activeKey.value = '1';
  showDrawer();
}
// 打开评论选项卡
const openComments = () => {
  //TODO 后续在这里发异步请求获取评论
  if (open.value && activeKey.value == '1') {
    activeKey.value = '2';
    return;
  }
  activeKey.value = '2';
  showDrawer();
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  const paddedMins = String(mins).padStart(2, '0')
  const paddedSecs = String(secs).padStart(2, '0')

  return `${paddedMins}:${paddedSecs}`
}

// 处理上传图片逻辑
const fileInput = ref(null)
const previewUrl = ref('')
// 点击图标时触发选择文件
const triggerFileSelect = () => {
  fileInput.value?.click()
}
const handlePictureUpload = (event: Event) => {
  if (!event.target) {
    return;
  }
  const input = event.target as HTMLInputElement
  const file = input.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    }
    reader.readAsDataURL(file);
  } else {
    alert('请选择图片文件');
  }
}
// 评论输入内容
const commentContent = ref('');

// 正在回复的目标对象的dom引用，用于回复评论时高亮显示
const replyTargetDOM: Ref<HTMLElement | null> = ref(null);
// 正在回复的目标对象的评论对象
const replyTargetObject: any = ref(null);
// 是否正在激活回复状态
const isReplying = ref(false);
// 点击回复按钮时的逻辑
const handleClickComments = (event: Event, targetComment: any) => {
  // 获取点击目标，转换为HTMLElement对象
  const target = event.target as HTMLElement;
  // 如果点击的是回复按钮，进行高亮
  if (target?.classList.contains('reply-btn')) {
    // 如果现在已经是回复状态，说明用户点击了其它的回复按钮，这时需要先把之前在其它评论上添加的高亮移除
    if (isReplying.value) {
      replyTargetDOM.value?.classList.remove('comment-highlight');
      // 把replyTargetDOM和replyTargetObject置为null
      replyTargetDOM.value = null;
      replyTargetObject.value = null;
    }
    // 激活正在回复状态
    isReplying.value = true;
    // 拿到点击目标所在的评论的DOM
    const currentTarget = event.currentTarget as HTMLElement;
    // 存储这个DOM用作之后的操作
    replyTargetDOM.value = currentTarget;
    // 存储目标评论的对象，用于后续的回复逻辑使用
    replyTargetObject.value = targetComment;
    // 设置高亮
    currentTarget.classList.add('comment-highlight');
    // 覆盖.ant-comment类的默认样式
    const comment: HTMLElement = currentTarget.querySelector('.ant-comment') as HTMLElement;
    if (comment) {
      comment.style.backgroundColor = 'transparent';
    }
  } else {
    // 用户点击的不是回复按钮，移除高亮
    removeHighlight();
    return;
  }
}
// 移除高亮方法
const removeHighlight = () => {
  replyTargetDOM.value?.classList.remove('comment-highlight');
  // 把replyTargetDOM和replyTargetObject置为null
  replyTargetDOM.value = null;
  replyTargetObject.value = null;
  // 还原正在回复状态
  isReplying.value = false;
}

// 视频交互按钮方法
// 给视频点赞
const likeVideo = async (videoId: number) => {
  const res = await likeVideoByVideoId(videoId);
  if (res.code === 200) {
    // 修改本地状态
    video.liked = !video.liked;
    video.liked ? video.likeCount++ : video.likeCount--;
  }
}
// 给视频收藏
const favoriteVideo = async (videoId: number) => {
  const res = await favoriteVideoByVideoId(videoId);
  if (res.code === 200) {
    // 修改本地状态
    video.favorited = !video.favorited;
    video.favorited ? video.favoriteCount++ : video.favoriteCount--;
  }
}

// 评论区交互方法
// 提交评论
const submitComment = async (videoId: number, comment: string, parentCommentId: number | null) => {
  const res = await addVideoComment(videoId, comment, parentCommentId);
  if (res.code === 200) {
    // 添加成功，更新本地状态
    video.commentCount++;
    // 构建一个评论对象，插入到本地评论数组
    const commentobj = {
      id: 0,
      videoId: video.id,
      userId: localStorage.getItem('id'),
      username: localStorage.getItem('username'),
      avatarUrl: localStorage.getItem('avatar'),
      content: comment,
      createdAt: new Date(),
      likeCount: 0,
      replyCount: 0,
      liked: false,
      replies: [],
    };
    if (parentCommentId) {
      // 如果是回复，则找到对应的父级评论对象，并插入回复对象
      const parentComment = comments.value.find(comment => comment.id === parentCommentId);
      if (parentComment) {
        parentComment.replies.unshift(commentobj);
        commentContent.value = '';
        return;
      }
    }
    comments.value.unshift(commentobj);
  }
  // 清空输入框
  commentContent.value = '';
}
// 给评论点赞
const likeComment = async (commentId: number) => {
  const res = await likeCommentByCommentId(commentId);
  if (res.code === 200) {
    // 获取评论对象
    const comment = comments.value.find(comment => comment.id === commentId);
    if (comment) {
      // 评论对象存在，修改本地状态
      comment.liked = !comment.liked;
      comment.liked ? comment.likeCount++ : comment.likeCount--;
    }
  }
}
</script>


<template>
  <div class="player-container" tabindex="-1"
       @keyup.space.stop="onPlay"
       @keyup.x.stop="openComments"
       @keyup.f.stop="openUserPage"
  >
    <!-- 视频区域绑定动态 class 控制宽度 -->
    <div :class="['player-video', { shrink: open }]" @click="onPlay">
      <div class="video-wrapper">
        <video :src="video.videoUrl" ref="videoRef" loop preload="auto"></video>
        <!-- 交互按钮 -->
        <div class="interaction-buttons" @click.stop>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                进入作者首页
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  F
                </div>
              </div>
            </template>
            <div class="user-avatar">
              <div class="follow-button">
                <PlusCircleFilled/>
              </div>
              <a-avatar
                  :src="video.avatarUrl"
                  size="large"
                  class="bounce-on-click"
              >
              </a-avatar>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                点赞
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  Z
                </div>
              </div>
            </template>
            <div class="like bounce-on-click" @click="likeVideo(video.id)">
              <heart-filled v-if="video.liked" style="color: red"/>
              <heart-filled v-else/>
              <div style="font-size: 20px;padding-top: 5px">{{ video.likeCount }}</div>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                评论
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  X
                </div>
              </div>
            </template>
            <div class="comment bounce-on-click" @click="showDrawer">
              <message-filled/>
              <div style="font-size: 20px;padding-top: 5px">{{ video.commentCount }}</div>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                收藏
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 30%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  X
                </div>
              </div>
            </template>
            <div class="star bounce-on-click" @click="favoriteVideo(video.id)">
              <star-filled v-if="video.favorited" style="color: goldenrod"/>
              <star-filled v-else/>
              <div style="font-size: 20px;padding-top: 5px">{{ video.favoriteCount }}</div>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                进入作者首页
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  F
                </div>
              </div>
            </template>
            <div class="share bounce-on-click">
              <icon-share-internal/>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" color="grey">
            <template #title>
              <div style="display: flex;line-height: 1.2em;padding: 8px">
                进入作者首页
                <div
                    style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
                  F
                </div>
              </div>
            </template>
            <div class="more bounce-on-click">
              <icon-more/>
            </div>
          </a-tooltip>
        </div>
      </div>
      <!-- 视频主信息 -->
      <div v-if="!clearScreen" class="video-info">
        <div style="display: flex">
          <div class="user-name">{{ '@' + video.userName }}</div>
          <div class="upload-time">{{ dayUtils.formatDate(video.createdAt) }}</div>
        </div>
        <div style="display: flex;flex-wrap: wrap;width: 100%">
          <div class="video-title">{{ video.title }}</div>
          <div class="video-tags" @click.stop>#若干标签...</div>
        </div>
      </div>
      <!--  遮罩层    -->
      <div v-if="!clearScreen" class="cover"></div>
      <!--  控件  -->
      <div class="player-controls" :class="['player-controls', { shrink: open }]" @click.stop>
        <!--  进度条  -->
        <div class="player-progress" @click.stop>
          <a-slider
              :max="videoRef?.duration"
              :step="0.1"
              :trackStyle="{ backgroundColor: '#fff' }"
              :handleStyle="{ backgroundColor: '#fff' }"
              :dotStyle="{ backgroundColor: '#fff' }"
              :activeDotStyle="{ backgroundColor: '#fff' }"
              :tooltipOpen="false"
              @afterChange="setVideoTime"
              v-model:value="currentTime"
          ></a-slider>
          <div class="handle"></div>
        </div>
        <!-- 播放按钮&播放时间 -->
        <div class="play-and-time-danmaku" style="display: flex">
          <!-- 播放按钮 -->
          <div class="play-button bounce-on-click" @click="onPlay">
            <icon-pause v-if="isPlaying"></icon-pause>
            <icon-play-arrow-fill v-else></icon-play-arrow-fill>
          </div>
          <div class="time">
            {{ formatTime(currentTime) }} / {{ formatTime(durationTime) }}
          </div>
        </div>

        <!-- 其它功能 -->
        <div class="player-others">

          <!-- 清屏按钮 -->
          <div class="clear-screen-button" style="user-select: none">
            <div>清屏</div>
            <a-switch size="small" v-model:checked="clearScreen"/>
          </div>
          <!-- 倍速控制按钮 -->
          <div class="speed-control bounce-on-click" style="font-size: 15px"
          >
            <a-popover
                :arrow=false
                :overlayInnerStyle="{backgroundColor:'grey'}"
                style="user-select: none"
            >
              <template #content>
                <div
                    style="color: white;height: 250px;width: 50px;display: flex;flex-direction: column;justify-content: space-between;user-select: none">
                  <div v-for="(item) in speeds" class="player-speed-control-item" @click="setSpeed(item)">
                    {{ item }}
                  </div>
                </div>
              </template>
              <div style="user-select: none"> {{ currentSpeed == 1 ? '倍速' : currentSpeed + 'x' }}</div>
            </a-popover>
          </div>
          <!-- 音量控制按钮 -->
          <div class="volume-control" style="user-select: none" @click="toggleMute">
            <a-popover
                :arrow=false
                :overlayInnerStyle="{backgroundColor:'grey'}"
            >
              <template #content>
                <div style="display: flex;flex-direction: column;height: 120px;">
                  <a-slider v-model:value="volume" vertical="true" :min="0" :max="100"
                            @change="handleVolumeChange"
                  ></a-slider>
                </div>
              </template>
              <div v-if="volume==100" class="volume-full bounce-on-click">
                <icon-sound-fill></icon-sound-fill>
              </div>
              <div v-else-if="volume>=1" class="volume-half bounce-on-click">
                <icon-sound></icon-sound>
              </div>
              <div v-else class="volume-none bounce-on-click">
                <icon-mute-fill></icon-mute-fill>
              </div>
            </a-popover>
          </div>
          <!-- 全屏按钮 -->
          <div class="fullScreen-control" @click="toggleFullScreen">
            <icon-fullscreen-exit v-if="isFullScreen"></icon-fullscreen-exit>
            <icon-fullscreen v-else></icon-fullscreen>
          </div>
        </div>
      </div>
    </div>
    <div class="other-draw" :class="['other-draw',{ shrink: open }]" @wheel.stop>
      <a-tabs v-model:activeKey="activeKey" size="large">
        <a-tab-pane key="1" tab="TA的作品">Content of Tab Pane 1</a-tab-pane>
        <a-tab-pane key="2" :tab='`评论 (${video.commentCount})`' force-render>
          <div class="comments" style="height: 100%; display: flex;flex-direction: column">
            <div style="flex: 1;overflow-y: auto">
              <a-list
                  class="comment-list"
                  item-layout="horizontal"
                  :data-source="comments"
                  :locale="{ emptyText: '暂无评论' }"
              >
                <template #renderItem="{ item }">
                  <a-list-item class="comment-content" @click="handleClickComments($event,item)" :key="item.id">
                    <a-comment :author="item.username" :avatar="item.avatarUrl">
                      <template #actions>
                      </template>
                      <template #content>
                        <div style="width: 100%">
                          <p>{{ item.content }}</p>
                          <p style="color:#bbbfc6;margin-bottom: 5px">{{ dayUtils.formatDate(item.createdAt) }}</p>
                          <p style="display: flex;gap: 10px;line-height: 1;text-align: center">
                            <span style="cursor: pointer;user-select: none;" class="bounce-on-click reply-btn"><message
                                style="margin-right: 3px"></message>回复</span>
                            <a-popover trigger="click"
                                       :arrow=false
                                       :overlayInnerStyle="{backgroundColor:'#252632'}"
                                       style="user-select: none"
                                       :destroyTooltipOnHide="true"
                            >
                              <template #content>
                                <div style="color: white">
                                  <div
                                      style="display: flex;text-align: center;background-color: grey;padding: 5px;border-radius: 10px">
                                    <div
                                        style="display: flex;flex-direction: column; justify-content: center;padding: 2px">
                                      <Search></Search>
                                    </div>
                                    <a-input
                                        style="outline: none;border: none;background-color: transparent;color: white"
                                        placeholder="搜索"></a-input>
                                  </div>
                                  <div style="margin-top: 10px;padding-bottom: 10px; color: grey">分享给朋友</div>
                                  <div class="share-targets">
                                    <div style="display: flex;gap: 10px;padding-bottom: 10px" v-for="item in 3">
                                      <a-avatar src="https://joeschmoe.io/api/v1/random"></a-avatar>
                                      <div style="height: 32px;line-height: 32px;flex: 1">昵称1</div>
                                      <div style="height: 32px;line-height: 32px">分享</div>
                                    </div>
                                  </div>
                                </div>
                              </template>
                              <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><share-two
                                  style="margin-right: 3px"></share-two>分享</span>
                            </a-popover>
                            <span style="cursor: pointer;user-select: none;" class="bounce-on-click">
                              <like v-if="item.liked" theme="filled" fill="#ff0000"></like>
                              <like v-else/>
                          {{ item.likeCount ? item.likeCount : '' }}
                        </span>
                            <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><dislike></dislike></span>
                          </p>
                        </div>
                        <div class="report-delete-btn">
                          <!-- 举报/删除评论按钮 -->
                          <a-popover>
                            <template #content>举报/删除</template>
                            <More></More>
                          </a-popover>
                        </div>
                      </template>
                      <a-list
                          class="comment-list"
                          item-layout="horizontal"
                          :data-source="item.replies"
                          v-if="item.replies.length > 0"
                      >
                        <template #renderItem="{ item }">
                          <a-list-item @click.stop="handleClickComments($event,item)" class="comment-content"
                                       :key="item.id">
                            <a-comment :author="item.username" :avatar="item.avatarUrl">
                              <template #actions>
                              </template>
                              <template #content>
                                <div style="width: 100%">
                                  <p>{{ item.content }}</p>
                                  <p style="color:#bbbfc6;margin-bottom: 5px">{{
                                      dayUtils.formatDate(item.createdAt)
                                    }}</p>
                                  <p style="display: flex;gap: 10px;line-height: 1;text-align: center">
                            <span style="cursor: pointer;user-select: none;" class="bounce-on-click reply-btn"><message
                                style="margin-right: 3px"></message>回复</span>
                                    <a-popover trigger="click"
                                               :arrow=false
                                               :overlayInnerStyle="{backgroundColor:'#252632'}"
                                               style="user-select: none"
                                               :destroyTooltipOnHide="true"
                                    >
                                      <template #content>
                                        <div style="color: white">
                                          <div
                                              style="display: flex;text-align: center;background-color: grey;padding: 5px;border-radius: 10px">
                                            <div
                                                style="display: flex;flex-direction: column; justify-content: center;padding: 2px">
                                              <Search></Search>
                                            </div>
                                            <a-input
                                                style="outline: none;border: none;background-color: transparent;color: white"
                                                placeholder="搜索"></a-input>
                                          </div>
                                          <div style="margin-top: 10px;padding-bottom: 10px; color: grey">分享给朋友
                                          </div>
                                          <div class="share-targets">
                                            <div style="display: flex;gap: 10px;padding-bottom: 10px" v-for="item in 3">
                                              <a-avatar src="https://joeschmoe.io/api/v1/random"></a-avatar>
                                              <div style="height: 32px;line-height: 32px;flex: 1">昵称1</div>
                                              <div style="height: 32px;line-height: 32px">分享</div>
                                            </div>
                                          </div>
                                        </div>
                                      </template>
                                      <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><share-two
                                          style="margin-right: 3px"></share-two>分享</span>
                                    </a-popover>
                                    <span style="cursor: pointer;user-select: none;" class="bounce-on-click">
                                        <like v-if="item.liked" theme="filled" fill="#ff0000"/>
                                        <like v-else></like>
                                      {{ item.likeCount ? item.likeCount : '' }}
                                     </span>
                                    <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><dislike></dislike></span>
                                  </p>
                                </div>
                                <div class="report-delete-btn">
                                  <!-- 举报/删除评论按钮 -->
                                  <a-popover>
                                    <template #content>举报/删除</template>
                                    <More></More>
                                  </a-popover>
                                </div>
                              </template>
                            </a-comment>
                          </a-list-item>
                        </template>
                      </a-list>
                    </a-comment>
                  </a-list-item>
                </template>
              </a-list>
            </div>
            <div class="comment-input" style="max-height: 50%;display: flex;flex-direction: column">
              <div class="reply-target" v-if="replyTargetObject">
                <div class="reply-target-content">
                  {{ '回复@' + replyTargetObject.username + ': ' + replyTargetObject.content }}
                </div>
                <icon-close-circle-fill class="delete-btn" @click="removeHighlight"></icon-close-circle-fill>
              </div>
              <div style="flex: 1">
                <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }"
                            @keyup.stop
                            style="background-color: transparent;color: white;border: none"
                            placeholder="留下你的评论吧~"
                            v-model:value="commentContent"
                ></a-textarea>
              </div>
              <div class="functions">
                <!-- 提交评论需要判断是不是回复，如果是回复，还要判断回复目标是不是二级回复 -->
                <div class="send-button"
                     @click="submitComment(video.id,commentContent,(replyTargetObject?.id ? (replyTargetObject.parentCommentId ? replyTargetObject.parentCommentId : replyTargetObject.id) : null))"
                     v-if="commentContent || previewUrl">
                  <arrow-circle-up></arrow-circle-up>
                </div>
                <div class="emoji-picker">
                  <a-popover trigger="click">
                    <template #content>
                      <EmojiPicker
                          :hide-search="true"
                          :hide-group-names="true"
                          :disable-skin-tones="true"
                          :picker-type="'emoji'"
                          :theme="'auto'"
                          @select="onEmojiSelect"
                      ></EmojiPicker>
                    </template>
                    <GrinningFace></GrinningFace>
                  </a-popover>
                </div>
                <AtSign></AtSign>
                <div @click="triggerFileSelect">
                  <Picture></Picture>
                  <input
                      type="file"
                      ref="fileInput"
                      accept="image/*"
                      @change="handlePictureUpload"
                      style="display: none"
                  />
                </div>
                <!-- 发送图片预览区域 -->
                <div class="upload-picture" v-if="previewUrl!=''">
                  <a-image
                      :src=previewUrl
                      :height="80"
                      :width="80"
                      :preview-mask="false"
                      style="object-fit: cover;border-radius: 10px;"
                  ></a-image>
                  <div class="delete-btn" @click="previewUrl=''">
                    <icon-close-circle-fill></icon-close-circle-fill>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="相关推荐">Content...</a-tab-pane>
      </a-tabs>
      <!-- 关闭按钮 -->
      <div class="close-button" @click="showDrawer">
        <close></close>
      </div>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.ant-list-item) {
  padding: 6px 12px;
  border-block-end: 0;

  p {
    text-align: left !important;
    color: white;
  }

  span {
    color: white;
  }
}

::v-deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: white; /*按钮文字*/
}

::v-deep(.ant-tabs-tab-btn:hover) {
  color: white;
}

::v-deep(.ant-tabs-tab) {
  color: #403d3d; /*按钮文字*/
}

::v-deep(.ant-tabs) {
  height: 100%;

  .ant-tabs-content-holder {
    flex: 1;
  }

  .ant-tabs-content-top {
    height: 100%;
  }
}

::v-deep(.ant-tabs-ink-bar) {
  background-color: red; /*按钮背景*/
}

::v-deep(.ant-tabs-nav-wrap) {
  padding-left: 10px;
}

::v-deep(.ant-comment-inner) {
  padding: 0;
}

::v-deep(.ant-switch-checked) {
  background-color: #ff0000;
}

::v-deep(.ant-input:focus) {
  box-shadow: 0 0 0 0;

}

::v-deep(.ant-input::placeholder) {
  color: grey;
  font-style: italic;
}

.player-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 15px;
  z-index: 0;
  display: flex;
  align-items: center;
  overflow: hidden;

  .player-video {
    width: 100%;
    height: 100%;
    transition: width 0.32s ease;
    display: flex;
    flex-direction: column;

    .video-wrapper {
      height: calc(100% - 40px);
      position: relative;

      .interaction-buttons {
        user-select: none;
        display: flex;
        flex-direction: column; /* 垂直排列 */
        gap: 20px;
        line-height: 1;
        font-size: 25px;
        color: white;
        position: absolute;
        z-index: 100;
        bottom: 10%;
        right: 3%;
        text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);


        .user-avatar {
          position: relative;

          .follow-button {
            cursor: pointer;
            color: rgba(254, 44, 85);
            font-size: 20px;
            position: absolute;
            bottom: -8px;
            right: 10px;
            z-index: 1;
          }
        }
      }

      video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .player-controls {
      position: absolute;
      text-align: center;
      bottom: 0;
      left: 0;
      display: flex;
      color: white;
      background-color: rgba(0, 0, 0, 1);
      transition: width 0.32s ease;
      height: 40px;
      width: 100%;

      .player-progress {
        line-height: 1;
        position: absolute;
        width: 100%;
        left: 0;

        bottom: 20px;
        z-index: 5;
      }

      .play-button {
        line-height: 1;
        display: flex;
        cursor: pointer;
        margin-left: 10px;
        margin-top: 2px;
        font-size: 30px;
      }

      .time {
        margin: 15px 20px;
        line-height: 1;
        color: white;
        font-size: 15px;
      }

      .player-others {
        flex: 1;
        display: flex;
        line-height: 1;
        gap: 20px;
        margin-right: 15px;
        justify-content: flex-end;
        align-items: center;

        .clear-screen-button {
          font-size: 1.1em;
          gap: 5px;

          div {
            display: flex;
            align-items: center;
          }

          display: flex;
        }

        svg {
          cursor: pointer;
          width: 20px;
          height: 20px;
        }
      }
    }

    .player-controls.shrink {
      width: 70%;
    }


    .video-info {
      user-select: none;
      line-height: 1.5;
      display: flex;
      flex-direction: column; /* 垂直排列 */
      position: absolute;
      left: 3%;
      bottom: 10%;
      z-index: 0;

      .user-name {
        font-size: 1.5em;
        margin-right: 1em;
      }

      .upload-time {
        margin-top: 5px;
      }

      .video-title {
        font-size: 1.2em;
        margin-right: 0.5em;
      }

      .video-tags {
        font-size: 1.2em;
        color: gold;
      }

      .video-tags:hover {
        cursor: pointer;
        color: orange;
      }
    }

    .cover {
      height: 15%;
      width: 100%;
      position: absolute;
      overflow: hidden;
      z-index: -1;
      left: 0;
      bottom: 0;
      background-image: linear-gradient(180deg, rgba(137, 137, 137, 0.00) 0%, rgba(0, 0, 0, 0.90) 100%);
    }
  }

  /* 抽屉打开时缩小视频 */

  .player-video.shrink {
    width: 70%;
    height: 100%;
  }

  /* 强制覆盖抽屉的padding */

  .player-comments {
    width: 100%;
    height: 100%;
  }

  .other-draw {
    height: 100%;
    position: absolute;
    transition: right 0.32s ease;
    z-index: 5;
    width: 30%;
    top: 0;
    right: -30%;
    background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */

    .comments {
      padding: 15px;

      .comment-input {
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;

        .reply-target {
          background-color: rgba(255, 255, 255, 0.1);
          display: flex;
          text-indent: 1em;
          position: relative;
          color: #bbbfc6;

          .reply-target-content {
            text-align: left;
            width: 80%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .delete-btn {
            color: grey;
            cursor: pointer;
            width: 15px;
            position: absolute;
            right: 10px;
            top: 3px;
          }

          .delete-btn:hover {
            color: white;
          }
        }

        .functions {
          user-select: none;
          display: flex;
          align-items: flex-end;
          flex-direction: row-reverse;
          gap: 10px;
          font-size: 20px;
          margin-right: 10px;

          .send-button {
            .arrow-circle-up {
              color: red;
            }
          }

          .upload-picture {
            display: flex;
            position: relative;
            padding: 10px;
            flex: 1;

            .delete-btn {
              cursor: pointer;
              width: 20px;
              height: 20px;
              position: absolute;
              left: 80px;
              top: -2px;
              color: white;
            }
          }

          span {
            cursor: pointer;
            color: rgba(255, 255, 255, 0.5);
          }

          span:hover {
            color: white;
          }
        }
      }

      .comment-input:hover {
        border: 2px solid rgba(255, 255, 255, 0.2);
      }

      .report-delete-btn {
        cursor: pointer;
        position: absolute;
        pointer-events: none;
        right: 10px;
        top: 0;
        opacity: 0;
      }

      .comment-content:hover .report-delete-btn {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .close-button {
      cursor: pointer;
      height: 25px;
      position: absolute;
      color: #ffffff;
      font-size: 25px;
      top: -25px;
      right: 30px;
    }
  }

  .other-draw.shrink {
    right: 0;
  }

}

.player-container::before {
  content: "";
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  background-image: url('http://localhost:8081/avatars/202300803-ProjectSEKAI-HatsuneMiku.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(80px); /* 高斯模糊 */
  z-index: -1;
}

.bounce-on-click {
  transition: transform 0.15s ease;
  cursor: pointer;
}

.bounce-on-click:hover {
  transform: scale(1.05);
}

.bounce-on-click:active {
  transform: scale(0.9);
}

.comment-highlight {
  /* 评论高亮样式 */
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0)) !important;
}
</style>

