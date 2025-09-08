<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-card">
      <div class="dialog-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <button @click="closeDialog" class="close-btn">&times;</button>
      </div>

      <div v-if="isLogin">
        <div class="toggle-switch">
          <button @click="loginMethod = 'sms'" :class="{ active: loginMethod === 'sms' }">短信验证码登录</button>

          <button @click="loginMethod = 'password'" :class="{ active: loginMethod === 'password' }">账号密码登录
          </button>
        </div>

        <form v-if="loginMethod === 'sms'" @submit.prevent="handleLoginWithSms">
          <div class="form-group">
            <label for="phone-sms">手机号</label>
            <input type="tel" id="phone-sms" v-model="loginForm.phone" required>
          </div>
          <div class="form-group">
            <label for="code-sms">验证码</label>
            <div class="code-input-group">
              <input type="text" id="code-sms" v-model="loginForm.code" required>
              <button type="button" @click="sendSmsCode" :disabled="isSendingCode || countdown > 0">{{
                  codeBtnText
                }}
              </button>
            </div>
            <strong>输入手机号并验证，即可登录或自动注册。</strong>
          </div>
          <button type="submit" class="submit-btn">登录</button>
        </form>

        <form v-if="loginMethod === 'password'" @submit.prevent="handleLoginWithPassword">
          <div class="form-group">
            <label for="username">用户名/手机号</label>
            <input type="text" id="username" v-model="loginForm.username" required>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="loginForm.password" required>
          </div>
          <strong>忘记密码？<a @click="loginMethod='sms'"
                              style="color: red;cursor: pointer">使用短信验证码登录</a></strong>
          <button type="submit" class="submit-btn">登录</button>
        </form>

      </div>

      <div v-else>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-username">用户名</label>
            <input type="text" id="reg-username" v-model="registerForm.username" required>
          </div>
          <div class="form-group">
            <label for="reg-phone">手机号</label>
            <input type="tel" id="reg-phone" v-model="registerForm.phone" required>
          </div>
          <div class="form-group">
            <label for="reg-password">密码</label>
            <input type="password" id="reg-password" v-model="registerForm.password" required>
          </div>
          <div class="form-group">
            <label for="reg-code">验证码</label>
            <div class="code-input-group">
              <input type="text" id="reg-code" v-model="registerForm.code" required>
              <button type="button" @click="sendSmsCode" :disabled="isSendingCode || countdown > 0">{{
                  codeBtnText
                }}
              </button>
            </div>
          </div>
          <button type="submit" class="submit-btn">注册</button>
        </form>

        <p class="switch-link">
          已有账号？<a href="#" @click.prevent="isLogin = true">返回登录</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, computed} from 'vue';
import {getSmsCode, loginByPhone} from "../api/loginAndRegister.js";
import {message} from 'ant-design-vue';


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close']);

const isLogin = ref(true); // 登录/注册状态切换
const loginMethod = ref('sms'); // 登录方式切换：'password' 或 'sms'
const countdown = ref(0); // 验证码倒计时
const isSendingCode = ref(false); // 正在发送验证码

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  phone: '',
  code: '',
});

const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  code: '',
});

// 倒计时按钮文本
const codeBtnText = computed(() => {
  if (countdown.value > 0) {
    return `${countdown.value}s后重发`;
  } else if (isSendingCode.value) {
    return '发送中...';
  }
  return '发送验证码';
});

// 关闭对话框
const closeDialog = () => {
  emit('close');
};

// 发送短信验证码
const sendSmsCode = async () => {
  let phone = isLogin.value ? loginForm.phone : registerForm.phone;
  if (!phone) {
    alert('请输入手机号');
    return;
  }
  // 简单的手机号验证
  if (!/^1\d{10}$/.test(phone)) {
    alert('请输入正确的手机号格式');
    return;
  }

  isSendingCode.value = true;
  try {
    // 发送验证码
    const result = await getSmsCode(loginForm.phone);
    console.log(result);
    countdown.value = 60; // 倒计时60秒
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    alert('验证码发送失败，请稍后重试。');
  } finally {
    isSendingCode.value = false;
  }
};

// 处理账号密码登录
const handleLoginWithPassword = () => {
  console.log('账号密码登录提交:', loginForm);
  // 在这里调用登录 API
  alert('账号密码登录成功！(模拟)');
  closeDialog();
};

// 处理短信验证码登录
const handleLoginWithSms = async () => {
  const result = await loginByPhone(loginForm.phone, loginForm.code);
  if (result.code == 200) {
    message.success({
      content: "登陆成功！",
    });
    // 设置token
    localStorage.setItem('token', result.data);
    // 刷新页面重新获取用户信息
    location.reload();
  } else {
    // 验证码校验失败，弹出警告
    message.warning({
      content: result.msg,
    });
    return;
  }
  // 在这里调用登录 API
  closeDialog();
};
</script>

<style scoped>
/* 对话框容器 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 对话框卡片 */
.dialog-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  position: relative;
}

/* 头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-header h2 {
  font-size: 24px;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

/* 切换按钮 */
.toggle-switch {
  display: flex;
  margin-bottom: 20px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.toggle-switch button {
  flex: 1;
  border: none;
  background: #f0f0f0;
  padding: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-switch button.active {
  background: #ff4d4f;
  color: white;
}

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.code-input-group input {
  flex: 1;
}

.code-input-group button {
  padding: 10px;
  white-space: nowrap;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f0f0f0;
  cursor: pointer;
}

.code-input-group button:disabled {
  cursor: not-allowed;
  background: #eee;
  color: #aaa;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #ff4d4f;
}

.switch-link {
  text-align: center;
  margin-top: 20px;
}

.switch-link a {
  color: #ff4d4f;
  text-decoration: none;
}
</style>
