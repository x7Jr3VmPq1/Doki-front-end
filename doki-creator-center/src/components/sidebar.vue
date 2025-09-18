<template>
  <aside class="sidebar-container">
    <div class="title">
      <h3>欢迎来到创作中心!</h3>
    </div>
    <div class="publish-button-wrapper">
      <div class="publish-button">
        <div>投稿</div>
        <component :is="AddFour" size="20" class="plus"></component>
      </div>
    </div>

    <nav class="menu-list">
      <div v-for="item in menuItems" :key="item.name">
        <div
            :class="['menu-item', { 'has-children': item.children}]"
            @click="item.children? toggleMenu(item): route.push(item.path)"
        >
          <component :is="item.icon" size="20"></component>
          <span>{{ item.name }}</span>
          <span v-if="item.children" :class="['toggle-arrow', { 'is-open': item.isExpanded }]">
            <span v-if="item.isExpanded">
              <down theme="outline" size="20" fill="#333"/>
            </span>
            <span v-else>
              <down theme="outline" size="20" fill="#333"/>
            </span>
          </span>
        </div>

        <Transition name="slide-fade">
          <ul v-if="item.children && item.isExpanded" class="sub-menu-list">
            <li v-for="child in item.children" :key="child.name"
                @click="route.push(child.path)"
                class="sub-menu-item">
              {{ child.name }}
            </li>
          </ul>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import {ref, shallowRef} from 'vue';
import {Down, Home, Monitor, Analysis, Peoples, AddFour} from '@icon-park/vue-next';
import route from '../router/router.js';
// 菜单数据结构
// name: 菜单项名称
// isExpanded: 是否展开，用于控制子菜单的显示与隐藏
// children: 子菜单数组，如果存在则为可折叠菜单
const menuItems = ref([
  {
    name: '首页',
    icon: shallowRef(Home),
    path: '/home'
  },
  {
    name: '内容管理',
    icon: shallowRef(Monitor),
    isExpanded: false,
    children: [
      {name: '作品管理', path: '/content/manage'},
    ]
  },
  {
    name: '互动管理',
    icon: shallowRef(Peoples),
    isExpanded: false,
    children: [
      {name: '关注管理', path: '/social/follow'},
      {name: '粉丝管理', path: '/social/fans'},
      {name: '评论管理', path: '/social/comments'},
      {name: '弹幕管理', path: '/social/danmaku'},
      {name: '私信管理', path: '/social/message'}]
  },
  {
    name: '数据中心',
    icon: shallowRef(Analysis),
    isExpanded: false,
    children: [{name: '账号总览', path: '/stats/views'}, {name: '作品分析', path: '/stats/analytics'}]
  },
]);

// 切换菜单展开/收起状态的函数
const toggleMenu = (item) => {
  if (item.children) {
    item.isExpanded = !item.isExpanded;
  }
};
</script>

<style scoped>
/* 整个侧边栏容器 */
.sidebar-container {
  font-size: 14px;
  width: 230px;
  min-height: 100vh;
  background-color: #f2f2f4;
  color: #777880;
  padding: 10px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.title {
  padding: 20px 40px;
}

/* 顶部发布按钮部分 */
.publish-button-wrapper {
  display: flex;
}

.publish-button {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 150px;
  background-color: #ff3c69;
  color: #fff;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0 auto;
}

.publish-button .plus {
  transform: translateY(2px); /* 根据视觉效果微调 */
}

.publish-button:hover {
  background-color: #e5355e;
}

/* 菜单列表样式 */
.menu-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.menu-item.active {
  font-weight: bold;
}

/* 所有菜单项的通用样式 */
.menu-item, .sub-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 12px 15px 12px 40px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.1s, color 0.1s;
  user-select: none;
  margin: 0 auto;
}


.menu-item.has-children .toggle-arrow {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  transition: transform 0.3s;
}

/* 箭头旋转效果 */
.menu-item.has-children .toggle-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

/* 子菜单列表容器 */
.sub-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 子菜单项样式 */
.sub-menu-item {
  padding-left: 70px;
  font-size: 13px;
  color: #777;
}

/* --- 动画部分 --- */
/*
  使用 max-height 动画
  它允许从 0 展开到一个足够大的值，实现平滑的收起和展开效果，
  并且可以适应不同数量的子菜单项。
*/
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: max-height 0.2s ease-in-out;
  overflow: hidden; /* 隐藏溢出的内容 */
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 500px; /* 设置一个足够大的值以覆盖所有子项的高度 */
}
</style>
