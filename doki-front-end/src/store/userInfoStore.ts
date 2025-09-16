import {defineStore} from 'pinia';


export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: null as null | {
            token: string;
            userId: number;
            userName: string;
            avatarUrl: string;
            bio: string;
            followingCount: number;
            followerCount: number;
        },
    }),
    actions: {
        setUser(data: any) {
            this.userInfo = data;
        },
        logout() {
            this.userInfo = null;
        },
    },
});
