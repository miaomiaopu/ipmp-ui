<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NModal, NCard, NForm, NFormItem, NSelect, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Project } from '@/types'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/project'
import { getCustomers } from '@/api/customer'
import { projectStatusOptions } from '@/utils/entityForms'

const router = useRouter()
const message = useMessage()

const projects = ref<Project[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const keyword = ref('')
const statusFilter = ref<string | null>(null)

function emptyProjectForm() {
  return {
    project_code: '',
    name: '',
    customer_id: null as string | null,
    start_date: '',
    go_live_date: '',
    completion_date: '',
    description: '',
    status: 'planning',
  }
}

const showCreate = ref(false)
const createForm = ref(emptyProjectForm())
const showEdit = ref(false)
const editingId = ref('')
const editForm = ref(emptyProjectForm())
const saving = ref(false)
const customerOptions = ref<{ label: string; value: string }[]>([])

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '-'
}

function buildProjectPayload(form: ReturnType<typeof emptyProjectForm>) {
  return {
    ...form,
    start_date: form.start_date || '',
    go_live_date: form.go_live_date || '',
    completion_date: form.completion_date || '',
  }
}

const columns: DataTableColumns<Project> = [
  { title: '编码', key: 'project_code', width: 100, ellipsis: { tooltip: true } },
  { title: '项目名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '客户', key: 'customer.name', width: 130, render(row) { return row.customer?.name || '-' } },
  {
    title: '状态', key: 'status', width: 110,
    render(row) {
      return h(NSelect, {
        value: row.status,
        options: projectStatusOptions,
        size: 'tiny',
        onUpdateValue: (value: string) => handleStatusUpdate(row, value),
      })
    },
  },
  { title: '开始日期', key: 'start_date', width: 110, render(row) { return formatDate(row.start_date) } },
  { title: '上线日期', key: 'go_live_date', width: 110, render(row) { return formatDate(row.go_live_date) } },
  { title: '竣工日期', key: 'completion_date', width: 110, render(row) { return formatDate(row.completion_date) } },
  {
    title: '操作', key: 'actions', width: 180,
    render(row) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, onClick: () => router.push(`/projects/${row.id}`) }, { default: () => '查看' }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, { default: () => '编辑' }),
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
            trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
            default: () => '确定删除该项目？',
          }),
        ],
      })
    },
  },
]

async function fetchProjects() {
  loading.value = true
  try {
    const res = await getProjects({ page: page.value, keyword: keyword.value, status: statusFilter.value || '' })
    projects.value = res.data.data
    total.value = res.data.pagination?.total || 0
  } catch { message.error('获取项目列表失败') }
  finally { loading.value = false }
}

async function fetchCustomers() {
  try {
    const res = await getCustomers({ page_size: 100 })
    customerOptions.value = (res.data.data || []).map((c: any) => ({ label: `${c.customer_code} ${c.name}`, value: c.id }))
  } catch {
    customerOptions.value = []
  }
}

async function handleCreate() {
  saving.value = true
  try {
    await createProject(buildProjectPayload(createForm.value) as any)
    showCreate.value = false
    createForm.value = emptyProjectForm()
    message.success('创建成功')
    fetchProjects()
  } catch (e: any) { message.error(e.message || e.response?.data?.message || '创建失败') }
  finally { saving.value = false }
}

function openEdit(row: Project) {
  editingId.value = row.id
  editForm.value = {
    project_code: row.project_code || '',
    name: row.name || '',
    customer_id: row.customer_id || null,
    start_date: row.start_date?.slice(0, 10) || '',
    go_live_date: row.go_live_date?.slice(0, 10) || '',
    completion_date: row.completion_date?.slice(0, 10) || '',
    description: row.description || '',
    status: row.status || 'planning',
  }
  showEdit.value = true
}

async function handleUpdate() {
  if (!editingId.value) return
  saving.value = true
  try {
    await updateProject(editingId.value, buildProjectPayload(editForm.value) as any)
    showEdit.value = false
    message.success('更新成功')
    fetchProjects()
  } catch (e: any) { message.error(e.message || e.response?.data?.message || '更新失败') }
  finally { saving.value = false }
}

async function handleStatusUpdate(row: Project, status: string) {
  if (row.status === status) return
  try {
    await updateProject(row.id, { status })
    row.status = status
    message.success('状态已更新')
  } catch { message.error('状态更新失败') }
}

async function handleDelete(row: Project) {
  try { await deleteProject(row.id); message.success('已删除'); fetchProjects() }
  catch { message.error('删除失败') }
}

onMounted(() => { fetchProjects(); fetchCustomers() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1>项目管理</h1>
      <NButton
        type="primary"
        size="small"
        @click="showCreate = true"
      >
        新建项目
      </NButton>
    </div>

    <NSpace
      style="margin-bottom: 16px"
      :size="8"
    >
      <NInput
        v-model:value="keyword"
        placeholder="搜索名称或编码..."
        clearable
        style="width: 260px"
        size="small"
        @keyup.enter="page=1; fetchProjects()"
      />
      <NSelect
        v-model:value="statusFilter"
        :options="projectStatusOptions"
        placeholder="状态"
        clearable
        style="width: 120px"
        size="small"
        @update:value="page=1; fetchProjects()"
      />
      <NButton
        size="small"
        @click="page=1; fetchProjects()"
      >
        搜索
      </NButton>
    </NSpace>

    <div style="overflow-x: auto">
      <NDataTable
        :columns="columns"
        :data="projects"
        :loading="loading"
        bordered
        size="small"
        :pagination="{
          page: page, pageSize: 20, itemCount: total,
          onChange(p: number) { page = p; fetchProjects() },
          onUpdatePageSize() {},
        }"
      />
    </div>

    <NModal
      v-model:show="showCreate"
      title="新建项目"
    >
      <NCard
        style="width: 480px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="项目编码"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.project_code"
              placeholder="PROJ-001"
            />
          </NFormItem>
          <NFormItem
            label="项目名称"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.name"
              placeholder="项目名称"
            />
          </NFormItem>
          <NFormItem
            label="客户"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.customer_id"
              :options="customerOptions"
              filterable
              placeholder="选择客户"
            />
          </NFormItem>
          <NFormItem
            label="状态"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.status"
              :options="projectStatusOptions"
            />
          </NFormItem>
          <NFormItem
            label="开始日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.start_date"
              placeholder="2026-06-16"
            />
          </NFormItem>
          <NFormItem
            label="上线日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.go_live_date"
              placeholder="2026-07-01"
            />
          </NFormItem>
          <NFormItem
            label="竣工日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.completion_date"
              placeholder="2026-08-01"
            />
          </NFormItem>
          <NFormItem
            label="描述"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.description"
              type="textarea"
              :rows="2"
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

    <NModal
      v-model:show="showEdit"
      title="编辑项目"
    >
      <NCard
        style="width: 520px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="editForm">
          <NFormItem
            label="项目编码"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.project_code" />
          </NFormItem>
          <NFormItem
            label="项目名称"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.name" />
          </NFormItem>
          <NFormItem
            label="客户"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="editForm.customer_id"
              :options="customerOptions"
              filterable
              placeholder="选择客户"
            />
          </NFormItem>
          <NFormItem
            label="状态"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="editForm.status"
              :options="projectStatusOptions"
            />
          </NFormItem>
          <NFormItem
            label="开始日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.start_date"
              placeholder="2026-06-16"
            />
          </NFormItem>
          <NFormItem
            label="上线日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.go_live_date"
              placeholder="2026-07-01"
            />
          </NFormItem>
          <NFormItem
            label="竣工日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.completion_date"
              placeholder="2026-08-01"
            />
          </NFormItem>
          <NFormItem
            label="描述"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.description"
              type="textarea"
              :rows="2"
            />
          </NFormItem>
          <NSpace justify="end">
            <NButton @click="showEdit = false">
              取消
            </NButton>
            <NButton
              type="primary"
              :loading="saving"
              @click="handleUpdate"
            >
              保存
            </NButton>
          </NSpace>
        </NForm>
      </NCard>
    </NModal>
  </div>
</template>
