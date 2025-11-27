<script lang="ts" setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  current: number, // 当前播放进度，0~100
  bufferd: number,  // 缓冲进度，0~100
  duration: number, // 视频时长
  width: number,  // 视频宽度
  height: number,  // 视频高度
}>();

const emit = defineEmits(['changeProgress']);

const currentStyle = computed(() => ({
  width: `${props.current}%`
}));

const bufferStyle = computed(() => ({
  width: `${props.bufferd}%`
}));

const progress = ref<HTMLElement | null>(null);
const handle = ref<HTMLElement | null>(null);

let dragging = false;

const updateProgressFromEvent = (event: MouseEvent) => {
  if (!progress.value) return;
  const rect = progress.value.getBoundingClientRect();
  let percent = (event.clientX - rect.left) / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  emit('changeProgress', percent);
}

const onMouseMove = (event: MouseEvent) => {
  if (dragging) {
    updateProgressFromEvent(event);
  }
}

const onMouseUp = () => {
  dragging = false;
}

onMounted(() => {
  if (progress.value) {
    // 点击进度条
    progress.value.addEventListener('click', (event) => {
      updateProgressFromEvent(event);
    });

    // 拖拽开始
    handle.value?.addEventListener('mousedown', (e) => {
      e.preventDefault();  // 阻止选中
      dragging = true;
    });
  }

  // 全局监听鼠标移动和释放
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});


const spriteLeft = ref(0);

const handleMouseMove = (event: MouseEvent) => {
  if (!progress.value) return;
  const rect = progress.value.getBoundingClientRect();
  let percent = (event.clientX - rect.left) / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);

  spriteLeft.value = percent;
}


const aspectRatioHeight = computed(() => props.height / (props.width / 160));

const spriteStyle = computed(() => {

  const heightValue = aspectRatioHeight.value;

  const left = Math.floor(spriteLeft.value * 100);

  const background = "http://localhost:10011/image/sprite/8e974928-0cc0-471d-91cc-68de932b836f.jpg";

  const current = props.duration >= 100 ? 100 : props.duration;

  const backgroundX = - (Math.floor(current * spriteLeft.value) % 10) * 160;

  const backgroundY = - Math.floor((current * spriteLeft.value / 10)) * heightValue;

  return {
    // 宽度是固定值
    width: '160px',

    // 高度使用计算值
    height: `${heightValue}px`,

    // top 使用计算值的负值
    top: `${-heightValue}px`,

    // left 直接使用 spriteLeft 变量，注意它已经是百分比字符串
    left: `${left}%`,

    backgroundImage: `url(${background})`,

    backgroundRepeat: 'no-repeat',

    backgroundPosition: `${backgroundX}px ${backgroundY}px`,

  }
});
</script>
<template>
  <div @mousemove="handleMouseMove" class="player-progress" ref="progress">

    <div class="sprite" :style=spriteStyle>
    </div>
    <div class="current" :style="currentStyle"></div>
    <div class="buffer" :style="bufferStyle"></div>
    <!-- 拖拽手柄 -->
    <div ref="handle" class="progress-handle" :style="{ left: props.current + '%' }"></div>
  </div>
</template>
<style scoped>
.player-progress {
  position: absolute;
  top: 0;
  width: 100%;
  height: 3px;
  background-color: rgb(101, 100, 100);
}


.player-progress:hover {
  height: 7px;
  cursor: pointer;
}

.player-progress:hover .progress-handle {
  opacity: 1;
}

.sprite {
  position: absolute;
  overflow: hidden;
  z-index: 10;
  opacity: 0;
}

.player-progress:hover .sprite {
  opacity: 1;
}


.current,
.buffer {
  height: 100%;
  position: absolute;
}

.current {
  background-color: red;
  z-index: 2;
}

.buffer {
  background-color: grey;
  z-index: 1;
}

.progress-handle {
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #f00;
  z-index: 3;
  cursor: pointer;
}
</style>