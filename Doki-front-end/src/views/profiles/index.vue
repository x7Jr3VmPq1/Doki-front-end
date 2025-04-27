<script setup lang="ts">
import {ref, watch} from 'vue';
import {
  HeartOutlined,
  ExportOutlined,
  DeleteFilled,
  TeamOutlined,
  UserAddOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
import {getUserInfo, followUser, getFollowList, getFansList} from '../../api/userService.ts';
import {getVideoCommentsByVideoId} from '../../api/commentService.ts';
import {deleteVideo} from "../../api/videoService.ts";
import {onBeforeMount, nextTick} from "vue";
import {useRoute} from "vue-router";
import {message, Modal} from 'ant-design-vue';
import EditProfile from "../../components/EditProfile.vue";
import router from "../../router";
import VideoDetails from "../../components/VideoDetails.vue";
import {useVideoStore} from "../../store/videoStore.ts";
import type {Video} from "../../store/videoStore.ts";
import {useNotificationsStore} from "../../store/notificationsStore.ts"

// 用户信息接口

interface UserProfile {
  id: number;
  avatarUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  likedCount: number;
  userName: string;
  videos?: Video[];
  likedVideos?: Video[];
  favoriteVideos?: Video[];
}

// Pinia的视频数据
const videoStore = useVideoStore();
// 用户数据
const userProfile = ref<UserProfile | null>(null);  // 定义 userProfile 类型
// 获取路由信息
const route = useRoute();
// 是否正在加载中
const isLoading = ref(true);
// 当前操作用户的ID
const userId = ref(0);

// 私聊页面状态仓库
const notificationsStore = useNotificationsStore();

// 管理作品选项是否打开
const isManageWorksOpen = ref(false);

// 激活管理作品按钮事件
const manageWorks = () => {
  isManageWorksOpen.value = !isManageWorksOpen.value;
  if (isManageWorksOpen.value) {
    // 获取所有的videoCard，让它们的遮罩层的不透明度增加一些，让鼠标悬停指针变为默认状态
    document.querySelectorAll('.videoCard').forEach(el => {
      (el as HTMLElement).style.cursor = 'default';
      (el.querySelector('.video-overlay') as HTMLElement).style.background = 'rgba(0, 0, 0, 0.2)';
    });
  } else {
    document.querySelectorAll('.videoCard').forEach(el => {
      (el as HTMLElement).style.cursor = 'pointer';
      (el.querySelector('.video-overlay') as HTMLElement).style.background = 'rgba(0, 0, 0, 0)';
    });
  }
};

// 删除视频方法
const delVideo = async (videoId: number) => {
  // 使用 a-modal 弹窗确认
  const confirmed = await new Promise((resolve) => {
    Modal.confirm({
      title: '确认删除',
      content: '你确认要删除吗？这个操作不可逆！',
      okText: '删除',
      cancelText: '取消',
      maskClosable: true,
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      },
    });
  });
  if (!confirmed) return;
  const response = await deleteVideo(videoId);
  if (response.code == 200) {
    message.success('删除成功');
    // 删除本地对应的视频
    if (userProfile.value?.videos) {
      userProfile.value.videos = userProfile.value.videos.filter(video => video.id !== videoId);
    }
  } else {
    message.error(response.data);
  }
};

// 获取用户信息
async function extracted() {
  try {
    // 获取当前操作用户ID
    userId.value = Number(localStorage.getItem('id')) || 0;
    const username = (route.params as { username: string }).username;
    const response = await getUserInfo(username);
    if (response.msg === "获取用户信息失败") {
      await router.push('/404');
      return;
    }
    userProfile.value = response.data;
    videoStore.setVideos(response.data.videos);
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

// 在组件挂载时获取用户信息
onBeforeMount(async () => {
  // 模拟一个短暂的加载
  await new Promise(resolve => setTimeout(resolve, 1000));
  await extracted();
});
// 监听路由变化并手动更新
watch(() => route.path, () => {
  extracted();
});

// 播放视频
const playVideo = (event: MouseEvent) => {
  // 如果现在是管理作品状态，不要触发播放方法
  if (isManageWorksOpen.value) {
    return;
  }
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

// 关注/取关方法
const handleFollow = async (userId: number) => {
  try {
    // 发送关注请求
    const response = await followUser(userId);
    if (userProfile.value) {
      // 根据关注结果更新用户信息
      if (response.data === '关注成功') {
        userProfile.value.isFollowing = true;
        userProfile.value.followerCount++;
        message.success('关注成功');
      } else {
        userProfile.value.isFollowing = false;
        userProfile.value.followerCount--;
        message.success('取关成功');
      }
    }
  } catch (error) {
    console.error('Error following user:', error);
  }
}


// 关于视频详情页的方法

// 视频评论数组
const videoComments = ref<any[]>([]);

// 布尔类型数组管理视频卡片所属的模态框开关
// 初始化所有值为false
const isModalVisibleArray = ref<boolean[]>(Array(videoStore.videos.length).fill(false));
// 打开模态框方法
const openModal = async (index: number) => {
  // 如果当前是管理作品状态，不要触发打开方法
  if (isManageWorksOpen.value) {
    return;
  }
  // 把Pinia中的视频索引更改成和卡片顺序对应
  videoStore.videoIndex = index;

  // 获取视频评论
  const response = await getVideoCommentsByVideoId(videoStore.videos[index].id);
  videoComments.value = response.data;

  // 开启对应索引的对话框
  isModalVisibleArray.value[index] = true;
};
const handleIsModalVisible = (_: boolean) => {
  // 获取所有的视频实例让其暂停
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    video.pause();
  });
  // 把所有的对话框关闭
  isModalVisibleArray.value = isModalVisibleArray.value.map(() => false);
}

// 跳转到私聊页面方法
const handleToMessage = () => {
  router.push(`/message/my`);
  // 在仓库中增加一条待处理的对话
  nextTick(() => {
        notificationsStore.pendingDialogs = {
          conversationId: null,
          username: userProfile.value?.userName as string,
          userId: userProfile.value?.id as number,
          avatarUrl: userProfile.value?.avatarUrl as string,
          messages: []
        }
      }
  )
}

// 关注列表
const followList = ref<UserProfile[] | null>(null);
// 粉丝列表
const followerList = ref<UserProfile[] | null>(null);

const open = ref<boolean>(false);

// 当前在关注列表激活的标签
const activeKey = ref('1');
const showModal = async (key: string) => {
  activeKey.value = key;
  followList.value = await getFollowList(userProfile.value?.id as number);
  followerList.value = await getFansList(userProfile.value?.id as number);
  console.log(followList.value)
  open.value = true;
};

// 从关注列表中点击关注的方法
const followUserByList = async (userId: number, type: string) => {
  try {
    // 发送关注请求
    const response = await followUser(userId);
    // 根据关注结果更新列表信息
    if (response.data === '关注成功') {
      if (type === 'followList') {
        followList.value?.map(user => {
          if (user.id === userId) {
            user.isFollowing = true;
          }
        });
      } else {
        followerList.value?.map(user => {
          if (user.id === userId) {
            user.isFollowing = true;
          }
        });
      }
      message.success('关注成功');
    } else {
      if (type === 'followList') {
        followList.value?.map(user => {
          if (user.id === userId) {
            user.isFollowing = false;
          }
        });
      } else {
        followerList.value?.map(user => {
          if (user.id === userId) {
            user.isFollowing = false;
          }
        });
      }
      message.success('取关成功');
    }
  } catch (error) {
    console.error('Error following user:', error);
  }
}
// 切换面板回调
const videoPaneActiveKey = ref('1');
const handleTabChange = (key: string) => {
  if (key === '1') {
    videoStore.setVideos(userProfile.value?.videos ?? [] as Video[])
  } else if (key === '2') {
    videoStore.setVideos(userProfile.value?.favoriteVideos ?? [] as Video[])
  } else {
    videoStore.setVideos(userProfile.value?.likedVideos ?? [] as Video[])
  }
};
</script>

<template>
  <div class="user-profile" v-if="!isLoading">
    <!-- 用户信息展示卡片 -->
    <a-card :bordered="false" style="width: 100%; margin: 20px auto;">
      <!-- 使用栅格系统布局，分为左右两部分 -->
      <a-row :gutter="[16, 16]" align="middle">
        <!-- 左侧部分：用户头像 -->
        <a-col :xs="24" :sm="8" :md="6" :lg="6" :xl="6">
          <a-avatar :size="200" :src="userProfile?.avatarUrl"/>
        </a-col>
        <!-- 右侧部分：用户基本信息 -->
        <a-col :xs="24" :sm="16" :md="18" :lg="18" :xl="18">
          <!-- 使用描述列表展示用户基本信息 -->
          <a-card :bordered="false" style="height: auto;">
            <!-- 用户名区域 -->
            <div class="username-section" style="text-align: left;">
              <h2>{{ userProfile?.userName }}</h2>
            </div>

            <!-- 按钮区域 -->
            <div class="button-section" style="text-align: left;">
              <!-- 如果是自己，显示"编辑个人资料和管理作品" -->
              <div v-if="userProfile?.id === userId">
                <edit-profile></edit-profile>
                &nbsp;
                <a-button v-if="!isManageWorksOpen" @click="manageWorks">管理作品</a-button>
                <a-button v-else danger @click="manageWorks">取消管理</a-button>
              </div>
              <!-- 如果不是自己，显示关注按钮 -->
              <a-button v-else
                        type="primary"
                        :style="{ backgroundColor: userProfile?.isFollowing ? '#d9d9d9' : '' }"
                        @click="handleFollow(userProfile?.id!)"
              >
                {{ userProfile?.isFollowing ? '已关注' : '关注' }}
              </a-button>
              <a-button v-if="!(userProfile?.id === userId)"
                        @click="handleToMessage"
              >消息
              </a-button>
              <a-button>
                <ExportOutlined></ExportOutlined>
              </a-button>
              <a-dropdown>
                <a-button v-if="!(userProfile?.id === userId)">更多</a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>举报</a-menu-item>
                    <a-menu-item>屏蔽</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>

            <!-- 数据统计区域 -->
            <div class="stats-section" style="text-align: left; display: flex; gap: 24px; font-weight: 500;">
              <div>
                <span class="stat-value" @click="showModal('1')">{{ userProfile?.followingCount }}</span>
                <span>&nbsp;已关注</span>
              </div>
              <div>
                <span class="stat-value" @click="showModal('2')">{{ userProfile?.followerCount }}</span>
                <span>&nbsp;粉丝</span>
              </div>
              <div>
                <a-popover>
                  <template #content>
                    <div>{{ "收到来自视频/评论的点赞数总和" }}</div>
                  </template>
                  <span class="stat-value">{{ userProfile?.likedCount }}</span>
                </a-popover>
                <span>&nbsp;赞</span>
              </div>
              <!-- 关注/粉丝详情列表 -->
              <a-modal v-model:open="open" :footer="null">
                <a-tabs v-model:activeKey="activeKey" size="large" type="card" centered>
                  <a-tab-pane key="1">
                    <template #tab>
                        <span>
                          <plus-outlined/>
                          已关注
                        </span>
                    </template>
                    <a-list item-layout="horizontal" :data-source="followList" :locale="{	emptyText: '还没有内容哦'}">
                      <template #renderItem="{ item }">
                        <a-list-item>
                          <a-list-item-meta
                              :description="item.bio"
                          >
                            <template #title>
                              <a @click="router.push(`/@${item.userName}`)">{{ item.userName }}</a>
                            </template>
                            <template #avatar>
                              <a-avatar :src="item.avatarUrl"/>
                            </template>
                          </a-list-item-meta>
                          <div class="sourceContent">
                            <a-button
                                v-if="!(item?.id === userId)"
                                type="primary"
                                :style="{ backgroundColor: item?.isFollowing ? '#d9d9d9' : '' }"
                                @click="followUserByList(item?.id!,'followList')"
                            >
                              {{ item?.isFollowing ? '已关注' : '关注' }}
                            </a-button>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                    <div>检测滚动到底...</div>
                  </a-tab-pane>
                  <a-tab-pane key="2">
                    <template #tab>
                        <span>
                          <user-add-outlined/>
                          粉丝
                        </span>
                    </template>
                    <a-list item-layout="horizontal" :data-source="followerList"
                            :locale="{	emptyText: '还没有内容哦'}">
                      <template #renderItem="{ item }">
                        <a-list-item>
                          <a-list-item-meta
                              :description="item.bio"
                          >
                            <template #title>
                              <a @click="router.push(`/@${item.userName}`)">{{ item.userName }}</a>
                            </template>
                            <template #avatar>
                              <a-avatar :src="item.avatarUrl"/>
                            </template>
                          </a-list-item-meta>
                          <div class="sourceContent">
                            <a-button
                                v-if="!(item?.id === userId)"
                                type="primary"
                                :style="{ backgroundColor: item?.isFollowing ? '#d9d9d9' : '' }"
                                @click="followUserByList(item?.id!,'followerList')"
                            >
                              {{ item?.isFollowing ? '已关注' : '回关' }}
                            </a-button>
                          </div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </a-tab-pane>
                  <a-tab-pane key="3">
                    <template #tab>
                        <span>
                          <TeamOutlined/>
                          好友
                        </span>
                    </template>
                  </a-tab-pane>
                </a-tabs>
              </a-modal>
            </div>

            <!-- 个人简介区域 -->
            <div class="bio-section" style="text-align: left;">
              <p>{{ userProfile?.bio }}</p>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <a-tabs @change="handleTabChange(videoPaneActiveKey)" v-model:activeKey="videoPaneActiveKey" size="large" style="margin-left: 2%">
      <a-tab-pane key="1" tab="作品">
        <div class="videoCards">
          <div
              class="videoCard"
              v-for="(item,index) in userProfile?.videos"
              :key="item.id"
              @mouseenter="playVideo($event)"
              @mouseleave="pauseVideo($event)"
              @click="openModal(index)"
          >

            <video
                :ref="'videoPlayer' + index"
                muted
                loop
                preload="metadata" style="width: 100%; height: 100%; object-fit: cover;"
            >
              <source :src="item.videoUrl" type="video/mp4"/>
              您的浏览器不支持视频播放。
            </video>
            <VideoDetails
                :visible="isModalVisibleArray[index]"
                @update:visible="handleIsModalVisible"
                :video-comments="videoComments"
                :isProfile="true"
            ></VideoDetails>
            <!-- 遮罩层 -->
            <div class="video-overlay">
              <div class="overlay-content">
                <!-- 点赞数量 -->
                <div class="videoLikeNumber">
                  <HeartOutlined/>
                  {{ item.likeCount }}
                </div>
              </div>
            </div>
            <!-- 删除按钮 -->
            <div class="deleteButton"
                 v-if="isManageWorksOpen"
                 @click.stop="delVideo(item.id)"
            >
              <DeleteFilled/>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="收藏">
        <div class="videoCards">
          <div
              class="videoCard"
              v-for="(item,index) in userProfile?.favoriteVideos"
              :key="item.id"
              @mouseenter="playVideo($event)"
              @mouseleave="pauseVideo($event)"
              @click="openModal(index)"
          >

            <video
                :ref="'videoPlayer' + index"
                muted
                loop
                preload="metadata" style="width: 100%; height: 100%; object-fit: cover;"
            >
              <source :src="item.videoUrl" type="video/mp4"/>
              您的浏览器不支持视频播放。
            </video>
            <VideoDetails
                :visible="isModalVisibleArray[index]"
                @update:visible="handleIsModalVisible"
                :video-comments="videoComments"
                :isProfile="true"
            ></VideoDetails>
            <!-- 遮罩层 -->
            <div class="video-overlay">
              <div class="overlay-content">
                <!-- 点赞数量 -->
                <div class="videoLikeNumber">
                  <HeartOutlined/>
                  {{ item.likeCount }}
                </div>
              </div>
            </div>
            <!-- 删除按钮 -->
            <div class="deleteButton"
                 v-if="isManageWorksOpen"
                 @click.stop="delVideo(item.id)"
            >
              <DeleteFilled/>
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="喜欢">
        <div class="videoCards">
          <div
              class="videoCard"
              v-for="(item,index) in userProfile?.likedVideos"
              :key="item.id"
              @mouseenter="playVideo($event)"
              @mouseleave="pauseVideo($event)"
              @click="openModal(index)"
          >

            <video
                :ref="'videoPlayer' + index"
                muted
                loop
                preload="metadata" style="width: 100%; height: 100%; object-fit: cover;"
            >
              <source :src="item.videoUrl" type="video/mp4"/>
              您的浏览器不支持视频播放。
            </video>
            <VideoDetails
                :visible="isModalVisibleArray[index]"
                @update:visible="handleIsModalVisible"
                :video-comments="videoComments"
                :isProfile="true"
            ></VideoDetails>
            <!-- 遮罩层 -->
            <div class="video-overlay">
              <div class="overlay-content">
                <!-- 点赞数量 -->
                <div class="videoLikeNumber">
                  <HeartOutlined/>
                  {{ item.likeCount }}
                </div>
              </div>
            </div>
            <!-- 删除按钮 -->
            <div class="deleteButton"
                 v-if="isManageWorksOpen"
                 @click.stop="delVideo(item.id)"
            >
              <DeleteFilled/>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>

    <!--   在最底部添加一些空白   -->
    <div style="height: 100px;display: block"></div>
  </div>
  <div v-else class="loading-container">
    <!-- 加载动画 -->
    <a-spin :spinning="true" size="large" tip="加载中...">
    </a-spin>
  </div>
</template>

<style scoped>
.user-profile {
  width: 100%;
  height: 100vh; /* 占满整个视口 */
  overflow: auto; /* 允许滚动 */

  .sourceContent {
    margin-left: auto;
    text-align: right;
    color: gray;
    width: 20%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bio-section p {
    white-space: pre-line;
  }

  .stats-section {
    .stat-value {
      display: block;
      font-weight: bold;
    }

    .stat-value:hover {
      color: #1890ff;
      cursor: pointer;
      text-decoration: underline;
    }


    div {
      display: flex;
      margin-right: 2px;
    }
  }

  .button-section {
    display: flex;
    gap: 10px;
  }

  .videoCards {
    max-height: 100vh; /* 让高度自动适应内容 */
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
    justify-content: flex-start;
    gap: 20px; /* 添加间距 */

    .videoCard {
      flex: 1 1 calc(25% - 20px); /* 让卡片宽度占 25%（四个一行） */
      max-width: 280px; /* 限制最大宽度 */
      aspect-ratio: 4 / 5; /* 让高度和宽度保持 4:5 */
      background-color: silver;
      position: relative;
      overflow: hidden;
      cursor: pointer;

      video {
        transition: transform 0.3s ease;
      }

      &:hover video {
        transform: scale(1.1); /* 悬停时放大视频 */
      }

      /* 遮罩层样式 */

      .video-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0); /* 透明背景 */
        display: flex;
        align-items: flex-end; /* 内容靠下对齐 */
        justify-content: flex-start; /* 内容靠左对齐 */
        pointer-events: none; /* 不拦截鼠标事件 */
        color: white; /* 文字颜色 */
        font-size: 14px; /* 文字大小 */

        .overlay-content {
          height: 20%;
          display: flex;
          gap: 10px; /* 信息之间的间距 */
          padding-left: 20px;
          margin-bottom: 20px;

          .videoLikeNumber {
            font-size: large;
          }
        }
      }

      .deleteButton {
        width: 30px;
        height: 30px;
        position: absolute;
        top: -20px;
        right: 10px;
        cursor: pointer;
        color: #a83f3f;
        font-size: 35px;
      }
    }
  }
}

.loading-container {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100vh; /* 占满整个视口高度 */
  width: 100%; /* 占满整个视口宽度 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .user-profile {
    .videoCard {
      flex: 1 1 calc(50% - 20px); /* 在小屏幕上，卡片宽度占 50%（两个一行） */
    }
  }
}

@media (max-width: 480px) {
  .user-profile {
    .videoCard {
      flex: 1 1 100%; /* 在超小屏幕上，卡片宽度占 100%（一个一行） */
    }
  }
}
</style>
