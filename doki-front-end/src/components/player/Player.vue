<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { Close, Like } from '@icon-park/vue-next';
import { watch } from 'vue';
import type { VideoInfo } from '../../api/feedService.ts';
import InteractionButtons from './InteractionButtons.vue';
import VideoInfoComponent from './VideoInfo.vue'
import Controls from './Controls.vue'
import CommentsPanel from './CommentsPanel.vue'
import analyticsService from '../../api/analyticsService.ts';
import { handleRequest } from '../../api/handleRequest.ts';
// 获取视频数据
const props = defineProps<{
  video: VideoInfo,
  index: number,
  active: number,
  mode: number // 模式 0=主页无限加载模式，1=有限列表模式，2=详情页模式
}>();
// 获取播放器HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
// 传递给控件的播放/赞停属性
const isPlaying = ref(true);
// 用来判断用户有没有实际看到这个视频。
let watched = false;

watch(() => props.active, async (newIndex) => {
  await nextTick();
  // 判断当前激活的视频是不是这个视频，如果是，改变播放状态。
  isPlaying.value = props.index === newIndex;
  if (isPlaying.value) {
    watched = true;
  }
}, {
  immediate: true
})
onMounted(() => {
  containerRef.value?.addEventListener('keydown', handleSpacedown)
})
onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('keydown', handleSpacedown);
  if (watched && videoRef.value?.currentTime! > 1) {
    // 组件卸载时上传播放记录
    handleRequest(analyticsService.updateVideoHistory, {
      params: {
        videoId: props.video.id,
        time: videoRef.value?.currentTime!
      }
    })
  }
});

const handleSpacedown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault(); // 阻止页面滚动
    if (props.index === props.active) {
      isPlaying.value = !isPlaying.value;
    }
  }
};

// 评论区抽屉控制
const open = ref(false)
const showDrawer = () => {
  if (props.mode === 2) {
    return;
  }
  open.value = !open.value;
}

// 拓展面板key
const activeKey = ref('2');
// 处理选项卡切换时的逻辑
// const handleTabChange = async (key: string) => {
//   if (key === '1' && !isInitUserItemsLoaded.value) {
//     // 获取用户作品
//     const res = await getUserInfo(video.userName);
//     userItems.value.push(...res.data.videos);
//     isInitUserItemsLoaded.value = true;
//   }
// }

// 打开用户信息选项卡
const openUserPage = () => {
  // TODO 后续在这里发异步请求获取用户信息
  if (open.value && activeKey.value == '2' && props.mode != 2) {
    activeKey.value = '1';
    return;
  }
  activeKey.value = '1';
  showDrawer();
}
// 打开评论选项卡
const openComments = async () => {

  if (open.value && activeKey.value == '1' && props.mode != 2) {
    activeKey.value = '2';
    return;
  }
  activeKey.value = '2';
  showDrawer();
}
</script>


<template>
  <div class="player-container" ref="containerRef" tabindex="-1" @keyup.x.stop="openComments"
    @keyup.f.stop="openUserPage" :style="{
      '--bg-url': `url(${video.coverName})`
    }">
    <!-- 视频区域绑定动态 class 控制宽度 -->
    <div :class="['player-video', { shrink: open }]">
      <div class="video-wrapper" @click="isPlaying = !isPlaying">
        <video :src="video.videoFilename" ref="videoRef" loop preload="auto"></video>
        <!-- 交互按钮 -->
        <InteractionButtons v-if="props.mode !== 2" @click.stop :video="video" :onOpenComments="openComments" />
      </div>
      <!-- 视频主信息 -->
      <VideoInfoComponent v-if="props.mode !== 2" :video="video" />
      <!--  遮罩层    -->
      <div class="cover"></div>
      <!--  控件，传入视频的引用  -->
      <Controls :video="videoRef!" :is-playing="isPlaying" :shrink="open" />
    </div>
    <!-- 评论区抽屉 -->
    <div v-if="props.mode !== 2" class="other-draw" :class="['other-draw', { shrink: open }]" @wheel.stop>
      <a-tabs v-model:activeKey="activeKey" size="large">
        <a-tab-pane key="1" tab="TA的作品">
          <div style="display: flex;flex-direction: column;width: 100%;height: 100%">
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
        <a-tab-pane key="2" :tab='`评论`' force-render>
          <CommentsPanel :videoinfo="props.video" :videoId="video.id" :open="open" />
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
  color: white;
  /*按钮文字*/
}

::v-deep(.ant-tabs-tab-btn:hover) {
  color: white;
}

::v-deep(.ant-tabs-tab) {
  color: #403d3d;
  /*按钮文字*/
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
  background-color: red;
  /*按钮背景*/
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

  .other-draw {
    height: 100%;
    position: absolute;
    transition: right 0.32s ease;
    z-index: 5;
    width: 30%;
    top: 0;
    right: -30%;
    background-color: rgba(0, 0, 0, 0.5);
    /* 半透明黑色 */

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

.player-container {
  position: relative;
  background: none;
  background-color: #fff;
}

.player-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--bg-color, #000);
  /* 原先的背景色 */
  background-image: var(--bg-url);
  background-size: cover;
  background-position: center;
  filter: blur(80px);
  z-index: -1;
}
</style>
