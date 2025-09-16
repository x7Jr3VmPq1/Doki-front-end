import instance from './axiosInstance'; // 引入axios实例

const getHotSearchList = async () => {
    const res = await instance.get('/search/hot')
    return res.data.data
}

export {
    getHotSearchList
}
