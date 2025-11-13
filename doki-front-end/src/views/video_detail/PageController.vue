<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

// 分页控制器
const props = defineProps<{
  totalCount: number,
  pageSize?: number,
  currentPage?: number  // 外部传入的页码（可选）
}>()


const emit = defineEmits<{
  changePage: [page: number]
}>()

const state = reactive({
  totalPages: computed(() => Math.ceil(props.totalCount / (props.pageSize || 5))),
  currentPage: 1,
});


// 外部控制模式：监听 props.currentPage
watch(
  () => props.currentPage,
  (newVal) => {
    if (newVal !== undefined) {
      state.currentPage = newVal;
    }
  },
  { immediate: true }
);


// 监听总页数变化，如果当前页超过总页数，重置为第一页
watch(() => state.totalPages, (newTotalPages) => {
  if (state.currentPage > newTotalPages) {
    state.currentPage = 1;
  }
});

// 处理页码点击
const handleChangePage = (page: number) => {
  if (page < 1 || page > state.totalPages || page === state.currentPage) {
    return;
  }
  state.currentPage = page;
  emit('changePage', page);
}

// 计算要显示的页码
const displayPages = computed(() => {
  const pages: (number | string)[] = [];
  const totalPages = state.totalPages;
  const currentPage = state.currentPage;

  if (totalPages <= 10) {
    // 10页及以下，显示全部页码
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 大于10页，显示复杂分页
    pages.push(1); // 总是显示第一页

    if (currentPage <= 5) {
      // 当前页靠近开头 (1-5)
      for (let i = 2; i <= Math.min(7, totalPages - 1); i++) {
        pages.push(i);
      }
      if (totalPages > 8) {
        pages.push('...');
      }
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 4) {
      // 当前页靠近结尾 (最后5页)
      pages.push('...');
      for (let i = Math.max(2, totalPages - 6); i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else {
      // 当前页在中间
      pages.push('...');
      for (let i = currentPage - 3; i <= currentPage + 3; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      pages.push('...');
      pages.push(totalPages);
    }
  }

  return pages;
});

// 上一页
const prevPage = () => {
  handleChangePage(state.currentPage - 1);
}

// 下一页
const nextPage = () => {
  handleChangePage(state.currentPage + 1);
}
</script>

<template>
  <div class="page-controller">
    <!-- 上一页 -->
    <button class="page-btn" :disabled="state.currentPage === 1" @click="prevPage">
      上一页
    </button>

    <!-- 页码 -->
    <span v-for="(page, index) in displayPages" :key="index" class="page-item" :class="{
      'current': page === state.currentPage,
      'ellipsis': page === '...'
    }">
      <a v-if="page !== '...'" @click="handleChangePage(page as number)">
        {{ page }}
      </a>
      <span v-else>...</span>
    </span>

    <!-- 下一页 -->
    <button class="page-btn" :disabled="state.currentPage === state.totalPages" @click="nextPage">
      下一页
    </button>

    <!-- 页面信息 -->
    <span class="page-info">
      第 {{ state.currentPage }} 页 / 共 {{ state.totalPages }} 页
    </span>
  </div>
</template>

<style scoped>
.page-controller {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  font-family: Arial, sans-serif;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-item {
  display: inline-block;
}

.page-item a {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  min-width: 36px;
  text-align: center;
}

.page-item a:hover {
  background: #f5f5f5;
}

.page-item.current a {
  background: #ff3c69;
  color: white;
  border-color: #ff3c69;
}

.page-item.ellipsis {
  padding: 6px 8px;
  color: #999;
}
</style>