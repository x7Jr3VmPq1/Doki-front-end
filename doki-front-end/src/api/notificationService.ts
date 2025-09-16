import instance from './axiosInstance'; // 引入axios实例

const getNotifications = async (type: string) => {
    const response = await instance.get(`/notifications/${type}`);
    return response.data;
};

const getDirectMessages = async () => {
    const response = await instance.get(`/messages`);
    return response.data;
};

const sendDirectMessage = async (messageDTO: any) => {
    const response = await instance.post('/messages', messageDTO);
    return response.data;
};
export {getNotifications, getDirectMessages, sendDirectMessage};
