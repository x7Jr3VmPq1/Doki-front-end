<script setup lang="ts">
import VideoDetails from "../../components/VideoDetails.vue";
import {ref, onMounted} from 'vue';
import {useVideoStore} from "../../store/videoStore.ts";
import {getVideoCommentsByVideoId} from "../../api/commentService.ts";
import {searchUsers} from "../../api/userService.ts";
import {searchVideos} from "../../api/videoService.ts";
import {useRoute, useRouter} from 'vue-router'
import {HeartOutlined} from "@ant-design/icons-vue";

const router = useRouter()

interface userInfo {
  id: number,
  userName: string,
  avatarUrl: string,
  bio: string,
  createdAt: string,
  updatedAt: string,
  followingCount: number,
  followerCount: number,
  likedCount: number
}

const userList = ref<userInfo[]>([])

const videoStore = useVideoStore();
const route = useRoute()
const searchWord = ref('');
// 页面加载时获取视频列表
onMounted(async () => {
  isLoading.value = true;
  // 0.5秒延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  videoStore.videos = (await searchVideos(route.query.keyword as string)).data;
  userList.value = (await searchUsers(route.query.keyword as string)).data;
  searchWord.value = route.query.keyword as string;
  isLoading.value = false;
})
const isLoading = ref(false);
// 搜索方法
const onSearch = async (content: string) => {
  await router.push({
    path: route.path,
    query: {
      keyword: content.trim()
    }
  });
}


// 播放视频
const playVideo = (event: MouseEvent) => {
  const videoElement = (event.currentTarget as HTMLElement).querySelector('video');
  if (videoElement) {
    videoElement.play();
  }
};

// 暂停视频
const pauseVideo = (event: MouseEvent) => {
  const videoElement = (event.currentTarget as HTMLElement).querySelector('video');
  if (videoElement) {
    videoElement.pause();
    videoElement.currentTime = 0;
  }
};

// 视频评论数组
const videoComments = ref<any[]>([]);

// 打开模态框方法
const isModalVisible = ref(false);
const openModal = async (index: number) => {
  // 把Pinia中的视频索引更改成和卡片顺序对应
  videoStore.videoIndex = index;

  // 获取视频评论
  const response = await getVideoCommentsByVideoId(videoStore.videos[index].id);
  videoComments.value = response.data;

  // 开启对应索引的对话框
  isModalVisible.value = true;
};

const activeKey = ref('1');
</script>

<template>
  <div class="search">
    <!-- 顶部搜索框 -->
    <a-input-search
        v-if="!isLoading"
        placeholder="搜索你喜欢的内容..."
        enter-button
        v-model:value="searchWord"
        @search="onSearch"
        size="large"
        style="width: 30vw; margin: 20px auto"
    />
    <div v-if="!isLoading" style="padding-left: 80px;height: 100%;overflow-y: auto">
      <!-- 搜索结果  -->
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="视频"><!-- 视频列表区域 -->
          <!-- 暂无数据提示 -->
          <div v-if="videoStore.videos.length === 0" class="empty-message">
            <a-empty description="没有任何内容哦！"/>
          </div>
          <div class="list">
            <VideoDetails
                :isProfile="true"
                @update:visible="isModalVisible=false"
                :visible="isModalVisible"
                :video-comments="videoComments"/>
            <div class="videoCards" v-if="!isLoading">
              <a-card
                  hoverable
                  style="width: 240px; height: 400px;"
                  v-for="(item,index) in videoStore.videos"
                  @click="openModal(index)"
                  @mouseenter="playVideo($event)"
                  @mouseleave="pauseVideo($event)"
              >
                <template #cover>
                  <div style="height: 280px; overflow: hidden;position: relative">
                    <video
                        muted
                        :src="item.videoUrl"
                        style="width: 100%; height: 100%; object-fit: cover;"
                    ></video>
                    <div class="videoLikeNumber">
                      <HeartOutlined/>
                      {{ item.likeCount }}
                    </div>
                  </div>
                </template>
                <a-card-meta :title=item.title :description=item.description>
                  <template #avatar>
                    <a-avatar :src=item.avatarUrl></a-avatar>
                    <p>{{ item.userName }}</p>
                  </template>
                </a-card-meta>
              </a-card>
              <!-- 空白区域 -->
              <div style="height: 80px; width: 100%"></div>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="用户" force-render>
          <div v-if="!isLoading">
            <!-- 暂无数据提示 -->
            <div v-if="userList.length === 0" class="empty-message">
              <a-empty description="没有任何内容哦！"/>
            </div>
            <a-list item-layout="horizontal" :data-source="userList"
                    :locale="{ emptyText: ' ' }"
            >
              <template #renderItem="{ item }">
                <a-list-item>
                  <a-list-item-meta
                      :description="item.bio?item.bio:'暂无个人简介'"
                      style="text-align: left"
                  >
                    <template #title>
                      <router-link :to="{ name: 'UserProfile', params: { username: item.userName } }">
                        {{ item.userName }}
                      </router-link>
                    </template>
                    <template #avatar>
                      <a-avatar :src=item.avatarUrl></a-avatar>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
    <!-- loading提示  -->
    <a-spin v-else style="margin: 35%" tip="加载中..." :spinning="isLoading">
    </a-spin>
  </div>
</template>

<style scoped>
.search {
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  color: black;
  width: 100%;

  .videoLikeNumber {
    display: flex;
    gap: 10px;
    position: absolute;
    line-height: 1;
    bottom: 0;
    left: 0;
    padding-left: 20px;
    margin-bottom: 20px;
    align-items: flex-end;
    justify-content: flex-start; /* 内容靠左对齐 */
    font-size: large;
    color: white;
  }

  .empty-message {
    padding-top: 15%;
  }
}

/* 主内容区域 */
.list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  justify-content: center; /* 水平居中内容 */
  width: 100%;
}

/* 视频卡片区域 */
.videoCards {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: start; /* 卡片居中排列 */
  gap: 20px;
  max-width: 1200px; /* 可选：限制最大宽度 */
}
</style>

