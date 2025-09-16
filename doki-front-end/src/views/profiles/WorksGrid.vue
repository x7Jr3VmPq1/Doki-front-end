<script setup lang="ts">

</script>

<template>
  <div class="works-grid">

    <div v-for="work in 20" class="work-card">
      <div class="image-container">
        <img src="http://localhost:8081/cat.jpeg" alt="" class="work-image"/>
      </div>
      <div class="work-description">{{ "这是视频的描述..." }}</div>
    </div>
  </div>

</template>

<style scoped>
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
