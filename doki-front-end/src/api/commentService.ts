import request from './gateway.ts'

// 评论相关的类型定义
export interface VideoCommentDTO {
  videoId: number;
  content: string;
  parentCommentId?: string | null;
  replyTargetId?: string | null;
  image?: string | null;
}

export interface VideoComments {
  id: string;
  userId: number;
  videoId: number;
  content: string;
  imgUrl: string;
  createdAt: number;
  likeCount: number;
  childCount: number;
  parentCommentId: string;
  replyTargetId: string
  isRoot: boolean;
}

export interface CommentListResponse {
  list: VideoCommentsVO[];
  hasMore: boolean;
  cursor: string | null;
}

export interface User {
  username: string;
  bio: string;
  id: number;
  avatarUrl: string;
  reply_to?: User | null // 额外的属性，当可能存在回复目标时，添加这个属性
}

export interface VideoCommentsVO {
  comments: VideoComments,
  liked: boolean;
  user: User;
  replies: CommentListResponse; // 额外的属性，可选的子评论列表
}


export default {
  // 添加视频评论
  addComment: (videoComment: VideoCommentDTO) => request<VideoComments>('/comment', {
    method: 'POST',
    data: videoComment
  }),

  // 删除视频评论
  deleteComment: (commentId: string) => request<void>('/comment', {
    method: 'DELETE',
    data: { commentId }
  }),

  // 获取视频评论列表
  getComments: (params: {
    videoId: number;
    cursor?: string | null;
    parentCommentId?: string;
  }) => request<CommentListResponse>('/comment/get', {
    method: 'GET',
    data: params
  }),

  // 评论点赞
  likeComment: (commentId: string) => request<void>('/comment/action/like', {
    method: 'GET',
    data: { commentId }
  }),

  // 评论点赞
  likeCommentV2: (params: { commentId: string, videoId: number, commentSender: number, content: string }) => request<void>('/comment/action/like/v2', {
    method: 'GET',
    data: params
  })
}
