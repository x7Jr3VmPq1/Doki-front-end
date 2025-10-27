<script setup lang="ts">
import { ref, watch } from 'vue';
import { IconPause, IconPlayArrowFill, IconMuteFill, IconSound, IconSoundFill, IconFullscreen, IconFullscreenExit } from '@arco-design/web-vue/es/icon';

// 外部传入的受控状态
const props = defineProps<{
  isPlaying: boolean,
  currentTime: number,
  durationTime: number,
  clearScreen: boolean,
  speeds: number[],
  currentSpeed: number,
  volume: number,
  isFullScreen: boolean,
  isPictureInPicture: boolean,
  videoDuration?: number,
  shrink?: boolean,
}>()

// 向父组件派发的事件（只传递意图，不直接改父状态）
const emits = defineEmits<{
  (e: 'togglePlay'): void,
  (e: 'setTime', time: number): void,
  (e: 'toggleClear', value: boolean): void,
  (e: 'setSpeed', speed: number): void,
  (e: 'changeVolume', value: number): void,
  (e: 'toggleFullscreen'): void,
  (e: 'toggleMute'): void,
  (e: 'togglePictureInPicture'): void,
  (e: 'toggleWebFullscreen'): void,
}>()

// 辅助：时间格式化显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const paddedMins = String(mins).padStart(2, '0')
  const paddedSecs = String(secs).padStart(2, '0')
  return `${paddedMins}:${paddedSecs}`
}

// 进度条本地状态：与 props.currentTime 同步
// 用于滑动过程中的平滑体验，避免拖动时被父级 timeupdate 抢回
const internalCurrentTime = ref(props.currentTime)
watch(() => props.currentTime, (v) => { internalCurrentTime.value = v })
</script>

<template>
  <div class="player-controls" :class="{ shrink: props.shrink }" @click.stop>
    <!-- 播放进度：范围 0 ~ 视频时长，拖动时触发 setTime 通知父级设置播放时间 -->
    <div class="player-progress" @click.stop>
      <a-slider
          :min="0"
          :max="props.videoDuration ?? props.durationTime"
          :step="0.1"
          :trackStyle="{ backgroundColor: '#fff' }"
          :handleStyle="{ backgroundColor: '#fff' }"
          :dotStyle="{ backgroundColor: '#fff' }"
          :activeDotStyle="{ backgroundColor: '#fff' }"
          :tooltipOpen="false"
          v-model:value="internalCurrentTime"
          @change="(val:number)=>emits('setTime', val)"
          @afterChange="(val:number)=>emits('setTime', val)"
      />
      <div class="handle"></div>
    </div>
    <!-- 播放/暂停 + 时间显示 -->
    <div class="play-and-time-danmaku" style="display: flex">
      <div class="play-button bounce-on-click" @click="emits('togglePlay')">
        <icon-pause v-if="props.isPlaying"></icon-pause>
        <icon-play-arrow-fill v-else></icon-play-arrow-fill>
      </div>
      <div class="time">
        {{ formatTime(props.currentTime) }} / {{ formatTime(props.durationTime) }}
      </div>
    </div>
    <!-- 其它控制项：清屏、倍速、音量、全屏 -->
    <div class="player-others">
      <div class="clear-screen-button" style="user-select: none">
        <div>清屏</div>
        <a-switch size="small" :checked="props.clearScreen" @update:checked="(v:boolean)=>emits('toggleClear', v)"/>
      </div>
      <div class="speed-control bounce-on-click" style="font-size: 15px">
        <a-popover :arrow="false" :overlayInnerStyle="{backgroundColor:'grey'}" style="user-select: none">
          <template #content>
            <div style="color: white;height: 250px;width: 50px;display: flex;flex-direction: column;justify-content: space-between;user-select: none">
              <div v-for="(item) in props.speeds" :key="item" class="player-speed-control-item" @click="emits('setSpeed', item)">{{ item }}</div>
            </div>
          </template>
          <div style="user-select: none"> {{ props.currentSpeed == 1 ? '倍速' : props.currentSpeed + 'x' }}</div>
        </a-popover>
      </div>
      <div class="volume-control" style="user-select: none" @click="emits('toggleMute')">
        <a-popover :arrow="false" :overlayInnerStyle="{backgroundColor:'grey'}">
          <template #content>
            <div style="display: flex;flex-direction: column;height: 120px;">
              <a-slider :value="props.volume" vertical :min="0" :max="100" @change="(v:number)=>emits('changeVolume', v)" />
            </div>
          </template>
          <div v-if="props.volume==100" class="volume-full bounce-on-click">
            <icon-sound-fill></icon-sound-fill>
          </div>
          <div v-else-if="props.volume>=1" class="volume-half bounce-on-click">
            <icon-sound></icon-sound>
          </div>
          <div v-else class="volume-none bounce-on-click">
            <icon-mute-fill></icon-mute-fill>
          </div>
        </a-popover>
      </div>
      <div class="picture-in-picture-control bounce-on-click" @click="emits('togglePictureInPicture')">
        <svg v-if="props.isPictureInPicture" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <!-- 退出画中画图标 -->
          <path d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
          <path d="M15 9h4v4h-4V9z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="white">
          <!-- 画中画图标 -->
          <path d="M19 7h-8v6h8V7zm2-4H3C1.9 3 1 3.9 1 5v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
          <path d="M15 9h4v4h-4V9z"/>
        </svg>
      </div>
      <div class="web-fullscreen-control bounce-on-click" @click="emits('toggleWebFullscreen')">
        <svg v-if="props.isWebFullScreen" width="20" height="20" viewBox="0 0 24 24" fill="white">
          <!-- 退出网页全屏图标 -->
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="white">
          <!-- 网页全屏图标 -->
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </div>
      <div class="fullScreen-control" @click="emits('toggleFullscreen')">
        <icon-fullscreen-exit v-if="props.isFullScreen"></icon-fullscreen-exit>
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
.player-controls.shrink { width: 70%; }
.player-controls .player-progress { line-height: 1; position: absolute; width: 100%; left: 0; bottom: 20px; z-index: 5; }
.player-controls .play-button { line-height: 1; display: flex; cursor: pointer; margin-left: 10px; margin-top: 2px; font-size: 30px; }
.player-controls .time { margin: 15px 20px; line-height: 1; color: white; font-size: 15px; }
.player-controls .player-others { flex: 1; display: flex; line-height: 1; gap: 20px; margin-right: 15px; justify-content: flex-end; align-items: center; }
.player-controls .player-others .clear-screen-button { font-size: 1.1em; gap: 5px; display: flex; }
.player-controls .player-others svg { cursor: pointer; width: 20px; height: 20px; }
.player-controls .picture-in-picture-control { cursor: pointer; }
.player-controls .web-fullscreen-control { cursor: pointer; }
</style>


