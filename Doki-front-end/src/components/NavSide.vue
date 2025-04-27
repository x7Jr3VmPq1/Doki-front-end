<template>
  <a-layout style="min-height: 100vh">
    <!-- 侧边导航栏 -->
    <a-layout-sider
        :style="{ background: '#fff' }"
    >
      <a-menu
          theme="light"
          mode="inline"
          v-model:selectedKeys="selectedKeys"
      >
        <a-menu-item key="home">
          <router-link to="/home"></router-link>
          <HomeOutlined/>
          <span>推荐</span>
        </a-menu-item>
        <a-menu-item key="friends">
          <router-link to="/friends"></router-link>
          <UserOutlined/>
          <span>好友</span>
        </a-menu-item>
        <a-menu-item key="message">
          <router-link to="/message">
            <MessageOutlined/>
            <span>消息中心</span>
            <span v-if="notificationsStore.totalUnreadCount>0">({{ notificationsStore.totalUnreadCount }})</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="upload">
          <router-link to="/upload"></router-link>
          <UploadOutlined/>
          <span>上传</span>
        </a-menu-item>
        <a-menu-item key="following">
          <router-link to="/following"></router-link>
          <HeartOutlined/>
          <span>关注中</span>
        </a-menu-item>
        <a-menu-item key="settings">
          <SettingOutlined/>
          <span>设置</span>
        </a-menu-item>
      </a-menu>
      <!-- 用户信息展示区域 -->
      <div class="user-info">
        <template v-if="isLoggedIn">
          <a-avatar :size="32" :src="avatarUrl"/>
          <span class="username">{{ username }}</span>
          <a-dropdown>
            <a-button type="link" style="margin-left: 10px;">
              <MoreOutlined/>
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile" @click="handleProfile">
                  <UserOutlined/>
                  个人资料
                </a-menu-item>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined/>
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <router-link to="/login">
            <a-button type="primary">登录</a-button>
          </router-link>
        </template>
      </div>
    </a-layout-sider>
  </a-layout>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  MoreOutlined,
  LogoutOutlined,
  UploadOutlined,
  MessageOutlined,
  HeartOutlined
} from '@ant-design/icons-vue';
import router from "../router/index.js";
import {useNotificationsStore} from "../store/notificationsStore.js";
import {useWebSocketStore} from "../store/websocketStore.js";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
// 侧边栏选中项
const selectedKeys = ref(['1']);
const isLoggedIn = ref(false);
// 获取通知存储实例
const notificationsStore = useNotificationsStore();

const username = ref(localStorage.getItem('username'));
const avatarUrl = ref(localStorage.getItem('avatar'));

onMounted(() => {
  // 根据 localStorage 中是否存在 token 来设置登录状态
  isLoggedIn.value = !!localStorage.getItem('token');

  /*if (isLoggedIn.value) {
    const socket = new SockJS('http://localhost:8080/ws'); // WebSocket 端点，要跟后端配置一致
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, frame => {
      console.log('WebSocket connected: ' + frame);
      // 设置心跳机制，保持连接
      stompClient.heartbeat.outgoing = 10000;  // 每10秒发送一个心跳包
      stompClient.heartbeat.incoming = 10000;  // 每10秒检查一次连接是否仍然活跃
      // 订阅用户私有通知队列
      stompClient.subscribe("/queue/notifications/" + localStorage.getItem('id'), message => {
        if (message.body === '10000') {
          notificationsStore.likeUnreadCount++;
        } else if (message.body === '10001') {
          notificationsStore.commentUnreadCount++;
        } else if (message.body === '20000'){
          notificationsStore.messageUnreadCount++;
        }
      });
    }, error => {
      console.error('WebSocket 连接失败:', error);
    });
  }*/


  const websocketStore = useWebSocketStore();
  const userId = localStorage.getItem('id');
  if (userId) {
    websocketStore.connect(userId);
  }
});

// 退出登录处理函数
const handleLogout = () => {
  // 清除 localStorage 中的 token 和用户信息
  localStorage.clear();
  isLoggedIn.value = false;
  // 重新加载页面
  window.location.reload();
  // 跳转到首页
  router.push('/');
};
// 导航到个人资料页面
const handleProfile = () => {
  router.push(`/@${localStorage.getItem('username')}`);
};
</script>

<style scoped>
a-layout-sider {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background-color: #fafafa;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.username {
  display: inline-block;
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
}
</style>
