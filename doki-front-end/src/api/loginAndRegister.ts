import instance from './axiosInstance'; // 引入axios实例


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
    loginByPassword,
    setPassword
}
