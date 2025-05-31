<script setup lang="ts">
import {onMounted, ref} from 'vue'
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
import {Close, Dislike, Like, Message, ShareTwo, GrinningFace, AtSign, Picture} from '@icon-park/vue-next';

import {getVideoCommentsByVideoId} from "../api/commentService.js";
import {dayUtils} from "../utils/dayUtils.ts";
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'


// 获取视频标签HTML元素
const videoRef = ref<HTMLVideoElement | null>(null);
const comments = ref([]);

onMounted(async () => {
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

  const videoCommentsByVideoId = await getVideoCommentsByVideoId(3);
  comments.value = videoCommentsByVideoId.data;
  console.log(comments);
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
      console.log(previewUrl.value)
    }
    reader.readAsDataURL(file);
  } else {
    alert('请选择图片文件');
  }
}

</script>


<template>
  <div class="player-container" tabindex="-1"
       @keyup.space="onPlay"
       @keyup.x="openComments"
       @keyup.f="openUserPage"
  >
    <!-- 视频区域绑定动态 class 控制宽度 -->
    <div :class="['player-video', { shrink: open }]" @click="onPlay">
      <div class="video-wrapper">
        <video src="http://localhost:8081/videos/BigBuckBunny.mp4" ref="videoRef"></video>
        <!--        <video src="http://localhost:8081/videos/f832ca6f-f659-44eb-bf20-b79735f1d757.mp4" ref="videoRef"-->
        <!--               loop></video>-->
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
                  src="http://localhost:8081/avatars/4b1028ef-0863-4516-bfe8-987707d0721b.jpg"
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
            <div class="like bounce-on-click">
              <heart-filled/>
              <div style="font-size: 20px;padding-top: 5px">999</div>
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
              <div style="font-size: 20px;padding-top: 5px">999</div>
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
            <div class="star bounce-on-click">
              <star-filled/>
              <div style="font-size: 20px;padding-top: 5px">999</div>
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
          <div class="user-name">用户123</div>
          <div class="upload-time">2020年11月11日</div>
        </div>
        <div style="display: flex;flex-wrap: wrap;width: 100%">
          <div class="video-title">可爱的兔子动画片</div>
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
    <div class="other-draw" :class="['other-draw',{ shrink: open }]">
      <a-tabs v-model:activeKey="activeKey" size="large">
        <a-tab-pane key="1" tab="TA的作品">Content of Tab Pane 1</a-tab-pane>
        <a-tab-pane key="2" :tab='`评论 (${comments.length})`' force-render>
          <div class="comments" style="height: 100%; display: flex;flex-direction: column">
            <div style="flex: 1;overflow-y: auto">
              <a-list
                  class="comment-list"
                  item-layout="horizontal"
                  :data-source="comments"
                  v-if="comments.length > 0"
              >
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-comment :author="item.username" :avatar="item.avatarUrl">
                      <template #actions>
                      </template>
                      <template #content>
                        <p>{{ item.content }}</p>
                        <p style="color:#bbbfc6;margin-bottom: 5px">{{ dayUtils.formatDate(item.createdAt) }}</p>
                        <p style="display: flex;gap: 10px;line-height: 1;text-align: center">
                        <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><message
                            style="margin-right: 3px"></message>回复</span>
                          <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><share-two
                              style="margin-right: 3px"></share-two>分享</span>
                          <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><like></like>
                          {{ item.likeCount }}
                        </span>
                          <span style="cursor: pointer;user-select: none;" class="bounce-on-click"><dislike></dislike></span>
                        </p>
                      </template>
                    </a-comment>
                  </a-list-item>
                </template>
              </a-list>
            </div>
            <div class="comment-input" style="max-height: 50%;display: flex;flex-direction: column">
              <div style="flex: 1">
                <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }"
                            @keyup.stop
                            style="background-color: transparent;color: white;border: none"
                            placeholder="留下你的评论吧~"
                ></a-textarea>
              </div>
              <div class="functions">
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
                      preview-mask="false"
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

        .functions {
          user-select: none;
          display: flex;
          align-items: flex-end;
          flex-direction: row-reverse;
          gap: 10px;
          font-size: 20px;
          margin-right: 10px;

          .upload-picture {
            display: flex;
            position: relative;
            padding-left: 10px;
            padding-bottom: 10px;
            flex: 1;

            .delete-btn {
              cursor: pointer;
              width: 20px;
              height: 20px;
              position: absolute;
              left: 80px;
              top: -10px;
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
</style>

