import { defineStore } from 'pinia';

export const useShareData = defineStore('titleBarShareData', {
  state: () => ({
    messageUnread: 0,
    notificationUnread: 0,
    openMessageFromDMButton: false, // 让popover的关闭方法判断一下这个变量的状态，如果为true，则置为false再关闭，避免打不开的问题。
    requestCreatConversationUID: 0 // 让title-bar监视这个变量，大于0就创建新的会话。
  }),
  actions: {
    clearRequst() {
      this.openMessageFromDMButton = false;
      this.requestCreatConversationUID = 0;
    }
  }
})
