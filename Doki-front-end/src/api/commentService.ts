import instance from './axiosInstance'; // 引入axios实例
// 获取视频评论
const getVideoCommentsByVideoId = async (videoId: number) => {
    const response = await instance.get(`/video/comments/${videoId}`);
    return response.data;
}

// 添加视频评论
const addVideoComment = async (videoId: number, comment: string, parentCommentId: number | null) => {
    const response = await instance.post(`/video/comments/add`, {
        userId: localStorage.getItem('id'),
        videoId: videoId,
        content: comment,
        parentCommentId: parentCommentId
    });
    return response.data;
}
// 删除视频评论
const deleteVideoComment = async (commentId: number) => {
    const response = await instance.delete(`/video/comments/del/${commentId}`);
    return response.data;
}

// 给评论点赞
const likeCommentByCommentId = async (commentId: number) => {
    const response = await instance.post(`/video/comments/like/${commentId}`);
    return response.data;
}

export {
    getVideoCommentsByVideoId,
    addVideoComment,
    deleteVideoComment,
    likeCommentByCommentId
}
