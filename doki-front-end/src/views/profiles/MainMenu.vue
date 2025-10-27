<script setup lang="ts">

import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { useUserStore } from "../../store/userInfoStore";
import { onMounted, reactive, ref } from "vue";
import 'dayjs/locale/zh-cn'
const userStore = useUserStore();
const props = defineProps<{
  userId: number
}>();
const pageData = reactive({
  menu: [
    { title: '作品', count: 330, type: 'works' },
    { title: '喜欢', count: 0, type: 'likes' },
    { title: '收藏', count: 12, type: 'favorites' },
  ],
});

onMounted(() => {
  if (props.userId === userStore.userInfo.id) {
    pageData.menu.push({ title: '历史观看', count: 45, type: 'history' });
  }
});
const currentClick = ref("works")

const searchInput = ref("")
const dateSelected = ref(null)

</script>

<template>
  <nav class="main-menu">
    <ul class="menu-list">
      <li v-for="item in pageData.menu" :key="item.type" class="menu-item"
        :class="{ active: item.type === currentClick }" @click="currentClick = item.type">
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
