<script setup lang="ts">
import {ref, onMounted, onUnmounted} from "vue";

const contentShow = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    contentShow.value = false;
  }
};


const handleTrigger = () => {
  contentShow.value = !contentShow.value;
}
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="container" ref="containerRef">
    <div @click="handleTrigger">
      <slot name="trigger"></slot>
    </div>
    <transition name="slide-down">
      <div class="content" v-if="contentShow">
        <slot name="content"></slot>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.container {
  position: relative;
}

.content {
  padding: 10px;
  border-radius: 15px;
  background-color: #fff;
  position: absolute;
  top: 60px;
  right: 0;
  z-index: 100;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 进入动画 */
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-enter-active {
  transition: all 0.3s ease;
}

.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* 离开动画 */
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
