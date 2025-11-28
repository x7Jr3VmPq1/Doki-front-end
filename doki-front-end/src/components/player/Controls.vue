<script setup lang="ts">
import Progress from './Progress.vue';
import { computed, nextTick, onMounted, reactive, watch } from 'vue';
import { IconPause, IconPlayArrowFill, IconMuteFill, IconSound, IconSoundFill, IconFullscreen, IconFullscreenExit } from '@arco-design/web-vue/es/icon';
import formatTime from '../../utils/formatTime.ts'
const props = defineProps<{
  video: HTMLVideoElement, // 视频引用
  resolutions: number[], // 可选分辨率
  isPlaying: boolean, // 外部传入的暂停/播放请求
  shrink: boolean // 当评论区打开时，缩小控件
}>()

const state = reactive({
  currentTime: 0,
  duration: 0,
  volume: 100,
  speeds: [3, 2, 1.5, 1.25, 1, 0.5],
  currentSpeed: 1,
  isPlaying: true,
  isFullScreen: false,
  bufferd: 0,
  width: 0,
  height: 0,
})
// 初始化视频状态
let videoObject: HTMLVideoElement | null = null;
onMounted(async () => {
  await nextTick(); // 等待DOM更新
  props.video.addEventListener('loadedmetadata', () => {
    state.duration = props.video.duration;
    state.width = props.video.videoWidth;
    state.height = props.video.videoHeight;
  })
  props.video.addEventListener('timeupdate', () => {
    state.currentTime = props.video.currentTime;
  })

  props.video.addEventListener('progress', () => {
    if (!videoObject) return;
    const buffered = videoObject.buffered;
    const duration = videoObject.duration;
    if (buffered.length > 0 && duration > 0) {
      // 获取最后一个缓冲区间的结束时间
      const bufferedEnd = buffered.end(buffered.length - 1);
      // 计算百分比
      state.bufferd = Math.min((bufferedEnd / duration) * 100, 100);
    }
  });
  videoObject = props.video;

  // 监听父组件传入的状态，判断是否暂停或播放
  watch(() => props.isPlaying, async (value: boolean) => {
    try {
      if (value) {
        await videoObject?.play();
        getCurrentTime();
      } else {
        videoObject?.pause();
      }
      state.isPlaying = value;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('视频播放控制错误:', err);
      }
    }
  }, {
    immediate: true
  });
})

watch(() => state.isPlaying, (newValue) => {
  if (newValue) {
    getCurrentTime();
  }
})

// 获取当前视频播放时长方法，用于驱动进度条更新。
const getCurrentTime = () => {
  if (state.isPlaying) {
    state.currentTime = videoObject?.currentTime!;
    requestAnimationFrame(getCurrentTime);
  }
}

// 播放/暂停方法
const onClickPlayButton = () => {
  state.isPlaying ? videoObject?.pause() : videoObject?.play();
  state.isPlaying = !state.isPlaying;
}

// 改变视频速度
const handleChangeSpeed = (speed: number) => {
  state.currentSpeed = speed;
  if (videoObject)
    videoObject.playbackRate = speed;
}
// 改变当前播放时长
const handleChangeTime = (percent: number) => {
  if (videoObject)
    videoObject.currentTime = videoObject.duration * percent;
}
// 改变音量
const handleVolumeChange = (value: number) => {
  state.volume = value;
  if (videoObject)
    videoObject.volume = (value / 100.0) + 0.01;
}
// 进入画中画
const handleEnterPictureInPicture = () => {
  if (videoObject) {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      videoObject.requestPictureInPicture();
    }
  }
}
// 进入全屏
const handleClickFullScreen = () => {
  console.log("这里发射一个事件，让播放器进入全屏状态。");
}

const getResolutionText = (resolution: number): string => {
  if (resolution >= 1440) {
    return '蓝光/2K' // 1440p 及以上
  }
  if (resolution >= 1080) {
    return '超清' // 1080p
  }
  if (resolution >= 720) {
    return '高清' // 720p
  }
  return '标清' // 小于 720p (如 480p, 360p)
};

const mapResolutions = (resolutions: number[]): { text: string, resolution: number }[] => {
  // 使用 Array.prototype.map 进行映射转换
  return resolutions.map((res: number) => ({
    text: getResolutionText(res), // 调用转换函数获取文本
    resolution: res                // 保留原始分辨率数值
  }));
};

const resolutionOptions = mapResolutions(props.resolutions);

watch(() => props.resolutions, (newValue) => {
  console.log('子组件接收到的 resolutions:', newValue);
  console.log('类型:', typeof newValue);
}, { immediate: true });

</script>

<template>
  <div class="player-controls" ref="controllerRef" tabindex="-1" :class="{ shrink: shrink }" @click.stop>
    <!-- 进度条 -->
    <Progress :duration="state.duration" :width="state.width" :height="state.height"
      :current="(state.currentTime / state.duration) * 100" :bufferd="state.bufferd"
      @changeProgress="handleChangeTime"></Progress>
    <!-- 播放/暂停 + 时间显示 -->
    <div class="play-and-time-danmaku" style="display: flex">
      <div class="play-button bounce-on-click" @click="onClickPlayButton">
        <icon-pause v-if="state.isPlaying"></icon-pause>
        <icon-play-arrow-fill v-else></icon-play-arrow-fill>
      </div>
      <div class="time">
        {{ formatTime(state.currentTime) }} / {{ formatTime(state.duration) }}
      </div>
    </div>
    <!-- 其它控制项：清屏、倍速、音量、全屏 -->
    <div class="player-others">
      <div class="clear-screen-button" style="user-select: none">
        <div>清屏</div>
        <a-switch size="small" />
      </div>
      <div class="resolutions">
        <a-popover :arrow="false" :overlayInnerStyle="{ backgroundColor: 'grey' }" style="user-select: none">
          <template #content>
            <div
              style="color: white;width: 50px;display: flex;flex-direction: column;justify-content: space-between;user-select: none">
              <div v-for="(item) in resolutionOptions" :key="item.resolution" class="player-speed-control-item">{{
                item.text }}</div>
            </div>
          </template>
          <div style="user-select: none"> {{ "自动" }}</div>
        </a-popover>
      </div>
      <div class="speed-control bounce-on-click" style="font-size: 15px">
        <a-popover :arrow="false" :overlayInnerStyle="{ backgroundColor: 'grey' }" style="user-select: none">
          <template #content>
            <div
              style="color: white;height: 250px;width: 50px;display: flex;flex-direction: column;justify-content: space-between;user-select: none">
              <div v-for="(item) in state.speeds" :key="item" class="player-speed-control-item"
                @click="handleChangeSpeed(item)">{{ item }}</div>
            </div>
          </template>
          <div style="user-select: none"> {{ state.currentSpeed === 1 ? '倍速' : `${state.currentSpeed}x` }}</div>
        </a-popover>
      </div>
      <div class="volume-control" style="user-select: none">
        <a-popover :arrow="false" :overlayInnerStyle="{ backgroundColor: 'grey' }">
          <template #content>
            <div style="display: flex;flex-direction: column;height: 120px;">
              <a-slider @change="handleVolumeChange" :value="state.volume" vertical :min="0" :max="100" />
            </div>
          </template>
          <div v-if="state.volume > 90" class="volume-full bounce-on-click">
            <icon-sound-fill></icon-sound-fill>
          </div>
          <div v-else-if="state.volume >= 1" class="volume-half bounce-on-click">
            <icon-sound></icon-sound>
          </div>
          <div v-else class="volume-none bounce-on-click">
            <icon-mute-fill></icon-mute-fill>
          </div>
        </a-popover>
      </div>
      <div class="picture-in-picture-control bounce-on-click">
        <svg v-if="true" width="20" height="20" viewBox="0 0 24 24" fill="white" @click="handleEnterPictureInPicture">
          <!-- 退出画中画图标 -->
          <path
            d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
          <path d="M15 9h4v4h-4V9z" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="white">
          <!-- 画中画图标 -->
          <path
            d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
          <path d="M15 9h4v4h-4V9z" />
        </svg>
      </div>
      <div class="fullScreen-control" @click="handleClickFullScreen">
        <icon-fullscreen-exit v-if="!state.isFullScreen"></icon-fullscreen-exit>
        <icon-fullscreen v-else></icon-fullscreen>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.player-controls.shrink {
  width: 70%;
}

.player-controls .play-button {
  line-height: 1;
  display: flex;
  cursor: pointer;
  margin-left: 10px;
  margin-top: 2px;
  font-size: 30px;
}

.player-controls .time {
  margin: 15px 20px;
  line-height: 1;
  color: white;
  font-size: 15px;
}

.player-controls .player-others {
  flex: 1;
  display: flex;
  line-height: 1;
  gap: 20px;
  margin-right: 15px;
  justify-content: flex-end;
  align-items: center;
}

.player-controls .player-others .clear-screen-button {
  gap: 5px;
  display: flex;
}

.player-controls .player-others svg {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.player-controls .picture-in-picture-control {
  cursor: pointer;
}

.player-controls .web-fullscreen-control {
  cursor: pointer;
}
</style>
