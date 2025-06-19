<template>
  <div class="search-page">
    <header class="header">
      <div class="header-left">
        <nav class="nav-links">
          <a
              v-for="navItem in navItems"
              :key="navItem.id"
              :href="navItem.link"
              :class="['nav-item', { active: navItem.id === activeNavId }]"
              @click.prevent="setActiveNav(navItem.id)"
          >
            {{ navItem.name }}
          </a>
        </nav>
      </div>
      <div class="header-right">
        <span class="filter-icon">筛选</span>
        <div class="search-box">
          <input type="text" placeholder="123" class="search-input" v-model="searchQuery"/>
          <button class="search-button" @click="performSearch">搜一搜</button>
        </div>
      </div>
    </header>
    <div class="content-wrapper">
      <div class="main-content">
        <div v-if="activeNavId == 1">
          <div class="tag-filters">
          <span
              :class="['tag-item', { active: activeTagId === 0 }]"
              @click="setActiveTag(0)"
          >
            全部
          </span>


            <div class="tag-group" ref="tagGroupRef">
            <span
                v-for="tag in tagFilters"
                :key="tag.id"
                :class="['tag-item', { active: tag.id === activeTagId }]"
                @click="setActiveTag(tag.id)"
            >
              {{ tag.name }}
            </span>
            </div>
            <button class="scroll-btn scroll-left-btn" @click="scrollTags('left')">&lt;</button>
            <button class="scroll-btn scroll-right-btn" @click="scrollTags('right')">&gt;</button>
          </div>
          <div class="video-grid">
            <div v-for="video in videos" :key="video.id" class="video-card">
              <div class="video-thumbnail">
                <img :src="video.thumbnailUrl" :alt="video.title"/>
                <div class="duration">{{ video.duration }}</div>
                <div class="views">{{ video.views }}</div>
              </div>
              <div class="video-info">
                <p class="title">{{ video.title }}</p>
                <div class="meta">
                  <span class="author">@ {{ video.author }}</span>
                  <span class="date">{{ video.uploadDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="activeNavId == 2">
          <Users></Users>
        </div>
        <div v-if="activeNavId == 3">
          直播页面（待开发）
        </div>
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
import {ref, onMounted, onUnmounted, nextTick} from 'vue';
import Users from "./users.vue";

// Interfaces for data types (unchanged)
interface NavItem {
  id: number;
  name: string;
  link: string;
}

interface TagFilter {
  id: number;
  name: string;
}

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  author: string;
  uploadDate: string;
}

interface RelatedSearch {
  id: number;
  query: string;
  link: string;
}

// Reactive state variables (unchanged)
const activeNavId = ref(1);
const activeTagId = ref(0);
const searchQuery = ref('');

const navItems = ref<NavItem[]>([]);
const tagFilters = ref<TagFilter[]>([]);
const videos = ref<Video[]>([]);
const relatedSearches = ref<RelatedSearch[]>([]);

// Refs for scrolling functionality (unchanged)
const tagGroupRef = ref<HTMLElement | null>(null);
const showScrollLeft = ref(false);
const showScrollRight = ref(false);

// Function to check and update button visibility (unchanged)
const checkScrollButtonsVisibility = () => {
  if (tagGroupRef.value) {
    const {scrollWidth, clientWidth, scrollLeft} = tagGroupRef.value;
    showScrollLeft.value = scrollLeft > 0;
    showScrollRight.value = scrollWidth - clientWidth - scrollLeft > 1;
  }
};

// Function to scroll tags (unchanged)
const scrollTags = (direction: 'left' | 'right') => {
  if (tagGroupRef.value) {
    const scrollAmount = 200;
    tagGroupRef.value.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }
};

// Mock data loading function (unchanged)
const loadMockData = () => {
  navItems.value = [
    {id: 1, name: '视频', link: '#'},
    {id: 2, name: '用户', link: '#'},
    {id: 3, name: '直播', link: '#'},
  ];

  tagFilters.value = [
    {id: 1, name: '搞笑'},
    {id: 2, name: '2是什么意思'},
    {id: 3, name: '画师'},
    {id: 4, name: '写字'},
    {id: 5, name: '咧嘴'},
    {id: 6, name: '45路公交车'},
    {id: 7, name: 'stella'},
    {id: 8, name: '布兰妮'},
    {id: 9, name: '开团是什么梗'},
    {id: 10, name: '第3...'},
    {id: 11, name: '热门推荐'},
    {id: 12, name: '最新发布'},
    {id: 13, name: '电影解说'},
    {id: 14, name: '游戏攻略'},
    {id: 15, name: '美食教程'},
    {id: 16, name: 'Vlog日常'},
    {id: 17, name: '科技数码'},
    {id: 18, name: '音乐现场'},
  ];

  videos.value = [
    {
      id: 1,
      title: '打宜昌',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+1',
      duration: '00:33',
      views: '4099',
      author: '123',
      uploadDate: '1天前'
    },
    {
      id: 2,
      title: '美丽的东西没梗！#抖音热歌#好歌推荐#经典老歌#百听不...',
      thumbnailUrl: 'http://localhost:8081/avatars/202300803-ProjectSEKAI-HatsuneMiku.jpg',
      duration: '00:56',
      views: '8403',
      author: '123',
      uploadDate: '2天前'
    },
    {
      id: 3,
      title: '你站着我就问你',
      thumbnailUrl: 'http://localhost:8081/avatars/b028a7cd-60b9-4a41-beee-94187d465685.jpg',
      duration: '01:20',
      views: '3.6万',
      author: '123',
      uploadDate: '1天前'
    },
    {
      id: 4,
      title: 'S3角洲下真季密密密勿勿猛地图实则曝光下个作品曝光...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+4',
      duration: '06:03',
      views: '3288',
      author: '橘子 (提时代)',
      uploadDate: '11小时前'
    },
    {
      id: 5,
      title: '一闻不重样早晨饭，今天我们吃鸡蛋水饺、豆蹄山药...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+5',
      duration: '05:06',
      views: '7.7万',
      author: '花花的123',
      uploadDate: '19小时前'
    },
    {
      id: 6,
      title: '新疆小朋友唱起了闽南歌，唱出了闽南一家亲#新疆是个好...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+6',
      duration: '06:25',
      views: '61.9万',
      author: '白朱了',
      uploadDate: '1天前'
    },
    {
      id: 7,
      title: '银河映像一部被很多人遗忘和忽视的佳作，也是杜琪峰最...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+7',
      duration: '29:25',
      views: '3.6万',
      author: '星门聊电影',
      uploadDate: '1天前'
    },
    {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    },
    {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    }, {
      id: 8,
      title: '农村漂亮媳妇要娶妻七十年以前的农村大铁门翻新造成...',
      thumbnailUrl: 'https://via.placeholder.com/200x120?text=Video+8',
      duration: '03:39',
      views: '5.8万',
      author: '乡情双儿',
      uploadDate: '1天前'
    },
  ];

  relatedSearches.value = [
    {id: 1, query: '123 fit健身', link: '#'},
    {id: 2, query: '123夫人', link: '#'},
    {id: 3, query: '123数字歌', link: '#'},
    {id: 4, query: '123什么意思', link: '#'},
    {id: 5, query: '123木头人韩国游戏', link: '#'},
    {id: 6, query: '123朋友', link: '#'},
    {id: 7, query: '123谁最爱你', link: '#'},
    {id: 8, query: '123木头人vs一二三木头人游戏', link: '#'},
    {id: 9, query: '123手工坊', link: '#'},
    {id: 10, query: '123木头人第一视角', link: '#'},
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

// Event handlers (unchanged)
const setActiveNav = (id: number) => {
  activeNavId.value = id;
};

const setActiveTag = (id: number) => {
  activeTagId.value = id;
};

const performSearch = () => {
};
</script>

<style scoped>

/* Base styles for .search-page - NOW FLEXBOX */
.search-page {
  height: 100%;
  font-family: Arial, sans-serif;
  display: flex; /* Change to flex */
  flex-direction: column; /* Stack header and content vertically */
  padding: 0px 20px 20px 20px; /* Padding for the whole page */
  margin: 0 auto; /* Center the page content */
  box-sizing: border-box;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  background-color: white; /* Light grey background for the page */
  z-index: 10;
  margin-bottom: 20px; /* Space below header, simulating former grid gap */
  flex-shrink: 0; /* Prevent header from shrinking */
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

/* New Content Wrapper - NOW FLEXBOX */
.content-wrapper {
  display: flex; /* Flex container for main content and sidebar */
  flex-direction: row; /* Arrange them horizontally */
  flex-grow: 1; /* Allow it to take up remaining vertical space */
  gap: 20px; /* Gap between main-content and related-searches */
  box-sizing: border-box; /* Include padding/border in element's total width/height */
}


/* Main Content Styles */
.main-content {
  flex-grow: 1; /* Allow main content to take up available horizontal space */
  /* No fixed height needed here, content will push the height */
  overflow-y: auto; /* If main content needs its own scrollbar when sidebar is shorter */
  /* You might want to remove this if the body scroll handles it */
}

/* Tag Filters - internal flex unchanged, but parent changed */
.tag-filters {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  position: relative;
  gap: 10px;
  flex-shrink: 0; /* Prevent tags from shrinking if space is tight vertically within main-content */
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
  flex-wrap: wrap; /* Allow items to wrap to the next line */
  gap: 20px; /* Space between video cards */
}

.video-card {
  /* For 4 columns: (100% - 3 * gap) / 4 */
  flex-basis: calc(25% - 15px); /* (100% - 3*20px) / 4 = 25% - 15px */
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  box-sizing: border-box; /* Crucial for calc() with padding/border */
}

.video-card:hover {
  transform: translateY(-5px);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
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

/* Related Searches Sidebar */
.related-searches {
  flex-shrink: 0; /* Prevent shrinking */
  width: 280px; /* Fixed width */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content; /* Adjust height to content */
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

/* Responsive adjustments (updated for Flexbox) */
@media (max-width: 1200px) {
  .video-card {
    flex-basis: calc(33.333% - 13.333px); /* 3 columns: (100% - 2*20px) / 3 */
  }
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column; /* Stack main content and sidebar vertically */
  }

  .main-content {
    margin-bottom: 20px; /* Add space between stacked main content and sidebar */
  }

  .related-searches {
    width: 100%; /* Sidebar takes full width when stacked */
  }

  .video-card {
    flex-basis: calc(50% - 10px); /* 2 columns: (100% - 1*20px) / 2 */
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
    flex-basis: 100%; /* 1 column */
  }

  .scroll-btn {
    display: none;
  }
}
</style>
