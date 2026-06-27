<template>
  <div class="app-container">
    <!-- 顶部标题 -->
    <div class="video-title">
      视频名称: {{ videoName }}
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 第一个 Tab: 区段信息 -->
        <el-tab-pane label="区段信息" name="sectionInfo">
          <div class="toolbar-container">
            <div class="search-bar">
              <span>模糊搜索:</span>
              <el-input
                v-model="searchQuery"
                placeholder="按操作类别搜索"
                clearable
                style="width: 240px; margin-left: 10px;"
              />
            </div>
            <el-button type="primary" icon="Download" @click="handleDownload">
              下载表格
            </el-button>
          </div>
          <el-table v-loading="sectionLoading" :data="paginatedSectionData">
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="startFrame" label="开始帧号" align="center" />
            <el-table-column prop="endFrame" label="结束帧号" align="center" />
            <el-table-column prop="actionType" label="操作类别" align="center" />
            <el-table-column label="概率" align="center">
              <template #default="scope">
                <span v-if="typeof scope.row.probability === 'number'">
                  {{ scope.row.probability.toFixed(4) }}
                </span>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <!-- <el-table-column label="细节" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="handleViewDetails(scope.row)">查看</el-button>
              </template>
            </el-table-column> -->
          </el-table>
          <pagination
            v-show="sectionTotal > 0"
            :total="sectionTotal"
            v-model:page="sectionQueryParams.pageNum"
            v-model:limit="sectionQueryParams.pageSize"
          />
        </el-tab-pane>

        <!-- 第二个 Tab: 单帧信息 -->
        <el-tab-pane label="单帧信息" name="frameInfo">
          <div ref="chartRef" style="width: 100%; height: 400px;"></div>
          <el-table v-loading="frameLoading" :data="paginatedFrameData">
            <el-table-column type="index" label="序号" width="70" align="center" :index="calcFrameIndex" />
            <el-table-column prop="frame_index" label="图片帧" align="center" />
            <el-table-column prop="label" label="标签" align="center" />
            <el-table-column prop="probability" label="概率" align="center" />
            <el-table-column prop="comparison_value" label="对比值" align="center">
               <template #default="scope">
                {{ scope.row.comparison_value.toFixed(4) }}
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="frameTotal > 0"
            :total="frameTotal"
            v-model:page="frameQueryParams.pageNum"
            v-model:limit="frameQueryParams.pageSize"
          />
        </el-tab-pane>

        <!-- 第三个 Tab: 图像查看 (这是需要修改的地方) -->
        <el-tab-pane label="图像查看" name="imageView">
          <!-- 
            - 我们在这里使用 ImageWall 组件。
            - v-if="activeTab === 'imageView'" 是一个性能优化：
              只有当用户点击这个Tab时，ImageWall组件才会被创建和渲染。
            - :videoId="videoId" 是关键的一步：
              它把我们在 script 中定义的 videoId ref，通过 prop 的方式传递给了 ImageWall 子组件。
          -->
          <ImageWall v-if="activeTab === 'imageView'" :videoId="videoId" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup name="VideoResultDetail">
import { ref, reactive, onMounted, computed, watch, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getAnalysisResult, getFrameInfo } from '@/api/video/video';
import * as echarts from 'echarts';
// +++ 1. 在这里引入 imageWall.vue 子组件 +++
import ImageWall from './imageWall.vue';

const { proxy } = getCurrentInstance();
const route = useRoute();

// +++ 2. 将 videoId 保存为一个 ref，以便在 template 中使用 +++
const videoId = ref(route.params.videoId);


// --- 通用状态 ---
const videoName = ref('');
const activeTab = ref('sectionInfo');
const searchQuery = ref('');

// --- 区段信息 (Tab 1) 状态 ---
const sectionLoading = ref(true);
const fullSectionData = ref([]); // 存储所有区段数据
const sectionTotal = ref(0);
const sectionQueryParams = reactive({ pageNum: 1, pageSize: 10 });

const filteredSectionData = computed(() => {
  if (!searchQuery.value) {
    return fullSectionData.value;
  }
  return fullSectionData.value.filter(item =>
    item.actionType.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedSectionData = computed(() => {
  sectionTotal.value = filteredSectionData.value.length;
  const start = (sectionQueryParams.pageNum - 1) * sectionQueryParams.pageSize;
  return filteredSectionData.value.slice(start, start + sectionQueryParams.pageSize);
});

// --- 单帧信息 (Tab 2) 状态 ---
const frameLoading = ref(false);
const fullFrameData = ref([]); // 存储所有帧数据
const frameTotal = ref(0);
const frameQueryParams = reactive({ pageNum: 1, pageSize: 10 });
const isFrameDataLoaded = ref(false);
const chartRef = ref(null);
let myChart = null;

const paginatedFrameData = computed(() => {
  const start = (frameQueryParams.pageNum - 1) * frameQueryParams.pageSize;
  return fullFrameData.value.slice(start, start + frameQueryParams.pageSize);
});

const calcFrameIndex = (index) => (frameQueryParams.pageNum - 1) * frameQueryParams.pageSize + index + 1;

// --- 辅助函数 ---
function getActionCategoryName(categoryNumber) {
  switch (categoryNumber) {
    case 9: return '四步触诊';
    case 6: return '心脏听诊';
    case 0: return '洗手';
    default: return `未知类别(${categoryNumber})`;
  }
}

// --- 数据获取方法 ---

// 获取区段信息 (Tab 1)
async function fetchSectionData() {
  sectionLoading.value = true;
  try {
    const videoId = route.params.videoId;
    const response = await getAnalysisResult(videoId);
    if (response && response.data) {
      const transformed = response.data.map(item => {
        if (!Array.isArray(item) || item.length < 5) return null;
        return {
          startFrame: item[0], endFrame: item[1], actionType: getActionCategoryName(item[2]), probability: item[4]
        };
      }).filter(Boolean); // filter(Boolean) 是一种过滤掉所有 null, undefined, 0, false 等假值的简洁写法
      fullSectionData.value = transformed;
      sectionTotal.value = transformed.length;
      videoName.value = '74D401'; // 示例名称
    }
  } catch(e) {
    console.error("加载区段数据失败:", e);
    proxy.$modal.msgError("加载区段数据失败");
  } finally {
    sectionLoading.value = false;
  }
}

// 获取单帧信息 (Tab 2)
async function fetchFrameData() {
  frameLoading.value = true;
  isFrameDataLoaded.value = true;
  try {
    const videoId = route.params.videoId;
    const response = await getFrameInfo(videoId);
    
    // **核心修改 1**: 检查返回的数据结构
    if (response && response.data && response.data.raw_seq_preds) {
      // 从返回的对象中解构出两个数组
      const rawData = response.data.raw_seq_preds;
      const probData = response.data.seq_prob || []; // 如果seq_prob不存在，给一个空数组

      // **核心修改 2**: 数据转换逻辑更新
      const transformed = rawData.map((value, index) => {
        const isKeyAction = value > 0.3;
        return {
          frame_index: `frame_${index + 1}`,
          label: isKeyAction ? '关键动作' : '无关动作',
          // **概率值**：直接从 probData 中按索引获取
          probability: probData[index] || 0, 
          comparison_value: value
        };
      });
      
      fullFrameData.value = transformed;
      frameTotal.value = transformed.length;
      
      await nextTick();
      // **核心修改 3**: 将两个数组都传给图表函数
      initChart(rawData, probData);
    }
  } catch(e) {
    console.error("加载单帧数据失败:", e);
    proxy.$modal.msgError("加载单帧数据失败");
  } finally {
    frameLoading.value = false;
  }
}

// --- ECharts 图表 ---
function initChart(comparisonData, probabilityData) { // 接收两个数组
  if (myChart) myChart.dispose();
  if (!chartRef.value) return;
  myChart = echarts.init(chartRef.value);
  myChart.setOption({
    title: { text: '概率和对比值' },
    tooltip: { trigger: 'axis' },
    legend: { 
      // **核心修改**: 图例中加入'概率'
      data: ['对比值', '概率'] 
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: comparisonData.map((_, index) => index + 1)
    },
    yAxis: { type: 'value', min: 0 },
    dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    series: [ // **核心修改**: series数组现在包含两个对象
      {
        name: '对比值',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: comparisonData // 第一条线的数据
      },
      {
        name: '概率',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: probabilityData // 第二条线的数据
      }
    ]
  });
}

const chartResizeHandler = () => myChart?.resize();

// --- 其他方法 ---
function handleDownload() {
  proxy.$modal.msgSuccess("触发下载操作！");
}

function handleViewDetails(row) {
  proxy.$modal.msgInfo(`正在查看 ${row.actionType} 的详情`);
}

// --- 监听与生命周期钩子 ---
watch(activeTab, (newTab) => {
  if (newTab === 'frameInfo' && !isFrameDataLoaded.value) {
    fetchFrameData();
  } else if (newTab === 'frameInfo' && myChart) {
    nextTick(() => myChart.resize());
  }
});

onMounted(() => {
  fetchSectionData(); // 页面加载时默认获取第一个Tab的数据
  window.addEventListener('resize', chartResizeHandler);
});

onUnmounted(() => {
  window.removeEventListener('resize', chartResizeHandler);
  myChart?.dispose();
});

</script>

<style scoped>
.video-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
.toolbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.search-bar {
  display: flex;
  align-items: center;
}
</style>