import instance from './axiosInstance'; // 引入axios实例

// 获取短信验证码
const getSmsCode = async (phone: String) => {
    const response = await instance.get("/getSmsCode", {
        params: {phone}
    });
    return response.data;
}
// 验证码登录

const loginByPhone = async (phone: String, code: String) => {
    const response = await instance.get("/loginByPhone", {
        params: {
            phone, code
        }
    });
    return response.data;
}

export {
    getSmsCode,
    loginByPhone
}
