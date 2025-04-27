<script setup lang="ts">
import {computed, h, nextTick, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';

import {CloseOutlined, DownOutlined} from '@ant-design/icons-vue';
import {useNotificationsStore} from "../../store/notificationsStore";
import type {Dialog, message} from "../../store/notificationsStore.ts"
import {getFormattedDate} from "../../utils/dayUtils"
import {getDirectMessages, sendDirectMessage} from '../../api/notificationService.ts'
import {message as errorToll} from 'ant-design-vue';
import {useWebSocketStore} from '../../store/websocketStore.ts'


const router = useRouter();

// 定义一个用来给后端发送消息的载体类
class MessageDTO {
  messageString: string;
  targetUserId: number;
  conversationId: string | null;
  username: string;
  userId: number;
  groupId: number;
  pictureBase64: string;

  constructor(messageString: string, TargetUserId: number, conversationId: string | null, username: string, userId: number, groupId: number, pictureBase64: string) {
    this.messageString = messageString;
    this.targetUserId = TargetUserId;
    this.conversationId = conversationId;
    this.username = username;
    this.userId = userId;
    this.groupId = groupId;
    this.pictureBase64 = pictureBase64;
  }
}

// 获取消息列表
const notificationsStore = useNotificationsStore();

// WebSocket
const webSocketStore = useWebSocketStore();

// 监听未读数的变化，有新消息立即拉取
watch(
    () =>
        notificationsStore.messageUnreadCount
    ,
    async (newMsg, oldMsg) => {
      if (newMsg !== oldMsg) {
        // 等待100毫秒
        await new Promise(resolve => setTimeout(resolve, 100));
        notificationsStore.dialogs = (await getDirectMessages()).data.map((dialog: Dialog) => {
          dialog.unreadCount = dialog.messages.filter(message => !message.read).length;
          return dialog;
        });
      }
    }
);
watch(
    () => notificationsStore.dialogs,
    (newVal, _) => {
      dialogs.value = JSON.parse(JSON.stringify(newVal));
      currentItem.value = notificationsStore.dialogs.find((dialog) => dialog.conversationId === currentConversationId.value)!;
    },
);

// 给一个默认对象防止报错
const defaultDialog: Dialog = {
  conversationId: '',
  username: '',
  userId: 0,
  avatarUrl: '',
  messages: []
};

const dialogs = ref<Dialog[]>(notificationsStore.dialogs ?? [defaultDialog]);
const userId = localStorage.getItem('id') ? Number(localStorage.getItem('id')) : 0;

// 当前对话用户，默认为第一个
const currentItem = ref<Dialog>(dialogs.value[0]);
// 当前对话的消息列表，默认为第一个
const currentMessageList = computed(() => currentItem.value.messages);
watch(() => currentMessageList.value.length, () => {
  // 如果当前滚动条不在最底，不做任何事情
  if (chatBoxRef.value && chatBoxRef.value.scrollTop + chatBoxRef.value.clientHeight < chatBoxRef.value.scrollHeight) {
    return;
  }
  scrollToBottom();
});

// 当前对话的ID
const currentConversationId = ref(currentItem.value.conversationId);

// 切换对话方法
const handleChangeItem = (conversationId: string) => {
  currentItem.value = dialogs.value.find((dialog) => dialog.conversationId === conversationId)!;
  currentConversationId.value = conversationId;

  // 向后端发送已读通知
  if (currentItem.value.unreadCount !== 0) {
    currentItem.value.unreadCount = 0;
    webSocketStore.send('/app/sendMessage', {
      type: 'read',
      conversationId: conversationId,
      userId: userId,
    })
  }
  nextTick(() => {
    chatBoxRef.value?.scrollTo({
      top: chatBoxRef.value.scrollHeight,
      behavior: 'auto'
    });
  });
};

// 删除对话方法
const handleDeleteItem = (conversationId: string) => {
  dialogs.value = dialogs.value.filter((dialog) => dialog.conversationId !== conversationId);
  // 如果删除的是当前会话，把当前会话重置回第一个
  if (currentConversationId.value === conversationId) {
    currentItem.value = dialogs.value[0] ?? defaultDialog;
  }
  currentConversationId.value = currentItem.value.conversationId;
};

// 消息输入框中的内容
const inputMessage = ref('');

const sendMessage = async () => {
  const messageDTO = new MessageDTO(
      inputMessage.value,
      currentItem.value.userId,
      currentItem.value.conversationId,
      currentItem.value.username,
      userId,
      0,
      '');

  const message = {
    id: 0,
    senderId: userId,
    senderName: localStorage.getItem('username') ?? '',
    senderAvatarUrl: localStorage.getItem('avatar') ?? '',
    message: inputMessage.value,
    attachmentUrl: '',
    sentAt: new Date().toISOString(),
    replyToId: 0,
    read: false,
    revoked: false,
  } as message;
  if (messageDTO.messageString.trim()) {
    const res = await sendDirectMessage(messageDTO);
    if (res.code === 200) {
      currentMessageList.value.push(message);
      inputMessage.value = '';
      scrollToBottom();
      // 找到当前的会话，把它移动到最前
      dialogs.value = dialogs.value.filter((dialog) => dialog.conversationId !== currentConversationId.value);
      dialogs.value.unshift(currentItem.value);
    } else if (res.code === undefined) {
      errorToll.error('发送失败，请检查网络或稍后再试');
    } else {
      errorToll.error('发送失败，请检查网络或稍后再试');
    }
  }
}
const chatBoxRef = ref<HTMLElement | null>(null);

const toBottomButtonShow = ref(false);

// 初始化方法，让滚动条移动到最下
onMounted(() => {
  // 从个人主页点击私聊按钮时，当列表不存在这个对话时，就添加
  if (Object.keys(notificationsStore.pendingDialogs).length > 0) {
    if (!dialogs.value.some(dialog => {
      return notificationsStore.pendingDialogs.userId === dialog.userId;
    })) {
      // 添加这个对话
      dialogs.value.unshift(notificationsStore.pendingDialogs);
    }
    // 更改当前会话
    currentItem.value = dialogs.value.find(dialog => {
      return notificationsStore.pendingDialogs.userId === dialog.userId;
    })!;
    currentConversationId.value = currentItem.value.conversationId;
  }
  // 把待添加的内容清空
  notificationsStore.pendingDialogs = {} as Dialog;

  // 滚动到最底
  nextTick(() => {
    chatBoxRef.value?.scrollTo({
      top: chatBoxRef.value.scrollHeight,
      behavior: 'auto'
    });
  });

  // 监听滚动条滚动事件
  chatBoxRef.value?.addEventListener('scroll', () => {
    // 滚动到顶部时，加载更多消息
    if (chatBoxRef.value && chatBoxRef.value.scrollTop === 0) {
      // TODO: 加载更多消息
    }
    // 如果滚动条不在最底，显示回到底部按钮
    toBottomButtonShow.value = (chatBoxRef.value && chatBoxRef.value.scrollTop + chatBoxRef.value.clientHeight < chatBoxRef.value.scrollHeight - 200) as boolean;

  });
});


// 滚动条移动方法
const scrollToBottom = () => {
  if (chatBoxRef.value) {
    nextTick(() => {
      chatBoxRef.value?.scrollTo({
        top: chatBoxRef.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
};

// 控制聊天记录的时间显示
const shouldShowTime = (index: number) => {
  const currentMsg = currentMessageList.value[index];
  const lastMsg = currentMessageList.value[index - 1];

  // 如果是第一条消息，一定显示时间
  if (index === 0) {
    return true;
  }

  const currentTime = new Date(currentMsg.sentAt).getTime();
  const lastTime = new Date(lastMsg.sentAt).getTime();
  const diffInMinutes = (currentTime - lastTime) / 1000 / 60;

  return diffInMinutes > 10;
}
</script>

<template>
  <div v-if="dialogs.length > 0" style="color: black; width: 100%; height: 100vh;">
    <a-row style="height: 100%;">
      <!-- 用户列表 -->
      <a-col :span="6" style="height: 100%; overflow-y: auto;">
        <a-list item-layout="horizontal" :data-source="dialogs">
          <template #renderItem="{ item }">
            <a-list-item class="list-item-hoverable"
                         :class="{ 'always-hover': item.conversationId === currentConversationId }"
                         style="position: relative;"
                         :key="item.conversationId"
                         @click="handleChangeItem(item.conversationId)"
            >
              <a-list-item-meta
                  :description="h('div', {
                  style: {
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }
                }, item.messages.length > 0 ? item.messages[item.messages.length-1].message : '')"
              >
                <template #title>
                  <div style="text-align: left;position: relative">
                    <a style="color: black;"
                       @click="router.push(`/@${item.username}`)"
                       class="hover-box"
                    >{{ item.username }}</a>
                    <div v-if="item.unreadCount>0" class="badge">{{ item.unreadCount }}</div>
                  </div>
                </template>
                <template #avatar>
                  <a-avatar :src="item.avatarUrl"/>
                </template>
              </a-list-item-meta>
              <a-button
                  type="link"
                  class="delete-btn"
                  @click.stop="handleDeleteItem(item.conversationId)"
              >
                <CloseOutlined/>
              </a-button>
            </a-list-item>
          </template>
        </a-list>
      </a-col>


      <!-- 聊天区域 -->
      <a-col :span="18" style="display: flex; flex-direction: column; height: 100%;">
        <div
            style="line-height: 1; position: relative; display: block;font-size: 20px;padding-bottom: 10px;color: grey">
          {{ currentItem.username }}
          <a-button
              v-if="toBottomButtonShow"
              @click="scrollToBottom()"
              shape="circle"
              size="large"
              style="position: absolute;right: 5vh;top: 70vh;z-index: 10">
            <DownOutlined/>
          </a-button>
        </div>
        <div class="chat-box" ref="chatBoxRef">
          <div
              v-for="(msg, index) in currentMessageList"
              :key="index"
              :class="['chat-message', msg.senderId === userId ? 'me' : 'other']"
              style="align-items: center;"
          >
            <div v-if="shouldShowTime(index)" class="time">{{ getFormattedDate(msg.sentAt) }}</div>
            <a-avatar :src="msg.senderAvatarUrl" class="avatar"/>
            <div class="bubble-wrapper">
              <div class="bubble">
                <div class="content">{{ msg.message }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 输入框 -->
        <div style="padding: 16px; background: #fff; border-top: 1px solid #eee;">
          <a-input-search
              v-model:value="inputMessage"
              enter-button="发送"
              @search="sendMessage"
              placeholder="输入消息..."
          />
        </div>
      </a-col>
    </a-row>
  </div>
  <div v-else style="padding-top: 20%">
    <a-empty description="还没有任何消息哦，找个人聊聊吧！"/>
  </div>
</template>

<style scoped lang="less">
.list-item-hoverable {
  margin-bottom: 2px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  border-radius: 6px;
  user-select: none;
}

// 列表项悬停效果
.list-item-hoverable:hover,
.list-item-hoverable.always-hover {
  background-color: #e8f0f6;
}

.hover-box:hover {
  color: skyblue !important;
}

/* 默认删除按钮隐藏 */
.delete-btn {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0; /* 默认隐藏 */
  pointer-events: none; /* 避免影响布局 */
  transition: opacity 0.2s ease;
  color: grey;
}

/* 当列表项悬停时显示删除按钮 */
.list-item-hoverable:hover .delete-btn {
  opacity: 1; /* 鼠标悬停时显示按钮 */
  pointer-events: auto; /* 使按钮可点击 */
}

.badge {
  position: absolute;
  top: 70%;
  left: 70%;
  background: red;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
  line-height: 1;
}


.chat-box {
  flex: 1; /* 占满剩余空间 */
  padding: 16px;
  margin-right: 5px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.chat-message {

  display: flex;
  align-items: start;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.chat-message.other {
  flex-direction: row;
}

.chat-message.me {
  flex-direction: row-reverse;
}

.avatar {
  margin: 0 10px;
}

.bubble-wrapper {
  max-width: 60%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-message.me .bubble-wrapper {
  align-items: flex-end;
}

.time {
  width: 100%;
  font-size: 12px;
  color: #999;
  line-height: 2; /* ✅ 减少垂直空间 */
  margin-bottom: 4px; /* ✅ 控制时间和气泡之间的间距 */
  padding: 0 5px;
  white-space: pre;
}


.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.4;

  .content {
    text-align: left;
  }
}

.chat-message.other .bubble {
  background: white;
  border: 1px solid #e6e6e6;
}

.chat-message.me .bubble {
  background: #1890ff;
  color: white;
}

</style>
