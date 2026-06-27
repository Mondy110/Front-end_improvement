<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学号" prop="stuNo">
        <el-input
          v-model="queryParams.stuNo"
          placeholder="请输入学生学号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="科目id" prop="subId">
        <el-input
          v-model="queryParams.subId"
          placeholder="请输入科目id, 逻辑外键"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分组id" prop="examId">
        <el-input
          v-model="queryParams.examId"
          placeholder="请输入考试分组id"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['video:video:ln:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['video:video:ln:edit']"
        >修改</el-button>
      </el-col>
      
      <el-button 
        link 
        type="primary" 
        icon="Delete" 
        @click="handleDelete(scope.row)" 
        v-hasPermi="['video:video:ln:remove']"
      >删除</el-button>
     

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['video:video:ln:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

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
      <el-table-column label="科目" align="center" prop="subName" />
      <el-table-column label="识别结果" align="center"  prop="vdoScore2" >
        <template #default="scope">
          <!-- 如果解析出数据则显示美化版，否则显示原文本 -->
          <div v-if="parseScore(scope.row.vdoScore2).length > 0" class="score-display">
            <div v-for="(item, index) in parseScore(scope.row.vdoScore2)" :key="index" class="score-group">
              <span class="score-title">{{ item.title }}：</span>
              <div class="score-tags">
                <el-tag 
                  v-for="(sub, subIndex) in item.items" 
                  :key="subIndex"
                  :type="sub.value == '1' ? 'success' : 'info'"
                  size="small"
                  class="mr-1"
                >
                  {{ sub.label }} {{ sub.value == '1' ? '✓' : '×' }}
                </el-tag>
              </div>
            </div>
          </div>
          <span v-else>{{ scope.row.vdoScore2 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成绩等第" align="center" prop="vdoScore" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Analysis" @click="handleAnalysis(scope.row)" v-hasPermi="['video:video:analysis']" >结果分析</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改视频信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="videoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="视频代码" prop="vdoCode">
          <el-input v-model="form.vdoCode" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="学生id" prop="stuId">
          <el-input v-model="form.stuId" placeholder="请输入学生id" />
        </el-form-item>
        <el-form-item label="科目id" prop="subId">
          <el-input v-model="form.subId" placeholder="请输入科目id" />
        </el-form-item>
        <el-form-item label="分组id" prop="examId">
          <el-input v-model="form.examId" placeholder="请输入考试分组id" />
        </el-form-item>
        <el-form-item label="成绩等第" prop="vdoScore">
          <el-input v-model="form.vdoScore" placeholder="请输入成绩等第: 0-不合格, 1-合格, 2-优秀" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Video">
import { listVideo, getVideo, delVideo, addVideo, updateVideo } from "@/api/video/video"
import { useRouter } from 'vue-router';  // 确保这个API路径是正确的

const { proxy } = getCurrentInstance()

const videoList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const router = useRouter();

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    vdoCode: null,
    stuId: null,
    subId: null,
    examId: null,
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询视频信息列表 */
function getList() {
  loading.value = true
  listVideo(queryParams.value).then(response => {
    videoList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    vdoCode: null,
    stuId: null,
    subId: null,
    examId: null,
    vdoPath: null,
    vdoResult: null,
    vdoImage: null,
    vdoTag: null,
    vdoScore: null,
    vdoTeaScore: null,
    vdoTime: null,
    vdoScore2: null,
    auxiliaryShots: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("videoRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加视频信息"
}

/** 
 * 解析后端返回的类似 Java Map 的字符串
 * 格式示例: {洗手={存在=1, 完整=0}, 触诊={...}} 
 */
function parseScore(str) {
  if (!str || typeof str !== 'string') return [];
  
  const result = [];
  try {
    // 移除最外层的花括号
    let innerStr = str.trim();
    if (innerStr.startsWith('{') && innerStr.endsWith('}')) {
      innerStr = innerStr.substring(1, innerStr.length - 1);
    }

    // 正则匹配: 匹配 "key={...}" 的结构
    // 解释: ([^=]+) 匹配标题, =\{ 匹配开始, (.*?) 匹配内容, \}(,|$) 匹配结束
    const regex = /([^{},=]+)=\{(.*?)\}(?:,|$)/g;
    let match;

    while ((match = regex.exec(innerStr)) !== null) {
      const title = match[1].trim(); // 例如 "洗手"
      const content = match[2];      // 例如 "存在=1, 完整=0"
      
      // 解析内部的键值对
      const items = content.split(',').map(item => {
        const parts = item.split('=');
        if (parts.length === 2) {
          return { label: parts[0].trim(), value: parts[1].trim() };
        }
        return null;
      }).filter(Boolean);

      result.push({ title, items });
    }
  } catch (e) {
    console.error("解析识别数据出错", e);
    return [];
  }
  return result;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getVideo(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改视频信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["videoRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateVideo(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addVideo(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}


// +++ 3. 添加下面这个新的处理函数 +++
/**
 * 跳转到结果分析页面
 */
function handleAnalysis(row) {
  // 从当前行数据中获取 id
  const videoId = row.id;
  // 跳转到我们在 router/index.js 中定义的新路径
  router.push({ path: '/video-analysis/detail/' + videoId });
}

/** 删除按钮操作 */
// function handleDelete(row) {
//   const _ids = row.id || ids.value
//   proxy.$modal.confirm('是否确认删除视频信息编号为"' + _ids + '"的数据项？').then(function() {
//     return delVideo(_ids)
//   }).then(() => {
//     getList()
//     proxy.$modal.msgSuccess("删除成功")
//   }).catch(() => {})
// }

/** 导出按钮操作 */
function handleExport() {
  proxy.download('video/video/export', {
    ...queryParams.value
  }, `video_${new Date().getTime()}.xlsx`)
}

getList()
</script>
