import {defineStore} from 'pinia';

export const useSharedState = defineStore('sharedState', {
    state: () => ({
        sharedValue: 0,  // 共享的状态
    }),
    actions: {
        increment() {
            this.sharedValue++;
        },
        setSharedValue(value: any) {
            this.sharedValue = value;
        }
    },
});
