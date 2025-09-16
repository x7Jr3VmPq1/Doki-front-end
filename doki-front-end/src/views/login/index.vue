<script setup>
import {ref} from 'vue';
import {message} from 'ant-design-vue';
import axios from '../../api/axiosInstance';
import {useRouter} from 'vue-router';

const email = ref('');
const password = ref('');
const username = ref(''); // 新增用户名字段
const loading = ref(false);
const isRegister = ref(false); // 新增状态标识当前是登录还是注册
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    message.error('请输入邮箱和密码');
    return;
  }

  loading.value = true;

  const response = await axios.post('/login', {
    email: email.value,
    password: password.value
  });
  if (response.data.code === 200) {
    localStorage.setItem('token', response.data.data.token); // 存储 Token
    localStorage.setItem('id', response.data.data.userId);
    localStorage.setItem('username', response.data.data.userName);
    localStorage.setItem('avatar', response.data.data.avatarUrl);
    localStorage.setItem('bio', response.data.data.bio);
    message.success('登录成功！');
    // 跳转到首页
    await router.push('/');
  } else {
    console.log(response.data.code);
    message.error('登录失败，请检查账号或密码');
  }
  loading.value = false;
};

const handleRegister = async () => {
  if (!email.value || !password.value || !username.value) {
    message.error('请输入邮箱、密码和用户名');
    return;
  }

  loading.value = true;

  const response = await axios.post('/register', {
    email: email.value,
    userName: username.value,
    password: password.value
  });
  if (response.data.code === 200) {
    message.success('注册成功！');
  } else {
    message.error('注册失败，请检查信息');
    loading.value = false;
    return;
  }
  loading.value = false;
  // 注册成功自动登录
  await handleLogin();
};

const toggleForm = () => {
  isRegister.value = !isRegister.value;
  email.value = '';
  password.value = '';
  username.value = '';
};
</script>

<template>
  <div class="login-container">
    <a-card :title="isRegister ? '用户注册' : '用户登录'" class="login-card" style="width: 100%;">
      <a-form>
        <a-form-item label="邮箱">
          <a-input v-model:value="email" placeholder="请输入邮箱"/>
        </a-form-item>

        <a-form-item label="密码">
          <a-input-password v-model:value="password" placeholder="请输入密码"/>
        </a-form-item>

        <a-form-item v-if="isRegister" label="用户名">
          <a-input v-model:value="username" placeholder="请输入用户名"/>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" block :loading="loading" @click="isRegister ? handleRegister() : handleLogin()">
            {{ isRegister ? '注册' : '登录' }}
          </a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="link" block @click="toggleForm">
            {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
  width: 100%; /* 新增宽度为100% */
}

.login-card {
  width: 100%; /* 修改宽度为100% */
  max-width: 350px; /* 新增最大宽度限制 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
