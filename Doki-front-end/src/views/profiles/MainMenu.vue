<script setup lang="ts">

import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import {reactive, ref} from "vue";
import 'dayjs/locale/zh-cn'


const pageData = reactive({
  user: {
    name: '楚门聊电影',
    handle: 'cmidy123',
    followers: '710.0万',
    likes: '7141.9万',
    ipLocation: '辽宁',
    age: 30,
    zodiac: '摩羯',
    bio: '“如果不再见你祝你早、午、晚都安”',
  },
  menu: [
    {title: '作品', count: 330, type: 'works'},
    {title: '推荐', count: 0, type: 'recommended'},
    {title: '喜欢', count: 0, type: 'likes'},
  ],
  subTabs: ['作品', '合集', '短剧'],
  works: [
    {
      title: '辣手神探',
      likes: '8.9万',
      description: '暴力版《无间道》是纯粹的...',
      image: 'path_to_image_1.jpg',
      rating: 8.9
    },
    {
      title: '喋血街头',
      likes: '3.6万',
      description: '为什么说吴宇森的这部作品...',
      image: 'path_to_image_2.jpg',
      rating: 8.5
    },
    {
      title: '烂赌英雄',
      likes: '31.1万',
      description: '二龙湖浩哥新剧爆笑来袭...',
      image: 'path_to_image_3.jpg',
      rating: 7.5
    },
    {
      title: '喋血双雄',
      likes: '8.5万',
      description: '终于理解吴宇森为何说...',
      image: 'path_to_image_4.jpg',
      rating: 9.2
    },
    {
      title: '英雄本色',
      likes: '11.9万',
      description: '真实的本色，回头的英雄！...',
      image: 'path_to_image_5.jpg',
      rating: 9.0
    },
    {
      title: '盲探',
      likes: '20.0万',
      description: '杜琪峰野心最大的一部作品...',
      image: 'path_to_image_6.jpg',
      rating: 8.8
    },
  ],
});
const currentClick = ref("works")

</script>

<template>
  <nav class="main-menu">
    <ul class="menu-list">
      <li v-for="item in pageData.menu"
          :key="item.type"
          class="menu-item"
          :class="{ active: item.type === currentClick }"
          @click="currentClick=item.type"
      >
        {{ item.title }} <span class="count">{{ item.count }}</span>
      </li>
    </ul>
    <div class="menu-actions">
      <a-input placeholder="搜索作品" size="small" style="width: 140px"></a-input>
      <a-date-picker
          v-model:value="value1"
          :locale="locale"
          style="width: 120px" placeholder="按日期筛选"/>
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
