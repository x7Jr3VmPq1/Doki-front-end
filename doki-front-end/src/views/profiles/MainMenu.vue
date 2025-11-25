<script setup lang="ts">

import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { useUserStore } from "../../store/userInfoStore";
import { onMounted, reactive, computed, ref, watch } from "vue";
import type { UserStatistics } from '../../api/analyticsService.ts'

import 'dayjs/locale/zh-cn'
const userStore = useUserStore();
const props = defineProps<{
  userId: number,
  stat: UserStatistics
}>();

const emit = defineEmits<{
  (e: 'changeTab', value: string): string
}>();


const baseMenu = computed(() => [
  { title: '作品', count: props.stat?.worksCount ?? 0, type: 'works' },
  { title: '喜欢', count: props.stat?.likeCount ?? 0, type: 'likes' },
  { title: '收藏', count: props.stat?.favoriteCount ?? 0, type: 'favorites' },
]);

const extraMenu = ref<any>([]);

onMounted(() => {
  if (props.userId === userStore.userInfo.id) {
    extraMenu.value.push({ title: '历史观看', count: 0, type: 'history' });
  }
});

const pageData = computed(() => ({
  menu: [...baseMenu.value, ...extraMenu.value],
}));

const currentClick = ref("works")

const searchInput = ref("")
const dateSelected = ref(null)


const handleClickTab = (type: string) => {
  currentClick.value = type;
}

watch(() => currentClick.value, (newValue) => {
  emit('changeTab', newValue);
})
</script>

<template>
  <nav class="main-menu">
    <ul class="menu-list">
      <li v-for="item in pageData.menu" :key="item.type" class="menu-item"
        :class="{ active: item.type === currentClick }" @click="handleClickTab(item.type)">
        <div>
          {{ item.title }} <span class="count">{{ item.count }}</span>
        </div>
      </li>
    </ul>
    <div class="menu-actions">
      <a-input placeholder="搜索作品" size="small" style="width: 140px" v-model:value="searchInput"></a-input>
      <a-date-picker v-model:value="dateSelected" :locale="locale" style="width: 120px" placeholder="按日期筛选" />
    </div>
  </nav>
</template>

<style scoped>
/* 主菜单和子菜单的样式 */
.main-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 15px;
  position: relative;
}

.menu-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  font-size: 16px;
  color: #666;
}

.menu-item.active {
  font-weight: bold;
  color: #333;
}

.menu-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background-color: #fe2c55;
  border-radius: 2px;
}

.menu-actions {
  display: flex;
  gap: 20px;
  color: #999;
}
</style>
