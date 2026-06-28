<template>
  <!-- 表格主体 -->
  <div class="card table-main">
    <!-- 表格头部 操作按钮 -->
    <div class="table-header">
      <div class="header-button-lf">
        <slot name="tableHeader" :selected-list="selectedList" :selected-list-ids="selectedListIds" :is-selected="isSelected" />
      </div>
      <div v-if="toolButton" class="header-button-ri">
        <slot name="toolButton">
          <el-button v-if="showToolButton('refresh')" :icon="Refresh" circle @click="getTableList" />
          <el-button v-if="showToolButton('setting') && tableColumns.length" :icon="Operation" circle @click="openColSetting" />
          <el-button v-if="showToolButton('search') && searchColumns.length" :icon="Search" circle @click="isShowSearch = !isShowSearch" />
        </slot>
      </div>
    </div>

    <!-- 查询表单 -->
    <div v-show="isShowSearch" class="table-search">
      <el-form :model="searchParam" :inline="true">
        <el-form-item v-for="item in searchColumns" :key="item.prop" :label="item.search?.label || item.label">
          <!-- input -->
          <el-input
            v-if="!item.search?.el || item.search?.el === 'input'"
            v-model="searchParam[item.search?.key || item.prop]"
            :placeholder="item.search?.props?.placeholder || '请输入'"
            clearable
            v-bind="item.search?.props || {}"
            @keyup.enter="_search"
          />
          <!-- select -->
          <el-select
            v-else-if="item.search?.el === 'select'"
            v-model="searchParam[item.search?.key || item.prop]"
            :placeholder="item.search?.props?.placeholder || '请选择'"
            clearable
            v-bind="item.search?.props || {}"
          >
            <el-option
              v-for="opt in (item.search?.options || enumMap.get(item.prop) || [])"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <!-- date-picker -->
          <el-date-picker
            v-else-if="item.search?.el === 'date-picker'"
            v-model="searchParam[item.search?.key || item.prop]"
            clearable
            v-bind="item.search?.props || {}"
          />
          <!-- 其他：通过 slot 自定义 -->
          <slot v-else :name="'search-' + item.prop" :model="searchParam" :item="item" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="_search">搜索</el-button>
          <el-button icon="Refresh" @click="_reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      ref="tableRef"
      v-bind="$attrs"
      :data="processTableData"
      :border="border"
      :row-key="rowKey"
      @selection-change="selectionChange"
    >
      <!-- 默认插槽 -->
      <slot />
      <template v-for="item in tableColumns" :key="item.prop">
        <!-- selection / index / expand / sort -->
        <el-table-column
          v-if="item.type && columnTypes.includes(item.type)"
          v-bind="item"
          :align="item.align ?? 'center'"
          :reserve-selection="item.type === 'selection'"
        >
          <template #default="scope">
            <!-- expand -->
            <template v-if="item.type === 'expand'">
              <component :is="item.render" v-bind="scope" v-if="item.render" />
              <slot v-else :name="item.type" v-bind="scope" />
            </template>
            <!-- radio -->
            <el-radio v-if="item.type === 'radio'" v-model="radio" :label="scope.row[rowKey]">
              <i></i>
            </el-radio>
            <!-- sort -->
            <el-tag v-if="item.type === 'sort'" class="move">
              <el-icon><DCaret /></el-icon>
            </el-tag>
          </template>
        </el-table-column>
        <!-- other columns -->
        <TableColumn v-else :column="item">
          <template v-for="slot in Object.keys($slots).filter(s => !s.startsWith('search-'))" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </TableColumn>
      </template>
      <!-- append -->
      <template #append>
        <slot name="append" />
      </template>
      <!-- empty -->
      <template #empty>
        <div class="table-empty">
          <slot name="empty">
            <div>暂无数据</div>
          </slot>
        </div>
      </template>
    </el-table>

    <!-- 分页组件 -->
    <slot name="pagination">
      <Pagination
        v-if="pagination"
        :pageable="pageable"
        :handle-size-change="handleSizeChange"
        :handle-current-change="handleCurrentChange"
      />
    </slot>
  </div>

  <!-- 列设置 -->
  <ColSetting v-if="toolButton" ref="colRef" :col-setting="colSetting" />
</template>

<script setup>
import { ref, watch, provide, onMounted, unref, computed, reactive } from "vue"
import { Refresh, Operation, Search, DCaret } from "@element-plus/icons-vue"
import { useTable } from "@/hooks/useTable"
import { useSelection } from "@/hooks/useSelection"
import { generateUUID, handleProp } from "./proTableUtils"
import Pagination from "./components/Pagination.vue"
import ColSetting from "./components/ColSetting.vue"
import TableColumn from "./components/TableColumn.vue"

const props = defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: undefined },
  requestApi: { type: Function, default: undefined },
  requestAuto: { type: Boolean, default: true },
  requestError: { type: Function, default: undefined },
  dataCallback: { type: Function, default: undefined },
  pagination: { type: Boolean, default: true },
  initParam: { type: Object, default: () => ({}) },
  border: { type: Boolean, default: true },
  toolButton: { type: [Array, Boolean], default: true },
  rowKey: { type: String, default: "id" }
})

// table 实例
const tableRef = ref()

// 生成组件唯一 id
const uuid = ref("id-" + generateUUID())

// column 列类型
const columnTypes = ["selection", "radio", "index", "expand", "sort"]

// 是否显示搜索模块
const isShowSearch = ref(true)

// 控制 ToolButton 显示
const showToolButton = (key) => {
  return Array.isArray(props.toolButton) ? props.toolButton.includes(key) : props.toolButton
}

// 单选值
const radio = ref("")

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } = useSelection(props.rowKey)

// 表格操作 Hooks
const { tableData, pageable, searchParam, searchInitParam, getTableList, search, reset, handleSizeChange, handleCurrentChange } =
  useTable(props.requestApi, props.initParam, props.pagination, props.dataCallback, props.requestError)

// 清空选中数据列表
const clearSelection = () => tableRef.value?.clearSelection()

// 初始化表格数据
onMounted(() => {
  props.requestAuto && getTableList()
  props.data && (pageable.value.total = props.data.length)
})

// 处理表格数据
const processTableData = computed(() => {
  if (!props.data) return tableData.value
  if (!props.pagination) return props.data
  return props.data.slice(
    (pageable.value.pageNum - 1) * pageable.value.pageSize,
    pageable.value.pageSize * pageable.value.pageNum
  )
})

// 监听页面 initParam 变化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true })

// 接收 columns 并设置为响应式
const tableColumns = reactive([...props.columns])

// 扁平化 columns
const flatColumns = computed(() => flatColumnsFunc(tableColumns))

// 定义 enumMap 存储 enum 值
const enumMap = ref(new Map())

const setEnumMap = async (col) => {
  const enumValue = col.enum
  if (!enumValue) return

  const prop = col.prop
  if (enumMap.value.has(prop) && (typeof enumValue === "function" || enumMap.value.get(prop) === enumValue)) return

  if (typeof enumValue !== "function") return enumMap.value.set(prop, unref(enumValue))

  enumMap.value.set(prop, [])
  const { data } = await enumValue()
  enumMap.value.set(prop, data)
}

// 注入 enumMap
provide("enumMap", enumMap)

// 扁平化 columns 的方法
const flatColumnsFunc = (columns, flatArr = []) => {
  columns.forEach(col => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children))
    flatArr.push(col)

    // column 添加默认属性
    if (col.isShow === undefined) col.isShow = true
    if (col.isSetting === undefined) col.isSetting = true
    if (col.isFilterEnum === undefined) col.isFilterEnum = true

    setEnumMap(col)
  })
  return flatArr.filter(item => !item._children?.length)
}

// 过滤需要搜索的配置项 && 排序
const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter(item => item.search?.el || item.search?.render)
    .sort((a, b) => (a.search?.order ?? 0) - (b.search?.order ?? 0))
})

// 设置搜索表单默认值
searchColumns.value?.forEach((column, index) => {
  if (column.search) {
    column.search.order = column.search.order ?? index + 2
    const key = column.search.key ?? handleProp(column.prop || "")
    const defaultValue = column.search.defaultValue
    if (defaultValue !== undefined && defaultValue !== null) {
      searchParam.value[key] = defaultValue
      searchInitParam.value[key] = defaultValue
    }
  }
})

// 列设置
const colRef = ref()
const colSetting = tableColumns.filter(item => {
  const { type, prop, isSetting } = item
  return !columnTypes.includes(type) && prop !== "operation" && isSetting !== false
})
const openColSetting = () => colRef.value?.openColSetting()

// emit 事件
const emit = defineEmits(["search", "reset"])

const _search = () => {
  search()
  emit("search")
}

const _reset = () => {
  reset()
  emit("reset")
}

// 暴露给父组件的参数和方法
defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  isSelected,
  selectedList,
  selectedListIds,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap
})
</script>
