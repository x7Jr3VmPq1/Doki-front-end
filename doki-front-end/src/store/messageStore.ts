// stores/messageStore.ts
import { defineStore } from 'pinia'

export const useMessageStore = defineStore('message', {
    state: () => ({
        shouldReload: false
    }),
    actions: {
        triggerReload() {
            this.shouldReload = true
        },
        resetReloadFlag() {
            this.shouldReload = false
        }
    }
})
