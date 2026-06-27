<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="考试分组代码" prop="examCode">
        <el-input
          v-model="queryParams.examCode"
          placeholder="请输入考试分组代码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="考试分组名称" prop="examName">
        <el-input
          v-model="queryParams.examName"
          placeholder="请输入考试分组名称"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['exam:group:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['exam:group:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['exam:group:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['exam:group:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="groupList" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="序号" type="index" width="60" align="center">
        <template #default="scope">
          <el-tooltip effect="light" :content="`id: ${scope.row.id}`" placement="top">
            {{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="考试分组代码" align="center" prop="examCode" />
      <el-table-column label="考试分组名称" align="center" prop="examName" />
      <el-table-column label="考试分组描述" align="center" prop="examInstru" />
      <el-table-column label="考试时间" align="center" prop="examTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.examTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['exam:group:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['exam:group:remove']">删除</el-button>
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

    <!-- 添加或修改考试分组对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="groupRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="考试分组代码" prop="examCode">
          <el-input v-model="form.examCode" placeholder="请输入考试分组代码" />
        </el-form-item>
        <el-form-item label="考试分组名称" prop="examName">
          <el-input v-model="form.examName" placeholder="请输入考试分组名称" />
        </el-form-item>
        <el-form-item label="考试分组描述" prop="examInstru">
          <el-input v-model="form.examInstru" placeholder="请输入考试分组描述" />
        </el-form-item>
        <el-form-item label="考试时间" prop="examTime">
          <el-date-picker clearable
            v-model="form.examTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择考试时间">
          </el-date-picker>
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

<script setup name="Group">
import { listGroup, getGroup, delGroup, addGroup, updateGroup } from "@/api/group/group"

const { proxy } = getCurrentInstance()

const groupList = ref([])
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
    examCode: null,
    examName: null,
  },
  rules: {
    examCode: [
      { required: true, message: "考试分组代码不能为空", trigger: "blur" }
    ],
    examName: [
      { required: true, message: "考试分组名称不能为空", trigger: "blur" }
    ],
    examTime: [
      { required: true, message: "考试时间不能为空", trigger: "change" }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询考试分组列表 */
function getList() {
  loading.value = true
  listGroup(queryParams.value).then(response => {
    groupList.value = response.rows
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
    examCode: null,
    examName: null,
    examInstru: null,
    examTime: null,
    createTime: null,
    updateTime: null
  }
  proxy.resetForm("groupRef")
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
  title.value = "添加考试分组"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getGroup(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改考试分组"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["groupRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGroup(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addGroup(form.value).then(response => {
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
    const rowIndex = groupList.value.findIndex(item => item.id === row.id);
    const serialNumber = (queryParams.value.pageNum - 1) * queryParams.value.pageSize + rowIndex + 1;
    proxy.$modal.confirm('是否确认删除考试分组序号为"' + serialNumber + '"的数据项？').then(function () {
      return delGroup(row.id)
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
      return delGroup(ids.value)
    }).then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    }).catch(() => { })
  }
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('group/group/export', {
    ...queryParams.value
  }, `group_${new Date().getTime()}.xlsx`)
}

getList()
</script>
