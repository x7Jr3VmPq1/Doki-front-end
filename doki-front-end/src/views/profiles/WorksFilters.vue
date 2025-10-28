<script setup lang="ts">

import { Lock } from "@icon-park/vue-next";
import { ref } from "vue";

const filterButtonActive = ref(0); // 作品类型过滤

</script>

<template>
  <div class="works-filter">
    <div class="works-filter-button" :class="{ active: filterButtonActive == 0 }" @click="filterButtonActive = 0">作品
    </div>
    <div class="works-filter-button" :class="{ active: filterButtonActive == 1 }" @click="filterButtonActive = 1">
      <lock theme="filled" size="15" :fill="filterButtonActive ? '#ff4d4f' : '#5c5c5c'" strokeLinecap="butt" />
      私密作品
    </div>
  </div>
</template>

<style scoped>
.works-filter {
  display: flex;
  gap: 20px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.works-filter-button {
  border-radius: 8px;
  /* 圆角 */
  padding: 5px 10px;
  /* 内边距 */
  font-size: 14px;
  /* 字体大小 */
  font-weight: bold;
  /* 字体加粗 */
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
}

.works-filter-button.active {
  background-color: #ffcccc;
  /* 浅红色背景 */
  color: #ff3366;
  /* 深红色文字 */
  border: none;
  /* 无边框 */
}
</style>
