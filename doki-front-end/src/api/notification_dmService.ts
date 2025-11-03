import type { VideoInfo } from "./feedService";
import request from "./gateway";
import type { userInfo } from "./userService";
export interface Conversation {
  id: string;
  members: number[];
  lastMessage: {
    id: string;
    conversationId: string;
    senderId: number;
    content: string;
    imgUrl: string | null;
    timestamp: number;
  };
  createdAt: number;
  updatedAt: number;
  userinfo: {
    id: number;
    username: string;
    avatarUrl: string;
    bio: string;
  },
  unread: number
}
export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  imgUrl: string | null;
  timestamp: number;
  userinfo?: {
    id: number;
    username: string;
    avatarUrl: string;
    bio: string;
  };
}
export interface MessageDTO {
  conversationId: string,
  senderId: number,
  content: string,
  imgUrl: string
}

export interface Notification {
  id: string;
  userId: number;
  type: number;
  content: string | null;
  sourceVideoId: number | null;
  sourceCommentId: number | null;
  operatorId: number | null;
  groupKey: string;
  mergedCount: number;
  isRead: number;
  createdAt: number;
  user: userInfo;
  sourceInfo: VideoInfo
}


export default {
  /**
   * 创建会话
   * @param tid 目标用户ID 
   * @returns 会话对象
   */
  createConversation: (tid: number) => request<Conversation>('/message/create', {
    method: 'GET',
    data: { tid }
  }),

  /**
   * 获取会话列表
   * @returns  会话列表
   */
  getConversationList: () => request<Conversation[]>('/message/getList', {
    method: 'GET',
  }),
  /**
   * 发送消息
   * @param message 
   * @returns 
   */
  sendMessage: (message: MessageDTO) => request<Message>('/message/send', {
    method: 'POST',
    data: message
  }),
  /**
   * 根据会话ID拉取消息
   * @param cid 会话ID
   * @returns 消息列表
   */
  getMessages: (cid: string) => request<Message[]>('/message/getMessage', {
    method: 'GET',
    data: { cid }
  }),
  /**
   * 删除会话
   * @param cid 会话ID
   * @returns 
   */
  delConversation: (cid: string) => request<void>('/message/delete', {
    method: 'DELETE',
    data: { cid }
  }),

  /**
   * 获取私信未读数
   * @returns 
   */
  getUnreadMessageCount: () => request<number>('/message/unread', {
    method: 'GET'
  }),
  /**
   * 清空未读数
   * @param cid 会话id，不传入则清空全部未读。
   * @returns
   */
  delUnreadMessageCount: (cid: string | null) => request<null>('/message/unread', {
    method: 'DELETE',
    data: { cid }
  }),
  /**
   * 获取通知列表
   * @param type  类型，不传入则获取所有。
   * @returns 
   */
  getNotifications: (type: number | null) => request<Notification[]>('/notify', {
    method: 'GET',
    data: { type }
  })
}
