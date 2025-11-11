<script lang="ts" setup>

import { computed, reactive } from 'vue';

// 分页控制器
const props = defineProps<{
  totalCount: number,
}>()

const state = reactive({
  totalPages: Math.ceil(props.totalCount / 10),
  currentPage: 1,
});

// 处理页码点击
const handleChangePage = (page: number) => {
  console.log('切换到第', page, '页');
  // 这里可以发出事件，通知父组件切换页码
  // emit('changePage', page);
}


// 计算要显示的页码


</script>

<template>
  <div class="page-controller">
    <!-- 渲染页码，只显示当前页附近的页码 -->
    <span v-for="page in state.totalPages" :key="page">
      <a @click="handleChangePage(page)">
        {{ page }}
      </a>
    </span>
  </div>
</template>

<style scoped>
.page-controller {
  margin: 20px 0;
}

span {
  margin: 0 5px;
  cursor: pointer;
  color: black;
}

span :hover {
  text-decoration: underline;
  color: #ff3c69
}
</style>