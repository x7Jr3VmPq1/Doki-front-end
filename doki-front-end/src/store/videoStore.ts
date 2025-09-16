import {defineStore} from 'pinia';

export interface Video {
    id: number;
    userId: number;
    title: string;
    description: string;
    userName: string;
    avatarUrl: string;
    videoUrl: string;
    thumbnailUrl: string | null;
    duration: number;
    views: number;
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    commentCount: number;
    favoriteCount: number;
    favorited: boolean;
    liked: boolean;
}

export const useVideoStore = defineStore('video', {
    state: () => ({
        videoIndex: 0, // 当前视频索引...
        videos: [] as Video[],
        currentVideoTime: 0 //当前视频已经播放的进度....
    }),
    actions: {
        // 更新当前视频索引
        setVideoIndex(index: number) {
            this.videoIndex = index;
        },
        // 更新视频数据源
        setVideos(videos: Video[]) {
            this.videos = videos;
        },
        // 更新视频当前播放进度
        setCurrentVideoTime(time: number) {
            this.currentVideoTime = time;
        },
        // 删除一个视频
        deleteVideo(index: number) {
            this.videos.splice(index, 1);
        },
    },
});
