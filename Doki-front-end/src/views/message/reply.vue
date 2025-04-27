<script setup lang="ts">
import {h, ref, computed, type Ref} from "vue";
import {LikeOutlined, MailOutlined} from '@ant-design/icons-vue';
import {dayUtils} from "../../utils/dayUtils.ts";
import {useRouter} from 'vue-router';
import {useNotificationsStore} from "../../store/notificationsStore";
import type {Notifications} from "../../store/notificationsStore";

// 获取数据
const notificationStore = useNotificationsStore();
const router = useRouter();
// 使用 computed 来创建响应式数据
const data: Ref<Notifications[]> = computed(() => {
  return notificationStore.commentNotifications; // 访问 store 中的响应式数据
});

// 用于控制哪个条目的回复框显示
const activeIndex = ref<number | null>(null); // 当前显示的输入框索引
const replyText = ref<string[]>(data.value.map(() => ''));

// 切换显示/隐藏输入框
const toggleReply = (index: number) => {
  if (activeIndex.value === index) {
    activeIndex.value = null; // 如果点击的是已显示的输入框，则隐藏它
  } else {
    activeIndex.value = index; // 否则，显示该条目的输入框
  }
};
const avatar = localStorage.getItem('avatar');
// 处理回复逻辑
const handleReply = (index: number) => {
  console.log(`回复内容: ${replyText.value[index]}`); // 处理回复逻辑
  activeIndex.value = null; // 隐藏输入框
  replyText.value[index] = ''; // 清空回复内容
};
</script>
<!-- TODO 实现快捷点赞回复 -->
<template>
  <div style="color: black">
    <a-list item-layout="horizontal" :data-source="data" style="height: 100vh;overflow-y: auto;">
      <template #renderItem="{ item, index }">
        <a-list-item style="flex-wrap: wrap;">
          <a-list-item-meta
              :description="h('div', {
              style: {
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }
            }, item.message)"
          >
            <template #title>
              <div style="text-align: left; display: flex;height: 1em;margin-bottom: 10px">
                <a style="color: black;white-space: pre"
                   class="hover-box"
                   @click="router.push(`/@${item.operatorName}`)"
                >{{ item.operatorName }}</a>
                <p>{{ item.commentId ? '回复了我的评论' : '评论了我的视频' }}</p>
              </div>
            </template>
            <template #avatar>
              <a-avatar style="cursor: pointer;"
                        @click="router.push(`/@${item.operatorName}`)"
                        :src="item.avatarUrl"/>
            </template>
          </a-list-item-meta>
          <div class="sourceContent">
            {{ item.commentId ? item.commentContent : item.videoTitle }}
          </div>
          <div style="width: 100%;text-align: start;padding-left: 48px;color: grey">
            {{ dayUtils.formatDate(item.createdAt) }}
            &nbsp;
            <a-button type="link" style="padding: 0;margin: 0;color: grey" class="buttonHover"
                      @click="toggleReply(index)">
              <MailOutlined/>
              回复
            </a-button>
            &nbsp;
            <a-button type="link" style="padding: 0;margin: 0;color: grey" class="buttonHover">
              <LikeOutlined/>
              喜欢
            </a-button>
          </div>

          <!-- 弹出的输入框，左侧显示头像，输入框的高度增加两行 -->
          <div v-if="activeIndex === index"
               style="margin-top: 10px;
               margin-left: 48px;
               width: 100%;
               display: flex;
               align-items: center;
               margin-right: 300px;
          ">
            <a-avatar
                :src="avatar"
                style="margin-right: 8px;"
            />
            <a-textarea
                class="inputArea"
                v-model:value="replyText[index]"
                placeholder="请输入您的评论..."
                :rows="3"
                :maxlength="200"
                :autoSize="{ minRows: 2, maxRows: 6 }"
                :resizable="false"
                show-count
                addonAfter=""
                style="flex: 1"
            >
              <template #suffix>
              </template>
            </a-textarea>
            <a-divider type="vertical"/>
            <a-button type="primary" @click="handleReply(index)">发送</a-button>
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

.buttonHover:hover {
  color: skyblue !important;
}

.hover-box:hover {
  color: skyblue !important;
}
</style>
