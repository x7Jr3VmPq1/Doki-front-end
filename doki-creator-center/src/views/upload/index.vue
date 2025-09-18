<script setup lang="ts">
import draftService from '../../api/draftService.ts'
import {ref, reactive, computed} from 'vue';
import DButton from "../../components/d-button.vue";
import {dayjs} from "@arco-design/web-vue/es/_utils/date";
import {Message} from '@arco-design/web-vue';

const draftCreated = ref(false);

// 视频上传服务器路径
const videoUploadPath = ref("http://localhost:10010/video/upload?draft_id=");
const handleBeforeUpload = async (file: File) => {
  if (file.size > 10 * 1024 ** 3) {
    // 文件大于 10GB
    Message.error("上传文件太大了哦？")
    return false;
  }
  const result = await draftService.createDraft();
  if (result.isSuccess()) {
    videoUploadPath.value = videoUploadPath.value + result.data.id;
    draftCreated.value = true;
    return true;
  }
  Message.error(result.msg);
  return false;
};

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


const handleChangeItem = (items: any, choice: any) => {
  items.forEach((item: any) => {
    item.active = item.code == choice.code;
  })
}

const isShowCalender = computed(() => {
  return publishTimeItems.find(item => item.code === 1)?.active
});


function onSelect(dateString:string) {
  console.log('onSelect', dateString);
  const date1 = new Date(dateString);
  const timestamp = Math.floor(date1.getTime() / 1000); // 秒级时间戳
  console.log(timestamp);
}

function onChange(dateString, date) {
  console.log('onChange: ', dateString, date);
}

function onOk(dateString, date) {
  console.log('onOk: ', dateString, date);
}
</script>

<template>
  <div class="main-wrapper">
    <div class="menu">
      <div class="menu-item">
        <h2>发布视频</h2>
        <div class="red-bar active"></div>
      </div>
      <div class="menu-item">
        <h2>发布图文</h2>
        <div class="red-bar"></div>
      </div>
    </div>
    <a-upload
        accept="video/*"
        draggable
        :limit=1
        :on-before-upload=handleBeforeUpload
        :action=videoUploadPath
    />
    <div class="info-input-area" v-if="draftCreated">
      <div class="base-info">
        <h3 style="margin-bottom: 20px">基础信息</h3>
        <div style="display: flex">
          <h3>作品描述</h3>
          <div class="input-area">
            <div class="video-title">
              <input type="text" placeholder="作品标题">
            </div>
            <div class="video-description">
              <textarea class="plain-textarea" placeholder="添加作品简介"></textarea>
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
               @click="handleChangeItem(permissionItems,item)"
               class="item" :class="{active:item.active}">
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
               @click="handleChangeItem(publishTimeItems,item)"
               class="item" :class="{active:item.active}">
            <div class="dot">
              <div class="inner"></div>
            </div>
            <div>{{ item.text }}</div>
          </div>
          <a-date-picker
              v-if="isShowCalender"
              :disabledDate="(current: Date) => dayjs(current).isBefore(dayjs(), 'day')"
              style="width: 220px; margin: 0 24px 24px 0;"
              show-time
              format="YYYY-MM-DD HH:mm"
              @change="onChange"
              @select="onSelect"
              @ok="onOk"
          />
        </div>
        <div v-if="isShowCalender" style="margin-top: 10px;font-weight: bold">
          选择定时发布时，只能选择大于当前时间2小时且在14天内的时间。
        </div>
      </div>
      <div class="operation">
        <d-button button-type="confirm">发布</d-button>
        <d-button button-type="cancel">暂存离开</d-button>
      </div>
    </div>
  </div>
</template>

<style scoped>

:deep(.arco-picker) {
  margin: 0 !important;
  height: 40px !important;
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

.main-wrapper {
  padding-left: 5%;
  padding-right: 5%;

  .menu {
    padding-left: 5px;
    display: flex;
    gap: 10px;

    .menu-item {
      cursor: pointer;

      .red-bar {
        height: 3px;
        margin-top: 3px;
      }

      .red-bar.active {
        background-color: #e5355e;
      }
    }
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

    .operation {
      display: flex;
      gap: 20px;
    }
  }

  padding-bottom: 50px;
}
</style>
