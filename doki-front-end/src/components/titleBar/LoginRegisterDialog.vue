<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog-card" v-if="hasPassword">
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
            <input type="text" id="username" v-model="loginForm.phone" required>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="loginForm.password" required>
          </div>
          <strong>忘记密码？<a @click="loginMethod = 'sms'" style="color: red;cursor: pointer">使用短信验证码登录</a></strong>
          <button type="submit" class="submit-btn">登录</button>
        </form>

      </div>
    </div>

    <div class="dialog-card" v-else>
      <div class="form-group">
        <h3>设置密码，下次登录更方便~</h3>
        <label>密码</label>
        <input type="password" v-model="passwordForm.newPassword" required>
      </div>
      <div class="form-group">
        <label for="code-sms">确认密码</label>
        <div class="code-input-group">
          <input type="password" v-model="passwordForm.confirmPassword" required>
        </div>
      </div>

      <div style="display: flex;gap: 10px">

        <button type="submit" class="submit-btn" @click="confirmSetPassword">确认</button>

        <button type="button" class="cancel-btn" @click="cancelSetPassword">下次再说</button>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import userService from '../../api/userService.ts'
import { handleRequest } from '../../api/handleRequest.ts';
import { message } from 'ant-design-vue';

const hasPassword = ref(true);

const cancelSetPassword = () => {
  location.reload();
};
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
  password: '',
  phone: '',
  code: ''
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
    await handleRequest(userService.getSmsCode, {
      onSuccess: () => {
        message.success("验证码已发送，请注意查收~");
        countdown.value = 60; // 倒计时60秒
        const timer = setInterval(() => {
          countdown.value--;
          if (countdown.value <= 0) {
            clearInterval(timer);
          }
        }, 1000);
      },
      params: { phone }
    });
  } catch (error) {
    alert('验证码发送失败，请稍后重试。');
  } finally {
    isSendingCode.value = false;
  }
};

// 处理账号密码登录
const handleLoginWithPassword = async () => {
  // 调用密码登录接口
  const response = await loginByPassword(loginForm.phone, loginForm.password);
  if (response.code == 200) {
    // 登陆成功，设置token
    localStorage.setItem('token', response.data);
    // 刷新页面重新获取信息
    location.reload();
  } else {
    message.warning("手机号或密码错误");
    return;
  }
};

// 处理短信验证码登录
const handleLoginWithSms = async () => {
  await handleRequest(userService.loginBySms, {
    onSuccess: (data) => {
      // 设置token
      localStorage.setItem('token', data.token);
      // 刷新页面
      window.location.reload();
    }, params: {
      phone: loginForm.phone,
      code: loginForm.code
    }
  });
};


const showSetPasswordDialog = ref(false);


// ----------------- 设置密码相关 -----------------
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
});

// 设置密码处理方法
const confirmSetPassword = async () => {
  // 两个密码不一致，直接返回
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning({ content: "两次输入的密码不一致" });
    return;
  }
  // 校验密码是否符合一定的规则
  const validationResult = passwordChecker.validatePassword(passwordForm.newPassword);

  // 不符合，直接返回
  if (!validationResult.valid) {
    message.warning(validationResult.message);
    return;
  }

  // 调用设置密码接口
  const response = await setPassword(passwordForm.newPassword);

  if (response.code == 200) {
    // 成功，直接刷新页面
    location.reload();
  } else {
    message.warning("未知错误");
  }
};
// ---------------------------------------------------

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

.submit-btn,
.cancel-btn {
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

.cancel-btn {
  background-color: white;
  color: black;
  border: 1px solid black;
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
