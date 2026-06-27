<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="姓名" prop="stuName">
        <el-input
          v-model="queryParams.stuName"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
          style="width: 160px;"
        />
      </el-form-item>
      <el-form-item label="学号" prop="stuNumber">
        <el-input
          v-model="queryParams.stuNumber"
          placeholder="请输入学号"
          clearable
          @keyup.enter="handleQuery"
          style="width: 160px;"
        />
      </el-form-item>
      <el-form-item label="学科" prop="subjectId">
        <el-select v-model="queryParams.subjectId" placeholder="请选择学科" clearable style="width: 150px;">
          <el-option
            v-for="subject in subjects"
            :key="subject.id"
            :label="subject.subName"
            :value="subject.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="考试分组" prop="groupId">
        <el-select v-model="queryParams.groupId" placeholder="请选择考试分组" clearable style="width: 150px;">
          <el-option
            v-for="group in groups"
            :key="group.id"
            :label="group.examName"
            :value="group.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain icon="Plus"
          @click="handleAdd"
          :disabled="tableSelection.length > 1"
          v-hasPermi="['exam:association:association']"
        >单个关联学科</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain icon="DocumentAdd"
          @click="handleBatchAdd"
          v-hasPermi="['exam:association:association']"
        >批量关联学科</el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="associationList" @selection-change="handleSelectionChange">
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
      <el-table-column label="班级" align="center" prop="stuClass" />
      <el-table-column label="专业" align="center" prop="stuField" />
      <el-table-column label="学科" align="center" prop="subName" />
      <el-table-column label="考试分组" align="center" prop="examName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="Plus"
            @click="handleAssociateRow(scope.row)"
            v-hasPermi="['exam:association:association']"
          >关联</el-button>
          <el-button
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdateRow(scope.row)"
            :disabled="!scope.row.subName || !scope.row.examName"
            v-hasPermi="['exam:association:edit']"
          >修改</el-button>
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

    <!-- 单个关联学科弹窗 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
  
    <!-- 学生选择保持不变 -->
    <el-form-item label="选择学生" prop="studentId">
      <el-select v-model="form.studentId" placeholder="请选择学生" filterable :disabled="form.id != null || isStudentFixed" style="width: 100%;">
        <el-option
          v-for="student in students"
          :key="student.id"
          :label="student.stuName + ' (' + student.stuNumber + ')'"
          :value="student.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <!-- === 修改开始：拆分学科选择 === -->
    
    <!-- 情况1：新增模式 (没有ID) -> 多选 (Array) -->
    <el-form-item label="选择学科" prop="subjectIds" v-if="!form.id">
      <el-select 
        v-model="form.subjectIds" 
        multiple 
        placeholder="请选择学科(可多选)" 
        filterable 
        style="width: 100%;">
        <el-option
          v-for="subject in subjects"
          :key="subject.id"
          :label="subject.subName"
          :value="subject.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <!-- 情况2：修改模式 (有ID) -> 单选 (String/Number) -->
    <el-form-item label="选择学科" prop="subjectId" v-if="form.id">
      <el-select 
        v-model="form.subjectId" 
        placeholder="请选择学科" 
        filterable 
        style="width: 100%;">
        <el-option
          v-for="subject in subjects"
          :key="subject.id"
          :label="subject.subName"
          :value="subject.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="选择考试分组" prop="groupId">
      <el-select v-model="form.groupId" :disabled="form.id != null && !isStudentFixed" placeholder="请选择考试分组" filterable style="width: 100%;">
        <el-option
          v-for="group in groups"
          :key="group.id"
          :label="group.examName"
          :value="group.id"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
      <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
    </el-dialog>

    <!-- 批量关联学科弹窗 -->
    <el-dialog :title="title" v-model="openBatch" width="600px" append-to-body>
      <el-form ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="120px">
        <el-form-item label="按班级选择" prop="selectedClass">
          <el-select v-model="batchForm.selectedClass" placeholder="请选择班级" clearable style="width: 100%;">
            <el-option
              v-for="className in classes"
              :key="className"
              :label="className"
              :value="className"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="按专业选择" prop="selectedMajor">
          <el-select v-model="batchForm.selectedMajor" placeholder="请选择专业" clearable style="width: 100%;">
            <el-option
              v-for="majorName in majors"
              :key="majorName"
              :label="majorName"
              :value="majorName"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择学生" prop="studentIds">
          <el-select v-model="batchForm.studentIds" multiple filterable placeholder="请选择学生" style="width: 100%;">
            <el-option
              v-for="student in students"
              :key="student.id"
              :label="student.stuName + ' (' + student.stuNumber + ')'"
              :value="student.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择学科" prop="subjectIds">
          <el-select v-model="batchForm.subjectIds" multiple placeholder="请选择学科" filterable style="width: 100%;">
            <el-option
              v-for="subject in subjects"
              :key="subject.id"
              :label="subject.subName"
              :value="subject.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择考试分组" prop="groupId">
          <el-select v-model="batchForm.groupId" placeholder="请选择考试分组" filterable style="width: 100%;">
            <el-option
              v-for="group in groups"
              :key="group.id"
              :label="group.examName"
              :value="group.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitBatchForm">确 定</el-button>
        <el-button @click="cancelBatch">取 消</el-button>
      </div>
    </template>
    </el-dialog>
  </div>
</template>

<script setup name="Association">
import { ref, reactive, onMounted, getCurrentInstance, watch } from 'vue';
import { listAssociation, getAssociation, delAssociation, updateAssociation, batchAssociate, getAllStudents, getAllSubjects, getAllGroups } from "@/api/exam/association";

const { proxy } = getCurrentInstance();

const queryFormRef = ref(null);
const formRef = ref(null);
const batchFormRef = ref(null);

const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const associationList = ref([]);
const title = ref("");
const open = ref(false);
const openBatch = ref(false);
const isStudentFixed = ref(false);

const students = ref([]);
const subjects = ref([]);
const groups = ref([]);
const tableSelection = ref([]);
const classes = ref([]);
const majors = ref([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  stuName: null,
  stuNumber: null,
  subjectId: null,
  groupId: null,
});

const form = ref({});

const batchForm = reactive({
  studentIds: [],
  subjectIds: [],
  groupId: null,
  selectedClass: null,
  selectedMajor: null
});

const rules = {
  studentId: [{ required: true, message: "学生不能为空", trigger: "change" }],
  // 新增模式校验规则
  subjectIds: [{ required: true, message: "请至少选择一个学科", trigger: "change", type: 'array' }],
  // 修改模式校验规则
  subjectId: [{ required: true, message: "学科不能为空", trigger: "change" }],
  groupId: [{ required: true, message: "考试分组不能为空", trigger: "change" }]
};

const batchRules = {
  studentIds: [{ required: true, message: "学生不能为空", trigger: "change" }],
  subjectIds: [{ required: true, message: "学科不能为空", trigger: "change" }],
  groupId: [{ required: true, message: "考试分组不能为空", trigger: "change" }]
};

function getList() {
  loading.value = true;
  listAssociation(queryParams).then(response => {
    associationList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function getStudents() {
  getAllStudents().then(response => {
    students.value = response.data;
    const classSet = new Set();
    const majorSet = new Set();
    response.data.forEach(student => {
      if (student.stuClass) classSet.add(student.stuClass);
      if (student.stuField) majorSet.add(student.stuField);
    });
    classes.value = Array.from(classSet);
    majors.value = Array.from(majorSet);
  });
}

function getSubjects() {
  getAllSubjects().then(response => {
    subjects.value = response.data;
  });
}

function getGroups() {
  getAllGroups().then(response => {
    groups.value = response.data;
  });
}

function cancel() {
  open.value = false;
  reset();
}

function cancelBatch() {
  openBatch.value = false;
  resetBatch();
}

function reset() {
  form.value = {
    id: null,
    studentId: null,
    subjectIds: [],    // 新增模式用：数组
    subjectId: null,   // 修改模式用：单值
    groupId: null,
  };
  isStudentFixed.value = false;
  if (formRef.value) {
    formRef.value.resetFields();
  }
}

function resetBatch() {
  batchForm.studentIds = [];
  batchForm.subjectIds = [];
  batchForm.groupId = null;
  batchForm.selectedClass = null;
  batchForm.selectedMajor = null;
  if (batchFormRef.value) {
    batchFormRef.value.resetFields();
  }
}

function handleQuery() {
  queryParams.pageNum = 1;
  getList();
}

function resetQuery() {
  if (queryFormRef.value) {
    queryFormRef.value.resetFields();
  }
  handleQuery();
}

function handleSelectionChange(selection) {
  tableSelection.value = selection;
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length; // 保持原始逻辑，表示是否没有选中任何项
}

function handleAdd() {
  reset();

  // 检查是否选择了单个学生
  if (tableSelection.value.length === 1) {
    // 使用选中的学生信息
    const selectedStudent = tableSelection.value[0];
    // 在学生列表中查找对应的id
    const student = students.value.find(s => s.stuNumber === selectedStudent.stuNumber);
    if (student) {
      form.value.studentId = student.id;
      isStudentFixed.value = true; // 锁定学生选择
    }
  } else {
    isStudentFixed.value = false; // 允许手动选择学生
  }

  open.value = true;
  title.value = "添加关联学科";
}

function handleBatchAdd() {
  resetBatch();
  if (tableSelection.value.length > 0) {
    const selectedStudentIds = tableSelection.value.map(row => {
      const student = students.value.find(s => s.stuNumber === row.stuNumber);
      return student ? student.id : null;
    }).filter(id => id !== null);
    // 使用 Set 去除重复的学生ID
    batchForm.studentIds = [...new Set(selectedStudentIds)];
  }
  openBatch.value = true;
  title.value = "批量关联学科";
}
function handleUpdateRow(row) {
  reset();
  const id = row.id;
  getAssociation(id).then(response => {
    // 1. 基础赋值
    const data = response.data;
    form.value = { ...data }; // 此时 form 中可能包含 subjectId 也可能包含 subjectIds

    // 2. 核心修复逻辑：确保修改模式下 form.subjectId 有值
    if (data.subjectId) {
      // 标准情况：后端返回了单学科ID
      form.value.subjectId = data.subjectId;
    } else if (data.subjectIds && Array.isArray(data.subjectIds) && data.subjectIds.length > 0) {
      // 兼容情况：后端返回了数组，取第一个
      form.value.subjectId = data.subjectIds[0];
    }
    
    // 清空多选数组，避免混淆（修改模式不使用它）
    form.value.subjectIds = []; 

    // 3. 锁定学生信息
    isStudentFixed.value = true;
    open.value = true;
    title.value = "修改关联学科";
  });
}

function handleAssociateRow(row) {
  reset();
  // 锁定当前行的学生信息
  const student = students.value.find(s => s.stuNumber === row.stuNumber);
  if (student) {
    form.value.studentId = student.id;
    isStudentFixed.value = true; // 锁定学生选择
  }

  open.value = true;
  title.value = "添加关联学科";
}

function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        // === 修改模式 ===
        const request = {
          id: form.value.id,
          studentId: form.value.studentId,
          subjectId: form.value.subjectId, // 读取单选字段
          groupId: form.value.groupId
        };
        updateAssociation(request).then(() => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        // === 新增模式 ===
        const request = {
          studentIds: [form.value.studentId],
          subjectIds: form.value.subjectIds, // 读取多选数组字段 (注意：这里直接传数组)
          groupId: form.value.groupId
        };
        // 注意：这里需要确认后端 batchAssociate 接口是需要 subjectIds 为数组还是怎么处理
        // 假设你的后端逻辑是：一个学生关联多个学科
        batchAssociate(request).then(() => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

function submitBatchForm() {
  batchFormRef.value.validate(valid => {
    if (valid) {
      batchAssociate(batchForm).then(() => {
        proxy.$modal.msgSuccess("批量关联成功");
        openBatch.value = false;
        getList();
      });
    }
  });
}

function handleDelete(row) {
  const delIds = row.id ? [row.id] : ids.value;
  proxy.$modal.confirm('是否确认删除编号为"' + delIds.join(',') + '"的数据项？').then(() => {
    return delAssociation(delIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

onMounted(() => {
  getList();
  getStudents();
  getSubjects();
  getGroups();
});

watch(() => batchForm.selectedClass, (newClass) => {
  if (newClass) {
    batchForm.selectedMajor = null;
    batchForm.studentIds = students.value
      .filter(s => s.stuClass === newClass)
      .map(s => s.id);
  }
});

watch(() => batchForm.selectedMajor, (newMajor) => {
  if (newMajor) {
    batchForm.selectedClass = null;
    batchForm.studentIds = students.value
      .filter(s => s.stuField === newMajor)
      .map(s => s.id);
  }
});
</script>