<template>
  <div class="login-container">
    <!-- 左侧品牌展示区 -->
    <div class="login-left">
      <div class="left-content">
        <div class="brand-area">
          <div class="logo-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 外圈 -->
              <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
              <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1.5" opacity="0.35"/>
              <!-- 医学十字 -->
              <rect x="28" y="14" width="8" height="36" rx="2" fill="currentColor" opacity="0.7"/>
              <rect x="14" y="28" width="36" height="8" rx="2" fill="currentColor" opacity="0.7"/>
              <!-- 脉搏线 -->
              <path d="M2,32 L18,32 L22,32 L26,18 L30,46 L34,10 L38,52 L42,32 L46,32 L62,32" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="system-title">医学动作智能评测系统</h1>
          <p class="system-subtitle">Medical Motion Intelligent Evaluation System</p>
        </div>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>深度学习驱动的动作识别与评分</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>实时视频分析与标准对比</span>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <span>多维度智能评测报告生成</span>
          </div>
        </div>
      </div>
      <!-- 装饰动画元素 -->
      <div class="deco-circle deco-circle-1"></div>
      <div class="deco-circle deco-circle-2"></div>
      <div class="deco-circle deco-circle-3"></div>
      <div class="deco-ring deco-ring-1"></div>
      <div class="deco-ring deco-ring-2"></div>
    </div>

    <!-- 右侧登录表单区 -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <h2 class="form-title">欢迎登录</h2>
        <p class="form-desc">请输入您的账号信息</p>
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              size="large"
              placeholder="请输入账号"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              size="large"
              placeholder="请输入密码"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="code" v-if="captchaEnabled">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                size="large"
                placeholder="请输入验证码"
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
              <img :src="codeUrl" @click="getCode" class="captcha-img" alt="验证码"/>
            </div>
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
          </div>
          <el-form-item>
            <el-button
              :loading="loading"
              size="large"
              type="primary"
              class="login-btn"
              @click.prevent="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
          <div class="register-link" v-if="register">
            还没有账号？<router-link :to="'/register'">立即注册</router-link>
          </div>
        </el-form>
      </div>
      <div class="login-footer">
        <span>Copyright &copy; 2024-2026 医学动作智能评测系统</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, Lock, Key } from '@element-plus/icons-vue'
import { getCodeImg } from "@/api/login"
import Cookies from "js-cookie"
import { encrypt, decrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: ""
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

const codeUrl = ref("")
const loading = ref(false)
const captchaEnabled = ref(true)
const register = ref(false)
const redirect = ref(undefined)

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 })
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 })
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 })
      } else {
        Cookies.remove("username")
        Cookies.remove("password")
        Cookies.remove("rememberMe")
      }
      userStore.login(loginForm.value).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        loading.value = false
        if (captchaEnabled.value) {
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
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get("username")
  const password = Cookies.get("password")
  const rememberMe = Cookies.get("rememberMe")
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
$primary: #0D9488;
$primary-light: #14B8A6;
$primary-dark: #0F766E;
$left-bg: #0C1222;
$left-bg-secondary: #111B2E;

.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* ===== 左侧品牌区 ===== */
.login-left {
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
    animation: logoPulse 4s ease-in-out infinite;

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
    line-height: 1.3;
  }

  .system-subtitle {
    font-size: 14px;
    color: rgba(148, 163, 184, 0.7);
    letter-spacing: 1.5px;
    margin: 0;
    font-weight: 300;
    text-transform: uppercase;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 14px;
    color: rgba(203, 213, 225, 0.85);
    font-size: 15px;
    letter-spacing: 0.5px;

    .feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $primary;
      box-shadow: 0 0 12px rgba($primary, 0.5);
      flex-shrink: 0;
    }
  }
}

/* 装饰圆环动画 */
.deco-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba($primary, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.deco-circle-1 {
  width: 400px; height: 400px;
  top: -80px; right: -100px;
  animation: float1 12s ease-in-out infinite;
}
.deco-circle-2 {
  width: 300px; height: 300px;
  bottom: -60px; left: -80px;
  animation: float2 15s ease-in-out infinite;
}
.deco-circle-3 {
  width: 200px; height: 200px;
  top: 40%; right: 10%;
  animation: float3 10s ease-in-out infinite;
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
  animation: ringRotate 30s linear infinite;
}
.deco-ring-2 {
  width: 350px; height: 350px;
  bottom: -100px; left: -100px;
  border-color: rgba($primary, 0.08);
  animation: ringRotate 25s linear infinite reverse;
}

/* ===== 右侧登录区 ===== */
.login-right {
  width: 45%;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;

  .login-form-wrapper {
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

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  :deep(.el-checkbox__label) {
    color: #64748B;
    font-size: 13px;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: $primary;
    border-color: $primary;
  }
}

.login-btn {
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
    box-shadow: 0 2px 8px rgba($primary, 0.25);
  }
}

.register-link {
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

.login-footer {
  position: absolute;
  bottom: 24px;
  width: 100%;
  text-align: center;
  color: #CBD5E1;
  font-size: 12px;
  letter-spacing: 0.5px;
}

/* ===== 动画 ===== */
@keyframes logoPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.05); }
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.05); }
  66% { transform: translate(-15px, 20px) scale(0.95); }
}

@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25px, -20px) scale(1.08); }
}

@keyframes float3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.6; }
  50% { transform: translate(-20px, 15px); opacity: 1; }
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 响应式 ===== */
@media screen and (max-width: 992px) {
  .login-left {
    width: 45%;
    .left-content {
      padding: 0 32px;
    }
    .system-title {
      font-size: 24px;
    }
    .feature-item {
      font-size: 13px;
    }
  }
  .login-right {
    width: 55%;
  }
}

@media screen and (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  .login-left {
    width: 100%;
    height: 220px;
    .left-content {
      padding: 0 24px;
      max-width: 100%;
    }
    .brand-area {
      margin-bottom: 16px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
    }
    .system-title {
      font-size: 22px;
    }
    .system-subtitle {
      font-size: 12px;
    }
    .feature-list {
      display: none;
    }
    .deco-circle, .deco-ring {
      display: none;
    }
  }
  .login-right {
    width: 100%;
    flex: 1;
    .login-form-wrapper {
      max-width: 400px;
    }
  }
}

/* 暗黑模式适配 - 使用 :global() 覆盖 scoped 限制 */
:global(html.dark) {
  .login-right {
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
  .login-footer {
    color: #475569;
  }
}
</style>
