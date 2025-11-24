<script setup lang="ts">

// 这个播放器和常规的播放器不同
// 在点击"TA的作品"或"相关推荐"视频时，会激活这个播放器
// 在这个播放器下，切换视频会从有限的列表中切换，原地切换视频。
// 没有滑动效果，从左上角点击BACK可以返回到激活它的位置。

import { nextTick, onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { Left } from '@icon-park/vue-next';
import { watch } from 'vue';
import InteractionButtons from './InteractionButtons.vue';
import VideoInfoComponent from './VideoInfo.vue'
import Controls from './Controls.vue'
import CommentsPanel from './CommentsPanel.vue'
import analyticsService from '../../api/analyticsService.ts';
import { handleRequest } from '../../api/handleRequest.ts';
import type { VideoVO } from '../../api/videoInfoService.ts';
import UserWorks from './UserWorks.vue';

const emit = defineEmits(['close'])

// 获取视频数据
const props = defineProps<{
  videos: VideoVO[],
  mode: number
}>();

const video = props.videos[0];

// 获取播放器HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
// 传递给控件的播放/赞停属性
const isPlaying = ref(true);
// 用来判断用户有没有实际看到这个视频。


const handleSpacedown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault(); // 阻止页面滚动

    isPlaying.value = !isPlaying.value;

  }
};

// 评论区抽屉控制
const open = ref(false)
const showDrawer = () => {
  open.value = !open.value;
}

onMounted(() => {
  nextTick();
  setTimeout(() => {
    openUserPage();
  }, 100)
})

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
const openComments = async () => {

  if (open.value && activeKey.value == '1') {
    activeKey.value = '2';
    return;
  }
  activeKey.value = '2';
  showDrawer();
}

const handleClose = () => {
  emit('close');
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

        <div class="close-button flex-center" v-if="props.mode == 2" @click="handleClose">
          <Left size="40"></Left>
        </div>

        <video :src="video.videoFilename" ref="videoRef" loop preload="auto"></video>
        <!-- 交互按钮 -->
        <InteractionButtons @click.stop :video="video" :onOpenComments="openComments" @openUserPage="openUserPage" />
      </div>
      <!-- 视频主信息 -->
      <VideoInfoComponent :video="video" />
      <!--  遮罩层    -->
      <div class="cover"></div>
      <!--  控件，传入视频的引用  -->
      <Controls :video="videoRef!" :is-playing="isPlaying" :shrink="open" />
    </div>
    <!-- 评论区抽屉 -->
    <div class="other-draw" :class="['other-draw', { shrink: open }]" @wheel.stop>
      <a-tabs v-model:activeKey="activeKey" size="large">
        <a-tab-pane key="1" tab="TA的作品">
          <UserWorks :video="video"></UserWorks>
        </a-tab-pane>
        <a-tab-pane key="2" :tab='`评论`' force-render>
          <CommentsPanel :videoinfo="video" :videoId="video.id" :open="open" />
        </a-tab-pane>
        <a-tab-pane key="3" tab="相关推荐">Content...</a-tab-pane>
      </a-tabs>
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


.close-button {
  opacity: 0;
  z-index: 100;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(0, 0, 0, 0.2);
  font-size: 30px;
  position: absolute;
  top: 3%;
  left: 3%;
}

.player-container:hover .close-button {
  opacity: 1;
}

.close-button:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.4);
}
</style>
