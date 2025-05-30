<script setup lang="ts">

import Player from "../../components/Player.vue";
</script>

<template>
  <div v-for="(item,index) in 3">
    <div v-if="index == 0" class="friends">
      <Player></Player>
    </div>
  </div>
</template>

<style scoped>
.friends {
  width: 90vw;
  height: 90vh;
  overflow-y: hidden;
}


</style>
