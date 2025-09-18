<script setup lang="ts">
import {Right} from '@icon-park/vue-next'
import router from '../../router/router'
import draftService from '../../api/draftService.ts'
import {Message} from '@arco-design/web-vue';

import {onMounted, ref} from "vue";

const hasUnPublish = ref(false);
onMounted(async () => {
  // 获取用户未发布的草稿信息
  const response = await draftService.getDraft();
  if (response.isSuccess()) {
    // 如果获取到，提示用户有未发布的作品
    if (response.data) {
      hasUnPublish.value = true;
    }
    return;
  }
  Message.error(response.msg);
})

const handleDeleteDraft = () => {
  await draftService.
}
</script>

<template>
  <div class="main-wrapper">
    <div class="works">
      <div class="title">
        <h2 class="text">新的创作</h2>
        <div style="color: #777880" v-if="hasUnPublish">
          您有一个上次未发布的作品
          <span class="to-edit">继续编辑
            <Right></Right>
          </span>
          <span class="delete" @click="handleDeleteDraft">放弃</span>
        </div>
      </div>
      <div class="upload-items">
        <div class="to-upload-video" @click="router.push('/upload')">
          <span>
          发布视频
          </span>
          <div style="color: #777880;margin-top: 5px">支持常用格式，推荐mp4</div>
        </div>
        <div class="to-upload-image">
          <span>
            发布图文
          </span>
          <div style="color: #777880;margin-top: 5px">支持图片常用格式，jpg，png</div>

        </div>
      </div>
    </div>
    <div class="data-center">
      <h2>数据中心</h2>
    </div>
  </div>
</template>

<style scoped>
.main-wrapper {
  width: 100%;
  padding-left: 20px;
}

.works, .data-center {
  width: 90%;
  background-color: #fff;
  border-radius: 15px;
  margin-bottom: 15px;
}

.works {
  height: 150px;
  padding: 20px 20px;


  .title {
    display: flex;
    align-items: flex-end;

    .text {
      flex: 1;
    }

    .to-edit {
      color: #1890ff;
      cursor: pointer;
    }

    .delete {
      color: red;
      cursor: pointer;
    }
  }

  .upload-items {
    display: flex;
    gap: 20px;
    height: 80%;
    margin-top: 20px;

    .to-upload-video, .to-upload-image {
      cursor: pointer;
      width: 200px;
      height: 50px;
      padding: 5px;

      span {
        font-weight: bold;
      }
    }

    .to-upload-video {
      background-color: #fff2ea;
    }

    .to-upload-image {
      background-color: #ecf6ff;

    }
  }
}

.data-center {
  height: 600px;
}
</style>
