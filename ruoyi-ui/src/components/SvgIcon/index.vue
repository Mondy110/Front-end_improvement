<template>
  <svg :class="svgClass" :style="iconStyle" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color" />
  </svg>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  // 图标名称（必传）
  iconClass: {
    type: String,
    required: true
  },
  // 图标前缀（默认 "icon"，与 vite-plugin-svg-icons 的 symbolId 对应）
  prefix: {
    type: String,
    default: "icon"
  },
  // 额外 class 名
  className: {
    type: String,
    default: ""
  },
  // 填充颜色
  color: {
    type: String,
    default: ""
  },
  // 自定义样式对象（Geeker 风格扩展）
  iconStyle: {
    type: Object,
    default: () => ({})
  }
})

const iconName = computed(() => `#${props.prefix}-${props.iconClass}`)

const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`
  }
  return "svg-icon"
})
</script>

<style scoped lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  position: relative;
  fill: currentColor;
  vertical-align: -2px;
}
</style>
