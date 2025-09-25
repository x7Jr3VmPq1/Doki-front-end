<template>
  <div class="video-container">
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
      <swiper-slide v-for="(video, index) in props.videos" :key="index" :virtualIndex="index">
        <Player :ref="el => setPlayerRef(el, index)" :video="video"></Player>
      </swiper-slide>
    </swiper>
    
    <!-- 翻页控制组件 - 右侧悬浮 -->
    <SwiperController
      ref="swiperControllerRef"
      :swiper-instance="swiperInstance"
      :player-refs="playerRefs"
      :total-slides="props.videos.length"
      @slide-change="handleSlideChange"
      @player-pause="handlePlayerPause"
      @player-play="handlePlayerPlay"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, nextTick, watch, onMounted} from 'vue'
import {Swiper, SwiperSlide} from 'swiper/vue'
import {Pagination, Virtual} from 'swiper/modules'
import type {Video} from "../../store/videoStore.ts";
import "swiper/css"
import "swiper/css/pagination"
import Player from "../../components/player/index.vue";
import SwiperController from "../../components/player/SwiperController.vue";

defineEmits(['_virtualUpdated']);

const props = defineProps({
  videos: {
    type: Array,
    default: () => []
  },
  index: {
    type: Number,
    default: 0
  }
})


const playerRefs = ref([]);
const swiperControllerRef = ref(null);

function setPlayerRef(el, index) {
  if (el) {
    playerRefs.value[index] = el;
  } else {
    // 组件销毁时，清空对应引用
    playerRefs.value[index] = null;
  }
}

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
  }, 750);
}
// 翻页方法
const handleChange = (event: KeyboardEvent | MouseEvent) => {
  // 如果是最后一页，不允许下滑
  if (swiperInstance.value.isEnd && event.deltaY > 0) return;
  // 如果是第一页，不允许上滑
  if (swiperInstance.value.isBeginning && event.deltaY < 0) return;
  // 如果事件既不是滚轮也不是上下按键，直接返回
  if (!(event instanceof KeyboardEvent && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) &&
      !(event instanceof WheelEvent)) {
    return;
  }
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
  // 没翻页，直接返回
  nextTick(() => {
    const nextPlayer = playerRefs.value[swiper.activeIndex] as Player;
    if (nextPlayer) {
      nextPlayer.play();
    }
  });
  swiper.update();

  // 加锁
  lockSlide();
}

// 控制器事件处理
const handleSlideChange = (index) => {
  console.log('🎬 切换到视频:', index + 1)
}

const handlePlayerPause = () => {
  console.log('⏸️ 播放器暂停')
}

const handlePlayerPlay = () => {
  console.log('▶️ 播放器播放')
}

onMounted(() => {
  watch(() => props.index, (newIndex) => {
    nextTick(() => {
      if (swiperInstance.value) {
        swiperInstance.value.slideTo(newIndex, 0, false);
        nextTick(() => {
          const player = playerRefs.value[newIndex] as Player;
          if (player) player.play();
        });
      }
    });
  }, {immediate: true});
});

</script>

<style scoped>
.video-swiper,
.swiper-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container {
  width: calc(100% - 80px); /* 为控制器留出空间 */
  height: 100%;
  position: relative;
  margin-right: 80px; /* 确保播放器不延伸到控制器区域 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-container {
    width: calc(100% - 70px);
    margin-right: 70px;
  }
}

@media (max-width: 480px) {
  .video-container {
    width: calc(100% - 60px);
    margin-right: 60px;
  }
}
</style>
