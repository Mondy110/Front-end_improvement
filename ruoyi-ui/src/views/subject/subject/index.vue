<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="科目名称" prop="subName">
        <el-input v-model="queryParams.subName" placeholder="请输入科目名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="学科代码" prop="subCode">
        <el-input v-model="queryParams.subCode" placeholder="请输入学科代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['subject:subject:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['subject:subject:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['subject:subject:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['subject:subject:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="subjectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="60" align="center">
        <template #default="scope">
          <el-tooltip effect="light" :content="`id: ${scope.row.id}`" placement="top">
            {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="科目代码" align="center" prop="subCode" />
      <el-table-column label="科目名称" align="center" prop="subName" />
      <el-table-column label="科目描述" align="center" prop="subInstru" />
      <el-table-column label="科目镜头数量" align="center" prop="numShot" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['subject:subject:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['subject:subject:remove']">删除</el-button>
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

    <!-- 添加或修改科目信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="subjectRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="科目代码" prop="subCode">
          <el-input v-model="form.subCode" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="科目名称" prop="subName">
          <el-input v-model="form.subName" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="科目描述" prop="subInstru">
          <el-input v-model="form.subInstru" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="科目镜头数量" prop="numShot">
          <el-input v-model="form.numShot" placeholder="请输入科目镜头数量" />
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

<script setup name="Subject">
import { listSubject, getSubject, delSubject, addSubject, updateSubject } from "@/api/subject/subject"

const { proxy } = getCurrentInstance()

const subjectList = ref([])
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
    subCode: null,
    subName: null,
  },
  rules: {
    subCode: [
      { required: true, message: "科目代码不能为空", trigger: "blur" }
    ],
    subName: [
      { required: true, message: "科目名称不能为空", trigger: "blur" }
    ],
    numShot: [
      { required: true, message: "科目镜头数量不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询科目信息列表 */
function getList() {
  loading.value = true
  listSubject(queryParams.value).then(response => {
    subjectList.value = response.rows
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
    subCode: null,
    subName: null,
    subInstru: null,
    numShot: null,
    createTime: null,
    updateTime: null,
    isDeleted: null
  }
  proxy.resetForm("subjectRef")
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
  title.value = "添加科目信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getSubject(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改科目信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["subjectRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateSubject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addSubject(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  if (row.id) {
    // 单个删除
    const rowIndex = subjectList.value.findIndex(item => item.id === row.id);
    const serialNumber = (queryParams.value.pageNum - 1) * queryParams.value.pageSize + rowIndex + 1;
    proxy.$modal.confirm('是否确认删除科目信息序号为"' + serialNumber + '"的数据项？').then(function () {
      return delSubject(row.id)
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
      return delSubject(ids.value)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => { })
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('subject/subject/export', {
    ...queryParams.value
  }, `subject_${new Date().getTime()}.xlsx`)
}

getList()
</script>
