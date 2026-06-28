import { ref, computed } from "vue"

/**
 * 表格多选数据操作
 * @param {String} rowKey 当表格可以多选时，所指定的 id（默认 "id"）
 */
export function useSelection(rowKey = "id") {
  const isSelected = ref(false)
  const selectedList = ref([])

  // 当前选中的所有 ids 数组
  const selectedListIds = computed(() => {
    const ids = []
    selectedList.value.forEach(item => ids.push(item[rowKey]))
    return ids
  })

  /**
   * 多选操作
   * @param {Array} rowArr 当前选择的所有数据
   */
  const selectionChange = (rowArr) => {
    isSelected.value = rowArr.length > 0
    selectedList.value = rowArr
  }

  return {
    isSelected,
    selectedList,
    selectedListIds,
    selectionChange
  }
}
