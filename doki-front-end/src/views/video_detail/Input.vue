<script lang="ts" setup>
const placeholders = [
  "良言一句三冬暖，恶语伤人六月寒~",
  "留下你的精彩评论吧！",
  "友善的交流是温暖的源泉~",
  "期待听到您的声音",
  "分享你的想法，让交流更美好~",
  "用温暖的话语，传递真诚的心意",
  "每一个评论都是珍贵的交流",
  "说出你的观点，我们一起讨论~"
]
const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)]



</script>

<template>
  <div class="comment-input">
    <div class="avatar"></div>
    <div class="input-wrapper">
      <input :placeholder="randomPlaceholder" type="text" style="all: unset;caret-color: black;">
    </div>
  </div>
</template>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: grey;
}

.comment-input {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 80%;
}

.input-wrapper {
  flex: 1;
  line-height: 20px;
  /* 字体行高 */
  height: calc(20px * 3);
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px 15px;
}

.input-wrapper>input {
  width: 100% !important;
}
</style>