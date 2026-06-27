<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学生姓名" prop="stuName">
        <el-input v-model="queryParams.stuName" placeholder="请输入学生姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学号" prop="stuNumber">
        <el-input v-model="queryParams.stuNumber" placeholder="请输入学号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['exam:student:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['exam:student:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['exam:student:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Upload"
          @click="handleImport"
          v-hasPermi="['exam:student:import']"
        >导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['exam:student:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="studentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center">
        <template #default="scope">
          <el-tooltip effect="light" :content="`id: ${scope.row.id}`" placement="top">
            {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="学生姓名" align="center" prop="stuName" />
      <el-table-column label="学号" align="center" prop="stuNumber" />
      <el-table-column label="专业" align="center" prop="stuField" />
      <el-table-column label="班级" align="center" prop="stuClass" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['exam:student:edit']">修改</el-button>
          <!-- <el-button link type="primary" icon="Upload" @click="handleUpload(scope.row)"
            v-hasPermi="['exam:student:remove']">视频上传</el-button> -->
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['exam:student:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="studentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学生姓名" prop="stuName">
          <el-input v-model="form.stuName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="学号" prop="stuNumber">
          <el-input v-model="form.stuNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="专业" prop="stuField">
          <el-input v-model="form.stuField" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="班级" prop="stuClass">
          <el-input v-model="form.stuClass" placeholder="请输入班级" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频上传对话框 -->
    <el-dialog :title="upload.title" v-model="upload.open" width="600px" append-to-body>
      <el-form ref="uploadFormRef" :model="upload.form" :rules="upload.rules" label-width="80px">
        <!-- 学生信息展示 -->
          <el-row>
            <el-col :span="24">
              <!-- 用div包裹并强制flex居中，不受表单默认样式影响 -->
              <div style="width: 100%; display: flex; margin-bottom: 20px;">
                <div style="font-size: larger; font-weight: bold;">学生信息</div>
              </div>
            </el-col>
          </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名：">{{ upload.form.stuName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号：">{{ upload.form.stuNumber }}</el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="专业：">{{ upload.form.stuField }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级：">{{ upload.form.stuClass }}</el-form-item>
          </el-col>
        </el-row>

        <!-- 考试科目 -->
        <el-form-item label="考试科目" prop="subject">
          <el-select v-model="upload.form.subject" placeholder="请选择">
            <el-option v-for="item in upload.subjects" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 视频上传 -->
        <el-form-item label="上传视频">
          <el-upload
            ref="uploadComponentRef"
            :limit="1"
            accept=".mp4, .avi, .mkv, .mov"
            :action="upload.url"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-center">
                <span>仅允许导入mp4, avi, mkv, mov格式文件。</span>
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitUpload">确 定</el-button>
          <el-button @click="cancelUpload">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="userImport.title" v-model="userImport.open" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls, .csv"
        :headers="userImport.headers"
        :action="userImport.url + '?updateSupport=' + userImport.updateSupport"
        :disabled="userImport.isUploading"
        :on-progress="handleUserImportProgress"
        :on-success="handleUserImportSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip">
              <el-checkbox v-model="userImport.updateSupport" />
              <span>是否更新已经存在的用户数据</span>
            </div>
            <span>仅允许导入xls、xlsx、csv格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="userImport.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Student">
import { listStudent, getStudent, delStudent, addStudent, updateStudent } from "@/api/student/student"
import { UploadFilled } from '@element-plus/icons-vue';

import { getToken } from "@/utils/auth";

const { proxy } = getCurrentInstance()

/*** 用户导入参数 */
const userImport = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/student/student/importData"
});

const studentList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    stuName: null,
    stuNumber: null,
    stuField: null,
    stuClass: null,
  },
  rules: {
    stuName: [
      { required: true, message: "学生姓名不能为空", trigger: "blur" }
    ],
    stuNumber: [
      { required: true, message: "学号不能为空", trigger: "blur" }
    ],
    isDeleted: [],
    stuField: [],
    stuClass: [],
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listStudent(queryParams.value).then(response => {
    studentList.value = response.rows
    total.value = response.total
    loading.value = false
  })
}

function cancel() {
  open.value = false
  reset()
}

function reset() {
  form.value = {
    id: null,
    stuName: null,
    stuNumber: null,
    stuField: null,
    stuClass: null,
    isDeleted: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("studentRef")
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "添加学生信息导入"
}

function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getStudent(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改学生信息导入"
  })
}

function submitForm() {
  proxy.$refs["studentRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateStudent(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addStudent(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

function handleDelete(row) {
  if (row.id) {
    // 单个删除
    const rowIndex = studentList.value.findIndex(item => item.id === row.id);
    const serialNumber = (queryParams.value.pageNum - 1) * queryParams.value.pageSize + rowIndex + 1;
    proxy.$modal.confirm('是否确认删除序号为"' + serialNumber + '"的数据项？').then(function () {
      return delStudent(row.id)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => { })
  } else {
    // 批量删除
    if (ids.value.length === 0) {
      proxy.$modal.msgError("请选择要删除的数据");
      return;
    }
    proxy.$modal.confirm('是否确认删除选中的"' + ids.value.length + '"条数据项？').then(function () {
      return delStudent(ids.value)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => { })
  }
}

function handleExport() {
  proxy.download('student/student/export', {
    ...queryParams.value
  }, `student_${new Date().getTime()}.xlsx`)
}

// 视频上传相关
const uploadFormRef = ref(null);
const uploadComponentRef = ref(null);
const upload = reactive({
  open: false,
  title: "",
  isUploading: false,
  //TODO 后端写好后需要修改这个地址
  url: import.meta.env.VITE_APP_BASE_API + "/common/upload", // 上传地址
  form: {
    stuName: '',
    stuNumber: '',
    stuField: '',
    stuClass: '',
    subject: null
  },
  rules: {
    subject: [
      { required: true, message: "请选择考试科目", trigger: "change" }
    ]
  },
  //TODO 科目列表需要从数据库中读取
  // 静态科目列表
  subjects: [
    { label: '科目一', value: 'subject1' },
    { label: '科目二', value: 'subject2' },
    { label: '科目三', value: 'subject3' }
  ]
});

/** 上传按钮操作 */
function handleUpload(row) {
  proxy.resetForm("uploadFormRef");
  upload.form.stuNumber = row.stuNumber;
  upload.form.stuName = row.stuName;
  upload.form.stuField = row.stuField;
  upload.form.stuClass = row.stuClass;
  upload.open = true;
  upload.title = "上传视频";
}

/** 取消上传 */
function cancelUpload() {
  upload.open = false;
  proxy.resetForm("uploadFormRef");
}

/** 提交上传 */
function submitUpload() {
  proxy.$refs.uploadFormRef.validate(valid => {
    if (valid) {
      if (uploadComponentRef.value) {
        // 手动触发上传
        uploadComponentRef.value.submit();
      } else {
        proxy.$modal.msgError("请选择一个视频文件");
      }
    }
  });
}

/** 文件上传中处理 */
function handleFileUploadProgress(event, file, fileList) {
  upload.isUploading = true;
}

/** 文件上传成功处理 */
function handleFileSuccess(response, file, fileList) {
  upload.isUploading = false;
  if (response.code === 200) {
    proxy.$modal.msgSuccess("上传成功");
    upload.open = false;
    getList();
  } else {
    proxy.$modal.msgError(response.msg);
  }
  // 清理已上传文件列表
  if (uploadComponentRef.value) {
    uploadComponentRef.value.clearFiles();
  }
}

/** 导入按钮操作 */
function handleImport() {
  userImport.title = "用户导入";
  userImport.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("student/student/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

/** 文件上传中处理 */
function handleUserImportProgress(event, file, fileList) {
  userImport.isUploading = true;
}

/** 文件上传成功处理 */
function handleUserImportSuccess(response, file, fileList) {
  userImport.isUploading = false;
  if (response.code === 200) {
    proxy.$modal.msgSuccess("导入成功");
    userImport.open = false;
    getList();
  } else {
    proxy.$modal.msgError(response.msg);
  }
  proxy.$refs["uploadRef"].clearFiles();
}

getList()
</script>
