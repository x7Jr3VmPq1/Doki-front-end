<script setup lang="ts">

import { Lock, SettingTwo } from "@icon-park/vue-next";
import { reactive, ref } from "vue";
import { useShareData } from "./ShareData";
import DokiConfirm from "../../components/Doki-Confirm.vue";
const shareData = useShareData();
const props = defineProps<{
  tab: string
}>();

const state = reactive({
  deleteConfirmVisible: false
})

const filterButtonActive = ref(0); // 作品类型过滤

const handleClickManage = () => {
  shareData.shouldManage = !shareData.shouldManage;
}

const handleDeleteConfirm = () => {
  shareData.shouldDelete = true;
  state.deleteConfirmVisible = false;
}
</script>

<template>
  <div class="works-filter">
    <div v-if="props.tab === 'works'" style="flex: 1;display: flex;gap: 10px;">
      <div class="works-filter-button" :class="{ active: filterButtonActive == 0 }" @click="filterButtonActive = 0">作品
      </div>
      <div class="works-filter-button" :class="{ active: filterButtonActive == 1 }" @click="filterButtonActive = 1">
        <lock theme="filled" size="15" :fill="filterButtonActive == 1 ? '#ff4d4f' : '#5c5c5c'" strokeLinecap="butt" />
        私密作品
      </div>
    </div>
    <div class="selected-count-text flex-center" v-if="shareData.selectedWorks.length > 0">
      <span>已选中{{ shareData.selectedWorks.length }}条作品。</span>
      <span class="delete-btn" @click="state.deleteConfirmVisible = true">删除</span>
      <DokiConfirm :visible="state.deleteConfirmVisible" message="确认要删除吗？删除之后不可恢复。"
        @close="state.deleteConfirmVisible = false" @cancel="state.deleteConfirmVisible = false"
        @confirm="handleDeleteConfirm">
      </DokiConfirm>
    </div>
    <div @click="handleClickManage" class="works-manage-button" :class="{ active: shareData.shouldManage }">
      <setting-two theme="filled" fill="#333" />
      <span>{{ shareData.shouldManage ? "取消管理" : "批量管理" }}</span>
    </div>
  </div>
</template>

<style scoped>
.works-filter {
  height: 25px;
  position: relative;
  display: flex;
  gap: 20px;
  margin-left: 10px;
  margin-bottom: 10px;
}

.works-filter-button,
.works-manage-button {
  border-radius: 8px;
  /* 圆角 */
  padding: 5px 10px;
  /* 内边距 */
  font-size: 14px;
  /* 字体大小 */
  font-weight: bold;
  /* 字体加粗 */
  cursor: pointer;
  /* 鼠标悬停时显示指针 */
}

.works-manage-button {
  position: absolute;
  right: 5px;
}

.works-filter-button.active {
  background-color: #ffcccc;
  /* 浅红色背景 */
  color: #ff3366;
  /* 深红色文字 */
  border: none;
  /* 无边框 */
}

.works-manage-button.active {
  background-color: grey;
  color: white
}

.selected-count-text {
  position: absolute;
  right: 120px;
  height: 100%;
  font-size: 14px;
  /* 字体大小 */
  font-weight: bold;
}

.delete-btn {
  cursor: pointer;
  color: #ff3366;
}
</style>
