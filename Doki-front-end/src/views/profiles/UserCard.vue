<script setup lang="ts">
import {reactive} from "vue";

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
</template>

<style scoped>
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

/* 用户签名 */
.user-bio {
  height: 30px;
  line-height: 30px;
  text-align: start; /* 水平居中 */
  font-size: 14px;
  color: #666;
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

</style>
