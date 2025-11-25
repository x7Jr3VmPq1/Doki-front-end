<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import { Close } from '@icon-park/vue-next';
import { watch } from 'vue';
import { useUserStore } from '../../store/userInfoStore.ts';
import InteractionButtons from './InteractionButtons.vue';
import VideoInfoComponent from './VideoInfo.vue'
import Controls from './Controls.vue'
import CommentsPanel from './CommentsPanel.vue'
import analyticsService from '../../api/analyticsService.ts';
import { handleRequest } from '../../api/handleRequest.ts';
import type { VideoVO } from '../../api/videoInfoService.ts';
import UserWorks from './UserWorks.vue';
const userStore = useUserStore();

// 获取视频数据
const props = defineProps<{
  video: VideoVO,
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
onMounted(async () => {
  await handleRequest(analyticsService.getVideoWatched, {
    onSuccess(data) {
      if (videoRef.value && data.length > 0 && data[0].time > 10)
        videoRef.value.currentTime = data[0].time;
    },
    params: { videoId: props.video.id, userId: userStore.userInfo.id }
  })

  if (props.video.watchedTime > 10 && videoRef.value) {
    videoRef.value.currentTime = props.video.watchedTime;
  }
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

const handleUserWorksClose = () => {
  isPlaying.value = true;
  showDrawer();
}

const handleUserWorksPause = () => {
  isPlaying.value = false;
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
        <InteractionButtons v-if="props.mode !== 2" @click.stop :video="video" :onOpenComments="openComments"
          @openUserPage="openUserPage" />
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
          <UserWorks :video="video" @close="handleUserWorksClose" @pause="handleUserWorksPause"></UserWorks>
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
