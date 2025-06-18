<script setup lang="ts">
import {Message, Remind, AddMusic, Search} from '@icon-park/vue-next';
import {ref, onMounted, nextTick} from "vue";
import {useSharedState} from "../store/useSharedState.ts";
import {getHotSearchList} from "../api/searchService.ts";
import router from "../router";
import {useRoute} from "vue-router";
import {CloseCircleOutlined, RestOutlined} from "@ant-design/icons-vue";
import type {SelectProps} from "ant-design-vue";

const route = useRoute()

// 搜索信息区域显示
const searchInfoBoxShow = ref(false);
// 热搜列表
const hotSearchList = ref([]);

onMounted(async () => {
  hotSearchList.value = (await getHotSearchList());
})

// 搜索方法
const sharedState = useSharedState();
const onSearch = async (content: string) => {
  // 如果搜索为空则返回
  if (!content.trim()) return;
  // 添加搜索记录
  sharedState.addSearchHistory(content);
}
import {getNotifications} from '../api/notificationService.ts'
import {dayUtils} from "../utils/dayUtils.ts";
import MyDirectMessage from "./direct-message/MyDirectMessage.vue";
import MyPopover from "./MyPopover.vue";
import Profiles from "./profiles/Profiles.vue";

// 通知列表
const notificationList = ref([]);
// 通知类型选择回调
const handleChange: SelectProps['onChange'] = async (value) => {
  if (value === '0') {
    const res = await getNotifications('all');
    console.log(res.data);
    notificationList.value.push(...res.data);
  }
};

// 点击私信按钮回调
const directMessage = ref<InstanceType<typeof MyDirectMessage> | null>(null)
const handleClickDirectMessage = () => {
  nextTick(() => {
    directMessage?.value?.getConversations();
  })
}
</script>

<template>
  <div class="title-bar">
    <div class="search-input-area">
      <div class="input-wrapper">
        <div class="input">
          <input
              type="text"
              placeholder="搜索"
              @focus="searchInfoBoxShow=true;"
              @blur="searchInfoBoxShow=false;"
          >
        </div>
        <div class="icon-wrapper" style="display: flex;">
          <div style="display: flex;align-items: center;">
            <search theme="outline" size="20" fill="#333"/>
          </div>
          <div style="display: flex;align-items: center;font-size: 20px">搜索</div>
        </div>
      </div>
      <!-- 搜索信息区域 -->
      <div class="search-info-box" v-if="searchInfoBoxShow" @mousedown.prevent>
        <div class="search-history" v-if="sharedState.getSearchHistory().length > 0">
          <div style="text-align: start;margin-left: 20px;margin-top: 20px;display: flex">
            <div>历史记录</div>
            <a style="margin-left: auto;margin-right: 20px;cursor: pointer;" @click="sharedState.clearSearchHistory()">
              <RestOutlined/>
              清空</a>
          </div>
          <div style="margin-left: 20px;margin-top: 10px">
            <div class="history-items">
              <div class="history-item" v-for="(item) in sharedState.getSearchHistory()">
                <a-button type="link" @click="onSearch(item)">{{ item }}</a-button>
                <!-- 用来做单个删除的图标 -->
                <div class="delete-btn">
                  <CloseCircleOutlined @click="sharedState.deleteSearchHistory(item)">
                  </CloseCircleOutlined>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="display: flex;">
          <div style="margin-left: 20px;margin-top: 20px">猜你想搜</div>
          <div class="search-info-change">换一换</div>
        </div>
        <div style="text-align: start;margin-left: 20px;margin-top: 20px;margin-bottom: 5px">热搜列表</div>
        <div class="search-info-item" v-for="(item,index) in hotSearchList" @click="onSearch(item)">
          <div style="text-align: start;">{{ `${index + 1}.  ${item}` }}</div>
        </div>
      </div>
    </div>
    <div class="functions">
      <a-popover
          :arrow="false"
          :overlayStyle="{paddingTop: '10px'}"
      >
        <template #content>
          <Profiles></Profiles>
        </template>
        <div style="width: 40px;height: 40px">
          <div class="avatar-wrapper">
            <img style="object-fit: contain;width:100%;height: 100%;"
                 src="http://localhost:8081/avatars/3137ae21-cd4b-4b9f-8426-a2c514273dbf.jpg">
          </div>
        </div>
      </a-popover>
      <div class="function" @click="router.push('/upload')">
        <add-music theme="outline" size="30" fill="#AAABAF"/>
        <div style="text-align: center">投稿</div>
      </div>
      <!--            <a-popover
                      :destroyTooltipOnHide="true"
                      :arrow="false"
                      :overlayStyle="{paddingTop: '10px',width: '500px'}"
                      trigger="click"
                      placement="bottomRight"
                      @openChange="handleClickDirectMessage"
                      overlayClassName="my-popover"
                  >
                    <template #content>
                      <MyDirectMessage ref="directMessage"></MyDirectMessage>
                    </template>
                    <div class="function">
                      <Message theme="outline" size="30" fill="#AAABAF"/>
                      <div style="text-align: center">消息</div>
                    </div>
                  </a-popover>-->
      <my-popover>
        <template #trigger>
          <div class="function">
            <Message theme="outline" size="30" fill="#AAABAF"/>
            <div style="text-align: center">消息</div>
          </div>
        </template>
        <template #content>
          <MyDirectMessage></MyDirectMessage>
        </template>
      </my-popover>

      <a-popover
          :arrow="false"
          :overlayStyle="{paddingTop: '10px',paddingRight: '10px',minWidth: '350px'}"
          trigger="click"
      >
        <template #content>
          <div style="height: 400px">
            <div style="display: flex;">
              <div>互动消息</div>
              <div style="margin-left: auto">
                <a-select
                    ref="select"
                    style="width: 120px"
                    @change="handleChange"
                    defaultValue="全部消息"
                >
                  <a-select-option value="0">全部消息</a-select-option>
                  <a-select-option value="1">粉丝</a-select-option>
                  <a-select-option value="2">@我的</a-select-option>
                  <a-select-option value="3">评论</a-select-option>
                  <a-select-option value="4">赞</a-select-option>
                  <a-select-option value="5">弹幕</a-select-option>
                </a-select>
              </div>
            </div>
            <div class="message-items" style="overflow-y: auto;height: 95%;padding-top: 15px">
              <div v-for="item in notificationList" style="margin-bottom: 5px">
                <div style="display: flex;">
                  <div class="avatar-wrapper"
                       style="width: 40px;height: 40px;">
                    <div style="border-radius: 50%;overflow: hidden">
                      <img style="object-fit: contain;width:100%;height: 100%;"
                           :src="item.avatarUrl" alt="">
                    </div>
                  </div>
                  <div style="flex: 1;padding-left: 15px">
                    <div>{{ item.operatorName }}</div>
                    <div>{{ item.message }}</div>
                    <div>{{ dayUtils.formatDate(item.createdAt) }}</div>
                  </div>
                  <div style="width: 60px;height: 40px;">
                    <img style="height: 100%;width: 100%;object-fit:cover"
                         src="http://localhost:8081/avatars/3137ae21-cd4b-4b9f-8426-a2c514273dbf.jpg" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div class="function">
          <Remind theme="outline" size="30" fill="#AAABAF"/>
          <div style="text-align: center">通知</div>
        </div>
      </a-popover>
    </div>
  </div>
</template>

<style scoped>

.title-bar {
  display: flex;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;

  .search-input-area {
    width: 80%;
    text-align: center;
    display: flex;
    padding-top: 10px;
    padding-bottom: 10px;
    position: relative;

    .search-info-box {
      width: 50%;
      left: 0;
      right: 0;
      margin: 0 auto;
      position: absolute;
      z-index: 10;
      top: 90%;
      border-radius: 10px;
      border: solid 1px #d9d9d9;
      background-color: #fff;
      padding-bottom: 10px;

      .search-history {

        .history-items {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          max-height: calc(2 * 35px);
          overflow: hidden;

          .history-item {
            line-height: 1;
            position: relative;
            display: flex;

            .delete-btn {
              position: absolute;
              right: 1px;
              top: 1px;
              color: skyblue;
              font-size: 12px;
              cursor: pointer;
              display: none;
            }

            &:hover {
              .delete-btn {
                display: block;
              }
            }
          }

        }
      }

      .search-info-change {
        margin-left: auto;
        margin-top: 20px;
        margin-right: 20px;
        cursor: pointer;
        color: #AAABAF;
      }

      .search-info-change:hover {
        color: lightskyblue;
      }

      .search-info-item {
        line-height: 2.5;
        padding-left: 20px;
        cursor: pointer;
      }

      .search-info-item:hover {
        background-color: #f5f5f5;
        color: lightskyblue;
      }
    }

    .input-wrapper {
      width: 50%;
      background-color: #ededef;
      margin: 0 auto;
      border-radius: 20px;
      padding-left: 10px;
      display: flex;
      overflow: hidden;

      .input {
        padding-left: 10px;
        flex: 1;
      }

      .icon-wrapper {
        display: flex;
        text-align: center;
        cursor: pointer;
        padding: 0 20px;
      }

      .icon-wrapper:hover {
        background-color: #AAABAF;
      }

      input {
        width: 100%;
        height: 100%;
        border: none;
        background: none;
        outline: none;
      }
    }
  }

  .functions {
    display: flex;
    width: 20%;
    flex-direction: row-reverse;
    padding-top: 10px;
    padding-right: 20px;
    gap: 20px;
    box-sizing: border-box;

    .avatar-wrapper {
      cursor: pointer;
    }

    .function {
      display: flex;
      flex-direction: column;
      color: #AAABAF;
    }

    .function:hover {
      cursor: pointer;
      color: lightskyblue;
    }

    .avatar-wrapper {
      width: 100%;
      height: 100%;
      background-color: #fff;
      border-radius: 50%;
      overflow: hidden;
    }
  }
}
</style>
