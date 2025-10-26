<template>
  <Doki-Modal :visible="visible" title="编辑资料" :fullscreen="false" @update:visible="$emit('update:visible', $event)"
    @close="handleClose" class="edit-profile-modal">
    <div class="edit-profile-content">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container" @click="handleAvatarClick">
          <img v-if="formData.avatarUrl" :src="formData.avatarUrl" class="avatar" />
        </div>
        <p class="avatar-hint">点击修改头像</p>
      </div>

      <!-- 名字输入 -->
      <div class="form-group">
        <label class="form-label">名字</label>
        <div class="input-container">
          <input v-model="formData.username" type="text" class="form-input" placeholder="请输入用户名" maxlength="20"
            @input="handleNameInput" />
          <span class="char-count">{{ (formData.username || '').length }}/20</span>
        </div>
      </div>

      <!-- 简介输入 -->
      <div class="form-group">
        <label class="form-label">简介</label>
        <textarea v-model="formData.bio" class="form-textarea" placeholder="介绍一下你自己" rows="4" maxlength="100"
          resize="none"></textarea>
        <div class="char-count-bottom">{{ (formData.bio || '').length }}/100</div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <button class="cancel-btn" @click="handleCancel">取消</button>
      <button class="save-btn" @click="handleSave" :disabled="!isFormValid">保存</button>
    </template>

    <!-- 头像裁剪模态框 -->
    <Doki-Modal :visible="showAvatarCropper" title="修改头像" :fullscreen="false" :closeOnOverlay="false"
      @update:visible="showAvatarCropper = $event" class="avatar-crop-modal">
      <div class="avatar-crop-content">
        <!-- 主编辑区域 -->
        <div class="crop-main-area">
          <div class="crop-container">
            <AvatarCropper ref="avatarCropperRef" :image="selectedImage" :notice="cropNotice"
              @cropResult="handleCropResult" @cropPreview="handleCropPreview" />
          </div>

          <!-- 缩放控制 -->
          <div class="zoom-controls">
            <div class="zoom-slider-container">
              <span class="zoom-icon">🔍</span>
              <input type="range" class="zoom-slider" min="0" max="100" v-model="zoomValue"
                @input="(e) => handleZoom(Number((e.target as HTMLInputElement).value))" />
              <span class="zoom-icon">🔍+</span>
            </div>
          </div>
        </div>

        <!-- 右侧预览区域 -->
        <div class="preview-area">
          <div class="preview-container">
            <div class="preview-circle">
              <img v-if="croppedPreview" :src="croppedPreview" class="preview-image" />
              <div v-else class="preview-placeholder">头像预览</div>
            </div>
            <p class="preview-text">头像预览</p>
            <p class="preview-hint">审核通过后展示</p>
            <button class="reupload-btn" @click="handleReupload">重新上传</button>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="save-btn" @click="confirmCrop">保存</button>
        <button class="cancel-btn" @click="showAvatarCropper = false">取消</button>
      </template>
    </Doki-Modal>

    <!-- 隐藏的文件输入 -->
    <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileSelect" />
  </Doki-Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DokiModal from '../../components/Doki-Modal.vue'
import userService, { type userInfo } from '../../api/userService'
import { handleRequest } from '../../api/handleRequest'
import AvatarCropper from './AvatarCropper.vue'
import { message } from 'ant-design-vue'

// Props
interface EditProfileModalProps {
  visible: boolean
  userInfo: {
    id: number
    username: string
    avatarUrl: string
    bio: string
  }
}

const props = defineProps<EditProfileModalProps>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void,
  (e: 'update:userInfo', value: userInfo): void
}>()

// 表单数据
const formData = reactive({
  username: '',
  avatarUrl: '',
  bio: ''
})

// 头像裁剪相关
const showAvatarCropper = ref(false)
const selectedImage = ref('')
const cropNotice = ref(false)
const fileInput = ref<HTMLInputElement>()
const croppedPreview = ref('')
const zoomValue = ref(50) // 初始值设为50，对应中等缩放
const avatarCropperRef = ref()

// 计算属性
const isFormValid = computed(() => {
  const username = formData.username || ''
  return username.trim().length > 0 && username.length <= 20
})

// 监听props变化，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.username = props.userInfo.username || ''
    formData.avatarUrl = props.userInfo.avatarUrl || ''
    formData.bio = props.userInfo.bio || ''
  }
})

// 处理名字输入
const handleNameInput = () => {
  // 可以在这里添加实时验证逻辑
}

// 处理头像点击
const handleAvatarClick = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件')
      return
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过5MB')
      return
    }

    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
      showAvatarCropper.value = true
    }
    reader.readAsDataURL(file)
  }
}

// 确认裁剪
const confirmCrop = () => {
  cropNotice.value = true
}

// 缩放节流
let zoomTimeout: any = null

// 处理缩放
const handleZoom = (value: number) => {
  zoomValue.value = value

  // 清除之前的定时器
  if (zoomTimeout) {
    clearTimeout(zoomTimeout)
  }

  // 延迟执行缩放，避免频繁调用
  zoomTimeout = setTimeout(() => {
    if (avatarCropperRef.value && avatarCropperRef.value.cropper) {
      // 将 0-100 转换为 -0.3 到 0.3 的相对缩放值
      // 0 = 最大缩小，50 = 正常，100 = 最大放大
      const scaleDiff = (value - 50) / 50 * 0.3

      // 应用相对缩放，基于当前图片大小
      avatarCropperRef.value.cropper.changeScale(scaleDiff)
    }
  }, 50) // 50ms 延迟
}

// 添加预览更新定时器
let modalPreviewTimer: any = null

// 开始预览更新
const startModalPreview = () => {
  if (modalPreviewTimer) clearInterval(modalPreviewTimer)
  modalPreviewTimer = setInterval(() => {
    if (avatarCropperRef.value) {
      avatarCropperRef.value.updatePreview()
    }
  }, 50) // 每50ms更新一次
}

// 停止预览更新
const stopModalPreview = () => {
  if (modalPreviewTimer) {
    clearInterval(modalPreviewTimer)
    modalPreviewTimer = null
  }
}

// 监听裁剪器显示状态
watch(() => showAvatarCropper.value, (newVal) => {
  if (newVal) {
    // 重置缩放值
    zoomValue.value = 50
    setTimeout(() => {
      startModalPreview()
    }, 500)
  } else {
    stopModalPreview()
  }
})

// 处理重新上传
const handleReupload = () => {
  // 不关闭裁剪对话框，直接触发文件选择
  fileInput.value?.click()
}

// 处理实时预览
const handleCropPreview = (croppedImage: string) => {
  croppedPreview.value = croppedImage
}

// 处理裁剪结果
const handleCropResult = (croppedImage: string) => {
  formData.avatarUrl = croppedImage
  croppedPreview.value = croppedImage
  showAvatarCropper.value = false
  cropNotice.value = false
  message.success('头像更新成功')
}

// 处理取消
const handleCancel = () => {
  emit('update:visible', false)
}

// 处理关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 处理保存
const handleSave = async () => {
  if (!isFormValid.value) {
    message.warning('请检查输入内容')
    return
  }
  // 如果没有更改任何内容，直接关闭
  if (formData.username === props.userInfo.username &&
    formData.bio === props.userInfo.bio &&
    formData.avatarUrl === props.userInfo.avatarUrl) {
    emit('update:visible', false)
    return
  }
  // 如果没有修改头像，则把 avatarUrl 设置为null。
  if (formData.avatarUrl === props.userInfo.avatarUrl) {
    formData.avatarUrl = null as any;
  }

  try {
    await handleRequest(userService.updateProfile, {
      onSuccess: (_) => {
        // 修改成功后，通知父组件关闭模态框
        emit('update:visible', false)
        // 通知父组件更新用户信息
        emit('update:userInfo', {
          id: props.userInfo.id,
          username: formData.username,
          avatarUrl: formData.avatarUrl || props.userInfo.avatarUrl,
          bio: formData.bio
        })
      },
      params: {
        id: props.userInfo.id,
        username: formData.username,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl
      }
    })
  } catch (error) {
    message.error('更新失败，请重试')
  }
}
</script>

<style scoped>
/* 编辑资料模态框样式 */
:deep(.edit-profile-modal .doki-modal) {
  width: 650px;
  max-width: 90vw;
  min-width: 500px;
}

.edit-profile-content {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  min-width: 500px;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 10px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #f0f0f0;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  border-color: #fe2c55;
  transform: scale(1.05);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-container:hover .camera-overlay {
  opacity: 1;
}

.camera-icon {
  font-size: 24px;
  color: white;
}

.avatar-hint {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-container {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #fe2c55;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(254, 44, 85, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fafafa;
  transition: all 0.3s ease;
  resize: none;
  min-height: 100px;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #fe2c55;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(254, 44, 85, 0.1);
}

.char-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
}

.char-count-bottom {
  text-align: right;
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

/* 按钮样式 */
.cancel-btn {
  padding: 10px 24px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
  border-color: #d0d0d0;
}

.save-btn {
  padding: 10px 24px;
  background-color: #fe2c55;
  color: white;
  border: 1px solid #fe2c55;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background-color: #e0254a;
  border-color: #e0254a;
}

.save-btn:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

/* 头像裁剪模态框样式 */
:deep(.avatar-crop-modal .doki-modal) {
  max-width: 95vw;
}

.avatar-crop-content {
  display: flex;
  gap: 20px;
  padding: 20px;
}

/* 主编辑区域 */
.crop-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crop-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: #fafafa;
  margin-bottom: 20px;
  padding: 20px;
}

/* 缩放控制 */
.zoom-controls {
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoom-slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
}

.zoom-icon {
  font-size: 16px;
  color: #666;
}

.zoom-slider {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #fe2c55;
  border-radius: 50%;
  cursor: pointer;
}

.zoom-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #fe2c55;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

/* 预览区域 */
.preview-area {
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  color: #999;
  font-size: 14px;
  text-align: center;
}

.preview-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.preview-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.reupload-btn {
  background: none;
  border: none;
  color: #fe2c55;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  padding: 5px;
}

.reupload-btn:hover {
  color: #e0254a;
}

/* 裁剪器容器 */
.cropper-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.edit-profile-modal .doki-modal) {
    width: 95vw;
    min-width: 320px;
  }

  :deep(.avatar-crop-modal .doki-modal) {
    width: 95vw;
    min-width: 320px;
  }

  .avatar-crop-content {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .preview-area {
    width: 100%;
    order: -1;
  }

  .preview-container {
    flex-direction: row;
    justify-content: center;
    gap: 20px;
  }

  .edit-profile-content {
    padding: 16px;
    min-width: 280px;
  }

  .avatar-container {
    width: 100px;
    height: 100px;
  }

  .form-input,
  .form-textarea {
    font-size: 16px;
    /* 防止iOS缩放 */
  }
}
</style>
