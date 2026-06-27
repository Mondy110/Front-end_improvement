<!-- imageWall.vue (改造后的子组件版本) -->
<template>
  <div class="image-wall-sub-container">
    <!-- 加载提示 -->
    <div v-if="loading" class="loading">
      <el-skeleton style="width: 100%" :rows="5" animated />
    </div>

    <!-- 照片墙内容 -->
    <div v-else>
      <!-- 控制面板 -->
      <div class="control-panel">
        <el-select
          v-model="step"
          placeholder="选择步长"
          @change="handleStepChange"
          style="width: 120px;"
        >
          <el-option
            v-for="item in stepOptions"
            :key="item"
            :label="`步长 ${item}`"
            :value="item"
          />
        </el-select>
        <div class="pagination-info">
          总计 {{ totalImages }} 张图片，当前显示 {{ images.length }} 张
        </div>
      </div>

      <!-- 照片网格 -->
      <div v-if="images.length > 0" class="image-grid">
        <div
          v-for="(image, index) in images"
          :key="getImageKey(image, index)"
          class="image-item"
        >
          <el-image
            :src="getImageUrl(image)"
            fit="cover"
            :preview-src-list="previewList"
            :initial-index="index"
            lazy
            preview-teleported
          >
            <template #placeholder>
              <div class="image-placeholder">
                <el-icon><picture-filled /></el-icon>
              </div>
            </template>
            <template #error>
              <div class="image-error">
                <el-icon><picture /></el-icon>
                <span>加载失败</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 无图片提示 -->
      <div v-else class="no-images">
        <el-empty description="暂无图片" />
      </div>
    </div>
  </div>
</template>

<script setup name="ImageWallSubComponent">
// 导入Vue相关API和第三方库
import { ref, computed, watch } from 'vue';
import { Picture, PictureFilled } from '@element-plus/icons-vue';
// **核心修改**: getImageList 已重命名为 getImages, 此处同步
import { getImageList, getStepOptions } from '@/api/video/imageWall';
import modal from '@/plugins/modal';

// **核心修改**: 移除 defineOptions 和 useRoute/useRouter

// --- 接收父组件传入的 Props ---
const props = defineProps({
  videoId: {
    type: [String, Number],
    required: true
  }
});

// --- 响应式状态定义 ---
const loading = ref(true);
const images = ref([]);
const totalImages = ref(0);
const step = ref(6);
const stepOptions = ref([]);

// --- 计算属性 ---
const previewList = computed(() => images.value.map(image => getImageUrl(image)));

// --- 方法定义 ---
async function fetchImages() {
  // **核心修改**: 直接使用 props.videoId
  if (!props.videoId) return;

  try {
    loading.value = true;
    const response = await getImageList(props.videoId, step.value);
    if (response.code === 200) {
      images.value = response.images || [];
      totalImages.value = response.totalImages || 0;
      step.value = response.step || 6;
    } else {
      modal.msgError(response.msg || '获取图片列表失败');
    }
  } catch (error) {
    console.error('获取图片列表失败:', error);
    modal.msgError('获取图片列表失败,请稍后重试');
  } finally {
    loading.value = false;
  }
}

async function fetchStepOptions() {
  try {
    const response = await getStepOptions();
    if (response.code === 200) {
      stepOptions.value = response.data || [6, 12, 18, 24];
    }
  } catch (error) {
    console.error('获取步长选项失败:', error);
    stepOptions.value = [6, 12, 18, 24];
  }
}

function handleStepChange() {
  fetchImages();
}

function getImageUrl(image) {
  if (typeof image === 'string') {
    return `${import.meta.env.VITE_APP_BASE_API || ''}/video/imageWall/image?token=${image}`;
  }
  const baseUrl = import.meta.env.VITE_APP_BASE_API || '';
  return `${baseUrl}/video/imageWall/image?token=${image.token}`;
}

function getImageKey(image, index) {
  const key = typeof image === 'string' ? image : (image.path || image.token);
  return `${key}-${index}`;
}

// **核心修改**: 使用 watch 监听 prop 的变化来触发数据加载
watch(() => props.videoId, (newVideoId) => {
  if (newVideoId) {
    // 当 videoId 变化时，重新获取步长选项和图片
    fetchStepOptions();
    fetchImages();
  }
}, { immediate: true }); // immediate: true 确保组件第一次挂载时就执行

</script>

<style scoped>
/* 样式基本不变, 只是调整了根容器的类名和移除了页面级的样式 */
.image-wall-sub-container {
  padding-top: 20px; /* 增加一点顶部间距 */
}

/* ... 您之前的其他样式保持不变 ... */
.loading { padding: 20px; }
.control-panel { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; padding: 15px; background-color: var(--el-bg-color-overlay); border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); gap: 20px; }
.pagination-info { font-size: 14px; color: var(--el-text-color-regular); }
.image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
.image-item { position: relative; height: 200px; overflow: hidden; border-radius: 6px; box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); cursor: pointer; transition: transform .3s ease; background-color: var(--el-bg-color-overlay); }
.image-item:hover { transform: scale(1.05); box-shadow: 0 4px 20px 0 rgba(0,0,0,.15); }
.image-item :deep(.el-image) { width: 100%; height: 100%; }
.image-placeholder, .image-error { display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; background-color: var(--el-fill-color-light); color: var(--el-text-color-secondary); }
.image-placeholder .el-icon, .image-error .el-icon { font-size: 30px; margin-bottom: 10px; }
.image-error span { font-size: 14px; }
.no-images { padding: 50px 0; background-color: var(--el-bg-color-overlay); border-radius: 4px; box-shadow: 0 2px 12px 0 rgba(0,0,0,.1); }
</style>