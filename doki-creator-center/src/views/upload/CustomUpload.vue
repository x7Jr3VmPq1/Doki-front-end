<template>
  <div 
    class="custom-upload"
    :class="{ 'dragover': isDragOver, 'uploading': isUploading }"
    @click="handleClick"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="upload-content">
      <div class="upload-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      </div>
      <div class="upload-text">
        <h3>点击或拖拽视频文件到此处</h3>
        <p>支持 MP4、AVI、MOV 等格式</p>
        <p class="file-size-limit">文件大小限制：10GB</p>
      </div>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="video/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
const props = defineProps<{
  action: string
  accept?: string
  draggable?: boolean
  onBeforeUpload?: (file: File) => boolean | Promise<boolean>
}>()

// Emits
const emits = defineEmits<{
  (e: 'beforeUpload', file: File): boolean | Promise<boolean>
  (e: 'change', fileList: any[]): void
  (e: 'success', response: any): void
  (e: 'error', error: any): void
}>()

// 响应式数据
const isDragOver = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

// 点击上传区域
const handleClick = () => {
  fileInput.value?.click()
}

// 拖拽进入
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (props.draggable) {
    isDragOver.value = true
  }
}

// 拖拽离开
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
}

// 拖拽放下
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  
  if (!props.draggable) return
  
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    await handleFiles(files)
  }
}

// 文件选择
const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    await handleFiles(files)
  }
}

// 处理文件
const handleFiles = async (files: File[]) => {
  const file = files[0] // 只处理第一个文件
  
  try {
    // 调用 beforeUpload 回调
    let shouldUpload = true
    if (props.onBeforeUpload) {
      shouldUpload = await props.onBeforeUpload(file)
    }
    
    if (shouldUpload === false) {
      return
    }
    
    isUploading.value = true
    
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // 创建 XMLHttpRequest 用于上传进度
    const xhr = new XMLHttpRequest()
    
    // 上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        const fileItem = {
          name: file.name,
          percent: percent,
          status: 'uploading'
        }
        emits('change', [fileItem])
      }
    })
    
    // 上传成功
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const fileItem = {
          name: file.name,
          percent: 100,
          status: 'done'
        }
        emits('change', [fileItem])
        emits('success', xhr.response)
      } else {
        emits('error', new Error(`Upload failed with status: ${xhr.status}`))
      }
      isUploading.value = false
    })
    
    // 上传失败
    xhr.addEventListener('error', () => {
      emits('error', new Error('Upload failed'))
      isUploading.value = false
    })
    
    // 开始上传
    xhr.open('POST', props.action)
    xhr.send(formData)
    
  } catch (error) {
    emits('error', error)
    isUploading.value = false
  }
}

// 暴露给父组件的方法
const upload = (files: File[]) => {
  handleFiles(files)
}
</script>

<style scoped>
.custom-upload {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.custom-upload:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.custom-upload.dragover {
  border-color: #1890ff;
  background-color: #e6f7ff;
  transform: scale(1.02);
}

.custom-upload.uploading {
  border-color: #52c41a;
  background-color: #f6ffed;
}

.upload-content {
  text-align: center;
  color: #666;
}

.upload-icon {
  margin-bottom: 16px;
  color: #d9d9d9;
  transition: color 0.3s ease;
}

.custom-upload:hover .upload-icon {
  color: #1890ff;
}

.custom-upload.dragover .upload-icon {
  color: #1890ff;
}

.upload-text h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.upload-text p {
  margin: 4px 0;
  font-size: 14px;
  color: #999;
}

.file-size-limit {
  font-size: 12px !important;
  color: #ccc !important;
}
</style>
