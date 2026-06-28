<template>
  <div class="register-container">
    <!-- 左侧品牌展示区 -->
    <div class="register-left">
      <div class="left-content">
        <div class="brand-area">
          <div class="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
              <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1.5" opacity="0.35"/>
              <rect x="28" y="14" width="8" height="36" rx="2" fill="currentColor" opacity="0.7"/>
              <rect x="14" y="28" width="36" height="8" rx="2" fill="currentColor" opacity="0.7"/>
              <path d="M2,32 L18,32 L22,32 L26,18 L30,46 L34,10 L38,52 L42,32 L46,32 L62,32" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="system-title">医学动作智能评测系统</h1>
          <p class="system-subtitle">Medical Motion Intelligent Evaluation System</p>
        </div>
      </div>
      <div class="deco-circle deco-circle-1"></div>
      <div class="deco-circle deco-circle-2"></div>
      <div class="deco-ring deco-ring-1"></div>
    </div>

    <!-- 右侧注册表单区 -->
    <div class="register-right">
      <div class="register-form-wrapper">
        <h2 class="form-title">注册账号</h2>
        <p class="form-desc">创建您的系统账号</p>
        <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" size="large" placeholder="请输入账号">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" size="large" placeholder="请输入密码" show-password @keyup.enter="handleRegister">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" size="large" placeholder="请确认密码" show-password @keyup.enter="handleRegister">
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="captcha-row">
              <el-input v-model="registerForm.code" size="large" placeholder="请输入验证码" @keyup.enter="handleRegister">
                <template #prefix><el-icon><Key /></el-icon></template>
              </el-input>
              <img :src="codeUrl" @click="getCode" class="captcha-img" alt="验证码"/>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button :loading="loading" size="large" type="primary" class="register-btn" @click.prevent="handleRegister">
              <span v-if="!loading">注 册</span>
              <span v-else>注 册 中...</span>
            </el-button>
          </el-form-item>
          <div class="login-link">
            已有账号？<router-link :to="'/login'">立即登录</router-link>
          </div>
        </el-form>
      </div>
      <div class="register-footer">
        <span>Copyright &copy; 2024-2026 医学动作智能评测系统</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, Lock, Key } from '@element-plus/icons-vue'
import { ElMessageBox } from "element-plus"
import { getCodeImg, register } from "@/api/login"

const router = useRouter()
const { proxy } = getCurrentInstance()

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      register(registerForm.value).then(res => {
        const username = registerForm.value.username
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login")
        }).catch(() => {})
      }).catch(() => {
        loading.value = false
        if (captchaEnabled) {
          getCode()
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

getCode()
</script>

<style lang='scss' scoped>
$primary: #0D9488;
$primary-light: #14B8A6;
$primary-dark: #0F766E;
$left-bg: #0C1222;
$left-bg-secondary: #111B2E;

.register-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.register-left {
  position: relative;
  width: 55%;
  background: linear-gradient(135deg, $left-bg 0%, $left-bg-secondary 50%, darken($left-bg, 2%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .left-content {
    position: relative;
    z-index: 2;
    padding: 0 60px;
    max-width: 520px;
  }

  .brand-area {
    margin-bottom: 48px;
  }

  .logo-icon {
    width: 64px;
    height: 64px;
    color: $primary-light;
    margin-bottom: 28px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .system-title {
    font-size: 32px;
    font-weight: 700;
    color: #F0FDFA;
    letter-spacing: 2px;
    margin: 0 0 12px 0;
  }

  .system-subtitle {
    font-size: 14px;
    color: rgba(148, 163, 184, 0.7);
    letter-spacing: 1.5px;
    margin: 0;
    font-weight: 300;
    text-transform: uppercase;
  }
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($primary, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.deco-circle-1 {
  width: 400px; height: 400px;
  top: -80px; right: -100px;
}
.deco-circle-2 {
  width: 300px; height: 300px;
  bottom: -60px; left: -80px;
}
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba($primary, 0.12);
  pointer-events: none;
}
.deco-ring-1 {
  width: 500px; height: 500px;
  top: -150px; right: -150px;
}

.register-right {
  width: 45%;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  .register-form-wrapper {
    width: 100%;
    max-width: 380px;
    padding: 0 32px;
  }

  .form-title {
    font-size: 26px;
    font-weight: 600;
    color: #1E293B;
    margin: 0 0 8px 0;
  }

  .form-desc {
    font-size: 14px;
    color: #94A3B8;
    margin: 0 0 36px 0;
  }
}

.register-form {
  width: 100%;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 0 0 1px #E2E8F0 inset;
    padding: 4px 12px;
    transition: box-shadow 0.25s;

    &:hover {
      box-shadow: 0 0 0 1px #CBD5E1 inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px $primary inset, 0 0 0 3px rgba($primary, 0.1) inset;
    }
  }

  :deep(.el-input__prefix) {
    color: #94A3B8;
    margin-right: 4px;
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;

  .el-input {
    flex: 1;
  }
}

.captcha-img {
  height: 40px;
  width: 120px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid #E2E8F0;
  object-fit: cover;
  transition: border-color 0.25s;

  &:hover {
    border-color: $primary;
  }
}

.register-btn {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 4px;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border: none;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, $primary-light 0%, $primary 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba($primary, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
}

.login-link {
  text-align: center;
  font-size: 13px;
  color: #94A3B8;
  margin-top: 4px;

  a {
    color: $primary;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: $primary-light;
    }
  }
}

.register-footer {
  position: absolute;
  bottom: 24px;
  width: 100%;
  text-align: center;
  color: #CBD5E1;
  font-size: 12px;
  letter-spacing: 0.5px;
}

@media screen and (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }
  .register-left {
    width: 100%;
    height: 180px;
    .left-content {
      padding: 0 24px;
    }
    .system-title {
      font-size: 22px;
    }
    .deco-circle, .deco-ring {
      display: none;
    }
  }
  .register-right {
    width: 100%;
    flex: 1;
  }
}

:global(html.dark) {
  .register-right {
    background: #1E293B;
    .form-title {
      color: #F1F5F9;
    }
    .form-desc {
      color: #64748B;
    }
  }
  .captcha-img {
    border-color: #334155;
  }
  .register-footer {
    color: #475569;
  }
}
</style>
