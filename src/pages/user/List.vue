<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NDataTable, NButton, NSpace, NInput, NModal, NCard, NForm, NFormItem, NSelect, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getUsers, createUser, deleteUser, resetPassword } from '@/api/user'

const message = useMessage()
const users = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const keyword = ref('')
const showCreate = ref(false)
const createForm = ref({ username: '', password: '', display_name: '', role: 'user' })
const saving = ref(false)

const columns: DataTableColumns<any> = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '显示名', key: 'display_name', width: 120 },
  { title: '角色', key: 'role', width: 80, render(r: any) { return r.role === 'admin' ? '管理员' : r.role === 'manager' ? '经理' : '用户' } },
  { title: '状态', key: 'status', width: 60, render(r: any) { return r.status === 'active' ? '正常' : '停用' } },
  {
    title: '操作', key: 'actions', width: 180, render(row: any) {
      return h(NSpace, { size: 4 }, { default: () => [
        h(NPopconfirm, { onPositiveClick: () => handleResetPwd(row) }, {
          trigger: () => h(NButton, { size: 'tiny', quaternary: true }, { default: () => '重置密码' }),
          default: () => '确定重置密码？',
        }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
          trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除该用户？',
        }),
      ]})
    },
  },
]

async function fetch() {
  loading.value = true
  try { const r = await getUsers({ page: page.value, keyword: keyword.value }); users.value = r.data.data; total.value = r.data.pagination?.total || 0 }
  catch { message.error('获取用户列表失败') }
  finally { loading.value = false }
}

async function handleCreate() {
  saving.value = true
  try {
    const r = await createUser(createForm.value)
    showCreate.value = false
    message.success(`创建成功，初始密码: ${r.data.data.initial_password || '(已设置)'}`)
    createForm.value = { username: '', password: '', display_name: '', role: 'user' }
    fetch()
  } catch (e: any) { message.error(e.message || '创建失败') }
  finally { saving.value = false }
}

async function handleResetPwd(row: any) {
  try {
    const r = await resetPassword(row.id, { new_password: 'Abc12345' })
    message.success(`密码已重置为: ${r.data.data.new_password || 'Abc12345'}`)
  } catch { message.error('重置失败') }
}

async function handleDelete(row: any) {
  try { await deleteUser(row.id); message.success('已删除'); fetch() }
  catch { message.error('删除失败') }
}

onMounted(fetch)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>用户管理</h1>
      <NButton
        type="primary"
        size="small"
        @click="showCreate = true"
      >
        新建用户
      </NButton>
    </div>
    <NSpace
      style="margin-bottom: 16px"
      :size="8"
    >
      <NInput
        v-model:value="keyword"
        placeholder="搜索用户名..."
        clearable
        style="width: 200px"
        size="small"
        @keyup.enter="page=1; fetch()"
      />
      <NButton
        size="small"
        @click="page=1; fetch()"
      >
        搜索
      </NButton>
    </NSpace>
    <div style="overflow-x: auto">
      <NDataTable
        :columns="columns"
        :data="users"
        :loading="loading"
        bordered
        size="small"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange(p: number) { page = p; fetch() }, onUpdatePageSize() {} }"
      />
    </div>
    <NModal
      v-model:show="showCreate"
      title="新建用户"
    >
      <NCard
        style="width: 400px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="用户名"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.username"
              placeholder="登录用户名"
            />
          </NFormItem>
          <NFormItem
            label="密码"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.password"
              type="password"
              placeholder="留空自动生成"
            />
          </NFormItem>
          <NFormItem
            label="显示名"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.display_name"
              placeholder="如：张三"
            />
          </NFormItem>
          <NFormItem
            label="角色"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.role"
              :options="[{label:'管理员',value:'admin'},{label:'用户',value:'user'}]"
            />
          </NFormItem>
          <NSpace justify="end">
            <NButton @click="showCreate = false">
              取消
            </NButton>
            <NButton
              type="primary"
              :loading="saving"
              @click="handleCreate"
            >
              创建
            </NButton>
          </NSpace>
        </NForm>
      </NCard>
    </NModal>
  </div>
</template>
