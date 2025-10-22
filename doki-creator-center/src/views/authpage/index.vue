<script setup lang="ts">
// 这个空页面用来发请求获取token。
import userService from '../../api/userService.ts'
import {handleRequest} from '../../api/handleRequest.ts'
import {onMounted} from 'vue';
import {useRouter} from 'vue-router'

const router = useRouter();
onMounted(async () => {
  // 如果已经有token了，直接跳转到首页
  if (localStorage.getItem('token')) {
    await router.replace('/home');
  }
  // 从URL中获取授权码
  const params = new URLSearchParams(window.location.search)
  const code = params.get('auth');
  // 调用接口获取token
  if (code) {
    await handleRequest(userService.getTokenByAuthCode, {
      onSuccess(data) {
        // 设置token
        localStorage.setItem('token', data);
        // 跳转到首页
        router.replace('/home')
      }, params: code
    })
  }
  // 跳转到首页
  await router.replace('/home');
})
</script>

<template>

</template>

<style scoped>

</style>
