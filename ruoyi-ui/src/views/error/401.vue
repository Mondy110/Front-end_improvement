<template>
  <div class="not-container">
    <img src="@/assets/images/403.png" class="not-img" alt="401" />
    <div class="not-detail">
      <h2>401</h2>
      <h4>抱歉，您无权访问该页面~</h4>
      <el-button type="primary" @click="router.back()">返回上一页</el-button>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
</script>

<style scoped lang="scss">
@use "./error-page.scss";
</style>
