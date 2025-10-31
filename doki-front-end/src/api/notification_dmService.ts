import request from "./gateway";
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
  }
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
  })

}
