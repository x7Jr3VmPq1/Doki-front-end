<script setup>
import {ref, reactive, watch, onBeforeMount, onMounted, nextTick} from 'vue';
import AvatarCropper from "./AvatarCropper.vue";
import {updateUserInfo, checkUserName} from "../api/userService";
import {message} from "ant-design-vue";
// 控制模态框的显示与隐藏变量
const isModalVisible = ref(false);
// 控制头像裁剪模态框的显示与隐藏变量
const isAvatarCropperModalVisible = ref(false);
// 表单实例
const form = ref(null);
// 表单数据
const formData = ref({});
onBeforeMount(() => {
  formData.value = {
    username: localStorage.getItem('username'),
    bio: localStorage.getItem('bio'),
    avatar: localStorage.getItem('avatar'),
  };
});

// 表单提交状态
const isSubmitting = ref(false);

// 用于存储用户上传的图片文件
const uploadedImage = ref(null);

const handleAvatarClick = () => {
  // 创建文件选择框
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*'; // 限制只能选择图片文件

  // 监听文件选择事件
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // 获取用户选择的文件
    if (file) {
      // 将文件转换为 URL
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImage.value = e.target.result; // 存储图片 URL
        isAvatarCropperModalVisible.value = true; // 打开裁剪模态框
      };
      reader.readAsDataURL(file);
    }
  });
  // 触发文件选择框
  fileInput.click();
};
// 打开编辑个人信息的对话框
const openModal = () => {
  isModalVisible.value = true;
};
// 处理取消表单
const handleCancel = () => {
  isModalVisible.value = false;
  // 清除表单验证
  form.value.clearValidate();
  // 重置表单数据
  formData.value = {
    username: localStorage.getItem('username'),
    bio: localStorage.getItem('bio'),
    avatar: localStorage.getItem('avatar'),
  };
};
// 处理提交表单
const handleSubmit = async () => {

  // 判断字符串是否以data:image/开头，并且包含base64
  function isBase64(str) {
    const regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    return regex.test(str);
  }

  isSubmitting.value = true;
  // 模拟一小段延迟
  setTimeout(() => {
  }, 1000);
  // 提交逻辑
  // 如果formData中的数据和本地存储的数据一致，则不执行更新操作
  if (
      formData.value.username === localStorage.getItem('username') &&
      formData.value.bio === localStorage.getItem('bio') &&
      formData.value.avatar === localStorage.getItem('avatar')
  ) {
    isSubmitting.value = false;
    isModalVisible.value = false;
    return;
  }
  try {
    const response = await updateUserInfo(
        localStorage.getItem('id'),
        formData.value.username,
        formData.value.bio,
        isBase64(formData.value.avatar) ? formData.value.avatar : null);
    if (response.code === 200) {
      localStorage.setItem('avatar', response.data.avatarUrl);
      localStorage.setItem('username', response.data.userName);
      localStorage.setItem('bio', response.data.bio);
      message.success('更新成功！');
      console.log(localStorage.getItem('bio'));
      // 延迟一小段时间后，跳转到新的个人资料页面
      setTimeout(() => {
        window.location.href = `/@${localStorage.getItem('username')}`;
      }, 1000);
      isModalVisible.value = false;
    } else {
      message.error('这个用户名已经存在了！');
    }
  } catch (e) {
    message.error('更新失败，请检查网络或稍后重试');
  }
  formData.value.isChanged = false;
  isSubmitting.value = false;
};

// 通知截图组件进行截图操作的标记
const cut = ref(false);
const handleAvatarCropperModalOk = () => {
  // 通知组件进行截图操作
  cut.value = true;
};

// 处理截图请求结果
const handleCropResult = (result) => {
  //  把处理头像的模态框关闭
  isAvatarCropperModalVisible.value = false;
  // 更新头像内容
  formData.value.avatar = result;
  // 恢复截图请求标志为false
  cut.value = false;
};
// 用户名可用校验器
const checkUsername = async (_, value) => {
  if (!value) {
    return Promise.reject('用户名不能为空');
  }
  const response = await checkUserName(value);
  if (response.data === '用户名可用') {
    return Promise.resolve();
  } else {
    return Promise.reject('用户名已经存在');
  }
};
</script>

<template>
  <!-- 打开模态框按钮  -->
  <a-button type="primary" @click="openModal">编辑个人信息</a-button>
  <!-- 编辑个人信息的对话框 -->
  <a-modal
      v-model:visible="isModalVisible"
      title="编辑个人信息"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirmLoading="isSubmitting"
      ok-text="提交修改"
      cancel-text="取消"
  >
    <div class="modal-content">
      <!-- 头像修改区域 -->
      <div class="avatar-section" @click="handleAvatarClick">
        <img :src="formData.avatar || 'https://via.placeholder.com/100'" alt="头像预览" class="avatar"/>
        <span class="upload-text">点击更换头像</span>
        <a-modal
            v-model:visible="isAvatarCropperModalVisible"
            @ok="handleAvatarCropperModalOk"
            ok-text="确认"
            cancel-text="取消"
        >
          <!-- 标题 -->
          <div class="title">
            <div class="title-text">裁剪头像</div>
          </div>
          <AvatarCropper
              :image="uploadedImage"
              :notice="cut"
              @cropResult="handleCropResult"
          ></AvatarCropper>
        </a-modal>
      </div>

      <!-- 用户名区域 -->
      <div>
        <a-form
            layout="vertical"
            :model="formData"
            ref="form"
        >
          <a-form-item
              label="用户名"
              name="username"
              :rules="[
                   { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '用户名只能包含中英文和数字', trigger: 'blur' },
                   { min: 2, max: 16, message: '用户名长度应为2到16个字符', trigger: 'blur' },
                   {validator: checkUsername,trigger: 'blur'}
                 ]"
          >
            <a-input
                :maxlength="16"
                show-count
                v-model:value="formData.username" placeholder="请输入用户名"/>
          </a-form-item>

          <a-form-item label="个人简介" name="bio">
            <a-textarea
                v-model:value="formData.bio"
                :maxlength="100"
                show-count
                :autoSize="{ minRows: 4, maxRows: 6 }"
                placeholder="这个人很懒，什么都没有留下..." :rows="4"/>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>


<style scoped>

.title {
  text-align: center; /* 标题居中 */
  margin-bottom: 16px; /* 标题与内容之间的间距 */
}

.title-text {
  font-size: 18px; /* 标题字体大小 */
  font-weight: bold; /* 标题加粗 */
  color: #333; /* 标题颜色 */
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-section {
  text-align: center;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* 添加过渡效果 */
}

.avatar:hover {
  cursor: pointer; /* 鼠标悬停时，显示手型 */
  transform: scale(1.01); /* 鼠标悬停时头像区域略微放大 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-text {
  display: block;
  margin-top: 10px;
  color: #1890ff;
  font-size: 12px;
}
</style>
