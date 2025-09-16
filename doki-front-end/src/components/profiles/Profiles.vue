<script setup lang="ts">

/*

 不知道这个组件是做什么的，先不要动
* */
import {createVNode, ref} from 'vue';
import {Power} from '@icon-park/vue-next'
import {Modal} from "ant-design-vue";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import {useUserStore} from "../../store/userInfoStore.ts";
import {getFansList, getFollowList} from '../../api/userService.ts'
import FollowModal from "../follow-modal.vue";

const userStore = useUserStore();
const userInfo = userStore.userInfo!;

const menuItems = ["我的喜欢", "我的收藏", "观看历史", "稍后再看", "我的作品"];
const hoveredIndex = ref<number | null>(null);
const container = ref<HTMLElement | null>(null);
const handleExitClick = () => {
  Modal.confirm({
    title: '确认退出登录吗？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    getContainer: container.value,
    cancelText: '取消',
    maskClosable: true,
    async onOk() {
      userStore.logout();
      location.reload();
    }
  });
};

const openFollowingList = ref(false);
const followingList = ref([]);
const followerList = ref([]);
const handleFollowList = async () => {
  openFollowingList.value = true;
  followingList.value = await getFollowList(userInfo.userId);
  console.log(followingList.value)
}

const handleFansList = async () => {
  openFollowingList.value = true;
  followerList.value = await getFansList(userInfo.userId);
  console.log(followerList.value)
}
</script>

<template>
  <div class="container" ref="container">
    <div class="user-info">
      <div class="avatar">
        <a-avatar size="large" :src="userInfo.avatarUrl"></a-avatar>
      </div>
      <div class="text">
        <div class="username">{{ userInfo.userName }}</div>
        <div class="follow-fans">
          <div class="follow-number" style="margin-right: 20px" @click="handleFollowList">
            关注:{{ userInfo.followingCount }}
          </div>
          <div class="fans-number" @click="handleFansList">
            粉丝:{{ userInfo.followerCount }}
          </div>
          <a-modal v-model:open="openFollowingList" :footer="null" :get-container="container" :width="600">
            <follow-modal></follow-modal>
          </a-modal>
        </div>
      </div>
    </div>
    <div class="user-menu">
      <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="function-btn"
          :class="{ active: hoveredIndex === index }"
          @mouseenter="hoveredIndex = index"
      >
        <div class="title">
          <div class="title-text">
            {{ item }}
          </div>
          <div class="item-number">{{ 123 }}</div>
        </div>
        <div class="video-preview" :class="{ active: hoveredIndex === index }"
        >
          <div class="item">
            <div class="img-wrapper">
              <img src="http://localhost:8081/videos/defaultCover.jpg" alt="">
            </div>
            <span>123</span>
          </div>
          <div class="item">
            <div class="img-wrapper">
              <img src="http://localhost:8081/videos/defaultCover.jpg" alt="">
            </div>
            <span>123</span>
          </div>
          <div class="item">
            <div class="img-wrapper">
              <img src="http://localhost:8081/videos/defaultCover.jpg" alt="">
            </div>
            <span>123</span>
          </div>
        </div>
      </div>
    </div>
    <div class="exit-button" @click="handleExitClick">
      <div class="text">
        退出登录123
      </div>
      <div class="icon">
        <power></power>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 300px;
  height: 500px;

  .user-info {
    display: flex;
    height: 15%;
    padding: 5%;

    .text {
      margin-left: 20px;
    }

    .follow-fans {
      color: #7a7c82;
      line-height: 1.5;
      display: flex;

      .follow-number, .fans-number {
        cursor: pointer;

        &:hover {
          color: #000;
        }
      }
    }
  }

  .user-menu {
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: column;

    .function-btn {
      width: 100%;
      user-select: none;
      height: 10%;
      border-radius: 15px;
      /* 尺寸过渡 */
      transition: height 0.3s ease-in-out;

      .title {
        display: flex;
        padding: 10px;

        .item-number {
          margin-left: auto;
        }
      }

      .video-preview {
        display: none;
        padding: 0 20px;
        width: 100%;
        height: 100%;
        justify-content: space-between;

        .item {
          width: 30%;
          height: 70%;

          .img-wrapper {
            width: 100%;
            height: 80%;
            border-radius: 10px;
            overflow: hidden;

            img {
              width: 78px;
              height: 105px;
              object-fit: cover;
              display: block;
            }
          }

        }
      }

      .video-preview.active {
        display: flex;
      }
    }

    .function-btn.active {
      background-color: #f5f5f5;
      height: 50%;
    }
  }

  .exit-button {
    cursor: pointer;
    user-select: none;
    height: 10%;
    padding: 10px;
    display: flex;
    border-radius: 15px;

    .text {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      margin-left: auto;
      display: flex;
      align-items: center;
      justify-content: center;

    }

    &:hover {
      background-color: #f5f5f5;
      color: red;
    }
  }
}
</style>
