<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

const settingsStore = useSettingsStore()

// 侧边栏主题 class 切换：亮色模式下选择深色侧边栏时添加 theme-dark-sidebar
watch(
  () => [settingsStore.sideTheme, settingsStore.isDark],
  ([sideTheme, isDark]) => {
    if (!isDark && sideTheme === 'theme-dark') {
      document.documentElement.classList.add('theme-dark-sidebar')
    } else {
      document.documentElement.classList.remove('theme-dark-sidebar')
    }
  },
  { immediate: true }
)

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(settingsStore.theme)
  })
})
</script>
