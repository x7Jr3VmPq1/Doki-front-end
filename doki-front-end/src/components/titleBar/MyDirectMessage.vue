<script setup lang="ts">

import { ref, watch, onMounted, nextTick, reactive } from "vue";
import { ArrowCircleUp, Picture, MenuFold, MenuUnfold, More } from "@icon-park/vue-next";
import { IconCloseCircleFill } from "@arco-design/web-vue/es/icon";
import { dayUtils } from "../../utils/dayUtils.ts";
import { Modal } from 'ant-design-vue';
import { createVNode } from 'vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useUserStore } from "../../store/userInfoStore.ts";
import notification_dmService from "../../api/notification_dmService.ts";
import type { Conversation, Message, MessageDTO } from '../../api/notification_dmService.ts'
import { handleRequest } from "../../api/handleRequest.ts";
import DokiLoading from "../Doki-Loading.vue";
import { useShareData } from "./shareData.ts";
const userStore = useUserStore();
const shareData = useShareData();
// 页面加载后，获取聊天列表
const isConversationsLoading = ref(false);
const conversations = ref<Conversation[]>([]);
const activeConversationIndex = ref(-1);
onMounted(async () => {
  isConversationsLoading.value = true;

  handleRequest(notification_dmService.getConversationList, {
    onSuccess(data) {
      console.log(data);
      conversations.value = data;
      isConversationsLoading.value = false;

      // 监听shareData中的创建新消息标记
      watch(
        () => shareData.requestCreatConversationUID, async (newVal) => {
          if (newVal > 0) {
            isHidden.value = true;
            await handleRequest(notification_dmService.createConversation, {
              onSuccess(data) {

                conversations.value = conversations.value.filter(c => c.id !== data.id)
                conversations.value.unshift(data);
              }, params: newVal
            })
            await handleClickConversation(conversations.value[0], 0);
          }
        }, {
        immediate: true
      }
      )
    }
  })
})

// 当前用户ID
const userId = userStore.userInfo.id!;
// 点击聊天列表时，会进入会话详情
const messagesList = ref<Message[]>([]);
// 是否进入会话详情
const conversationsShow = ref(false);
const isHidden = ref(false);
// 聊天区域盒子引用
const messageItems = ref<HTMLElement | null>(null);
const handleClickConversation = async (item: Conversation, index: number) => {
  activeConversationIndex.value = index;
  await handleRequest(notification_dmService.getMessages, {
    onSuccess(data) {
      messagesList.value = data;
      handleRequest(notification_dmService.delUnreadMessageCount, {
        onSuccess(_) {
          shareData.messageUnread -= item.unread;
          item.unread = 0;
        }, params: item.id
      })
    }, params: item.id
  })
  conversationsShow.value = true;
  isHidden.value = true;
  await nextTick(() => {
    messageItems.value!.scrollTop = messageItems.value!.scrollHeight;
  })
};
const isExpansion = ref(false);
const isMessageContentShow = ref(false);
const handleHideClick = () => {
  // 如果现在不是展开状态，就晚一点儿再显示信息
  if (!isExpansion.value) {
    setTimeout(() => {
      isMessageContentShow.value = !isMessageContentShow.value;
    }, 200);
  } else {
    isMessageContentShow.value = !isMessageContentShow.value;
  }
  isExpansion.value = !isExpansion.value;
};
const handleExitClick = () => {
  conversationsShow.value = false;
  isHidden.value = false;
};


const previewUrl = ref('');
const fileInput = ref<HTMLElement | null>(null)

// 点击图标时触发选择文件
const triggerFileSelect = () => {
  fileInput.value?.click()
}
const handlePictureUpload = (event: Event) => {
  if (!event.target) {
    return;
  }
  const input = event.target as HTMLInputElement
  const file = input.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    }
    reader.readAsDataURL(file);
  } else {
    alert('请选择图片文件');
  }
}

// 控制聊天记录的时间显示
const shouldShowTime = (index: number) => {
  const currentMsg = messagesList.value[index];
  const lastMsg = messagesList.value[index - 1];
  // 如果是第一条消息，一定显示时间
  if (index === 0) {
    return true;
  }
  const currentTime = new Date(currentMsg.timestamp).getTime();
  const lastTime = new Date(lastMsg.timestamp).getTime();
  const diffInMinutes = (currentTime - lastTime) / 1000 / 60;
  return diffInMinutes > 10;
}
// 发送消息方法
const messageContent = ref('');
const handleSendMessage = async () => {
  if (!messageContent.value && messageContent.value.trim() === '' && previewUrl.value == '') {
    return;
  }
  const activeConversation = conversations.value[activeConversationIndex.value];
  handleRequest(notification_dmService.sendMessage, {
    onSuccess(data) {
      messagesList.value.push(data);
      activeConversation.lastMessage.content = previewUrl.value != '' ? '[图片]' + data.content : data.content;
      messageContent.value = '';
      previewUrl.value = previewUrl.value;
    }, params: {
      conversationId: activeConversation.id,
      senderId: userId,
      content: messageContent.value,
      imgUrl: previewUrl.value
    }
  })
}
const more = ref(null);

const handleDeleteConversation = () => {
  Modal.confirm({
    title: '确认删除对话吗？这将会删除历史聊天记录。',
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    maskClosable: true,
    getContainer: () => more.value!,
    async onOk() {
      handleRequest(notification_dmService.delConversation, {
        onSuccess: async () => {
          conversations.value.splice(activeConversationIndex.value, 1);
          if (conversations.value.length == 0) {
            // 更新会话列表
            // 如果没有任何会话了，就退出会话详情界面
            handleExitClick();
          } else {
            // 把当前会话重置回第一个
            await handleClickConversation(conversations.value[0], 0);
          }
        }, params: conversations.value[activeConversationIndex.value].id
      })
    }
  });
}

</script>

<template>
  <div style="background-color: #fff;border-radius: 10px;padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

    <!-- 标题区域 -->
    <div class="title">
      <div v-if="isExpansion" style="font-size: 20px">私信</div>
      <div v-if="!conversationsShow" style="font-size: 20px">私信</div>
      <div v-if="conversationsShow" class="unfold-button" @click.stop="handleHideClick">
        <menu-unfold theme="outline" size="35" fill="#c7c8ca" v-if="isExpansion" />
        <menu-fold theme="outline" size="35" fill="#c7c8ca" v-else />
      </div>

      <div style="display: flex;margin-left: auto" v-show="conversationsShow">
        <div class="more" ref="more">
          <a-popover :getPopupContainer="() => more" placement="bottom">
            <template #content>
              <div class="menu">
                <div class="menu-item">举报用户</div>
                <div class="menu-item" @click="handleDeleteConversation">删除会话</div>
              </div>
            </template>
            <More size="30"></More>
          </a-popover>
        </div>
        <div class="exit-button" @click="handleExitClick">
          退出会话
        </div>
      </div>

    </div>
    <div class="container">
      <!--  会话列表区域  -->
      <div class="conversations" :class="{ 'hidden': isHidden }">
        <div v-if="!isConversationsLoading" class="conversation" v-for="(item, index) in conversations"
          @click="handleClickConversation(item, index)">
          <a-avatar :src="item.userinfo.avatarUrl" size="large"></a-avatar>
          <div style="margin-left: 10px">
            <div class="user-name" style="margin-bottom: 5px">{{ item.userinfo.username }}</div>
            <div class="last-message">{{ item.lastMessage === null ? '' : item.lastMessage.content }}</div>
          </div>
          <div class="unread-wrapper flex-center" v-if="item.unread > 0">{{ item.unread }}</div>
        </div>
        <div v-else style="text-align: center">
          <DokiLoading></DokiLoading>
        </div>
        <!-- 空盒子 -->
        <div class="empty-box" v-if="conversations.length === 0 && !isConversationsLoading">
          <a-empty description="还没有消息，找个人聊聊吧！"></a-empty>
        </div>
      </div>
      <div class="conversation-details" v-show="conversationsShow">
        <div class="chat-list" :class="{ expansion: isExpansion }">
          <div class="message">
            <div class="message-item" :class="{ active: index == activeConversationIndex }"
              v-for="(item, index) in conversations" @click="handleClickConversation(item, index)">
              <a-avatar size="large" :src="item.userinfo.avatarUrl"></a-avatar>
              <div class="message-content" style="margin-left: 10px;display: flex;" v-if="isMessageContentShow">
                <div>
                  <div class="message-user-name">{{ item.userinfo.username }}</div>
                  <div class="message-text">{{ item.lastMessage === null ? '' : item.lastMessage.content }}</div>
                </div>
                <div class="unread-wrapper flex-center" v-if="item.unread">{{ item.unread }}</div>
              </div>

            </div>
          </div>
        </div>
        <div class="chat-area">
          <div class="message-items" ref="messageItems">
            <div v-for="(item, index) in messagesList">
              <div class="time" v-if="shouldShowTime(index)">{{ dayUtils.formatTimestamp(item.timestamp) }}</div>
              <div class="message-item" :class="{ me: item.senderId == userId }">
                <a-avatar size="large" :src="item.userinfo?.avatarUrl"></a-avatar>
                <div class="message-content">
                  <a-image v-if="item.imgUrl" :src=item.imgUrl :height="80" :width="80" :preview-mask="false"
                    :preview="{ getContainer: () => messageItems }"
                    style="object-fit: cover;border-radius: 10px;"></a-image>
                  <div>{{ item.content }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="message-input" style="max-height: 50%;display: flex;flex-direction: column">
            <div style="flex: 1">
              <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }" @keyup.stop
                style="background-color: transparent;color: black;border: none;outline: none;box-shadow: none;"
                placeholder="想聊点儿什么？" v-model:value="messageContent"
                @keydown.enter.prevent="handleSendMessage"></a-textarea>
            </div>
            <div style="display: flex">
              <div class="upload-picture" v-if="previewUrl != ''">
                <a-image :src=previewUrl :height="80" :width="80" :preview-mask="false"
                  style="object-fit: cover;border-radius: 10px;"></a-image>
                <div class="delete-btn" @click.stop="previewUrl = ''">
                  <icon-close-circle-fill></icon-close-circle-fill>
                </div>
              </div>
              <div class="functions">
                <div class="send" @click="handleSendMessage"
                  style="cursor: pointer;margin-right: 5px;display: flex;flex-direction: column-reverse">
                  <ArrowCircleUp></ArrowCircleUp>
                </div>
                <div class="picture" style="cursor: pointer;display: flex;flex-direction: column-reverse">
                  <div @click="triggerFileSelect">
                    <Picture></Picture>
                    <input type="file" ref="fileInput" accept="image/*" @change="handlePictureUpload"
                      style="display: none" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>

</template>

<style scoped>
/* 工具属性，用来隐藏盒子 */
.hidden {
  display: none;
}


::v-deep(.ant-input:focus) {
  box-shadow: 0 0 0 0;
}

.container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 15px;

  .title {
    font-weight: bold;
    display: flex;
    font-size: 25px;
    padding: 10px;
    position: relative;

    .unfold-button {
      cursor: pointer;
      position: absolute;
      top: 10px;
      right: 425px;
    }


    .more {
      .menu {
        width: auto;

        .menu-item {
          cursor: pointer;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }
    }

    .exit-button {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      font-size: 15px;
      margin-left: auto;

      &:hover {
        color: red;
      }
    }
  }

  .conversations {
    overflow-y: auto;
    padding-top: 10px;
    width: 300px;
    height: 500px;

    .conversation {
      display: flex;
      margin-bottom: 5px;
      cursor: pointer;
      padding: 5px;
      border-radius: 15px;

      &:hover {
        background-color: #eee;
      }

      .last-message {
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .conversation-details {
    height: 500px;
    display: flex;

    .chat-list {
      position: relative;
      height: 100%;
      width: 75px;
      /* 缓动 */
      transition: width 0.2s ease-in-out;

      .message {
        height: 100%;
        overflow-y: auto;

        .message-item {
          margin-right: 10px;
          border-radius: 15px;
          margin-bottom: 10px;
          cursor: pointer;
          padding: 10px;
          display: flex;

          &:hover {
            background-color: #eee;
          }

          .message-text {
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .message-item.active {
          background-color: #eee;
          border-radius: 15px;
        }
      }
    }

    .chat-list.expansion {
      width: 200px;
    }

    .chat-area {
      height: 100%;
      width: 400px;
      display: flex;
      flex-direction: column;

      .message-items {
        flex: 1;
        overflow-y: auto;
        padding: 20px;

        .time {
          text-align: center;
          margin: 10px;
          color: grey;
        }

        .message-item {
          display: flex;
          margin-bottom: 20px;

          .message-content {
            display: flex;
            margin-left: 10px;
            margin-right: 10px;
            padding: 10px;
            background-color: #f1ebeb;
            border-radius: 15px;
            max-width: 50%;
            word-break: break-word;
            /* 强制在单词内部也可以换行 */
            white-space: normal;
            /* 允许自动换行 */
            overflow-wrap: break-word;
            /* 更好的兼容性（等效于 word-break） */
          }
        }

        .me {
          flex-direction: row-reverse;

          .message-content {
            background-color: #eaedf1;
          }
        }
      }

      .message-input {
        display: flex;
        border: 2px solid rgba(199, 200, 201, 0.77);
        border-radius: 10px;

        .upload-picture {
          position: relative;
          margin: 10px;

          .delete-btn {
            cursor: pointer;
            width: 20px;
            height: 20px;
            position: absolute;
            left: 68px;
            top: -5px;
          }
        }

        .functions {
          margin-left: auto;
          display: flex;
          flex-direction: row-reverse;
          font-size: 30px;
          gap: 5px;
          color: #c7c8ca;

          .send.picture {
            display: flex;
            flex-direction: column-reverse;
            cursor: pointer;
          }
        }
      }
    }
  }
}

.container-expansion {
  width: 600px;
}

.unread-wrapper {
  margin-top: 10px;
  color: white;
  background-color: #fe2c55;
  width: 20px;
  height: 20px;
  font-size: 15px;
  border-radius: 50%;
}
</style>
