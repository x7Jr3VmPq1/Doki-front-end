<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {
  HeartFilled,
  MessageFilled,
  StarFilled,
  PlusCircleFilled
} from "@ant-design/icons-vue";
import {
  IconShareInternal,
  IconMore,
  IconPause,
  IconPlayArrowFill,
  IconMuteFill,
  IconSound,
  IconSoundFill,
  IconFullscreen,
  IconFullscreenExit
} from '@arco-design/web-vue/es/icon';

// 获取视频标签HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.addEventListener('loadedmetadata', () => {
      durationTime.value = videoRef.value?.duration ?? 0;
      currentTime.value = videoRef.value?.currentTime ?? 0;
      videoRef.value?.play(); // 可以开始播放
      isPlaying.value = true;
    });
    const updateHandler = () => {
      currentTime.value = videoRef.value?.currentTime ?? 0;
      progressPercent.value = (currentTime.value / durationTime.value) * 100;
    };
    videoRef.value.addEventListener('timeupdate', updateHandler);
  }
})

// 评论区抽屉控制
const open = ref(false)
const showDrawer = () => {
  open.value = !open.value;
}
const onClose = () => {
  open.value = false;
}

// 播放暂停控制
const isPlaying = ref(false);
const onPlay = () => {
  isPlaying.value = !isPlaying.value;
  if (videoRef.value) {
    isPlaying.value ? videoRef.value.play() : videoRef.value.pause();
  }
}

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
    console.log(time);
  }
}

// 时间格式化函数
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
</script>


<template>
  <div class="player-container" tabindex="-1" @keydown.space="onPlay">
    <!-- 视频区域绑定动态 class 控制宽度 -->
    <div :class="['player-video', { shrink: open }]" @click="onPlay">
      <!--      <video src="http://localhost:8081/videos/f832ca6f-f659-44eb-bf20-b79735f1d757.mp4" ref="videoRef" loop></video>-->
      <video src="http://localhost:8081/videos/BigBuckBunny.mp4" ref="videoRef"></video>
      <!-- 交互按钮 -->
      <div class="interaction-buttons" @click.stop>
        <a-tooltip placement="left" color="grey">
          <template #title>
            <div style="display: flex;line-height: 1.2em">
              进入作者首页
              <div
                  style="width: 1.2em;height: 1.2em;background-color: white;color: grey;font-size: 1em;border-radius: 10%;text-align: center;line-height: 1.2em;margin-left: 5px">
                F
              </div>
            </div>
          </template>
          <div class="user-avatar">
            <div class="follow-button">
              <PlusCircleFilled/>
            </div>
            <a-avatar
                src="http://localhost:8081/avatars/4b1028ef-0863-4516-bfe8-987707d0721b.jpg"
                size="large"
                class="bounce-on-click"
            >
            </a-avatar>
          </div>
        </a-tooltip>
        <a-tooltip></a-tooltip>
        <div class="like bounce-on-click">
          <heart-filled/>
          <div style="font-size: 20px">999</div>
        </div>
        <div class="star bounce-on-click">
          <star-filled/>
          <div style="font-size: 20px">999</div>
        </div>
        <div class="comment bounce-on-click" @click="showDrawer">
          <message-filled/>
          <div style="font-size: 20px">999</div>
        </div>
        <div class="share bounce-on-click">
          <icon-share-internal/>
        </div>
        <div class="more bounce-on-click">
          <icon-more/>
        </div>
      </div>
      <!-- 视频主信息 -->
      <div class="video-info">
        <div style="display: flex">
          <div class="user-name">用户123</div>
          <div class="upload-time">2020年11月11日</div>
        </div>
        <div style="display: flex;flex-wrap: wrap;width: 100%">
          <div class="video-title">可爱的兔子动画片</div>
          <div class="video-tags" @click.stop>#若干标签...</div>
        </div>
      </div>
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
      <!--  控件  -->
      <div class="player-controls" @click.stop>
        <div class="play-and-time(danmaku)" style="display: flex">
          <!-- 播放按钮 -->
          <div class="play-button bounce-on-click" @click="onPlay">
            <icon-pause v-if="isPlaying"></icon-pause>
            <icon-play-arrow-fill v-else></icon-play-arrow-fill>
          </div>
          <!-- 时间 -->
          <div class="time">
            {{ formatTime(currentTime) }} / {{ formatTime(durationTime) }}
          </div>
        </div>
        <div class="player-others">
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
              {{ currentSpeed == 1 ? '倍速' : currentSpeed + 'x' }}
            </a-popover>
          </div>
          <div class="volume-control" @click="toggleMute">
            <a-popover
                :arrow=false
                :overlayInnerStyle="{backgroundColor:'grey'}"
            >
              <template #content>
                <div style="display: inline-block;height: 100px;">
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

          <div class="fullScreen-control" @click="toggleFullScreen">
            <icon-fullscreen-exit v-if="isFullScreen"></icon-fullscreen-exit>
            <icon-fullscreen v-else></icon-fullscreen>
          </div>

        </div>
      </div>

    </div>
    <a-drawer
        v-model:open="open"
        class="custom-class"
        root-class-name="root-class-name"
        :root-style="{ color: 'blue' }"
        :style="{ backgroundColor: 'transparent', boxShadow: 'none' }"
        title="评论区"
        placement="right"
        :get-container="false"
        width="30%"
        :mask="false"
        @close="onClose"
    >
      <div class="player-comments">
      </div>
    </a-drawer>

  </div>

</template>


<style scoped>


.player-container {
  width: 95%;
  height: 95%;
  overflow: hidden;
  position: relative;
  border-radius: 15px;
  z-index: 0;
  display: flex;
  flex-direction: column;


  .player-video {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0; /* 让容器撑满父级 */
    width: 100%;
    height: 100%;
    transition: width 0.32s ease;
    display: flex;
    flex-direction: column;
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */

    video {
      object-fit: contain;
      max-width: 100%;
      max-height: 100%;
    }

    .player-progress {
      line-height: 1;
      position: absolute;
      width: 100%;
      left: 0;
      bottom: 20px;
      z-index: 5;
    }

    .player-controls {
      text-align: center;
      display: flex;
      line-height: 1;
      color: white;
      background-color: rgba(0, 0, 0, 0.70);
      position: absolute;
      bottom: 0;
      left: 0;
      height: 40px;
      width: 100%;

      .play-button {
        display: flex;
        cursor: pointer;
        margin-left: 10px;
        margin-top: 2px;
        font-size: 30px;
      }

      .time {
        margin-left: 10px;
        font-size: 15px;
        margin-top: 10px;
      }

      .player-others {
        flex: 1;
        display: flex;
        gap: 15px;
        margin-right: 15px;
        justify-content: flex-end;
        align-items: center;

        svg {
          cursor: pointer;
          width: 30px;
          height: 30px;
        }
      }
    }

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

      .user-avatar {
        position: relative;

        .follow-button {
          cursor: pointer;
          color: rgba(255, 0, 0);
          font-size: 20px;
          position: absolute;
          bottom: -8px;
          right: 10px;
          z-index: 1;
        }
      }
    }

    .video-info {
      user-select: none;
      line-height: 1.5;
      display: flex;
      flex-direction: column; /* 垂直排列 */
      position: absolute;
      left: 3%;
      bottom: 10%;

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
  }

  /* 抽屉打开时缩小视频 */

  .player-video.shrink {
    width: 70%;
  }


  .player-comments {
    background-color: grey;
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
</style>

