<template>
  <button :class="['button', buttonType]">
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  buttonType: {
    type: String,
    required: true,
    validator: (value) => ['confirm', 'cancel'].includes(value),
  },
});
</script>

<style scoped>
.button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.button.confirm {
  background-color: #ff3c69;
  color: #fff;
}

.button.confirm:hover {
  background-color: #e53e4c;
}

.button.cancel {
  background-color: #f0f0f0;
  color: #666;
}

.button.cancel:hover {
  background-color: #e0e0e0;
}
</style>
