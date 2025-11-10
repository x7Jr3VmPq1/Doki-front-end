<script lang="ts" setup>
import { ref } from 'vue';
import xiaomeng from '../../api/xiaomeng'

const response = ref(''); // 用于存储小梦的回复内容

const sendMessage = async () => {
  const userInput = (document.getElementById('user-input') as HTMLInputElement).value;
  if (!userInput) return;

  // 清空输入框
  (document.getElementById('user-input') as HTMLInputElement).value = '';

  // 调用小梦的接口
  await xiaomeng(userInput, (content) => {
    response.value = response.value + content; // 追加内容
  });
};



</script>

<template>

  <!-- 输出显示区域 -->
  <div id="output-display" style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; min-height: 100px;">
    <!-- 这里将显示小梦的回复内容 -->
    <p>小梦的回复将显示在这里。</p>
    <div class="response-area">
      <div class="response">{{ response }}</div>
    </div>
  </div>

  <!-- 输入框 -->
  <div>
    <input type="text" id="user-input" placeholder="请输入内容..." />
    <button id="send-button" @click="sendMessage">发送</button>
  </div>
</template>

<style scoped>
.response-area {
  display: flex;
  /* 换行 */
  flex-wrap: wrap;
}

.response {
  transition: opacity 1s ease, filter 1s ease;
}

</style>
