import instance from './axiosInstance'; // 引入axios实例

// 根据关键字搜索视频
const searchVideos = async (keyword: string) => {
    const response = await instance.get(`/videos/search?keyword=${keyword}`);
    return response.data;
}

// 给视频点赞
const likeVideoByVideoId = async (videoId: number) => {
    const response = await instance.post(`/videos/like/${videoId}`);
    return response.data;
}
// 给视频收藏
const favoriteVideoByVideoId = async (videoId: number) => {
    const response = await instance.post(`/videos/collect/${videoId}`);
    return response.data;
}
// 上传视频接口
const uploadVideo = async (video: FormData, config: any) => {
    const response = await instance.post(`/videos/upload`, video, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: config.onUploadProgress,
        timeout: 60000
    });
    return response.data;
}

// 发布视频接口
const publishVideo = async (videoData: {
    videoTitle: string;
    videoDesc: string;
    category: string;
    tags: string[];
}) => {
    const response = await instance.post('/videos/publish', videoData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};
// 删除视频接口
const deleteVideo = async (videoId: number) => {
    const response = await instance.delete(`/videos/del/${videoId}`);
    return response.data;
}
export {
    likeVideoByVideoId,
    favoriteVideoByVideoId,
    uploadVideo,
    publishVideo,
    deleteVideo,
    searchVideos
};
