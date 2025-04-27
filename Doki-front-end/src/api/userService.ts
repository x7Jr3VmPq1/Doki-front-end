import instance from './axiosInstance'; // 引入axios实例

// 拉取个人信息
const getUserInfo = async (userName: string) => {
    const response = await instance.get(`/user/profiles/${userName}`);
    return response.data;
}

// 关注/取关用户
const followUser = async (userId: number) => {
    const response = await instance.post(`/user/follow/${userId}`);
    return response.data;
}

// 更新用户资料
const updateUserInfo = async (userId: number, userName: string, bio: string, avatarBase64: string) => {
    const response = await instance.put(`/user/update/${userId}`, {
        userName,
        bio,
        avatarBase64
    });
    return response.data;
}
// 校验用户名可用性
const checkUserName = async (userName: string) => {
    const response = await instance.get(`/user/checkUsername/${userName}`);
    return response.data;
}

// 搜索用户列表
const searchUsers = async (keyword: string) => {
    const response = await instance.get(`/user/search`, {
        params: {
            userName: keyword
        }
    });
    return response.data;
}

// 获取用户关注列表..
const getFollowList = async (userId: number, page?: number, lastUserId?: number) => {
    const response = await instance.get(
        '/user/followingList', {
            params: {
                userId,
                page,
                lastUserId
            }
        });
    return response.data.data;
}
// 获取用户粉丝列表
const getFansList = async (userId: number, page?: number, lastUserId?: number) => {
    const response = await instance.get(
        '/user/fansList', {
            params: {
                userId,
                page,
                lastUserId
            }
        });
    return response.data.data;
}
export {
    getUserInfo,
    followUser,
    updateUserInfo,
    checkUserName,
    searchUsers,
    getFollowList,
    getFansList
}
