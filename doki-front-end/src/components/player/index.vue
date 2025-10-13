<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {Close, Like} from '@icon-park/vue-next';
import {likeVideoByVideoId, favoriteVideoByVideoId} from "../../api/videoService.ts";
import {getUserInfo} from "../../api/userService.ts";
import type {Video} from '../../store/videoStore.ts'
import type {VideoInfo} from '../../api/feedService.ts'
import {useUserStore} from "../../store/userInfoStore.ts";

const userStore = useUserStore();
// 子组件
import InteractionButtons from './InteractionButtons.vue'
import VideoInfoComponent from './VideoInfo.vue'
import Controls from './Controls.vue'
import CommentsPanel from './CommentsPanel.vue'
// 当前登录用户ID
const userId = ref(userStore.userInfo?.userId);
// 获取视频数据
const {video} = defineProps<{
  video: VideoInfo
}>()
// 视频流请求地址
const videoStreamPath = 'http://localhost:10010/video/play/'
// 获取播放器HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);
// TA的作品集合
const userItems = ref<Video[]>([]);
// 初始作品集合加载完毕标志
const isInitUserItemsLoaded = ref(false);
// 评论统计从子组件回传增量

// 评论区已抽取到 CommentsPanel 组件

// 播放器初始化钩子
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
});

// 滚动、分页逻辑由子组件处理

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
  const element = document.querySelector('.video-container');

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
// 处理选项卡切换时的逻辑
const handleTabChange = async (key: string) => {
  if (key === '1' && !isInitUserItemsLoaded.value) {
    // 获取用户作品
    const res = await getUserInfo(video.userName);
    userItems.value.push(...res.data.videos);
    isInitUserItemsLoaded.value = true;
  }
}

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
const openComments = async () => {

  if (open.value && activeKey.value == '1') {
    activeKey.value = '2';
    return;
  }
  activeKey.value = '2';
  showDrawer();
  // 评论加载交给子组件
}

// 评论相关逻辑已下放至 CommentsPanel 组件


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
        <video :src="videoStreamPath + video.videoFilename" ref="videoRef" loop
               preload="auto"></video>
        <!-- 交互按钮 -->
        <InteractionButtons
            :video="video"
            :onOpenComments="openComments"
            :onLike="likeVideo"
            :onFavorite="favoriteVideo"
        />
      </div>
      <!-- 视频主信息 -->
      <VideoInfoComponent v-if="!clearScreen" :video="video"/>
      <!--  遮罩层    -->
      <div v-if="!clearScreen" class="cover"></div>
      <!--  控件  -->
      <Controls
          :isPlaying="isPlaying"
          :currentTime="currentTime"
          :durationTime="durationTime"
          :clearScreen="clearScreen"
          :speeds="speeds"
          :currentSpeed="currentSpeed"
          :volume="volume"
          :isFullScreen="isFullScreen"
          :videoDuration="videoRef?.duration"
          :shrink="open"
          @togglePlay="onPlay"
          @setTime="setVideoTime"
          @toggleClear="(v:any)=>clearScreen=v"
          @setSpeed="setSpeed"
          @changeVolume="(v:any)=>{ volume=v; handleVolumeChange(); }"
          @toggleFullscreen="toggleFullScreen"
          @toggleMute="toggleMute"
      />
    </div>
    <!-- 评论区抽屉 -->
    <div class="other-draw" :class="['other-draw',{ shrink: open }]" @wheel.stop>
      <a-tabs v-model:activeKey="activeKey" size="large" @change="handleTabChange(activeKey)">
        <a-tab-pane key="1" tab="TA的作品">
          <div style="display: flex;flex-direction: column;width: 100%;height: 100%" v-if="isInitUserItemsLoaded">
            <div class="title" style="display: flex">
              <div class="user-info" style="flex: 1">
                <div class="user-name" style="font-size: 20px;display: flex;margin-left: 10%">
                  <a style="color: white">@admin</a>
                </div>
                <div class="user-like-number" style="font-size: 15px;display: flex;margin-left: 10%;color: white">
                  <span>1000粉丝 | </span>
                  <span>1000获赞</span>
                </div>
              </div>
              <div>
                <div style="margin-right: 50px">
                  <button class="followed-button" v-if="false">已关注
                  </button>
                  <button class="follow-button" v-else>关注</button>
                </div>
              </div>
            </div>
            <div class="user-videos">
              <div class="user-video-item" v-for="(item) in userItems">
                <img style="object-fit: cover;width: 100%;height: 100%"
                     :src="item.thumbnailUrl ?? 'http://localhost:8081/videos/defaultCover.jpg'"
                     alt="http://localhost:8081/videos/defaultCover.jpg">
                <div class="like-number">
                  <Like></Like>
                  <span style="margin-left: 5px">{{ item.likeCount }}</span>
                </div>
              </div>
            </div>
          </div>

        </a-tab-pane>
        <a-tab-pane key="2" :tab='`评论 (${video.commentCount})`' force-render>
          <CommentsPanel :videoId="video.id" :userId="userId"
                         @countChange="(delta:number)=> video.commentCount += delta"/>
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
  width: 100%;

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

::v-deep(.ant-comment) {
  width: 100%;
}

::v-deep(.ant-comment-inner) {
  width: 100%;
  padding: 0;
}

::v-deep(.ant-comment-content) {
  width: 100%;
}

::v-deep(.ant-comment-content:hover) {
  .report-delete-btn {
    opacity: 1 !important;
    display: block;
    z-index: 99;
    pointer-events: auto;
  }
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
  color: white;
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

        .like, .comment, .star, .share {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

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

    .followed-button,
    .follow-button {
      padding: 8px 15px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      white-space: nowrap;
    }

    .followed-button {
      background-color: #e0e0e0;
      color: #666;
      border: 1px solid #d0d0d0;
    }

    .follow-button {
      background-color: #fe2c55;
      color: #fff;
      border: 1px solid #fe2c55;
    }

    .user-videos {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      overflow-y: auto;
      margin-top: 5%;
      margin-left: 5%;
      justify-content: flex-start;
      gap: 10px;

      .user-video-item {
        overflow: hidden;
        width: 30%;
        height: 25%;
        background-color: #fff;
        border-radius: 20px;
        position: relative;

        .like-number {
          font-size: 20px;
          color: white;
          position: absolute;
          left: 20px;
          bottom: 10px;
        }
      }

      .user-video-item:hover {
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        transform: scale(1.05);
        transition: all 0.3s ease-in-out;
      }
    }

    .comments {
      padding: 15px;
      width: 100%;


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
        right: 10px;
        top: 0;
        opacity: 0;
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

