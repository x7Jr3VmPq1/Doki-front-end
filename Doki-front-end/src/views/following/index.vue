<template>
  <swiper
      ref="swiperRef"
      direction="vertical"
      :modules="[Pagination,Virtual]"
      :allowTouchMove="false"
      virtual
      class="video-swiper"
      @keyup="handleChange"
      @wheel="handleWheel"
      @swiper="onSwiperInit"
  >
    <swiper-slide v-for="(video, index) in 3" :key="index" :virtualIndex="index"
    >
      <Player></Player>
    </swiper-slide>
  </swiper>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import {Swiper, SwiperSlide} from 'swiper/vue'
import {Pagination, Virtual} from 'swiper/modules'

import "swiper/css"
import "swiper/css/pagination"
import Player from "../../components/Player.vue";

const swiperInstance = ref(null)  // 保存 swiper 实例
function onSwiperInit(swiper) {
  swiperInstance.value = swiper
}


const videoRefs = ref([])

const currentIndex = ref(0);
const handleChange = (event) => {
  const swiper = swiperInstance.value;
  if (!swiper) return
  console.log(event.key)
  if (event.key === 'ArrowDown') {
    swiper.slideNext()
    currentIndex.value++;
  } else if (event.key === 'ArrowUp') {
    swiper.slidePrev()
    currentIndex.value--;
  }
}

function handleWheel(event) {
  // event.deltaY > 0 表示向下滚动， < 0 表示向上滚动
  if (event.deltaY > 0) {
    console.log('向下滚动了')
  } else {
    console.log('向上滚动了')
  }
}
</script>

<style scoped>
.video-swiper,
.swiper-slide {
  height: 80vh;
  width: 80vw;
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
