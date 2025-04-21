<script setup>

import { onMounted, ref, watch } from "vue";
import { deleteEmpApi, queryByParams, queryEmpByIdApi, saveEmpApi, updateEmpApi } from "../../api/emp";
import { ElMessage, ElMessageBox } from "element-plus";
import { queryAllDeptapi } from "../../api/dept";
const empQueryParams = ref({
  name: '',
  gender: '',
  begin: '',
  end: '',
  date: ['', ''],
  page: 1,
  pageSize: 10
});

const jobs = ref([{ name: '班主任', value: 1 }, { name: '讲师', value: 2 }, { name: '学工主管', value: 3 }, { name: '教研主管', value: 4 }, { name: '咨询师', value: 5 }, { name: '其他', value: 6 }])
//性别列表数据
const genders = ref([{ name: '男', value: 1 }, { name: '女', value: 2 }])

const depts = ref([])

const empList = ref([]);

const pageTotal = ref(0);

const query = async () => {


  empQueryParams.value.begin = empQueryParams.value.date[0];
  empQueryParams.value.end = empQueryParams.value.date[1];
  const result = await queryByParams(empQueryParams);
  if (result.code) {
    empList.value = result.data.rows;
    pageTotal.value = result.data.total;
  } else {
    ElMessage.error(result.msg);
  }
}

const clear = () => {
  empQueryParams.value = {
    name: '',
    gender: '',
    begin: '',
    end: '',
    date: ['', ''],
    page: 1,
    pageSize: 10
  };
  query();
}

const handleSizeChange = () => {
  query();
}

const handleCurrentChange = () => {
  query();
}

const employee = ref({
  username: '',
  name: '',
  gender: '',
  phone: '',
  job: '',
  salary: '',
  deptId: '',
  entryDate: '',
  image: '',
  exprList: []
})

const addEmpExprList = () => {
  employee.value.exprList.push({
    company: '',
    job: '',
    begin: '',
    end: '',
    exprDate: []
  })
}

// 控制弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增员工')

const addEmpDialogRef = ref();

//文件上传
// 图片上传成功后触发
const handleAvatarSuccess = (response) => {
  employee.value.image = response.data;
}
// 文件上传之前触发
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('只支持上传图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('只能上传2M以内图片')
    return false
  }
  return true
}

// 新增员工按钮相关事件触发
const addEmp = () => {
  if (addEmpDialogRef.value)
    addEmpDialogRef.value.resetFields();
  employee.value = {
    username: '',
    name: '',
    gender: '',
    phone: '',
    job: '',
    salary: '',
    deptId: '',
    entryDate: '',
    image: '',
    exprList: []
  }

  dialogTitle.value = '新增员工';
  dialogVisible.value = true;
}

const deleteExprItem = (index) => {
  employee.value.exprList.splice(index, 1)
}

// 员工信息保存中对employee中date监听
watch(() => employee.value.exprList, (newvalue, oldvalue) => {
  if (employee.value.exprList && employee.value.exprList.length > 0) {
    employee.value.exprList.forEach((expr) => {
      if (expr.exprDate) {
        expr.begin = expr.exprDate[0];
        expr.end = expr.exprDate[1];
      }
    })
  }
}, { deep: true })


//员工信息保存
const saveEmp = async () => {
  if (addEmpDialogRef.value)
    await addEmpDialogRef.value.validate(async (valid, fields) => {
      if (valid) {
        let result;
        console.log(employee.value);

        if (!employee.value.id)
          result = await saveEmpApi(employee.value);
        else
          result = await updateEmpApi(employee.value);
        if (result.code) {
          ElMessage.success('保存成功');
          dialogVisible.value = false;
          query();
        } else {
          console.log('!');

          ElMessage.error(result.msg)
        }
      } else {
        ElMessage.error('请检查表单数据是否正确')
        return;
      }
    })
}

// 钩子函数自动加载
onMounted(async () => {
  query();
  const result = await queryAllDeptapi();
  if (result.code)
    depts.value = result.data;
  const temp = JSON.parse(localStorage.getItem('loginUser'));
  token.value = temp.token;
})

//表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2到20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ]
});

const editEmp = async (id) => {
  const result = await queryEmpByIdApi(id);
  if (result.code) {
    employee.value = result.data;

    console.log(employee.value);

    if (employee.value.exprList && employee.value.exprList.length > 0) {
      employee.value.exprList.forEach((expr) => {
        // Object.defineProperties(expr, {
        //   exprDate: {
        //     value: [expr.begin, expr.end],
        //     writable: true, // 可写
        //     enumerable: true, // 可枚举
        //     configurable: true // 可配置
        //   }
        // })
        expr.exprDate = [expr.begin, expr.end];//逆天
      })
    }
    console.log(employee.value);


    dialogTitle.value = '编辑员工';
    dialogVisible.value = true;
  } else {
    ElMessage.error(result.msg)
  }

}
const deleteEmps = async (ids) => {
  console.log(ids);
  if (ids && ids.length > 0) {
    ElMessageBox.confirm(
      '您即将删除员工，确认吗',
      '警告',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {

      const result = await deleteEmpApi(ids);
      if (result.code) {
        ElMessage.success('删除成功');
      } else {
        ElMessage.error('删除失败');
      }
      query();
    }).catch(() => {
      ElMessage({
        type: 'info',
        message: '删除操作已取消',
      })
    })
  } else {
    ElMessage.error('您尚未选中员工');
  }



}

const ids = ref([]);
const onSelectionChange = (val) => {
  console.log(val);
  // ids.value = [];
  // val.forEach(item => {
  //   ids.value.push(item.id);
  // })
  ids.value = val.map(item => item.id);
}
const token = ref();
</script>

<template>
  <!-- 标题 -->
  <div class="container">
    <h1>员工管理</h1>
  </div>

  <!-- 查询表单 -->
  <div>
    <el-form :inline="true" :model="empQueryParams" class="demo-form-inline">
      <el-form-item label="姓名">
        <el-input v-model="empQueryParams.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="empQueryParams.gender" placeholder="请选择" clearable>
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间">
        <div class="demo-date-picker">
          <div class="block">
            <el-date-picker v-model="empQueryParams.date" type="daterange" range-separator="到" start-placeholder="入职日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD" />
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="query">查询</el-button>
        <el-button type="info" @click="clear">清空</el-button>
      </el-form-item>
    </el-form>

  </div>

  <!-- 员工信息处理按钮组件 -->
  <div>
    <el-button type="primary" @click="addEmp">+ 增加员工</el-button>
    <el-button type="danger" @click="deleteEmps(ids)">- 批量删除</el-button>
  </div>

  <!-- 员工信息列表 -->
  <div>
    <el-table :data="empList" border style="width: 100%" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column label="性别" width="90">
        <template #default="scope">
          <div v-if="scope.row.gender == 1">男</div>
          <div v-else>女</div>
        </template>
      </el-table-column>
      <el-table-column label="头像" width="90px">
        <template #default="scope">
          <img :src="scope.row.image" width="50px">
        </template>
      </el-table-column>
      <el-table-column prop="deptName" label="所属部门" width="100" />
      <el-table-column label="职位" width="180">
        <template #default="scope">
          <div v-if="scope.row.job == 1">班主任</div>
          <div v-else-if="scope.row.job == 2">讲师</div>
          <div v-else-if="scope.row.job == 3">学工主管</div>
          <div v-else-if="scope.row.job == 4">教研主管</div>
          <div v-else-if="scope.row.job == 5">咨询师</div>
          <div v-else>其他</div>
        </template>
      </el-table-column>
      <el-table-column prop="entryDate" label="入职日期" width="180" />
      <el-table-column prop="updateTime" label="最后操作时间" width="180" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" @click="editEmp(scope.row.id)" text>编辑</el-button>
          <el-button type="danger" @click="deleteEmps([scope.row.id])" text>删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 分页表组件 -->
  <div class="demo-pagination-block">
    <el-pagination v-model:current-page="empQueryParams.page" v-model:page-size="empQueryParams.pageSize"
      :page-sizes="[10, 20, 30, 40]" layout="total, sizes, prev, pager, next, jumper" :total="pageTotal"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>

  <!-- 员工对话框 -->
  <div>
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="employee" label-width="80px" :rules="rules" ref="addEmpDialogRef">
        <!-- 基本信息 -->
        <!-- 第一行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="employee.username" placeholder="请输入员工用户名，2-20个字"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="employee.name" placeholder="请输入员工姓名，2-10个字"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="employee.gender" placeholder="请选择性别" style="width: 100%;">
                <el-option v-for="(g) in genders" :key="g.value" :label="g.name" :value="g.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="employee.phone" placeholder="请输入员工手机号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-select v-model="employee.job" placeholder="请选择职位" style="width: 100%;">
                <el-option v-for="(job) in jobs" :key="job.value" :label="job.name" :value="job.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资">
              <el-input v-model="employee.salary" placeholder="请输入员工薪资"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属部门">
              <el-select v-model="employee.deptId" placeholder="请选择部门" style="width: 100%;">
                <el-option v-for="(dept) in depts" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入职日期">
              <el-date-picker v-model="employee.entryDate" type="date" style="width: 100%;" placeholder="选择日期"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="头像">
              <el-upload class="avatar-uploader" :headers="{ 'token': token }" action="/api/upload"
                :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
                <img v-if="employee.image" :src="employee.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>


        <!-- 工作经历 -->
        <!-- 第六行 -->
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="工作经历">
              <el-button type="success" size="small" @click="addEmpExprList">+ 添加工作经历</el-button>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第七行 ...  工作经历 -->
        <el-row :gutter="3" v-for="(expr, index) in employee.exprList">
          <el-col :span="10">
            <el-form-item size="small" label="时间" label-width="80px">
              <el-date-picker type="daterange" v-model="expr.exprDate" range-separator="至" start-placeholder="开始日期"
                end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD"></el-date-picker>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small" label="公司" label-width="60px">
              <el-input placeholder="请输入公司名称" v-model="expr.company"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item size="small" label="职位" label-width="60px">
              <el-input placeholder="请输入职位" v-model="expr.job"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="2">
            <el-form-item size="small" label-width="0px">
              <el-button type="danger" @click="deleteExprItem(index)">- 删除</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEmp">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>


</template>

<style scoped>
.container {
  margin-bottom: 15px;
}

.avatar {
  height: 40px;
}

.avatar-uploader .avatar {
  width: 78px;
  height: 78px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 78px;
  height: 78px;
  text-align: center;
  border-radius: 10px;
  /* 添加灰色的虚线边框 */
  border: 1px dashed var(--el-border-color);
}
</style>
