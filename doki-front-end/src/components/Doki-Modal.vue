<template>
  <Transition name="modal" appear>
    <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
      <div class="doki-modal" :class="{ 'fullscreen': fullscreen }">
        <!-- 头部区域 -->
        <div v-if="showHeader" class="modal-header">
          <h3 v-if="title" class="modal-title">{{ title }}</h3>
          <button v-if="showCloseButton" class="close-button" @click="closeModal">×</button>
        </div>
        
        <!-- 内容区域 - 支持插槽 -->
        <div class="modal-content" @click.stop>
          <slot></slot>
        </div>
        
        <!-- 底部区域 -->
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// import { computed } from 'vue' // 暂时不需要

// 定义 Props
interface DokiModalProps {
  visible?: boolean
  title?: string
  fullscreen?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  closeOnOverlay?: boolean
}

// 定义默认值
const props = withDefaults(defineProps<DokiModalProps>(), {
  visible: false,
  title: '',
  fullscreen: true,
  showHeader: true,
  showCloseButton: true,
  closeOnOverlay: true
})

// 定义 Emits
const emit = defineEmits(['close'])

// 关闭模态框
const closeModal = () => {
  emit('close')
}

// 点击遮罩层关闭模态框
const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    closeModal()
  }
}
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 模态框主体 */
.doki-modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1001;
  max-height: 90vh;
  max-width: 90vw;
}

/* 全屏模式 */
.doki-modal.fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  max-height: 100vh;
  max-width: 100vw;
}

/* 头部样式 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fafafa;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 内容区域 */
.modal-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-height: 0;
}

/* 底部区域 */
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Vue Transition 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-to {
  opacity: 1;
}

.modal-leave-from {
  opacity: 1;
}

.modal-leave-to {
  opacity: 0;
}

/* 模态框内容的动画 */
.modal-enter-active .doki-modal,
.modal-leave-active .doki-modal {
  transition: all 0.3s ease;
}

.modal-enter-from .doki-modal {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-enter-to .doki-modal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-leave-from .doki-modal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.modal-leave-to .doki-modal {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .doki-modal {
    margin: 10px;
    max-height: calc(100vh - 20px);
    max-width: calc(100vw - 20px);
  }
  
  .doki-modal.fullscreen {
    margin: 0;
    max-height: 100vh;
    max-width: 100vw;
  }
  
  .modal-header {
    padding: 12px 16px;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 12px 16px;
  }
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
