<template>
  <div class="sidebar-menu">
    <div
        v-for="item in menuItemsTop"
        :key="item.key"
        :class="['menu-item', { 'is-selected': selectedKey === item.key }]"
        @click="selectItem(item.key)"
    >
      <div class="icon-placeholder">
        <component :is="item.icon" :size="24"></component>
      </div>
      <span class="menu-label">{{ item.label }}</span>
    </div>

    <div class="divider"></div>

    <div
        v-for="item in menuItemsMiddle"
        :key="item.key"
        :class="['menu-item', { 'is-selected': selectedKey === item.key }]"
        @click="selectItem(item.key)"
    >
      <div class="icon-placeholder">
        <component :is="item.icon" :size="24"></component>
      </div>
      <span class="menu-label">{{ item.label }}</span>
    </div>

    <div class="divider"></div>

    <div
        v-for="item in menuItemsBottom"
        :key="item.key"
        :class="['menu-item', { 'is-selected': selectedKey === item.key }]"
        @click="selectItem(item.key)"
    >
      <div class="icon-placeholder">
        <component :is="item.icon" :size="24"></component>
      </div>
      <span class="menu-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref,} from 'vue';
import type {ComponentPublicInstance} from 'vue';
import {Fireworks, PersonalCollection, Me, PeoplePlus, Tv} from '@icon-park/vue-next'
import router from "../router";

// 定义菜单项的接口
interface MenuItem {
  key: string;
  label: string;
  icon?: ComponentPublicInstance | any;
}

// 顶部菜单项
const menuItemsTop: MenuItem[] = [
  {key: 'home', label: '推荐', icon: Fireworks},
];

// 中部菜单项
const menuItemsMiddle: MenuItem[] = [
  {key: 'followed', label: '关注', icon: PeoplePlus},
  {key: 'friends', label: '朋友', icon: PersonalCollection},
  {key: 'my', label: '我的', icon: Me},
];

// 底部菜单项
const menuItemsBottom: MenuItem[] = [
  // {key: 'live-stream', label: '直播', icon: Tv},
];

// 默认选中的菜单项，这里设置为 'my' 以匹配图片
const selectedKey = ref<string>('home');

const selectItem = (key: string) => {
  selectedKey.value = key;
  // 可以在这里添加路由跳转或其他逻辑
  router.push(`/${key}`);
};
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: #333;
  padding: 16px 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); /* 轻微阴影 */
  border-right: 1px solid #eee;
  box-sizing: border-box; /* 确保padding和border不增加额外宽度 */
  transition: all 0.3s ease;
}

.menu-item {
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 16px;
  color: #333;
  position: relative; /* 为了live-tag定位 */
  box-sizing: border-box;
}

.menu-item:hover {
  background-color: #f5f5f5;
  border-radius: 10px; /* 轻微圆角 */
}

/* 选中项的样式 */
.menu-item.is-selected {
  font-weight: bold;
  background-color: #f0f0f0; /* 选中时的背景色 */
  color: #333; /* 选中时文字颜色不变 */
  border-radius: 10px; /* 轻微圆角 */
}


.icon-placeholder {
  width: 24px; /* 图标占位符大小 */
  height: 24px;
  border-radius: 50%; /* 圆形图标 */
  margin-right: 12px; /* 图标与文字间距 */
  flex-shrink: 0; /* 防止图标被压缩 */
  display: flex; /* 让其内容居中，虽然目前没有内容 */
  align-items: center;
  justify-content: center;
}

.live-tag {
  background-color: #f00;
  color: #fff;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 3px;
  margin-left: 8px; /* 与文字的距离 */
  font-weight: bold;
}

.divider {
  height: 1px;
  background-color: #eee;
  margin: 16px 20px; /* 分隔线上下的间距和左右内缩 */
}

.menu-label {
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar-menu {
    padding: 16px 8px;
  }

  .menu-item {
    padding: 10px 15px;
    font-size: 14px;
  }

  .icon-placeholder {
    margin-right: 8px;
  }

  .menu-label {
    display: none; /* 隐藏文字，只显示图标 */
  }

}

@media (max-width: 768px) {
  .sidebar-menu {
    padding: 16px 5px;
  }

  .menu-item {
    padding: 10px 8px;
    justify-content: center;
  }

  .menu-label {
    display: none; /* 隐藏文字，只显示图标 */
  }

  .icon-placeholder {
    margin-right: 0;
  }

  .divider {
    margin: 16px 8px;
  }
}

@media (max-width: 480px) {
  .sidebar-menu {
    padding: 12px 4px;
  }

  .menu-item {
    padding: 8px 4px;
    margin-bottom: 8px;
  }

  .divider {
    margin: 12px 4px;
  }

  .menu-label {
    display: none; /* 隐藏文字，只显示图标 */
  }

}
</style>
