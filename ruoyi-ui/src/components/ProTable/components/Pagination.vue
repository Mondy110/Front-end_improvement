<template>
  <el-pagination
    :background="true"
    :current-page="pageable.pageNum"
    :page-size="pageable.pageSize"
    :page-sizes="[10, 25, 50, 100]"
    :total="pageable.total"
    layout="total, sizes, prev, pager, next, jumper"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup>
defineProps({
  pageable: {
    type: Object,
    required: true
  },
  handleSizeChange: {
    type: Function,
    required: true
  },
  handleCurrentChange: {
    type: Function,
    required: true
  }
})
</script>
