import {defineStore} from 'pinia';
import type {VideoDraft} from "../../api/draftService.ts";

export const useDraftFormStore = defineStore('draftFormStore', {
    state: (): VideoDraft => ({
        id: 0,
        title: '',
        description: '',
        tags: '',
        coverImage: '',
        permission: 0,
        isScheduled: 0,
        scheduledTime: 0,
    }),
    getters: {
        // 返回当前表单对象
        formData: (state) => ({
            id: state.id,
            title: state.title,
            description: state.description,
            tags: state.tags,
            coverImage: state.coverImage,
            permission: state.permission,
            isScheduled: state.isScheduled,
            scheduledTime: state.scheduledTime,
        })
    },
    actions: {
        // 初始化/重置表单
        initForm(draft?: VideoDraft) {
            if (draft) {
                this.id = draft.id || 0;
                this.title = draft.title || '';
                this.description = draft.description || '';
                this.tags = draft.tags || '';
                this.coverImage = draft.coverImage || '';
                this.permission = draft.permission || 0;
                this.isScheduled = draft.isScheduled || 0;
                this.scheduledTime = draft.scheduledTime || 0;
            } else {
                this.id = 0;
                this.title = '';
                this.description = '';
                this.tags = '';
                this.coverImage = '';
                this.permission = 0;
                this.isScheduled = 0;
                this.scheduledTime = 0;
            }
        }
    }
});
