<script setup lang="ts">

import {ref, watch, onMounted, nextTick} from "vue";
import {ArrowCircleUp, Picture, MenuFold, MenuUnfold, More} from "@icon-park/vue-next";
import {IconCloseCircleFill} from "@arco-design/web-vue/es/icon";
import {getConversations, getMessages, sendMessage, delMessage} from "../../api/messsageService.ts";
import {dayUtils} from "../../utils/dayUtils.ts";
import {Modal} from 'ant-design-vue';
import {createVNode} from 'vue';
import {ExclamationCircleOutlined} from '@ant-design/icons-vue';

// 页面加载后，获取聊天列表
const isConversationsLoading = ref(false);
const conversations = ref([]);
const activeConversationIndex = ref(-1);
onMounted(async () => {
  isConversationsLoading.value = true;
  // 延迟一秒钟
  await new Promise((resolve) => setTimeout(resolve, 500));
  const res = await getConversations();
  conversations.value = res.data;
  isConversationsLoading.value = false;
})

// 当前用户ID
const userId = ref(localStorage.getItem('id'));
// 点击聊天列表时，会进入会话详情
const messagesList = ref([]);
// 是否进入会话详情
const conversationsShow = ref(false);
const isHidden = ref(false);
// 聊天区域盒子引用
const messageItems = <HTMLElement | null>ref(null);

const handleClickConversation = async (conversationId: string, activeIndex: number) => {
  activeConversationIndex.value = activeIndex;
  const res = await getMessages(conversationId);
  messagesList.value = res.data;
  conversationsShow.value = true;
  isHidden.value = true;
  await nextTick(() => {
    messageItems.value.scrollTop = messageItems.value.scrollHeight;
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
const fileInput = ref(null)

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

  const currentTime = new Date(currentMsg.sentAt).getTime();
  const lastTime = new Date(lastMsg.sentAt).getTime();
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
  const res = await sendMessage({
    conversationId: activeConversation.conversationId,
    messageString: messageContent.value,
    targetUserId: activeConversation.userId,
    pictureBase64: previewUrl.value == '' ? null : previewUrl.value,
  });
  if (res.code == 200) {
    messagesList.value.push(res.data);
    activeConversation.lastMessage = previewUrl.value != '' ? '[图片]' + res.data.message : res.data.message;
    messageContent.value = '';
    previewUrl.value = '';
  } else {
    errorToll.error('发送失败，请检查网络或稍后再试');
  }
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
    getContainer: () => more.value,
    async onOk() {
      await delMessage(conversations.value[activeConversationIndex.value].conversationId)
      // 更新会话列表
      conversations.value.splice(activeConversationIndex.value, 1);
      // 如果没有任何会话了，就退出会话详情界面
      if (conversations.value.length == 0) {
        handleExitClick();
      } else {
        // 把当前会话重置回第一个
        await handleClickConversation(conversations.value[0].conversationId, 0);
      }
    }
  });
}
</script>

<template>
  <!-- 标题区域 -->
  <div class="title">
    <div v-if="isExpansion" style="font-size: 20px">私信</div>
    <div v-if="!conversationsShow" style="font-size: 20px">私信</div>
    <div v-if="conversationsShow" class="unfold-button" @click.stop="handleHideClick">
      <menu-unfold theme="outline" size="35" fill="#c7c8ca" v-if="isExpansion"/>
      <menu-fold theme="outline" size="35" fill="#c7c8ca" v-else/>
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
    <div class="conversations" :class="{'hidden': isHidden}">
      <div v-if="!isConversationsLoading" class="conversation" v-for="(item,index) in conversations"
           @click="handleClickConversation(item.conversationId,index)">
        <a-avatar :src="item.avatarUrl" size="large"></a-avatar>
        <div style="margin-left: 10px">
          <div class="user-name" style="margin-bottom: 5px">{{ item.username }}</div>
          <div class="last-message">{{ item.lastMessage }}</div>
        </div>
      </div>
      <div v-else style="text-align: center">
        <a-spin></a-spin>
      </div>
      <!-- 空盒子 -->
      <div class="empty-box" v-if="conversations.length === 0 && !isConversationsLoading">
        <a-empty description="还没有消息，找个人聊聊吧！"></a-empty>
      </div>
    </div>
    <div class="conversation-details" v-show="conversationsShow">
      <div class="chat-list" :class="{expansion: isExpansion }">
        <div class="message">
          <div class="message-item" :class="{active:index ==activeConversationIndex}"
               v-for="(item,index) in conversations"
               @click="handleClickConversation(item.conversationId,index)">
            <a-avatar size="large" :src="item.avatarUrl"></a-avatar>
            <div class="message-content" style="margin-left: 10px" v-if="isMessageContentShow">
              <div class="message-user-name">{{ item.username }}</div>
              <div class="message-text">{{ item.lastMessage }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-area">
        <div class="message-items" ref="messageItems">
          <div v-for="(item,index) in messagesList">
            <div class="time" v-if="shouldShowTime(index)">{{ dayUtils.formatDate(item.sentAt) }}</div>
            <div class="message-item" :class="{me: item.senderId == userId}">
              <a-avatar size="large" :src="item.senderAvatarUrl"></a-avatar>
              <div class="message-content">
                <a-image
                    v-if="item.attachmentUrl"
                    :src=item.attachmentUrl
                    :height="80"
                    :width="80"
                    :preview-mask="false"
                    style="object-fit: cover;border-radius: 10px;"
                ></a-image>
                <div>{{ item.message }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="message-input" style="max-height: 50%;display: flex;flex-direction: column">
          <div style="flex: 1">
            <a-textarea :auto-size="{ minRows: 1, maxRows: 8 }"
                        @keyup.stop
                        style="background-color: transparent;color: black;border: none;outline: none;box-shadow: none;"
                        placeholder="想聊点儿什么？"
                        v-model:value="messageContent"
                        @keydown.enter.prevent="handleSendMessage"
            ></a-textarea>
          </div>
          <div style="display: flex">
            <div class="upload-picture" v-if="previewUrl!=''">
              <a-image
                  :src=previewUrl
                  :height="80"
                  :width="80"
                  :preview-mask="false"
                  style="object-fit: cover;border-radius: 10px;"
              ></a-image>
              <div class="delete-btn" @click.stop="previewUrl=''">
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
                  <input
                      type="file"
                      ref="fileInput"
                      accept="image/*"
                      @change="handlePictureUpload"
                      style="display: none"
                  />
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

  .title {
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
            width: 120px;
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
            margin-left: 10px;
            margin-right: 10px;
            padding: 10px;
            background-color: #f1ebeb;
            border-radius: 15px;
            max-width: 50%;
            word-break: break-word; /* 强制在单词内部也可以换行 */
            white-space: normal; /* 允许自动换行 */
            overflow-wrap: break-word; /* 更好的兼容性（等效于 word-break） */
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
</style>
