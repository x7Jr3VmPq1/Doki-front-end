<template>
  <swiper
      ref="swiperRef"
      direction="vertical"
      :modules="[Pagination,Virtual]"
      :allowTouchMove="false"
      virtual
      class="video-swiper"
      @keyup="handleChange"
      @wheel="handleChange"
      @swiper="onSwiperInit"
  >
    <swiper-slide v-for="(video, index) in videos" :key="index" :virtualIndex="index">
      <Player :ref="el => setPlayerRef(el, index)" :video="video"></Player>
    </swiper-slide>
  </swiper>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {Swiper, SwiperSlide} from 'swiper/vue'
import {Pagination, Virtual} from 'swiper/modules'
import type {Video} from "../../store/videoStore.ts";
import "swiper/css"
import "swiper/css/pagination"
import Player from "../../components/Player.vue";
import axios from "../../api/axiosInstance.ts";

const videos = ref<Video[]>([]);
const playerRefs = ref([]);

function setPlayerRef(el, index) {
  if (el) {
    playerRefs.value[index] = el;
  } else {
    // 组件销毁时，清空对应引用
    playerRefs.value[index] = null;
  }
}

onMounted(async () => {
  await axios.get('/videos')
      .then(Response => {
        // 保留完整的视频信息，同时处理 videoUrl
        videos.value = Response.data.data.map((item: any) => ({
          ...item,
          videoUrl: item.videoUrl.replace(/^"|"$/g, '').replace(/\\/g, '/')
        }));
      })
      .catch(Error => console.dir(Error));

  console.log(videos)
  console.log(playerRefs.value)
})

const swiperInstance = ref(null)  // 保存 swiper 实例
function onSwiperInit(swiper) {
  swiperInstance.value = swiper
}

// 节流锁，一秒后才允许翻页
const slideLocked = ref(false);
// 节流事件ID
let throttleId = 0;
// 加锁方法
const lockSlide = () => {
  slideLocked.value = true;
  clearTimeout(throttleId);
  throttleId = setTimeout(() => {
    slideLocked.value = false;
  }, 500);
}
// 翻页方法
const handleChange = (event: KeyboardEvent | MouseEvent) => {
  const swiper = swiperInstance.value as Swiper;
  if (!swiper) return;
  // 如果当前翻页变量处于锁定状态，则返回
  if (slideLocked.value) {
    // 重新加锁
    lockSlide();
    return;
  }
  // 当前幻灯片索引
  const currentIndex = swiper.activeIndex;
  // 当前播放器组件引用
  const currentPlayer = playerRefs.value[currentIndex] as Player;

  // 翻页方法
  function handleNavigation(direction: 'next' | 'prev') {
    if (currentPlayer) currentPlayer.pause();
    direction === 'next' ? swiper.slideNext() : swiper.slidePrev();
  }

  // 键盘和鼠标事件处理
  if (event instanceof KeyboardEvent) {
    const {key} = event;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      handleNavigation(key === 'ArrowDown' ? 'next' : 'prev');
    }
  } else if (event instanceof WheelEvent) {
    handleNavigation(event.deltaY > 0 ? 'next' : 'prev');
  }
  nextTick(() => {
    const nextPlayer = playerRefs.value[swiper.activeIndex] as Player;
    if (nextPlayer) {
      nextPlayer.play();
    }
  });
  // 加锁
  lockSlide();
}
</script>

<style scoped>
.video-swiper,
.swiper-slide {
  height: 85vh;
  width: 85vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video {
  height: 100%;
  width: 100%;
  object-fit: cover;
}
</style>
