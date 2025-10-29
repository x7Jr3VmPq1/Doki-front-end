<template>
  <Doki-Modal :visible="visible" :title="title" :fullscreen="fullscreen" :showHeader="showHeader"
    :showCloseButton="showCloseButton" :closeOnOverlay="closeOnOverlay" @close="handleClose">
    <div class="confirm-content">
      <slot>
        <p v-if="message" class="confirm-message">{{ message }}</p>
      </slot>
    </div>
    <template #footer>
      <Doki-Button v-if="showCancel" buttonType="cancel" @click="handleCancel">
        {{ cancelText }}
      </Doki-Button>
      <Doki-Button buttonType="confirm" @click="handleConfirm">
        {{ confirmText }}
      </Doki-Button>
    </template>
  </Doki-Modal>
</template>

<script setup lang="ts">
import DokiModal from './Doki-Modal.vue'
import DokiButton from './Doki-Button.vue'

interface DokiConfirmProps {
  visible?: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  fullscreen?: boolean
  showHeader?: boolean
  showCloseButton?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<DokiConfirmProps>(), {
  visible: false,
  title: '提示',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  fullscreen: false,
  showHeader: true,
  showCloseButton: true,
  closeOnOverlay: true
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

const close = () => {
  emit('update:visible', false)
}

const handleClose = () => {
  close()
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}
</script>

<style scoped>
.confirm-content {
  padding: 4px 0;
}

.confirm-message {
  margin: 0;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}
</style>
