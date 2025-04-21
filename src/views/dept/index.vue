<script setup>
import { onMounted, ref } from "vue";
import { queryAllDeptapi } from "@/api/dept";
import { addDeptApi, deleteById, queryByIdApi, updateDeptApi } from "../../api/dept";
import { ElMessage, ElMessageBox } from "element-plus";

const query = async () => {
  const result = await queryAllDeptapi();
  // console.log(result);

  if (result.code)
    deptList.value = result.data;
}

const dept = ref({ name: '' });

const save = async () => {
  if (formInstance.value) {
    await formInstance.value.validate(async (valid) => {
      if (valid) {
        let result;
        if (dept.value.id) {
          result = await updateDeptApi(dept.value);
        } else {
          result = await addDeptApi(dept.value);
        }


        if (result.code) {
          ElMessage.success("操作成功")
          query();
          dialogFormVisible.value = false;
        } else {
          ElMessage.error(result.msg);
          dialogFormVisible.value = false;
        }
      } else {
        return;
      }
    })
  }



}

onMounted(() => {
  query();
})

const addDept = () => {
  dept.value.name = '';
  if (formInstance.value) {
    formInstance.value.resetFields();
  }
  title.value = '新增部门';
  dialogFormVisible.value = true;
}

const deptList = ref([]);

const title = ref('');

// const name = ref('');

const dialogFormVisible = ref(false);


const rules = ref({
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度须在2~10之间', trigger: 'blur' }
  ]
})

const formInstance = ref();

const updateDept = (id, name) => {
  dept.value = {
    id: id,
    name: name
  }
  if (formInstance.value) {
    formInstance.value.resetFields();
  }
  dept.value.name = name;
  title.value = '编辑部门';
  dialogFormVisible.value = true;
}

const deleteDeptCheck = async (id) => {
  ElMessageBox.confirm(
    '你即将删除该部门，确认吗',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const result = await deleteDept(id);
      if (result.code) {
        ElMessage({
          type: 'success',
          message: '删除成功',
        });
        query();
      }
      else
        ElMessage.error(result.msg);
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除操作已取消',
      })
    })
}

const deleteDept = (id) => {
  return deleteById(id);
}


</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type="primary" @click="addDept">新增部门</el-button>
  </div>
  <el-table :data="deptList" border style="width: 80%">
    <el-table-column type="index" label="序号" width="80" align="center" />
    <el-table-column prop="name" label="部门名称" width="200" align="center" />
    <el-table-column prop="updateTime" label="最后操作时间" width="200" align="center" />
    <el-table-column prop="updateTime" label="操作" align="center">
      <template #default="scope">
        <div>
          <el-button type="primary" size="small" text @click="updateDept(scope.row.id, scope.row.name)"><el-icon>
              <EditPen />
            </el-icon>编辑</el-button>
          <el-button type="danger" size="small" text @click="deleteDeptCheck(scope.row.id)"><el-icon>
              <DeleteFilled />
            </el-icon>删除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>


  <el-dialog v-model="dialogFormVisible" :title=title>
    {{ dept }}
    <el-form :model="dept" :rules="rules" ref="formInstance">
      <el-form-item label="部门名称" label-width="100px" prop="name">
        <el-input v-model="dept.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="save">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>


</template>

<style scoped>
.container {
  margin: 10px 0px;
}
</style>
