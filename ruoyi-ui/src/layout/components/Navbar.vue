<template>
  <div class="navbar">
    <!-- 左侧工具栏：折叠按钮 + 面包屑 -->
    <div class="tool-bar-lf">
      <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
      <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
      <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />
    </div>

    <!-- 右侧工具栏 -->
    <div class="tool-bar-ri">
      <template v-if="appStore.device !== 'mobile'">
        <div class="header-icon">
          <header-search id="header-search" class="header-icon-item" />
          <screenfull id="screenfull" class="header-icon-item" />
          <el-tooltip content="主题模式" effect="dark" placement="bottom">
            <div class="header-icon-item theme-switch-wrapper" @click="toggleTheme">
              <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
              <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
            </div>
          </el-tooltip>
          <size-select id="size-select" class="header-icon-item" />
        </div>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname">{{ userStore.nickName }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div v-if="settingsStore.showSettings" class="header-icon-item setting-btn" @click="setLayout">
        <svg-icon icon-class="more-up" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 55px;
  padding: 0 15px;
  background: var(--el-header-bg-color);
  border-bottom: 1px solid var(--el-header-border-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

/* ========== 左侧工具栏 ========== */
.tool-bar-lf {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  flex: 1;

  .hamburger-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 55px;
    cursor: pointer;
    transition: background 0.3s;
    margin-right: 10px;
    color: var(--el-header-text-color);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  .breadcrumb-container {
    display: flex;
    align-items: center;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }
}

/* ========== 右侧工具栏 ========== */
.tool-bar-ri {
  display: flex;
  align-items: center;

  .header-icon {
    display: flex;
    align-items: center;

    .header-icon-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 55px;
      font-size: 18px;
      color: var(--el-header-text-color);
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      &.theme-switch-wrapper {
        svg {
          transition: transform 0.3s;
          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }
  }

  .setting-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 55px;
    font-size: 18px;
    color: var(--el-header-text-color);
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}

/* ========== 头像区域 ========== */
.avatar-container {
  display: flex;
  align-items: center;
  height: 55px;
  padding: 0 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--el-header-border-color);
      transition: border-color 0.3s;
    }

    .user-nickname {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-header-text-color);
      white-space: nowrap;
    }

    &:hover .user-avatar {
      border-color: var(--el-color-primary);
    }
  }
}
</style>
