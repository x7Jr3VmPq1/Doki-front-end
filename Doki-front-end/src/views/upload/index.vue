<script setup lang="ts">
import {h, ref} from 'vue';
import {InboxOutlined, PlusOutlined, SmileOutlined} from '@ant-design/icons-vue';
import {message, notification} from 'ant-design-vue';
import {uploadVideo, publishVideo} from "../../api/videoService.ts";
import type {UploadRequestOption} from "ant-design-vue/es/vc-upload/interface";
import type {AxiosProgressEvent} from "axios";

const fileList = ref([]);
// 进度条百分比
const uploadPercent = ref(0);
// 是否上传视频标记
const isSuccess = ref(false);
// 预览视频链接
const previewVideoUrl = ref('');
// 在视频没有传输完毕之前，不允许点击发布，用一个标记控制
const allowSubmit = ref(false);
// 视频表单数据
const formData = ref({
  videoTitle: '',
  videoDesc: '',
  category: '日常',
  tags: [],
});
const handleChange = () => {
  // 让表单输入区域显示
  isSuccess.value = true;
};

function handleDrop(e: DragEvent) {
  console.log(e);
}

// 撤销确认对话框的显示标记
const open = ref(false);
// 当用户重新上传时，清空所有数据
const cancelUpload = () => {
  isSuccess.value = false;
  fileList.value = [];
  previewVideoUrl.value = '';
  allowSubmit.value = false;
  uploadPercent.value = 0;
  open.value = false;
  formData.value = {
    videoTitle: '',
    videoDesc: '',
    category: '',
    tags: [],
  };
};

// 自定义上传
const customUpload = async (options: UploadRequestOption) => {
  const {file, onSuccess, onError} = options; // 解构出关键回调函数
  const formData = new FormData();
  formData.append('file', file as File); // 明确类型为 File

  const config = {
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      if (progressEvent.lengthComputable) {
        uploadPercent.value = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
      }
    },
  };
  const result = await uploadVideo(formData, config);
  if (result.code === 200) {
    // 3s 后允许点击发布
    setTimeout(() => {
      allowSubmit.value = true;
    }, 3000);
    onSuccess?.(result);
  } else {
    onError?.(new Error('上传失败'));
  }
};
// 上传前的处理
const beforeUpload = (file: File) => {
  // 检查是否为视频文件
  if (file.type!.startsWith('video/')) {
    previewVideoUrl.value = URL.createObjectURL(file);
  }
  return true;
};

// 标签
const inputValue = ref('');
const inputVisible = ref(false);

// 处理标签的输入
const handleInputConfirm = () => {
  if (formData.value.tags.length >= 5) {
    message.error('最多只能添加5个标签');
    inputValue.value = '';
    inputVisible.value = false;
    return;
  }
  if (inputValue.value.length > 10) {
    message.error('标签不能超过10个字');
    inputValue.value = '';
    inputVisible.value = false;
    return;
  }
  if (inputValue.value && !formData.value.tags.includes(inputValue.value)) {
    formData.value.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = '';
};
// 处理标签的删除
const handleClose = (removedTag: any) => {
  formData.value.tags = formData.value.tags.filter(tag => tag !== removedTag);
};

// 发布按钮的状态
const submitLoading = ref(false);

// 处理发布事件
const handleSubmit = async () => {
  submitLoading.value = true;
  // 模拟一小段延迟
  await new Promise(resolve => setTimeout(resolve, 3000));
  if (allowSubmit.value) {
    const result = await publishVideo(formData.value);
    if (result.code === 200) {
      notification.open({
        message: '系统通知',
        description: '上传成功！',
        icon: () => h(SmileOutlined, {style: 'color: #108ee9'}),
      });
      cancelUpload();
    } else {
      message.error('上传失败');
    }
  } else {
    message.error('请等待上传完成');
  }
  submitLoading.value = false;
};
</script>
<template>
  <div v-if="!isSuccess" class="uploadArea">
    <div class="uploadButton">
      <a-upload-dragger
          v-model:fileList="fileList"
          :beforeUpload="beforeUpload"
          name="file"
          :customRequest="customUpload"
          @change="handleChange"
          accept="video/*"
          @drop="handleDrop"
          :showUploadList="false">
        <div style="width: 100%;height: 100%; padding-top: 10%">
          <p class="ant-upload-drag-icon">
            <inbox-outlined></inbox-outlined>
          </p>
          <p class="ant-upload-text">点击或拖曳到此处上传</p>
          <p class="ant-upload-hint">请上传符合社区规则的视频</p>
        </div>
      </a-upload-dragger>
    </div>
  </div>
  <div v-else class="previewArea">
    <video autoplay muted controls :src="previewVideoUrl"
    ></video>
    <div class="progress">
      <a-progress
          :percent="uploadPercent"
          :strokeColor="'#108ee9'"
      ></a-progress>
      <a-popover>
        <template #content>
          <div>撤销操作</div>
          <div>继续上传将覆盖已上传的视频</div>
        </template>
        <a-button danger @click="open=true">撤销</a-button>
      </a-popover>
      <a-modal
          v-model:open="open"
          title="确认操作"
          @ok="cancelUpload"
          :ok-text="'确认'"
          :cancel-text="'取消'"
      >你确认要撤销吗？这个操作不可恢复
      </a-modal>
    </div>
    <!--  表单区域  -->
    <div class="formArea">
      <a-form
          layout="vertical"
          :model="formData"
          ref="form"
      >
        <a-form-item
            label="视频标题"
            name="videoTitle"
        >
          <a-input
              :maxlength="30"
              show-count
              v-model:value="formData.videoTitle" placeholder="请输入视频标题"/>
        </a-form-item>

        <a-flex gap="middle">
          <div style="flex: 1">
            <a-form-item label="视频描述" name="videoDesc">
              <a-textarea
                  v-model:value="formData.videoDesc"
                  :maxlength="100"
                  show-count
                  :autoSize="{ minRows: 4, maxRows: 6 }"
                  placeholder="可选内容" :rows="4"/>
            </a-form-item>
          </div>
          <div style="flex: 1">
            <a-form-item label="选择分类" name="category">
              <a-select v-model:value="formData.category" placeholder="请选择分类">
                <a-select-option value="日常">日常</a-select-option>
                <a-select-option value="搞笑">搞笑</a-select-option>
                <a-select-option value="影视剪辑">影视剪辑</a-select-option>
                <a-select-option value="其它">其它</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="标签" name="category">
              <a-tag
                  v-for="tag in formData.tags"
                  :key="tag"
                  closable
                  @close="handleClose(tag)"
              >
                {{ tag }}
              </a-tag>
              <a-input
                  v-if="inputVisible"
                  v-model:value="inputValue"
                  size="small"
                  @pressEnter="handleInputConfirm"
                  @blur="handleInputConfirm"
              />
              <a-tag v-else-if="formData.tags.length < 5" @click="inputVisible = (formData.tags.length !== 5)"
                     style="cursor: pointer">
                <plus-outlined/>
                新增标签(按Enter确认，最多5个)
              </a-tag>
            </a-form-item>
          </div>
          <div style="display: flex; align-items: flex-end; padding-bottom: 40px">
            <a-button
                :loading="submitLoading"
                :disabled="!allowSubmit"
                type="primary"
                @click="handleSubmit">发布
            </a-button>
          </div>
        </a-flex>
      </a-form>
    </div>
  </div>
</template>

<style scoped>


.uploadArea {
  width: 100%;
  height: 100%;

  .uploadButton {
    width: 100%;
    height: 50%;
  }
}

.previewArea {
  width: 100%;
  height: 50%;

  .progress {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    width: 50%;
  }

  video {
    background-color: black;
    width: 75%;
    height: auto;
    max-height: 400px; /* 限制最大高度 */
    object-fit: contain;
  }

  .formArea {
    margin-left: 15%;
    width: 70%;
  }
}
</style>
