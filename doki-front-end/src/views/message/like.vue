<script setup lang="ts">

import {computed, h, type Ref} from "vue";
import {useNotificationsStore} from "../../store/notificationsStore";
import type {Notifications} from "../../store/notificationsStore";
import {useRouter} from 'vue-router';
import {dayUtils} from "../../utils/dayUtils.ts";

const notificationStore = useNotificationsStore();
const router = useRouter();
// 使用 computed 来创建响应式数据
const data: Ref<Notifications[]> = computed(() => {
  return notificationStore.likeNotifications; // 访问 store 中的响应式数据
});
</script>

<template>
  <div style="color: black">

    <a-list item-layout="horizontal" :data-source="data" style="height: 100vh;overflow-y: auto;">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta
              :description="h('div', {
            style: {
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }
          }, dayUtils.formatDate(item.createdAt))"
          >
            <template #title>
              <div style="text-align: left; display: flex;height: 1em;margin-bottom: 10px">
                <a style="color: black;white-space: pre"
                   class="hover-box"
                   href="#"
                   @click="router.push(`/@${item.operatorName}`)"
                >{{ item.operatorName }}</a>
                <p>赞了我的{{ item.commentId === null ? '视频' : '评论' }}</p>
              </div>
            </template>
            <template #avatar>
              <a-avatar
                  style="cursor: pointer;"
                  @click="router.push(`/@${item.operatorName}`)"
                  :src="item.avatarUrl"></a-avatar>
            </template>
          </a-list-item-meta>

          <!-- 👇 这是右侧额外的内容区域 -->
          <div class="sourceContent">
            {{ item.commentContent ? item.commentContent : item.videoTitle}}
          </div>
        </a-list-item>
      </template>
    </a-list>


  </div>
</template>

<style scoped>
.sourceContent {
  margin-left: auto;
  text-align: right;
  color: gray;
  width: 20%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hover-box {
  width: 1em;
  height: 1em;
  margin-right: 2em;
}


.hover-box:hover {
  color: skyblue !important;
}
</style>
