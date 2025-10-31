import { defineStore } from 'pinia';
import type { VideoInfo } from '../../api/feedService'
export const useShareData = defineStore('ShareData', {
  state: () => ({
    shouldManage: false,
    selectedWorks: [] as VideoInfo[],
    shouldDelete: false,
    shouldClearHistory: false,
    shouldClearHistoryAndClose: false
  }),
  actions: {
    clear: function () {
      this.selectedWorks = [];
      this.shouldManage = false;
      this.shouldDelete = false;
      this.shouldClearHistory = false;
      this.shouldClearHistoryAndClose = false;
    }
  }
})
