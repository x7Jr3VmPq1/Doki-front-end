<!-- 顶部标题栏搜索框组件 -->
<template>
  <div class="search-container">
    <!-- 搜索框 -->
    <div class="search-box">
      <input v-model="searchQuery" @input="onInput" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown"
        @keyup.enter="handleSearch" placeholder="请输入搜索内容" class="search-input" ref="searchInputRef" />
      <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
      <button class="search-btn" @click="handleSearch">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        搜索
      </button>
    </div>

    <!-- 搜索建议列表 -->
    <div v-if="showSuggestions && (suggestions.length > 0 || showHotTopics)" class="suggestions-dropdown"
      @mousedown.prevent>
      <!-- 搜索建议 -->
      <div v-if="suggestions.length > 0" class="suggestions-section">
        <div v-for="(suggestion, index) in suggestions" :key="index"
          :class="['suggestion-item', { active: index === activeIndex }]" @click="selectSuggestion(suggestion)"
          @mouseenter="activeIndex = index">
          <span class="suggestion-text" v-html="highlightText(suggestion)"></span>
        </div>
      </div>

      <!-- 热点推荐 -->
      <div v-if="showHotTopics" class="hot-section">
        <!-- 搜索历史 -->
        <div v-if="searchHistory.length > 0" class="history-section">
          <div class="section-header">
            <span class="section-title">搜索历史</span>
            <button class="clear-history-btn" @click.stop="clearHistory">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              清空
            </button>
          </div>

          <div class="history-list">
            <div v-for="(item, index) in searchHistory" :key="index" class="history-item"
              @click="selectSuggestion(item)">

              <span class="history-text">{{ item }}</span>
              <button class="remove-history-btn" @click.stop="removeHistory(index)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!--        <div class="section-header">-->
        <!--          <span class="section-title">猜你想搜</span>-->
        <!--          <button class="refresh-btn">-->
        <!--            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">-->
        <!--              <path d="M1 4V10H7M23 20V14H17M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14"-->
        <!--                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
        <!--            </svg>-->
        <!--            换一换-->
        <!--          </button>-->
        <!--        </div>-->

        <!--        <div class="hot-grid">-->
        <!--          <div-->
        <!--              v-for="(topic, index) in displayHotTopics"-->
        <!--              :key="index"-->
        <!--              class="hot-item"-->
        <!--              @click="selectSuggestion({ text: topic.text })"-->
        <!--          >-->
        <!--            {{ topic.text }}-->
        <!--            <span v-if="topic.badge" :class="['hot-badge', topic.badge]">{{ topic.badgeText }}</span>-->
        <!--          </div>-->
        <!--        </div>-->

        <div class="trending-section">
          <div class="trending-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#ff6b6b" />
            </svg>
            <span>热点</span>
          </div>

          <div v-for="(item, index) in trendingTopics" :key="index" class="trending-item"
            @click="selectSuggestion(item.keyword)">
            <span class="trending-rank">{{ index + 1 }}</span>
            <span class="trending-text">{{ item.keyword }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import router from "../../router/index.ts";
import searchService from "../../api/searchService.ts";
import type { searchHistory } from '../../api/searchService.ts';
import { handleRequest } from '../../api/handleRequest.ts';


// Props
interface Props {
  placeholder?: string
  maxSuggestions?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入搜索内容',
  maxSuggestions: 10
})

// Emits
const emit = defineEmits<{
  search: [query: string]
}>()

// 响应式数据
const searchQuery = ref('')
const showSuggestions = ref(false)
const activeIndex = ref(-1)
const searchInputRef = ref<HTMLInputElement>()
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'))

// 建议数据
const suggestions = ref<string[]>([]);

const trendingTopics = ref<searchHistory[]>([]);

const showHotTopics = computed(() => {
  return !searchQuery.value.trim()
})

// 方法
const onInput = async () => {
  activeIndex.value = -1
  showSuggestions.value = true
  await handleRequest(searchService.suggest, {
    params: searchQuery.value,
    onSuccess(data) {
      suggestions.value = data;
    }
  })
}

const onFocus = async () => {
  handleRequest(searchService.getSearchHistoryList, {
    onSuccess(data) {
      trendingTopics.value = data;
    }
  })
  showSuggestions.value = true
}

const onBlur = () => {
  setTimeout(() => {
    suggestions.value = []
    showSuggestions.value = false
  }, 200)
}

const onKeyDown = (event: KeyboardEvent) => {
  const suggestionCount = suggestions.value.length

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, suggestionCount - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
        selectSuggestion(suggestions.value[activeIndex.value])
      } else {
        handleSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      activeIndex.value = -1
      break
  }
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion;
  showSuggestions.value = false
  activeIndex.value = -1
  handleSearch();
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    showSuggestions.value = false
    // 添加到搜索历史
    addToHistory(searchQuery.value.trim())
    router.push({
      path: '/search',
      query: {
        keyword: searchQuery.value.trim()
      }
    })
    emit('search', searchQuery.value.trim())
  }
}

const addToHistory = (query: string) => {
  // 移除已存在的相同项
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  // 添加到开头
  searchHistory.value.unshift(query)
  // 保持最多8条历史记录
  if (searchHistory.value.length > 8) {
    searchHistory.value = searchHistory.value.slice(0, 8)
  }

  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));

}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
  activeIndex.value = -1
  searchInputRef.value?.focus()
}

const highlightText = (text: string): string => {
  if (!searchQuery.value.trim()) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 点击外部隐藏建议
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.search-container')) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-container {
  position: relative;
  height: 90%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.search-box {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s ease;
  border: 1px solid black;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 12px 16px;
  background: transparent;
  line-height: 1.5;
}

.search-input::placeholder {
  color: #656d76;
}

.clear-btn {
  background: none;
  border: none;
  color: #656d76;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #f6f8fa;
  color: #24292e;
}

.search-btn {
  height: 100%;
  background: #24292e;
  color: white;
  padding: 10px 16px;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  min-width: 80px;
  justify-content: center;
}

.search-btn:hover {
  background: #1c2128;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
}


.suggestion-item {
  /* 文字靠左对齐*/
  text-align: left;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f6f8fa;
  color: #24292e;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: #f6f8fa;
}

.suggestion-text :deep(.highlight) {
  color: #cf222e;
  font-weight: 600;
  background: none;
}

.hot-section {
  border-top: 1px solid #f6f8fa;
  padding: 16px;
}

.history-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f6f8fa;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  font-size: 13px;
  color: #24292e;
  transition: all 0.2s ease;
  gap: 8px;
}

.history-item:hover {
  color: #ff6b6b;
}

.history-text {
  flex: 1;
  line-height: 1.4;
}

.remove-history-btn {
  background: none;
  border: none;
  color: #656d76;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
}

.history-item:hover .remove-history-btn {
  opacity: 1;
}

.remove-history-btn:hover {
  background: #f6f8fa;
  color: #24292e;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #656d76;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: #f6f8fa;
  color: #24292e;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  color: #656d76;
  font-size: 14px;
  font-weight: 600;
}

.refresh-btn {
  background: none;
  border: none;
  color: #656d76;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: #f6f8fa;
  color: #24292e;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.hot-item {
  background: transparent;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #24292e;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hot-item:hover {
  background: #f6f8fa;
}

.hot-badge {
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 600;
  margin-left: 4px;
}

.hot-badge.hot {
  background: #ff6b6b;
  color: white;
}

.trending-section {
  border-top: 1px solid #f6f8fa;
  padding-top: 12px;
}

.trending-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #656d76;
  font-weight: 600;
}

.trending-item {
  text-align: left;

  display: flex;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  font-size: 13px;
  color: #24292e;
  transition: all 0.2s ease;
}

.trending-item:hover {
  color: red;
}

.trending-rank {
  font-weight: 600;
  color: #656d76;
  margin-right: 8px;
  min-width: 16px;
  font-size: 12px;
}

.trending-text {
  flex: 1;
  line-height: 1.4;
}

.warning-icon {
  color: #fb8500;
  font-size: 12px;
  margin-left: 4px;
}
</style>
