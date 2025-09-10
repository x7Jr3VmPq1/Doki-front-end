<script setup lang="ts">
import {reactive, ref} from 'vue';
import {Lock} from '@icon-park/vue-next'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'                        // 引入 dayjs 中文
dayjs.locale('zh-cn')

const filterButtonActive = ref(0); // 作品类型过滤
const currentClick = ref("works")
// 页面数据，这里只包含图片中有的部分
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
</script>

<template>
  <div class="profile-page">
    <header class="header">
      <div class="user-card">
        <div class="avatar-container">
          <img src="http://localhost:8081/avatars/defaultAvatar.png" alt="User Avatar" class="avatar"/>
        </div>
        <div class="user-info">
          <h1 class="user-name">{{ pageData.user.name }}</h1>
          <div class="stats">
            <div class="stat-item">关注 <span class="stat-value">{{ pageData.user.followers }}</span></div>
            <div class="stat-item">粉丝 <span class="stat-value">{{ pageData.user.followers }}</span></div>
            <div class="stat-item">获赞 <span class="stat-value">{{ pageData.user.likes }}</span></div>
          </div>
          <div class="user-bio">
            {{ pageData.user.bio }}
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-button share-button">分享主页</button>
      </div>
    </header>

    <div class="user-details-row">
      <div class="user-action-buttons">
        <button class="action-button follow-button">
          <span class="follow-icon">+</span> 关注
        </button>
        <button class="action-button private-message-button">私信</button>
      </div>
    </div>


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

    <div class="works-filter">
      <div class="works-filter-button" :class="{active:filterButtonActive == 0}" @click="filterButtonActive = 0">作品
      </div>
      <div class="works-filter-button" :class="{active:filterButtonActive == 1}" @click="filterButtonActive = 1">
        <lock theme="filled" size="15"
              :fill="filterButtonActive ?  '#ff4d4f': '#5c5c5c'"
              strokeLinecap="butt"/>
        私密作品
      </div>
    </div>
    <div class="works-grid">

      <div v-for="work in 20" class="work-card">
        <div class="image-container">
          <img src="http://localhost:8081/cat.jpeg" alt="" class="work-image"/>
        </div>
        <div class="work-description">{{ "这是视频的描述..." }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整个页面容器的样式 */


::-webkit-scrollbar {
  display: none;
}

.profile-page {
  height: 100%;
  width: 95%;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 20px;
  margin: 0 auto;
  border-radius: 10px;
  overflow-y: auto;
}


/* 顶部用户卡片和操作按钮的样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-card {
  display: flex;
  align-items: center;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.stats {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.header-actions .action-button {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

/* 用户详细信息行 */
.user-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-action-buttons {
  width: 100%;
  justify-content: flex-end;
  display: flex;
  gap: 10px;
}

.user-action-buttons .action-button {
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.follow-button {
  background-color: #fe2c55;
  color: #fff;
}

.private-message-button {
  background-color: #e0e0e0;
  color: #333;
}

/* 用户签名 */
.user-bio {
  height: 30px;
  line-height: 30px;
  text-align: start; /* 水平居中 */
  font-size: 14px;
  color: #666;
}

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

.works-filter {
  display: flex;
  gap: 20px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.works-filter-button {
  border-radius: 8px; /* 圆角 */
  padding: 5px 10px; /* 内边距 */
  font-size: 14px; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
}

.works-filter-button.active {
  background-color: #ffcccc; /* 浅红色背景 */
  color: #ff3366; /* 深红色文字 */
  border: none; /* 无边框 */
}

/* 作品网格布局 */
.works-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

/* 单个作品卡片样式 */
.work-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.image-container {
  aspect-ratio: 3 / 4; /* 宽高比 3:4 */
  position: relative;
  width: 100%;
  overflow: hidden;
}

.work-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-description {
  color: #666;
  margin-top: 5px;
  overflow: hidden;
}
</style>
