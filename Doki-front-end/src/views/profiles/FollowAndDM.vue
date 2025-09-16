<script setup lang="ts">

</script>

<template>
  <div class="user-details-row">
    <div class="user-action-buttons">
      <button class="action-button follow-button">
        <span class="follow-icon">+</span> 关注
      </button>
      <button class="action-button private-message-button">私信</button>
    </div>
  </div>
</template>

<style scoped>
/* 用户详细信息行 */
.user-details-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-action-buttons {
  width: 100%;
  justify-content: flex-end;
  display: flex;
  gap: 10px;
}

.user-action-buttons .action-button {
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.follow-button {
  background-color: #fe2c55;
  color: #fff;
}

.private-message-button {
  background-color: #e0e0e0;
  color: #333;
}
</style>
