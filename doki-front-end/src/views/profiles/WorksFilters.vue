<script setup lang="ts">

import { Lock, SettingTwo, Clear } from "@icon-park/vue-next";
import { reactive, ref } from "vue";
import { useShareData } from "./ShareData";
import DokiConfirm from "../../components/Doki-Confirm.vue";
const shareData = useShareData();
const props = defineProps<{
  tab: string
}>();

const state = reactive({
  deleteConfirmVisible: false,
  clearHistoryConfirmVisible: false,
  clearHistoryAndCloseFunConfirmVisible: false,
  clearHistoryMessage: '确认清空历史记录吗？',
  clearHistoryAndCloseFunMesssage: '确认清空并关闭功能吗？关闭后不会记录新的观看。'
})

const filterButtonActive = ref(0); // 作品类型过滤

const handleClickManage = () => {
  shareData.shouldManage = !shareData.shouldManage;
}

const handleDeleteConfirm = () => {
  shareData.shouldDelete = true;
  state.deleteConfirmVisible = false;
}


// 让WroksGrid组件调用清空接口。
const handleConfirmClearHistoryAndCloseFun = () => {
  shareData.shouldClearHistoryAndClose = true;
  state.clearHistoryAndCloseFunConfirmVisible = false;
}

const handleConfirmClearHistory = () => {

  shareData.shouldClearHistory = true;
  state.clearHistoryConfirmVisible = false;
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
    <div v-if="props.tab != 'history'" @click="handleClickManage" class="works-manage-button"
      :class="{ active: shareData.shouldManage }">
      <setting-two theme="filled" fill="#333" />
      <span>{{ shareData.shouldManage ? "取消管理" : "批量管理" }}</span>
    </div>

    <div v-if="props.tab === 'history'" class="works-manage-button">
      <div class="clear-history">
        <div class="clear-option" @click="state.clearHistoryConfirmVisible = true">清空观看历史</div>
        <div class="clear-option" @click="state.clearHistoryAndCloseFunConfirmVisible = true">清空并关闭功能</div>
      </div>
      <DokiConfirm :visible="state.clearHistoryConfirmVisible" :message="state.clearHistoryMessage"
        @confirm="handleConfirmClearHistory" @close="state.clearHistoryConfirmVisible = false"
        @cancel="state.clearHistoryConfirmVisible = false">
      </DokiConfirm>
      <DokiConfirm :visible="state.clearHistoryAndCloseFunConfirmVisible"
        :message="state.clearHistoryAndCloseFunMesssage" @confirm="handleConfirmClearHistoryAndCloseFun"
        @close="state.clearHistoryAndCloseFunConfirmVisible = false"
        @cancel="state.clearHistoryAndCloseFunConfirmVisible = false">
      </DokiConfirm>
      <Clear class="clear-icon"></Clear>
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


.clear-history {
  opacity: 0;
  border-radius: 5px;
  padding: 10px 10px;
  gap: 10px;
  background-color: #fff;
  z-index: 50;
  width: 120px;
  position: absolute;
  bottom: -60px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

.clear-option:hover {
  color: #ff3366;
}

.works-manage-button:hover .clear-history {
  opacity: 1;
}
</style>
