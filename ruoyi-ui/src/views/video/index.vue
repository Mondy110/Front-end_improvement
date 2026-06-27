<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-row :gutter="20">
        <!-- 姓名搜索 -->
        <el-col :span="4">
          <el-form-item label="姓名" prop="stuName">
            <el-input
              v-model="queryParams.stuName"
              placeholder="请输入姓名"
              clearable
              @keyup.enter="handleQuery"
              style="width: 150px;"
            />
          </el-form-item>
        </el-col>
        <!-- 学号搜索 -->
        <el-col :span="4">
          <el-form-item label="学号" prop="stuNumber">
            <el-input
              v-model="queryParams.stuNumber"
              placeholder="请输入学号"
              clearable
              @keyup.enter="handleQuery"
              style="width: 150px;"
            />
          </el-form-item>
        </el-col>
        <!-- 学科选择 -->
        <el-col :span="4">
            <el-form-item label="学科" prop="subId">
                <el-select v-model="queryParams.subId" placeholder="请选择学科" clearable style="width: 125px;">
                <el-option
                    v-for="subject in subjects"
                    :key="subject.id"
                    :label="subject.subName"
                    :value="subject.id"
                />
                </el-select>
            </el-form-item>
        </el-col>
        <!-- 考试分组选择 -->
        <el-col :span="4">
            <el-form-item label="考试分组" prop="examId">
                <el-select v-model="queryParams.examId" placeholder="请选择考试分组" clearable style="width: 150px;">
                <el-option
                    v-for="group in examGroups"
                    :key="group.id"
                    :label="group.examName"
                    :value="group.id"
                />
                </el-select>
            </el-form-item>
        </el-col>
        <!-- 搜索和重置按钮 -->
        <el-col :span="8" style="text-align: right;">
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="danger"
          :disabled="multiple"
          @click="handleBatchDelete"
          plain icon="Delete"
          v-hasPermi="['video:video:remove']"
        >批量删除
        </el-button>
      </el-col>
      <!-- 右侧工具栏，用于控制搜索表单的显示/隐藏和刷新表格 -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="videoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center">
        <template #default="scope">
          <el-tooltip effect="light" :content="`id: ${scope.row.id}`" placement="top">
            {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="stuName" />
      <el-table-column label="学号" align="center" prop="stuNumber" />
      <el-table-column label="学科" align="center" prop="subName" />
      <el-table-column label="考试分组" align="center" prop="examName" />
      <el-table-column label="任务状态" align="center" prop="vdoTag">
         <template #default="scope">
          <!-- 格式化任务状态显示 -->
          <span :class="['status-tag', getStatusClass(scope.row.vdoTag)]">
            {{ formatStatus(scope.row.vdoTag) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- 视频上传按钮 -->
          <el-button
            size="small"
            type="text"
            icon="Upload"
            @click="handleUpload(scope.row)"
            v-hasPermi="['video:video:upload']"
          >视频上传</el-button>
          <!-- 预测按钮 -->
          <el-button
            size="small"
            type="text"
            icon="VideoPlay"
            @click="handlePredict(scope.row)"
            v-hasPermi="['video:video:prediction']"
          >预测</el-button>
          <!-- 照片墙按钮 -->
          <!-- <el-button
            size="small"
            type="text"
            icon="Picture"
            @click="handleImageWall(scope.row)"
            :disabled="!scope.row.vdoImage"
          >照片墙</el-button> -->
          <!-- 视频删除按钮 -->
          <el-button
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            :disabled="scope.row.vdoTag === 0"
            v-hasPermi="['video:video:remove']"
          >视频删除</el-button>
          <!-- 数据库记录删除按钮 -->
          <el-button
            size="small"
            type="text"
            icon="Delete"
            @click="handleDeleteRecord(scope.row)"
            v-hasPermi="['video:video:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 视频上传弹窗 -->
    <el-dialog :title="uploadTitle" v-model="uploadOpen" width="600px" append-to-body>
      <!-- 学生基本信息展示 -->
      <el-form v-if="currentVideo" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input :value="currentVideo.stuName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号">
              <el-input :value="currentVideo.stuNumber" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="专业">
              <el-input :value="currentVideo.stuField" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级">
              <el-input :value="currentVideo.stuClass" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 根据镜头数量动态生成上传组件 -->
        <div v-if="currentVideo.numShot > 0">
          <el-form-item v-for="i in currentVideo.numShot" :key="i" :label="'镜头 ' + i">
            <el-upload
              :key="currentVideo.id + '-' + i"
              drag
              action="#"
              :auto-upload="false"
              :on-change="(file, fileList) => handleFileChange(file, fileList, i)"
              :on-remove="(file, fileList) => handleFileRemove(file, fileList, i)"
              :limit="1"
              accept=".mp4"
              :before-upload="beforeVideoUpload"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  请上传 MP4 格式的视频文件。
                </div>
              </template>
            </el-upload>
            <!-- 上传进度条 -->
            <el-progress v-if="uploadProgress[i]" :percentage="uploadProgress[i]" />
          </el-form-item>
        </div>
        <!-- 若无法确定镜头数量则显示提示信息 -->
        <div v-else>
          <p>无法确定镜头数量，请确保该记录已关联学科且学科信息包含镜头数。</p>
        </div>
      </el-form>
      <!-- 弹窗页脚 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUploadChunk">提 交</el-button>
          <el-button @click="cancelUpload">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Video">
// 导入Vue相关API、第三方库和自定义模块
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SparkMD5 from 'spark-md5'; // 用于计算文件MD5
import { UploadFilled, Picture } from '@element-plus/icons-vue'; // Element Plus图标
import { listVideo, listAllSubject, listAllExamGroup, uploadVideo, uploadChunk, getStatus, mergeChunks, predict, deleteVideoFile, delVideo } from "@/api/video/video"; // API接口
// import { listNotice } from "@/api/system/notice"; // 导入系统通知API
import modal from '@/plugins/modal'; // 消息提示插件

// --- 响应式状态定义 ---

// 获取查询表单的引用
const queryFormRef = ref(null);

// 路由实例
const router = useRouter();

// 表格加载状态
const loading = ref(true);
// 控制搜索表单的显示与隐藏
const showSearch = ref(true);

// 总数据条数
const total = ref(0);
// 视频列表数据
const videoList = ref([]);
// 学科列表数据
const subjects = ref([]);
// 考试分组列表数据
const examGroups = ref([]);
// 任务状态选项
const statusOptions = ref([
  { value: 0, label: '未上传' },
  { value: 1, label: '未预测' },
  { value: 2, label: '预测中' },
  { value: 3, label: '已预测' },
  { value: 4, label: '预测失败' }
]);

// 上传弹窗的显示状态
const uploadOpen = ref(false);
// 上传弹窗的标题
const uploadTitle = ref("");
// 当前正在操作的视频行数据
const currentVideo = ref(null);
// 待上传的文件列表，以镜头索引为key
const filesToUpload = ref({});
// 上传进度，以镜头索引为key
const uploadProgress = ref({});
// MD5计算状态（响应式状态定义区域）
const calculatingMd5 = ref({});
// 已选择的行
const multiple = ref(true);
const ids = ref([]);
const single = ref(true);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  stuName: null,
  stuNumber: null,
  subId: null,
  examId: null,
});

// 记录上次检查到的最新通知
const lastNoticeCheckTime = ref(0);

// 用于存储轮询定时器
let noticePollTimer = null;

// 记录预测中的视频ID集合
const predictingVideoIds = ref(new Set());

// 上次请求时间戳，用于节流
const lastRequestTime = ref(0);

// 请求间隔（毫秒）
const REQUEST_INTERVAL = 5000; // 5秒

// --- 方法定义 ---

/**
 * @description 获取视频列表数据
 */
function getList() {
  loading.value = true;
  listVideo(queryParams).then(response => {
    videoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/**
 * @description 获取所有学科列表
 */
function getSubjects() {
  listAllSubject().then(response => {
    subjects.value = response.data;
  });
}

/**
 * @description 获取所有考试分组列表
 */
function getExamGroups() {
  listAllExamGroup().then(response => {
    examGroups.value = response.data;
  });
}

/**
 * @description 格式化任务状态
 * @param {number} status - 状态码 (0, 1, 2, 3)
 * @returns {string} 状态对应的文本标签
 */
function formatStatus(status) {
  const option = statusOptions.value.find(item => item.value === status);
  return option ? option.label : '未知';
}

/**
 * @description 处理搜索操作
 */
function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

/**
 * @description 重置查询表单
 */
function resetQuery() {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields();
  }
  handleQuery();
}

/**
 * @description 处理上传按钮点击事件，打开上传弹窗
 * @param {object} row - 当前行的数据
 */
function handleUpload(row) {
  currentVideo.value = row;
  filesToUpload.value = {};
  uploadProgress.value = {};
  uploadTitle.value = `上传视频 - ${row.stuName} - ${row.subName}`;
  uploadOpen.value = true;
}

/**
 * @description 处理预测按钮点击事件
 * @param {object} row - 当前行的数据
 */
async function handlePredict(row) {
  // 打印行数据以供调试
  console.log("handlePredict row data:", row);

  // 检查是否存在主视频路径
  if (!row.vdoPath) {
    modal.msgWarning("该记录尚无主视频，无法进行预测。");
    return;
  }

  // 构建请求参数
  // const params = {
  //   videoId: row.id,
  //   subName: row.subName,
  //   videoPath: row.vdoPath,
  //   // 如果 auxiliaryShots 为 null 或 undefined，则发送空字符串
  //   auxiliaryShots: row.auxiliaryShots || ''
  // };

  const formData = new FormData();
  formData.append('videoId', row.id);
  formData.append('subId', row.subId);
  formData.append('videoPath', row.vdoPath);
  formData.append('auxiliaryShots', row.auxiliaryShots || '');

  try {
    // 显示加载提示
    modal.loading("正在发送预测请求，请稍候...");

    // 调用API
    await predict(formData,row.id);

    // 关闭加载提示并显示成功信息
    modal.closeLoading();
    modal.msgSuccess("预测请求已成功发送！");

    // （可选）刷新列表以更新状态
    getList();

  } catch (error) {
    // 关闭加载提示并显示错误信息
    modal.closeLoading();
    console.error("预测请求失败:", error);
    modal.msgError("发送预测请求失败，请稍后重试。");
  }
}

/**
 * @description 取消上传，关闭弹窗并重置状态
 */
function cancelUpload() {
  uploadOpen.value = false;
  currentVideo.value = null;
  filesToUpload.value = {};
  uploadProgress.value = {};
}

/**
 * @description 文件状态改变时的钩子，添加文件时触发
 * @param {object} file - 当前操作的文件对象
 * @param {array} fileList - 当前文件列表
 * @param {number} shotIndex - 镜头索引
 */
function handleFileChange(file, fileList, shotIndex) {
  console.log("存储的文件对象：", file.raw);
  console.log("是否为File类型：", file.raw instanceof File); // 应输出 true
  filesToUpload.value[shotIndex] = file.raw;
}

/**
 * @description 文件列表移除文件时的钩子
 * @param {object} file - 被移除的文件对象
 * @param {array} fileList - 移除后的文件列表
 * @param {number} shotIndex - 镜头索引
 */
function handleFileRemove(file, fileList, shotIndex) {
  delete filesToUpload.value[shotIndex];
}

/**
 * @description 检查是否已存在视频并确认是否重新上传
 * @param {object} row - 当前视频记录
 * @returns {Promise<boolean>} - 是否继续上传
 */
async function checkAndConfirmReupload(row) {
  // 检查是否已存在视频文件（主视频或辅助视频）
  const hasVideo = (row.vdoPath) || (row.auxiliaryShots);

  if (hasVideo) {
    // 提示用户是否重新上传
    try {
      await modal.confirm("该记录已存在视频文件，是否重新上传？重新上传将删除所有原有文件。");
      // 用户确认重新上传，删除原视频文件
      try {
        await deleteVideoFile(row.id);
        modal.msgSuccess("原视频文件已删除");
        // 重新获取列表数据以确保数据一致性
        getList();
        return true;
      } catch (error) {
        console.error("删除原视频文件失败:", error);
        modal.msgError("删除原视频文件失败，请稍后重试。");
        return false;
      }
    } catch (error) {
      // 用户取消操作
      return false;
    }
  }
  // 不存在视频文件，直接上传
  return true;
}

/**
 * @description 上传文件之前的钩子，参数为上传的文件
 * @param {object} file - 待上传的文件
 * @returns {boolean} - 返回 false 则停止上传
 */
function beforeVideoUpload(file) {
  // const allowedTypes = ['video/mp4', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'];
  const allowedTypes = ['video/mp4'];
  const isVideo = allowedTypes.includes(file.type);
  if (!isVideo) {
    modal.msgError('上传文件只能是 MP4 格式!');
  }
  return isVideo;
}

// 定义分块大小
const CHUNK_SIZE = 2 * 1024 * 1024; // 16MB

/**
 * @description 提交上传（直接上传整个文件）
 */
async function submitUpload() {
  // 过滤掉未选择文件的上传项
  const filesToProcess = Object.entries(filesToUpload.value).filter(([, file]) => file);

  if (filesToProcess.length === 0) {
    modal.msgWarning("请至少选择一个文件上传。");
    return;
  }

  // 检查并确认重新上传（只需确认一次）
  const shouldReupload = await checkAndConfirmReupload(currentVideo.value);
  const confirmResults = filesToProcess.map(() => shouldReupload);

  // 如果用户取消了重新上传，则不继续
  if (confirmResults.some(result => !result)) {
    return;
  }

  // 显示上传提示（在确认所有准备工作完成后）
  modal.msg("正在上传视频文件，请稍候...");

  // 创建一个上传任务数组
  const uploadPromises = filesToProcess.map(async ([shotIndex, file]) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('videoId', currentVideo.value.id);
    formData.append('shotIndex', shotIndex);

    // 初始化上传进度
    uploadProgress.value[shotIndex] = 0;

    // 调用直接上传的 API，并传入 onUploadProgress 回调来更新进度
    return uploadVideo(formData, (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      uploadProgress.value[shotIndex] = percentCompleted;
    });
  });

  try {
    // 等待所有上传任务完成
    await Promise.all(uploadPromises);
    modal.msgSuccess("所有文件上传成功");
    uploadOpen.value = false;
    getList(); // 刷新列表
  } catch (error) {
    console.error("上传失败:", error);
    modal.msgError("部分或全部文件上传失败。");
  }
}

/**
 * @description 提交上传（分块上传逻辑，当前未使用）
 */
async function submitUploadChunk() {
  const filesToProcess = Object.entries(filesToUpload.value).filter(([, file]) => file);

  if (filesToProcess.length === 0) {
    modal.msgWarning("请至少选择一个文件上传。");
    return;
  }

  // 检查并确认重新上传（只需确认一次）
  const shouldReupload = await checkAndConfirmReupload(currentVideo.value);
  const confirmResults = filesToProcess.map(() => shouldReupload);

  // 如果用户取消了重新上传，则不继续
  if (confirmResults.some(result => !result)) {
    return;
  }

  // 显示上传提示（在确认所有准备工作完成后）
  modal.msg("正在上传视频文件，请稍候...");

  const uploadPromises = filesToProcess.map(async ([shotIndex, file]) => {
    // 1. 计算文件哈希
    const fileId = await calculateFileHash(file);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    // 2. 获取已上传的分片信息
    const { data: uploadedChunks } = await getStatus({ fileId });


    const uploadedSizeFromServer = (uploadedChunks || []).length * CHUNK_SIZE;
    let newlyUploadedSize = 0;

    // 更新总进度
    const updateTotalProgress = () => {
      const totalUploadedSize = Math.min(uploadedSizeFromServer + newlyUploadedSize, file.size);
      const currentProgress = file.size > 0 ? Math.round((totalUploadedSize / file.size) * 100) : 0;
      uploadProgress.value[shotIndex] = currentProgress;
    };

    updateTotalProgress();

    // 3. 准备并上传未上传的分片
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      if (uploadedChunks && uploadedChunks.includes(String(i))) {
        continue;
      }
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      chunks.push({
        index: i,
        file: file.slice(start, end),
        size: end - start
      });
    }

    for (const chunk of chunks) {
      const formData = new FormData();
      formData.append("file", chunk.file);
      formData.append("fileId", fileId);
      formData.append("chunkIndex", chunk.index);
      try {
        await uploadChunk(formData,fileId,chunk.index);
        newlyUploadedSize += chunk.size;
        updateTotalProgress();
      } catch (error) {
        console.error(`文件 ${file.name} 的分片 ${chunk.index} 上传失败:`, error);
        modal.msgError(`文件 ${file.name} 的分片 ${chunk.index} 上传失败，请重试。`);
        throw new Error(`Chunk upload failed for file ${file.name}`);
      }
    }

    // 4. 发送合并请求
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('fileName', file.name);
    formData.append('videoId', currentVideo.value.id);
    formData.append('shotIndex', shotIndex);
    formData.append('totalChunks', totalChunks);

    await mergeChunks(formData,fileId);
  });

  try {
    await Promise.all(uploadPromises);
    modal.msgSuccess("所有文件上传成功");
    uploadOpen.value = false;
    getList();
  } catch (error) {
    console.error("上传失败:", error);
    modal.msgError("部分或全部文件上传失败。");
  }
}

/**
 * @description 计算文件的MD5哈希值（用于分块上传）
 * @param {File} file - 文件对象
 * @returns {Promise<string>} - 返回一个Promise，resolve时为文件的MD5值
 */
function calculateFileHash(file) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const size = file.size;
    let offset = 0;

    reader.onload = (e) => {
      spark.append(e.target.result);
      offset += e.target.result.byteLength;
      if (offset < size) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    reader.onerror = (e) => {
      reject(e);
    };

    function loadNext() {
      const start = offset;
      const end = Math.min(offset + CHUNK_SIZE, size);
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}

/**
 * @description 处理照片墙按钮点击事件
 * @param {object} row - 当前行的数据
 */
function handleImageWall(row) {
  // 检查是否存在图片路径
  if (!row.vdoImage) {
    modal.msgWarning("该记录尚无图片数据");
    return;
  }

  // 跳转到照片墙页面
  router.push(`/video/imageWall/${row.id}`);
}

/**
 * @description 处理删除按钮点击事件
 * @param {object} row - 当前行的数据
 */
async function handleDelete(row) {
  try {
    // 确认删除操作
    await modal.confirm("确定要删除该视频文件吗？此操作将删除所有相关文件和数据。");

    // 调用API删除视频文件
    await deleteVideoFile(row.id);

    // 显示成功信息
    modal.msgSuccess("视频文件删除成功");

    // 刷新列表以更新状态
    getList();
  } catch (error) {
    console.error("删除视频文件失败:", error);
    // 用户取消操作或删除失败
    if (error && error.message) {
      modal.msgError("删除视频文件失败：" + error.message);
    }
  }
}

/**
 * @description 处理删除记录按钮点击事件
 * @param {object} row - 当前行的数据
 */
async function handleDeleteRecord(row) {
  // 计算当前行的序号
  const rowIndex = videoList.value.findIndex(item => item.id === row.id);
  const serialNumber = (queryParams.pageNum - 1) * queryParams.pageSize + rowIndex + 1;

  try {
    // 确认删除操作
    await modal.confirm(`确定要删除序号为"${serialNumber}"的数据库记录吗？此操作将删除该记录及其所有相关数据。`);

    // 调用API删除数据库记录
    await delVideo(row.id);

    // 显示成功信息
    modal.msgSuccess("数据库记录删除成功");

    // 刷新列表以更新状态
    getList();
  } catch (error) {
    console.error("删除数据库记录失败:", error);
    // 用户取消操作或删除失败
    if (error && error.message) {
      modal.msgError("删除数据库记录失败：" + error.message);
    }
  }
}

/**
 * @description 处理表格项选择事件
 * @param {Array} selection - 已选择的行数据数组
 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

/**
 * @description 处理批量删除按钮点击事件
 */
async function handleBatchDelete() {
  try {
    // 确认批量删除操作
    await modal.confirm("确定要批量删除选中的记录吗？此操作将删除这些记录及其所有相关数据。");

    // 调用API批量删除数据库记录
    await delVideo(ids.value);

    // 显示成功信息
    modal.msgSuccess("选中的记录删除成功");

    // 清空选择状态
    ids.value = [];
    multiple.value = true;

    // 刷新列表以更新状态
    getList();
  } catch (error) {
    console.error("批量删除失败:", error);
    // 用户取消操作或删除失败
    if (error && error.message) {
      modal.msgError("批量删除失败：" + error.message);
    }
  }
}

/**
 * @description 获取状态对应的CSS类名
 * @param {number} status - 状态码 (0, 1, 2, 3, 4)
 * @returns {string} CSS类名
 */
function getStatusClass(status) {
  const classMap = {
    0: 'status-not-uploaded',
    1: 'status-not-predicted',
    2: 'status-predicting',
    3: 'status-predicted',
    4: 'status-prediction-failed'
  };
  return classMap[status] || 'status-unknown';
}

/**
 * @description 高效检查视频状态变化（带节流功能）
 */
async function checkVideoStatusChange() {
  // 节流：确保请求间隔大于设定的最小间隔
  const now = Date.now();
  if (now - lastRequestTime.value < REQUEST_INTERVAL) {
    return; // 如果请求过于频繁，直接返回
  }

  try {
    // 更新最后请求时间
    lastRequestTime.value = now;

    // 只查询最近状态为"预测中"的视频
    const params = {
      pageNum: 1,
      pageSize: 100,
      vdoTag: 2 // 状态为"预测中"
    };

    const response = await listVideo(params);
    const videos = response.rows;

    // 获取当前"预测中"的视频ID集合
    const currentPredictingIds = new Set(videos.map(video => video.id));

    // 找到已经完成预测的视频ID（之前是预测中，现在不在当前预测列表中）
    const completedIds = [...predictingVideoIds.value].filter(id => !currentPredictingIds.has(id));

    if (completedIds.length > 0) {
      // 有预测完成的视频，刷新列表
      await getList();
      // 更新预测中视频ID集合
      predictingVideoIds.value = currentPredictingIds;
    } else {
      // 更新预测中视频ID集合，用于下次比较
      predictingVideoIds.value = currentPredictingIds;
    }
  } catch (error) {
    console.error('检查视频状态变化时出错:', error);
  }
}

/**
 * @description 启动优化的轮询检查
 */
function startStatusPolling() {
  console.log('启动视频状态轮询检查');

  // 立即执行一次
  checkVideoStatusChange();

  // 每10秒检查一次状态变化（可根据需要调整）
  noticePollTimer = setInterval(checkVideoStatusChange, 10000);
}

/**
 * @description 停止轮询检查
 */
function stopStatusPolling() {
  if (noticePollTimer) {
    console.log('停止视频状态轮询检查');
    clearInterval(noticePollTimer);
    noticePollTimer = null;
  }
}

// --- 生命周期钩子 ---

/**
 * @description 组件挂载后执行
 */
onMounted(() => {
  getList();
  getSubjects();
  getExamGroups();
  // 启动优化的轮询检查视频状态变化
  startStatusPolling();
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  stopStatusPolling();
});
</script>

<style scoped>
/* 任务状态标签样式 */
.status-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
}

/* 未上传状态 - 灰色 */
.status-not-uploaded {
  color: #909399;
}

/* 未预测状态 - 蓝色 */
.status-not-predicted {
  color: #409eff;
}

/* 预测中状态 - 橙色带动效 */
.status-predicting {
  color: #e6a23c;
  animation: pulse 2s infinite;
}

/* 已预测状态 - 绿色 */
.status-predicted {
  color: #67c23a;
}

/* 预测失败状态 - 红色 */
.status-prediction-failed {
  color: #f56c6c;
  font-weight: bold;
}

/* 未知状态 - 红色 */
.status-unknown {
  color: #f56c6c;
}

/* 脉冲动画效果 */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
