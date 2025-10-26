<script setup lang="ts">
import draftService from '../../api/draftService.ts'
import {onMounted, reactive, ref} from 'vue';
import {useDraftFormStore} from "./draftFormStore.ts";
import DButton from "../../components/d-button.vue";
import {Message} from '@arco-design/web-vue';
import {useRoute} from 'vue-router'
import {handleRequest} from "../../api/handleRequest.ts";
import BaseInfoForm from "./base-info-form.vue";

const route = useRoute(); // 引入路由

const draftForm = useDraftFormStore(); // 引入表单数据

const draftCreated = ref(false);  // 是否创建了草稿

const uploadComponentRef = ref<any>(null);  // 上传组件引用


const isUploadSuccess = ref(false); // 上传成功标记

const handleUploadSuccess = () => { // 上传成功回调
  Message.success('上传成功！');
  isUploadSuccess.value = true;
}

const uploadedVideoInfo = reactive({  // 视频信息
  filename: '',
  size: 0,
  progress: 0
})


// 如果是从继续编辑而来，直接显示草稿表单
onMounted(async () => {
  if (route.query.enter_from == 'draft') {
    draftCreated.value = true;
  }
  // 获取草稿
  if (draftCreated.value)
    await handleRequest(draftService.getDraft,
        {
          onSuccess(data) {
            draftForm.initForm(data);
          }
        }
    )
})

// 视频上传服务器路径
const videoUploadPath = ref("http://localhost:10010/video/upload?draft_id=");

// 上传视频前的钩子方法
const handleBeforeUpload = async (file: File) => {
  console.log('开始上传视频...');
  isUploadSuccess.value = false; // 重置上传状态

  if (file.size > 10 * 1024 ** 3) {
    // 文件大于 10GB
    Message.error("上传文件太大了哦")
    return false;
  }

  if (draftForm.id !== 0) {
    draftCreated.value = true;
    return true;
  }

  let result = false;
  // 如果当前没有草稿，创建草稿
  await handleRequest(draftService.createDraft, {
    onSuccess(data) {
      draftForm.initForm(data);
      draftCreated.value = true;
      result = true;
    }
  })
  return result;
};

// 处理上传变更事件
const handleUploadChange = (fileItem) => {
  uploadedVideoInfo.filename = fileItem[fileItem.length - 1].name;
  uploadedVideoInfo.progress = fileItem[fileItem.length - 1].percent;

  localStorage.setItem('uploadProgress', JSON.stringify({
    filename: uploadedVideoInfo.filename,
    progress: uploadedVideoInfo.progress
  }))
}

// 处理重新上传方法
const handleReUpload = () => {

  const input = document.createElement('input');
  input.type = 'file'; // 文件类型
  input.accept = 'video/*'; // 只接受视频
  input.multiple = false; // 禁止多选

  // 用户选择文件后
  input.addEventListener('change', (event) => {
    const files = Array.from((event.target as HTMLInputElement).files!);
    uploadComponentRef.value?.upload(files);
  });
  // 触发文件选择器
  input.click();
}

// =========== 保存草稿 ===========
// 保存草稿方法
const handleSaveDraft = async () => {
  await handleRequest(draftService.updateDraft, {
    params: draftForm,
    onSuccess() {
      Message.info("保存成功");
    },
  })
}


// 提交表单方法
const handleSubmit = () => {
  handleRequest(draftService.submitDraft, {
    params: draftForm.formData,
    onSuccess: () => {
      Message.success('提交成功！视频将在审核成功后展示~');
      // 清理数据
      draftCreated.value = false;
      draftForm.initForm();
    },
  })
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
    <div class="content">
      <a-upload
          v-show="!draftCreated"
          accept="video/*"
          draggable
          :show-file-list="false"
          :on-before-upload=handleBeforeUpload
          :action="videoUploadPath + draftForm.id"
          @change="handleUploadChange"
          ref="uploadComponentRef"
          @success="handleUploadSuccess"
      ></a-upload>
      <!-- 草稿信息表单 -->
      <div v-if="draftCreated">
        <base-info-form></base-info-form>
        <!-- 提交/保存按钮 -->
        <div class="operation">
          <d-button button-type="confirm" @click="handleSubmit">发布</d-button>
          <d-button button-type="cancel" @click="handleSaveDraft">暂存离开</d-button>
          <div v-if="!isUploadSuccess"
               style="display: flex;align-items: center;justify-content: center;font-weight: bold">
            在上传成功之前，请不要离开页面。
          </div>
        </div>
      </div>

      <div v-if="draftCreated">
        <div class="video-upload-info">
          <div style="height: 80%;padding-top: 25%">
            <div style="display: flex;align-items: center;justify-content: center">
              <a-progress type="circle" status="normal"
                          :percent="uploadedVideoInfo.progress" color="#ff3c69"/>
            </div>
            <div class="video-name" style="margin-top: 30%">{{ uploadedVideoInfo.filename }}</div>
          </div>
          <div class="button">
            <d-button button-type="confirm" @click="handleReUpload">重新上传</d-button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>

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

  .content {
    display: flex;

    .video-upload-info {
      width: 200px;
      height: 300px;
      background-color: #fff;
      border-radius: 15px;
      margin-left: 20px;

      .button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .operation {
      display: flex;
      gap: 20px;
    }
  }
}


</style>
