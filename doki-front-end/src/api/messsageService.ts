import instance from './axiosInstance.ts'

export const getConversations = async () => {
    const res = await instance.get('/conversations');
    return res.data;
}
export const getMessages = async (conversationId: string) => {
    const res = await instance.get(`/getMessagesByConversationId`, {params: {conversationId}});
    return res.data;
}
export const sendMessage = async (messageDTO: any) => {
    const res = await instance.post('/messages', messageDTO);
    return res.data;
}
export const delMessage = async (conversationId: string) => {
    const res = await instance.delete('/messages', {params: {conversationId}});
    return res.data;
}
