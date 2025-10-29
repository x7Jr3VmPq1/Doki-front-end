<script setup lang="ts">
import { reactive, onMounted, ref, watch } from 'vue';
import videoInfoService from '../../api/videoInfoService.ts'
import type { videoInfoWithStat } from '../../api/videoInfoService.ts'
import type { VideoInfo } from '../../api/feedService.ts'
import { handleRequest } from '../../api/handleRequest.ts';
import DokiLoading from '../../components/Doki-Loading.vue';
import { useInfiniteScroll } from '../../utils/infiniteScroll.ts'
import DokiVideoPre from '../../components/Doki-Video-Pre.vue';
import SwiperPlayer from '../../components/player/index.vue';
// 定义组件属性
const props = defineProps<{
  userId: number, // 用户ID
  tab: string // 当前的tab，可以是works,likes,favorites,history
}>();

const cursor = ref<string | null>(null);
const hasMore = ref(true);
const worksArea = ref<HTMLElement | null>(null);
const loadMore = ref<HTMLElement | null>(null);
const loading = ref(true);
const isModalVisible = ref(false);


watch(() => props.tab, (_) => {
  userWorks.list = [];
  cursor.value = null;
  hasMore.value = true;
  loadMoreWorks();
})

let requestId = 0;
const loadMoreWorks = async () => {

  if (!hasMore.value) {
    return;
  }

  let requestFn = null;
  switch (props.tab) {
    case 'works': requestFn = videoInfoService.getVideosInfoByUserId;
      break;
    case 'likes': requestFn = videoInfoService.getLikeVideosInfoByUserId;
      break;
    default: return;
  }
  const currentRequest = ++requestId;
  loading.value = true;
  await handleRequest(requestFn, {
    onSuccess(data) {
      if (currentRequest !== requestId) {
        return;
      }
      userWorks.list.push(...data.list);
      cursor.value = data.cursor;
      hasMore.value = data.hasMore;
    }, params: {
      tid: props.userId,
      cursor: cursor.value
    },
    delay: 500
  })

  if (currentRequest === requestId) {
    loading.value = false;
  }
}

onMounted(async () => {
  useInfiniteScroll(loadMoreWorks, loadMore, worksArea)
  await loadMoreWorks();
})
const userWorks = reactive({
  list: [] as videoInfoWithStat[]
})
const startWith = ref(0);
const handleClickPre = (index: number) => {
  isModalVisible.value = true;
  startWith.value = index;
}
</script>

<template>
  <div v-if="isModalVisible" class="fullscreen-box">
    <SwiperPlayer :start-with="startWith" :videos="userWorks.list" :mode="1" @close="isModalVisible = false">
    </SwiperPlayer>
  </div>
  <div ref="worksArea" class="main">
    <div class="works-grid">
      <div v-for="(item, index) in userWorks.list" class="work-card">
        <div class="image-container">
          <DokiVideoPre :item="item" @click="handleClickPre(index)"></DokiVideoPre>
        </div>
        <div class="work-description">{{ item.title }}</div>
      </div>
    </div>

    <div class="flex-center">
      <DokiLoading v-if="loading"></DokiLoading>
    </div>

    <!-- 加载标记 -->
    <div ref=loadMore v-show="!loading"></div>

    <div v-if="!hasMore && !loading" style="height: 100px;color: grey;" class="flex-center">没有更多了</div>

  </div>


</template>

<style scoped>
.main {
  height: 100%;
  overflow-y: auto;
}

/* 作品网格布局 */
.works-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

/* 单个作品卡片样式 */
.work-card {
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.image-container {
  aspect-ratio: 3 / 4;
  /* 宽高比 3:4 */
  position: relative;
  width: 100%;
  overflow: hidden;
}


.work-description {
  color: #666;
  margin-top: 5px;
  overflow: hidden;
}

.fullscreen-box {
  position: fixed;
  /* 固定在窗口，不随滚动移动 */
  top: 0;
  left: 0;
  width: 100vw;
  /* 覆盖整个宽度 */
  height: 100vh;
  /* 覆盖整个高度 */
  z-index: 9999;
  /* 确保在最上层 */
  background-color: white;
  /* 可选，避免透明背景显示 */
}
</style>
