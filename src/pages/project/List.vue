<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NModal, NCard, NForm, NFormItem, NSelect, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Project } from '@/types'
import { getProjects, createProject, deleteProject } from '@/api/project'

const router = useRouter()
const message = useMessage()

const projects = ref<Project[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const keyword = ref('')
const statusFilter = ref<string | null>(null)

const showCreate = ref(false)
const createForm = ref({ project_code: '', name: '', description: '', status: 'planning' })
const saving = ref(false)

const statusOptions = [
  { label: '立项', value: 'planning' },
  { label: '实施中', value: 'in_progress' },
  { label: '已竣工', value: 'completed' },
  { label: '挂起', value: 'suspended' },
]

const statusLabel: Record<string, string> = { planning: '立项', in_progress: '实施中', completed: '已竣工', suspended: '挂起' }

const columns: DataTableColumns<Project> = [
  { title: '编码', key: 'project_code', width: 100, ellipsis: { tooltip: true } },
  { title: '项目名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '客户', key: 'customer.name', width: 130, render(row) { return row.customer?.name || '-' } },
  {
    title: '状态', key: 'status', width: 80,
    render(row) { return h('span', { class: `status-dot ${row.status}` }, statusLabel[row.status] || row.status) },
  },
  { title: '开始日期', key: 'start_date', width: 110, render(row) { return row.start_date || '-' } },
  {
    title: '操作', key: 'actions', width: 140,
    render(row) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, onClick: () => router.push(`/projects/${row.id}`) }, { default: () => '查看' }),
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

async function handleCreate() {
  saving.value = true
  try {
    await createProject(createForm.value as any)
    showCreate.value = false
    createForm.value = { project_code: '', name: '', description: '', status: 'planning' }
    message.success('创建成功')
    fetchProjects()
  } catch (e: any) { message.error(e.message || e.response?.data?.message || '创建失败') }
  finally { saving.value = false }
}

async function handleDelete(row: Project) {
  try { await deleteProject(row.id); message.success('已删除'); fetchProjects() }
  catch { message.error('删除失败') }
}

onMounted(fetchProjects)
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
        :options="statusOptions"
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
            label="状态"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.status"
              :options="statusOptions"
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
  </div>
</template>
