import instance from './axiosInstance'; // 引入axios实例

// 获取短信验证码
const getSmsCode = async (phone: string) => {
    const response = await instance.get("/getSmsCode", {
        params: {phone}
    });
    return response.data;
}
// 验证码登录

const loginByPhone = async (phone: string, code: string) => {
    const response = await instance.get("/loginByPhone", {
        params: {
            phone, code
        }
    });
    return response.data;
}

// 设置密码
const setPassword = async (password: string) => {
    const response = await instance.get("/setPassword", {
        params: {
            password
        }
    })
    return response.data;
}

// 手机号密码登录
const loginByPassword = async (phone: string, password: string) => {
    const response = await instance.post("/loginByPassword", {
        phone, password
    });
    return response.data;

}

export {
    getSmsCode,
    loginByPhone,
    loginByPassword,
    setPassword
}
