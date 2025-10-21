<template>
  <div class="loading-dots">
    <span v-for="n in 3" :key="n" :style="{ animationDelay: `${(n - 1) * 0.2}s` }"></span>
  </div>
</template>

<script setup>
// 通用加载中动画组件
</script>

<style scoped>
.loading-dots {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 40px;
  gap: 8px;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background-color: grey;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 0.6s infinite alternate;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}
</style>
