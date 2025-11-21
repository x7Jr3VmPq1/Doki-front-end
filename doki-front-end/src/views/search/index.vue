<template>
  <!-- 全屏对话框位置 -->
  <div v-if="isModalVisible" class="fullscreen-box">
    <SwiperPlayer :start-with="state.startWith" :videos="videoInfos" :mode="1" @close="isModalVisible = false">
    </SwiperPlayer>
  </div>
  <div class="search-page">
    <header class="header">
      <div class="header-left">
        <nav class="nav-links">
          <a v-for="navItem in navItems" :key="navItem.id" :href="navItem.link"
            :class="['nav-item', { active: navItem.id === activeNavId }]" @click.prevent="setActiveNav(navItem.id)">
            {{ navItem.name }}
          </a>
        </nav>
      </div>
      <!-- <div class="header-right">
        <span class="filter-icon">筛选</span>
        <div class="search-box">
          <input type="text" placeholder="123" class="search-input" v-model="searchQuery" />
          <button class="search-button" @click="performSearch">搜一搜</button>
        </div>
      </div> -->
    </header>

    <div class="content-wrapper">
      <div class="main-content">
        <div v-if="activeNavId == 1">
          <!-- <div class="tag-filters">
            <span :class="['tag-item', { active: activeTagId === 0 }]" @click="setActiveTag(0)">
              全部
            </span>
            <div class="tag-group" ref="tagGroupRef">
              <span v-for="tag in tagFilters" :key="tag.id" :class="['tag-item', { active: tag.id === activeTagId }]"
                @click="setActiveTag(tag.id)">
                {{ tag.name }}
              </span>
            </div>
            <button class="scroll-btn scroll-left-btn" @click="scrollTags('left')">&lt;</button>
            <button class="scroll-btn scroll-right-btn" @click="scrollTags('right')">&gt;</button>
          </div> -->
          <div class="video-grid" v-if="videos.length > 0">
            <div v-for="(item, index) in videos" :key="item.video.id" class="video-card" @click="goToVideo(index)">
              <div class="video-thumbnail">
                <DokiVideoPre @click="handleClickVideo(index)" :manage="false" :item="item.video as videoInfoWithStat">
                </DokiVideoPre>
                <div class="duration">{{ dayUtils.formatSecondsToHHMMSS(item.video.videoDuration) }}</div>
                <!-- <div class="likes">
                  <Like></Like>
                  {{ item.video.statistics.likeCount }}
                </div> -->
                <div class="views">{{ item.video.statistics.viewCount }}</div>
              </div>
              <div class="video-info">
                <p class="title" v-html="item.highlight ?? item.video.title"></p>
                <div class="meta">
                  <span class="author">@ {{ item.video.user.username }}</span>
                  <span class="date">{{ dayUtils.formatTimestamp(item.video.publishTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-center empty" v-else>
            暂无更多
          </div>
        </div>
        <div v-if="activeNavId == 2">
          <Users></Users>
        </div>
        <!-- <div v-if="activeNavId == 3">
          直播页面（待开发）
        </div> -->
      </div>
      <aside class="related-searches">
        <h3>相关搜索</h3>
        <ul>
          <li v-for="relatedSearch in relatedSearches" :key="relatedSearch.id">
            <a :href="relatedSearch.link">{{ relatedSearch.query }}</a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, reactive, computed } from 'vue';
import Users from "./User.vue";
import { useRoute } from 'vue-router'
import { dayUtils } from "../../utils/dayUtils.ts";
import { Like } from '@icon-park/vue-next'
import SwiperPlayer from "../../components/player/index.vue";
import { handleRequest } from '../../api/handleRequest.ts';
import searchService from '../../api/searchService.ts';
import type { searchResult } from '../../api/searchService.ts';
import DokiVideoPre from '../../components/Doki-Video-Pre.vue';
import type { videoInfoWithStat } from '../../api/videoInfoService.ts';

const state = reactive({
  startWith: 0,
  keyword: '',
  isModalVisible: false,
});

interface NavItem {
  id: number;
  name: string;
  link: string;
}

interface TagFilter {
  id: number;
  name: string;
}

interface RelatedSearch {
  id: number;
  query: string;
  link: string;
}

const route = useRoute();
const keyword = ref(route.query.keyword as string || '');

const isModalVisible = ref(false);

watch(
  () => route.query.keyword,
  async (newKeyword) => {
    keyword.value = newKeyword as string || ''
    await handleRequest(searchService.search, {
      onSuccess: (data) => {
        videos.value = data;
      },
      params: newKeyword as string
    })

  },
  { immediate: true }
)
const activeNavId = ref(1);
const activeTagId = ref(0);

const navItems = ref<NavItem[]>([]);
const tagFilters = ref<TagFilter[]>([]);
const videos = ref<searchResult[]>([]);
const relatedSearches = ref<RelatedSearch[]>([]);

const videoInfos = computed(() => {
  return videos.value.map(item => item.video)
})

const tagGroupRef = ref<HTMLElement | null>(null);
const showScrollLeft = ref(false);
const showScrollRight = ref(false);


const handleClickVideo = (index: number) => {
  state.startWith = index;
  isModalVisible.value = true;
};

const checkScrollButtonsVisibility = () => {
  if (tagGroupRef.value) {
    const { scrollWidth, clientWidth, scrollLeft } = tagGroupRef.value;
    showScrollLeft.value = scrollLeft > 0;
    showScrollRight.value = scrollWidth - clientWidth - scrollLeft > 1;
  }
};

const scrollTags = (direction: 'left' | 'right') => {
  if (tagGroupRef.value) {
    const scrollAmount = 200;
    tagGroupRef.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }
};

const loadMockData = () => {
  navItems.value = [
    { id: 1, name: '视频', link: '#' },
    { id: 2, name: '用户', link: '#' },
    // { id: 3, name: '直播', link: '#' },
  ];

  tagFilters.value = [
    { id: 1, name: '搞笑' },
    { id: 2, name: '2是什么意思' },
    { id: 3, name: '画师' },
    { id: 4, name: '写字' },
    { id: 5, name: '咧嘴' },
    { id: 6, name: '45路公交车' },
    { id: 7, name: 'stella' },
    { id: 8, name: '布兰妮' },
    { id: 9, name: '开团是什么梗' },
    { id: 10, name: '第3...' },
    { id: 11, name: '热门推荐' },
    { id: 12, name: '最新发布' },
    { id: 13, name: '电影解说' },
    { id: 14, name: '游戏攻略' },
    { id: 15, name: '美食教程' },
    { id: 16, name: 'Vlog日常' },
    { id: 17, name: '科技数码' },
    { id: 18, name: '音乐现场' },
  ];

  relatedSearches.value = [
    { id: 1, query: '123 fit健身', link: '#' },
    { id: 2, query: '123夫人', link: '#' },
    { id: 3, query: '123数字歌', link: '#' },
    { id: 4, query: '123什么意思', link: '#' },
    { id: 5, query: '123木头人韩国游戏', link: '#' },
    { id: 6, query: '123朋友', link: '#' },
    { id: 7, query: '123谁最爱你', link: '#' },
    { id: 8, query: '123木头人vs一二三木头人游戏', link: '#' },
    { id: 9, query: '123手工坊', link: '#' },
    { id: 10, query: '123木头人第一视角', link: '#' },
  ];
};

// Lifecycle hooks (unchanged)
onMounted(() => {
  loadMockData();
  nextTick(() => {
    if (tagGroupRef.value) {
      tagGroupRef.value.addEventListener('scroll', checkScrollButtonsVisibility);
    }
    checkScrollButtonsVisibility();
  });
  window.addEventListener('resize', checkScrollButtonsVisibility);
});

onUnmounted(() => {
  if (tagGroupRef.value) {
    tagGroupRef.value.removeEventListener('scroll', checkScrollButtonsVisibility);
  }
  window.removeEventListener('resize', checkScrollButtonsVisibility);
});

const setActiveNav = (id: number) => {
  activeNavId.value = id;
};

const setActiveTag = (id: number) => {
  activeTagId.value = id;
};

const performSearch = () => {
};

const videoIndex = ref(0);
const goToVideo = (index: number) => {
  isModalVisible.value = true;
  nextTick(() => {
    videoIndex.value = index;
  });
};

const handleClose = () => {
  isModalVisible.value = false;
};
</script>


<style scoped>
.fullscreen-modal {
  position: fixed;
  background-color: #fff;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .close-icon {
    position: absolute;
    top: 20px;
    left: 20px;
    cursor: pointer;
    font-size: 20px;
    color: black;
    transition: color 0.3s;
    z-index: 10000;
  }
}

.search-page {
  height: 100%;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 0px 20px 20px 20px;
  margin: 0 auto;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  z-index: 10;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-right: 20px;
}

.nav-links {
  display: flex;
}

.nav-item {
  text-decoration: none;
  color: #666;
  padding: 5px 15px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.active {
  color: #000;
  font-weight: bold;
  position: relative;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #f00;
  border-radius: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.filter-icon {
  margin-right: 15px;
  color: #666;
  cursor: pointer;
}

.search-box {
  display: flex;
  border: 1px solid #ccc;
  border-radius: 20px;
  overflow: hidden;
  height: 36px;
}

.search-input {
  border: none;
  padding: 0 15px;
  outline: none;
  flex-grow: 1;
  font-size: 14px;
  width: 180px;
}

.search-button {
  background-color: #f0f0f0;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.3s;
}

.search-button:hover {
  background-color: #e0e0e0;
}

.content-wrapper {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  gap: 20px;
  box-sizing: border-box;
}


.main-content {
  flex-grow: 1;
  overflow-y: auto;
}

.tag-filters {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  position: relative;
  gap: 10px;
  flex-shrink: 0;
}

.tag-label {
  background-color: #f0f0f0;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.tag-item {
  background-color: #f0f0f0;
  color: #666;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.tag-item.active {
  background-color: #ff4d4f;
  color: #fff;
  font-weight: bold;
}

.tag-group {
  display: flex;
  gap: 10px;
  white-space: nowrap;
  flex-grow: 1;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tag-group::-webkit-scrollbar {
  display: none;
}

.scroll-btn {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.scroll-btn:hover {
  background-color: #e0e0e0;
}

.video-grid {
  overflow-y: auto;
  height: 70vh;
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.video-card {
  flex: 0 0 calc(25% - 15px);
  flex-basis: calc(25% - 15px);
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  box-sizing: border-box;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  overflow: hidden;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duration,
.views {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.duration {
  bottom: 8px;
  right: 8px;
}

.views {
  top: 8px;
  left: 8px;
}

.likes {
  position: absolute;
  color: #fff;
  bottom: 8px;
  left: 20px;
}

.video-info {
  padding: 10px;
}

.video-info .title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
}

.video-info .meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.related-searches {
  flex-shrink: 0;
  width: 280px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.related-searches h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.related-searches ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-searches li {
  margin-bottom: 10px;
}

.related-searches a {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  transition: color 0.3s;
}

.related-searches a:hover {
  color: #000;
  text-decoration: underline;
}


@media (max-width: 1200px) {
  .video-card {
    flex-basis: calc(33.333% - 13.333px);
  }
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
  }

  .main-content {
    margin-bottom: 20px;
  }

  .related-searches {
    width: 100%;
  }

  .video-card {
    flex-basis: calc(50% - 10px);
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 10px;
    width: 100%;
    justify-content: flex-end;
  }

  .search-box {
    width: 100%;
  }

  .search-input {
    width: auto;
  }

  .video-card {
    flex-basis: 100%;
    /* 1 column */
  }

  .scroll-btn {
    display: none;
  }
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
  z-index: 20;
  /* 确保在最上层 */
  background-color: white;
  /* 可选，避免透明背景显示 */
}

.empty {
  text-align: center;
  color: #888;
  margin-top: 20px;
}
</style>
