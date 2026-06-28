<template>
  <el-table-column
    v-if="column.isShow !== false"
    v-bind="column"
    :align="column.align ?? 'center'"
    :show-overflow-tooltip="column.showOverflowTooltip !== undefined ? column.showOverflowTooltip : column.prop !== 'operation'"
  >
    <!-- 多级表头 -->
    <template v-if="column._children && column._children.length">
      <TableColumn v-for="(child, idx) in column._children" :key="idx" :column="child" />
    </template>

    <!-- 单级表头：默认单元格 -->
    <template v-if="!column._children || !column._children.length" #default="scope">
      <!-- 自定义 render 函数 -->
      <component :is="column.render(scope)" v-if="column.render" />
      <!-- 具名插槽（按 prop 命名） -->
      <slot v-else-if="column.prop && $slots[handledProp]" :name="handledProp" v-bind="scope" />
      <!-- Tag 模式 -->
      <el-tag v-else-if="column.tag" :type="getTagType(scope)">{{ renderCellData(scope) }}</el-tag>
      <!-- 默认文本 -->
      <template v-else>{{ renderCellData(scope) }}</template>
    </template>

    <!-- 表头插槽 -->
    <template v-if="!column._children || !column._children.length" #header="scope">
      <component :is="column.headerRender(scope)" v-if="column.headerRender" />
      <slot v-else-if="column.prop && $slots[handledProp + 'Header']" :name="handledProp + 'Header'" v-bind="scope" />
      <template v-else>{{ column.label }}</template>
    </template>
  </el-table-column>
</template>

<script setup>
import { inject, computed } from "vue"
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from "../proTableUtils"

const props = defineProps({
  column: {
    type: Object,
    required: true
  }
})

const enumMap = inject("enumMap", ref(new Map()))

const handledProp = computed(() => handleProp(props.column.prop || ""))

// 渲染表格单元格数据
const renderCellData = (scope) => {
  const col = props.column
  if (enumMap.value.get(col.prop) && col.isFilterEnum !== false) {
    return filterEnum(handleRowAccordingToProp(scope.row, col.prop), enumMap.value.get(col.prop), col.fieldNames)
  }
  return formatValue(handleRowAccordingToProp(scope.row, col.prop))
}

// 获取 tag 类型
const getTagType = (scope) => {
  const col = props.column
  return filterEnum(handleRowAccordingToProp(scope.row, col.prop), enumMap.value.get(col.prop), col.fieldNames, "tag") || "primary"
}
</script>
