<script setup lang="ts">

import {dayjs} from "@arco-design/web-vue/es/_utils/date";
import {reactive} from "vue";
import {useDraftFormStore} from "./draftFormStore.ts";

const draftForm = useDraftFormStore();

const permissionItems = reactive(
    [{
      text: '公开',
      code: 0,
      active: true
    }, {
      text: '仅限好友',
      code: 1,
      active: false
    }, {
      text: '私密',
      code: 2,
      active: false
    }])

const publishTimeItems = reactive(
    [{
      text: '立即发布',
      code: 0,
      active: true
    }, {
      text: '定时发布',
      code: 1,
      active: false
    }]
)

// 修改作品权限，0：公开，1：仅限好友，2：私密
const setPermission = (code: number) => {
  console.log('切换权限')
  draftForm.permission = code;
}
// 修改发布时间，0：立即发布，1：计划发布
const setPublishTime = (code: number) => {
  console.log('切换发布时间')
  draftForm.isScheduled = code;
}

// 时间选择器点击确定后，更新计划发布时间
function onOk(dateString: string) {
  const date = new Date(dateString);
  // 秒级时间戳
  draftForm.scheduledTime = Math.floor(date.getTime() / 1000);
}

</script>

<template>
  <div class="info-input-area" v-if="true">
    <!--      <div class="info-input-area" v-if="false">-->
    <div class="base-info">
      <h3 style="margin-bottom: 20px">基础信息</h3>
      <div style="display: flex">
        <h3>作品描述</h3>
        <div class="input-area">
          <div class="video-title">
            <input type="text" placeholder="作品标题" v-model="draftForm.title">
          </div>
          <div class="video-description">
            <textarea class="plain-textarea" placeholder="添加作品简介" v-model="draftForm.description"></textarea>
            <div>
              <span>#添加话题</span>
              <span>@好友</span>
            </div>
          </div>
          <div class="video-tags">
            <span style="padding-top:5px;color:#7b7e88">推荐</span>
            <div style="padding-top: 2px;display: flex;gap: 10px">
              <a-tag checkable>#二次元</a-tag>
              <a-tag checkable>#二次元</a-tag>
              <a-tag checkable>#二次元</a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="setting">
      <h3>发布设置</h3>
      <div class="permission">
        <h4 class="title">谁可以看</h4>
        <div v-for="item in permissionItems"
             @click="setPermission(item.code)"
             class="item" :class="{active:item.code == draftForm.permission}">
          <div class="dot">
            <div class="inner"></div>
          </div>
          <div>{{ item.text }}</div>
        </div>
      </div>
      <div class="publish-time">
        <h4 class="title">
          发布时间
        </h4>
        <div v-for="item in publishTimeItems"
             @click="setPublishTime(item.code)"
             class="item" :class="{active:item.code == draftForm.isScheduled}">
          <div class="dot">
            <div class="inner"></div>
          </div>
          <div>{{ item.text }}</div>
        </div>
        <a-date-picker
            v-if="draftForm.isScheduled"
            :defaultValue="draftForm.scheduledTime * 1000"
            format="YYYY-MM-DD HH:mm"
            :disabledDate="(current: Date) => dayjs(current).isBefore(dayjs(), 'day')"
            style="width: 220px; margin: 0 24px 24px 0;"
            show-time
            @ok="onOk"
        />
      </div>
      <div v-if="draftForm.isScheduled" style="margin-top: 10px;font-weight: bold">
        选择定时发布时，只能选择大于当前时间2小时且在14天内的时间。
      </div>
    </div>
  </div>

</template>

<style scoped>

:deep(.arco-picker) {
  margin: 0 !important;
  height: 40px !important;
}


.plain-textarea {
  all: unset; /* 清除所有默认样式 */
  display: block; /* textarea 默认是 block，但 unset 后需要确认 */
  width: 90%; /* 固定宽度 */
  height: 90%; /* 固定高度 */
  resize: none; /* 禁止用户调整大小 */
  box-sizing: border-box; /* 包括 padding 和 border 在内计算大小 */
  padding: 0; /* 清空内边距 */
  margin: 0; /* 清空外边距 */
  overflow: auto; /* 内容超出时显示滚动条 */
  font: inherit; /* 保持字体继承，不使用浏览器默认字体 */
}

input {
  all: unset; /* 重置几乎所有样式，包括边框、背景、字体等 */
  display: inline-block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}


.info-input-area {
  .base-info, .setting {
    width: 850px;
    background-color: #fff;
    border-radius: 15px;
    margin-bottom: 20px;
    padding: 20px;
  }

  .setting {
    padding-top: 20px;
    padding-left: 20px;

    .permission, .publish-time {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }

    .title {
      display: flex;
      align-items: center;
    }

    .item {
      .dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px grey solid;
        margin-right: 5px;
        margin-left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .inner {
          margin: 25%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
      }

      cursor: pointer;
      width: 120px;
      height: 40px;
      background-color: #f8f9f9;
      display: flex;
      align-items: center;
    }
  }

  .item.active {
    background-color: #fdf5f7;
    color: #fe2c55;

    .dot {
      border: none;
      background-color: #fe2c55;

      .inner {
        background-color: #fff;
      }
    }
  }

  .base-info {
    .input-area {
      margin-left: 25px;
      width: 700px;
      height: 300px;
      background-color: #f9f9fa;
      display: flex;
      flex-direction: column;

      .video-title, .video-tags {
        height: 40px;
        padding-left: 10px;
      }

      .video-tags {
        display: flex;
        gap: 10px;
        padding-top: 5px;
      }

      .video-description {
        padding-top: 10px;
        padding-left: 10px;
        border-bottom: 2px solid #e4e4e6;
        border-top: 2px solid #e4e4e6;
        flex: 1;

        span {
          margin-right: 10px;
          margin-bottom: 5px;
          cursor: pointer;
          color: #6f7f9d;
        }
      }
    }
  }


}


</style>
