import request from './axiosInstanse.ts'

export interface VideoDraft {
    id: number;
    title: string;
    description: string;
    tags: string;
    coverImage: string;
    permission: number;
    isScheduled: number;
    scheduledTime: number;
}

const DRAFT_PATH = '/video/upload/draft'
export default {
    // 创建草稿
    createDraft: () => request<VideoDraft>(DRAFT_PATH + '/create', {method: 'POST'}),
    // 获取草稿
    getDraft: () => request<VideoDraft>(DRAFT_PATH, {method: 'GET'}),
    // 更新草稿
    updateDraft: (draft: VideoDraft) => request<VideoDraft>(DRAFT_PATH + '/update', {method: 'PUT', data: draft}),
    // 删除草稿
    deleteDraft: (draftId: number) => request(DRAFT_PATH + '/delete', {
        method: 'DELETE', data: {
            draftId
        }
    }),
    // 提交发布
    submitDraft: (draft: VideoDraft) => request(DRAFT_PATH + '/submit', {
        method: 'POST', data: draft
    })
}
