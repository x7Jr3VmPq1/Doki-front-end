<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button, Result } from 'ant-design-vue';

const router = useRouter();

// 返回首页
const goHome = () => {
  router.push('/');
};
</script>

<template>
  <Result
    status="404"
    title="404"
    sub-title="抱歉，您访问的页面不存在。"
  >
    <template #extra>
      <Button type="primary" @click="goHome">返回首页</Button>
    </template>
  </Result>
</template>

<style scoped>
/* 让页面内容居中 */
.ant-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
