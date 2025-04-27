<template>
  <div class="following-page-center">
    <div class="following-container">
      <h2>关注中</h2>
      <!-- 暂无数据提示 -->
      <div v-if="followingList.length === 0" class="empty-message">
        <a-empty description="你还没有关注任何人哦！"/>
      </div>
      <!-- 关注列表 -->
      <a-list v-else
        item-layout="horizontal"
        :data-source="followingList"
        :locale="{ emptyText: ' ' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta
              :description="item.bio || '暂无个人简介'"
              style="text-align: left"
            >
              <template #title>
                <router-link :to="{ name: 'UserProfile', params: { username: item.userName } }">
                  {{ item.userName }}
                </router-link>
              </template>
              <template #avatar>
                <a-avatar :src="item.avatarUrl" />
              </template>
            </a-list-item-meta>
            <template #extra>
              <a-button @click="unfollowUser(item.id)">取消关注</a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axiosInstance from '../../api/axiosInstance';

interface FollowingUser {
  id: number;
  userName: string;
  avatarUrl: string;
  bio: string;
}

// 模拟数据
const mockFollowingUsers: FollowingUser[] = [
  {
    id: 1,
    userName: '小明',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    bio: '热爱生活，热爱分享'
  },
  {
    id: 2,
    userName: '小红',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    bio: '喜欢旅行和美食，记录生活中的点滴'
  },
  {
    id: 3,
    userName: '小刚',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dusty',
    bio: '数码科技爱好者，分享最新科技资讯'
  },
  {
    id: 4,
    userName: '小丽',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coco',
    bio: '舞蹈爱好者，每天分享舞蹈视频'
  },
  {
    id: 5,
    userName: '小华',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    bio: '美妆博主，分享最新美妆技巧'
  }
];

const followingList = ref<FollowingUser[]>(mockFollowingUsers);

// 获取关注列表 (模拟API调用)
const getFollowingList = async () => {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 使用模拟数据
    followingList.value = mockFollowingUsers;
  } catch (error) {
    message.error('获取关注列表失败');
  }
};

// 取消关注 (模拟API调用)
const unfollowUser = async (userId: number) => {
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    // 从列表中移除被取消关注的用户
    followingList.value = followingList.value.filter(user => user.id !== userId);
    message.success('取消关注成功');
  } catch (error) {
    message.error('取消关注失败');
  }
};

onMounted(() => {
  getFollowingList();
});
</script>

<style scoped>
.following-page-center {
  display: flex;
  justify-content: center;
  width: 100vw;
  min-height: 100vh;
  background: #f5f6fa;
}
.following-container {
  width: 480px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
  margin-top: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.empty-message {
  margin-top: 100px;
}
</style>