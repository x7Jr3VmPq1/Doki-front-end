<script lang="ts" setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';

const props = defineProps<{
  current: number, // 当前播放进度，0~100
  bufferd: number  // 缓冲进度，0~100
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
</script>
<template>
  <div class="player-progress" ref="progress">
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
  background-color:rgb(101, 100, 100);
}


.player-progress:hover {
  height: 7px;
  cursor: pointer;
}

.player-progress:hover .progress-handle {
  opacity: 1;
}


.current,
.buffer {
  height: 100%;
  position: absolute;
  transition: width 0.1s linear;
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