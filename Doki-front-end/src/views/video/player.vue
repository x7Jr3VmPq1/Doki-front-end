<template>
  <div>
    <div
        class="search"
    >
      <a-input-search
          placeholder="搜索你喜欢的内容..."
          enter-button
          @search="onSearch"
          size="large"
          style="width: 30vw"
      />
    </div>
    <div @keyup="handleKeyUp" style="display: flex">
      <div class="container">
        <!-- 视频详情页，点击评论按钮会展开-->
        <VideoDetails
            :visible="isModalVisible"
            @update:visible="handleIsModalVisible"
            :video-comments="videoComments"
        ></VideoDetails>
        <!-- 播放器组件  -->
        <a-carousel
            :autoplay="false"
            :dot-position="dotPosition"
            :dots="false"
            :beforeChange="handleBeforeChange"
            :afterChange="handleAfterChange"
            ref="carousel"
        >
          <!--    视频卡片区域-->
          <div class="playerCard">
            <!--      播放器区域-->
            <div class="playerArea">
              <!--        播放器标签-->
              <video controls :key="video0" loop>
                <source :src="video0" type="video/mp4">
              </video>
            </div>
            <!--  功能按钮-->
            <VideoFunctionButton
                @openModal="openModal"
                v-if="videoStore.videos.length > 0"
            ></VideoFunctionButton>
          </div>
          <div class="playerCard">
            <!--      播放器区域-->
            <div class="playerArea">
              <!--        播放器标签-->
              <video controls :key="video1" loop>
                <source :src="video1" type="video/mp4">
              </video>
            </div>
            <!--  功能按钮-->
            <VideoFunctionButton
                @openModal="openModal"
                v-if="videoStore.videos.length > 0"
            ></VideoFunctionButton>
          </div>
        </a-carousel>
      </div>
      <div class="ChangeVideoButton">
        <ChangeVideoButton @changeVideo="handleChangeVideo"></ChangeVideoButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import axios from '../../api/axiosInstance.ts';
import {getVideoCommentsByVideoId} from '../../api/commentService'
import {ref, onBeforeMount} from 'vue';
import type {CarouselProps} from 'ant-design-vue';
import VideoDetails from "../../components/VideoDetails.vue";
import ChangeVideoButton from "../../components/changeVideoButton.vue";
import VideoFunctionButton from "../../components/VideoFunctionButton.vue";
import {useVideoStore} from "../../store/videoStore.ts";
import type {Video} from "../../store/videoStore.ts";
import router from "../../router";

const videoStore = useVideoStore();
// 视频数据源
const videos = ref<Video[]>([]);
// 两个视频框的视频源
let video0 = ref('');
let video1 = ref('');
// 视频评论数组
const videoComments = ref<any[]>([]);
// 加载页面发起请求
onBeforeMount(async () => {
  await axios.get('/videos')
      .then(Response => {
        // 保留完整的视频信息，同时处理 videoUrl
        videos.value = Response.data.data.map((item: any) => ({
          ...item,
          videoUrl: item.videoUrl.replace(/^"|"$/g, '').replace(/\\/g, '/')
        }));
        // 将新的数组赋值给 videoStore 中的 videos
        videoStore.setVideos(videos.value);
        // 给两个播放器初始值
        video0.value = videos.value[0].videoUrl;
        video1.value = videos.value[1].videoUrl;
      })
      .catch(Error => console.dir(Error));
});

// 获取当前幻灯片中播放器的实例方法
const getCurrentVideoInstance = () => {
  const currentSlide = document.querySelector('.slick-active')
  if (currentSlide) {
    const currentVideo = currentSlide.querySelector('video');
    if (currentVideo) {
      return currentVideo;
    }
  }
  return null;
}

// 控制视频详情页显示和关闭
const isModalVisible = ref(false);
const openModal = async () => {
  // 获取视频评论
  const response = await getVideoCommentsByVideoId(videoStore.videos[videoStore.videoIndex].id);
  console.log(response);
  videoComments.value = response.data;
  const currentVideo = getCurrentVideoInstance();
  // 暂停视频
  currentVideo?.pause();
  // 同步进度
  videoStore.setCurrentVideoTime(currentVideo?.currentTime ?? 0)
  isModalVisible.value = true;
};
const handleIsModalVisible = (visible: boolean) => {
  // 关闭前，把对话框中视频的状态同步给父组件
  const currentVideo = getCurrentVideoInstance();
  if (currentVideo) {
    currentVideo.src = videos.value[videoStore.videoIndex].videoUrl;
    currentVideo.currentTime = videoStore.currentVideoTime;
  }
  // 让对话框关闭
  isModalVisible.value = visible;
  currentVideo?.play();
}

// 处理切换按钮组件事件
const handleChangeVideo = (direction: number) => {
  direction === 1 ? nextSlide() : prevSlide();
}
//TODO 添加按下键盘触发按钮逻辑
const handleKeyUp = (event: KeyboardEvent) => {
  const key = event.key;
  if (key === 'ArrowUp') {

  } else if (key === 'ArrowDown') {

  } else {
    return;
  }
}

// 控制切换逻辑
const carousel = ref(null);
const prevSlide = () => {
  carousel.value?.prev();
};
const nextSlide = () => {
  carousel.value?.next();
};

// 切换前的钩子
const handleBeforeChange = (currentIndex: number) => {
  const currentVideo = getCurrentVideoInstance();
  if (currentVideo) {
    // 切之前，先暂停视频
    currentVideo.pause();
    // 等切换到下一个视频后，重置上一个视频的播放时长
    setTimeout(() => {
      currentVideo.currentTime = 0;
    }, 300)
  }
  // 如果当前是video0，就切换video1的视频源
  // 如果当前是video1，就切换video0的视频源
  if (currentIndex === 0) {
    console.log(videos.value);
    video1.value = videos.value[videoStore.videoIndex].videoUrl;
  } else {
    console.log(videos.value);
    video0.value = videos.value[videoStore.videoIndex].videoUrl;
  }
}

// 切换后的钩子
const handleAfterChange = () => {
  // 切换后自动播放
  const currentVideo = getCurrentVideoInstance();
  if (currentVideo) {
    currentVideo.play();
  }
}

//TODO 点击搜索向后端发送请求
const onSearch = (content: string) => {
  router.push({name: 'Search', query: {keyword: content}})
}

const dotPosition = ref<CarouselProps['dotPosition']>('right');

</script>
<style scoped lang="less">
.search {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  box-sizing: border-box;
  height: 5vh;
}

.container {
  width: 60%;
  height: 80%;
  display: flex;
  margin-left: 10vw;
  margin-top: 2vh;

  .playerCard {
    display: flex !important;
    width: 40vh;
    height: 90vh;
    margin-bottom: 1px;
    // 播放器区域样式
    .playerArea {
      margin-top: 0;
      flex: 1;

      video {
        border-radius: 15px;
        width: 100%;
        height: 100%;
        object-fit: contain;
        background-color: #000; /* 黑色背景 */
      }
    }
  }
}

.ChangeVideoButton {
  margin-top: 20%;
  margin-left: 15%;
}

</style>
