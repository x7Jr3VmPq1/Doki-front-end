import {defineStore} from 'pinia';

export interface Notifications {
    avatarUrl: string;
    commentContent: string;
    commentId: number;
    createdAt: string;
    message: string;
    operatorName: string;
    type: string;
    userId: number;
    videoId: number;
    videoTitle: string;
}

export interface message {
    id: number;
    senderId: number;
    senderName: string;
    senderAvatarUrl: string;
    message: string;
    attachmentUrl: string;
    sentAt: string;
    replyToId: number;
    read: boolean;
    revoked: boolean;
}

export interface Dialog {
    conversationId: string | null;
    username: string;
    userId: number;
    avatarUrl: string;
    messages: message[];

    unreadCount?: number; // 未读消息数量，自己计算
}

export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        likeNotifications: [] as Notifications[],
        commentNotifications: [] as Notifications[],
        dialogs: [] as Dialog[],
        pendingDialogs: {} as Dialog, // 从个人资料页发私信时，会设置这个值，如果dialogs数组中没有这个对话，就会添加这个对话
        likeUnreadCount: 0,
        commentUnreadCount: 0,
        messageUnreadCount: 0,
    }),
    actions: {
        addNotification(_: Notifications) {
            // 没什么用
        },
        // 只要点击了选项卡，就把未读数清零
        likesMarkAsRead() {
            this.likeUnreadCount = 0;
        },
        commentsMarkAsRead() {
            this.commentUnreadCount = 0;
        },
        messagesMarkAsRead() {
            this.messageUnreadCount = 0;
        },
    },
    getters: {
        totalUnreadCount(state): number {
            return state.likeUnreadCount + state.commentUnreadCount + state.messageUnreadCount;
        }
    }
})

