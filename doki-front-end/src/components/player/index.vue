<template>
  <div class="video-container">
    <swiper ref="swiperRef" @slide-change="handleSlideChange" direction="vertical" @_virtualUpdated="() => { }"
      :modules="[Pagination, Virtual]" :allowTouchMove="true" virtual class="video-swiper" @wheel.passive="handleWheel"
      @swiper="onSwiperInit">
      <swiper-slide v-for="(video, index) in props.videos" :key="index" :virtualIndex="index">
        <!-- 在有限模式下，可以选择点击关闭。 -->
        <div class="close-button flex-center" v-if="props.mode == 1" @click="handleClose">
          <Close></Close>
        </div>
        <Player :video="video" :index="index" :active="state.active" v-if="videos.length > 0"></Player>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@icon-park/vue-next';
import { reactive, watch, nextTick, ref, onMounted, onBeforeUnmount } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper';
import { Pagination, Virtual } from 'swiper/modules'
import "swiper/css"
import "swiper/css/pagination"
import Player from "./Player.vue";
import type { VideoInfo } from '../../api/feedService.ts'
import feedService from '../../api/feedService.ts'
import { handleRequest } from '../../api/handleRequest.ts';

const props = defineProps<{
  videos: VideoInfo[],
  mode: number,  // 模式 0=主页无限加载模式，1=其它有限列表模式
  startWith: number // 从哪个索引位置开始播放
}>()


const emit = defineEmits(['close'])

const state = reactive({
  active: 0, // 当前播放项索引
  lock: false,  // 节流锁，以禁止快速翻页
  timer: 0// 节流定时器的编号
})

const swiperRef = ref<HTMLElement | null>(null);

watch(() => state.active, async (newValue) => {
  // 如果是有限模式，不再追加。
  if (props.mode === 1) {
    return;
  }
  // 即将触底，加载下一批视频。
  if (newValue > props.videos.length - 2) {
    await handleRequest(feedService.getRandomVideos, {
      onSuccess(data) {
        props.videos.push(...data);
      }
    })
  }
})


let swiperObject: SwiperType | null = null;
const onSwiperInit = (swiper: SwiperType) => {
  swiperObject = swiper;
}

onMounted(() => {
  document.addEventListener('keyup', handleKeyUp)
})
onBeforeUnmount(() => {
  document.removeEventListener('keyup', handleKeyUp)
})


watch(() => props.startWith, async (newIndex) => {
  await nextTick()
  swiperObject?.slideTo(newIndex, 0);
}, {
  immediate: true
})

const handleKeyUp = (event: KeyboardEvent) => {
  if (getLock()) {
    setLock();
    return;
  }
  if (event.key != 'ArrowDown' && event.key != 'ArrowUp')
    return;
  if (event.key === 'ArrowDown' && state.active < props.videos.length) {
    swiperObject?.slideNext();
  }
  if (event.key === 'ArrowUp' && state.active > 0) {
    swiperObject?.slidePrev();
  }
  state.active = swiperObject?.activeIndex ?? 0;
}

const handleWheel = (event: WheelEvent) => {
  if (getLock()) {
    setLock();
    return;
  }
  if (event.deltaY > 0) {
    swiperObject?.slideNext();
  } else if (event.deltaY < 0) {
    swiperObject?.slidePrev();
  }
  state.active = swiperObject?.activeIndex ?? 0;
};

const handleSlideChange = () => {
  setLock();
  if (swiperObject)
    state.active = swiperObject?.activeIndex
}

const getLock = () => state.lock;

const setLock = () => {
  state.lock = true;
  clearTimeout(state.timer);
  state.timer = window.setTimeout(() => {
    state.lock = false
  }, 300);
}

const handleClose = () => {
  emit('close');
}

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
  height: 100%;
  position: relative;
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

.close-button {
  opacity: 0;
  z-index: 100;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.2);
  ;
  font-size: 30px;
  position: absolute;
  top: 3%;
  left: 3%;
}

.video-container:hover .close-button {
  opacity: 1;
}

.close-button:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.4);
}
</style>
