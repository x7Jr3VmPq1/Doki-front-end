<script setup lang="ts">
import {DownOutlined, UpOutlined} from "@ant-design/icons-vue";
import {useVideoStore} from "../store/videoStore.ts";
import {defineEmits} from 'vue';

const emit = defineEmits(['changeVideo']);
const videoStore = useVideoStore();

// 节流函数
const throttle = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (!timeoutId) {
      func(...args);
      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, delay);
    }
  };
};

// 使用节流函数包装 handleClick
const throttledHandleClick = throttle(async (direction: number) => {
  // 更改当前视频索引
  videoStore.videoIndex += direction;
  // 通知父组件发生了视频切换
  emit('changeVideo', direction);
}, 1000); // 设置节流时间为 1 秒

const handleClick = (direction: number) => {
  throttledHandleClick(direction);
};
</script>

<template>
  <!--   切换按钮-->
  <div class="control">
    <div class="up">
      <a-button
          type="default"
          shape="circle"
          @click="handleClick(-1)"
          :disabled="videoStore.videoIndex === 0"
          size="large"
      >
        <UpOutlined/>
      </a-button>
    </div>
    <div class="down">
      <a-button
          type="default"
          shape="circle"
          @click="handleClick(+1)"
          :disabled="videoStore.videoIndex === videoStore.videos.length-1"
          size="large"
      >
        <DownOutlined/>
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.control {
  display: flex; /* 设置容器为 flex 布局 */
  flex-direction: column; /* 让子元素垂直排列 */
  gap: 40px; /* 设置子元素之间的间隔，可以根据需要调整 */
}
</style>
