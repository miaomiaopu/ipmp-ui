<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getTasks, createTask, deleteTask } from '@/api/task'
import { getProjects } from '@/api/project'
import { getCustomers } from '@/api/customer'

const router = useRouter()
const message = useMessage()
const tasks = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const typeFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const dueBefore = ref('')
const keyword = ref('')
const showCreate = ref(false)
const createForm = ref({
  task_type: 'project',
  title: '',
  description: '',
  project_id: null as string | null,
  customer_id: null as string | null,
  priority: 'medium',
  due_date: '',
})
const saving = ref(false)
const projectOptions = ref<{ label: string; value: string }[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])

const statusLabel: Record<string, string> = { in_progress: '进行中', done: '已完成' }
const priorityLabel: Record<string, string> = { low: '低', medium: '中', high: '高' }

const columns: DataTableColumns<any> = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '类型', key: 'task_type', width: 70, render(r: any) { const m: Record<string, string> = { project: '项目', customer: '客户', daily: '日常' }; return m[r.task_type] } },
  { title: '状态', key: 'status', width: 70, render(r: any) { return statusLabel[r.status] } },
  { title: '优先级', key: 'priority', width: 60, render(r: any) { return priorityLabel[r.priority] } },
  {
    title: '操作', key: 'actions', width: 120, render(row: any) {
      return h(NSpace, { size: 4 }, { default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => router.push(`/tasks/${row.id}`) }, { default: () => '查看' }),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
          trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
          default: () => '确定删除？',
        }),
      ]})
    },
  },
]

async function fetch() {
  loading.value = true
  try { const r = await getTasks({ page: page.value, task_type: typeFilter.value, status: statusFilter.value, keyword: keyword.value, due_before: dueBefore.value }); tasks.value = r.data.data; total.value = r.data.pagination?.total || 0 }
  catch { message.error('获取列表失败') }
  finally { loading.value = false }
}

async function fetchRefs() {
  try {
    const [projects, customers] = await Promise.all([getProjects({ page_size: 100 }), getCustomers({ page_size: 100 })])
    projectOptions.value = (projects.data.data || []).map((p: any) => ({ label: p.name, value: p.id }))
    customerOptions.value = (customers.data.data || []).map((c: any) => ({ label: c.name, value: c.id }))
  } catch {
    projectOptions.value = []
    customerOptions.value = []
  }
}

async function handleCreate() {
  saving.value = true
  try {
    const payload = { ...createForm.value } as Record<string, any>
    if (payload.task_type !== 'project') payload.project_id = null
    if (payload.task_type !== 'customer') payload.customer_id = null
    if (!payload.due_date) payload.due_date = null
    await createTask(payload)
    showCreate.value = false
    createForm.value = { task_type: 'project', title: '', description: '', project_id: null, customer_id: null, priority: 'medium', due_date: '' }
    message.success('创建成功')
    fetch()
  }
  catch (e: any) { message.error(e.message || '创建失败') }
  finally { saving.value = false }
}

async function handleDelete(row: any) { try { await deleteTask(row.id); message.success('已删除'); fetch() } catch { message.error('删除失败') } }

watch(() => createForm.value.task_type, () => {
  createForm.value.project_id = null
  createForm.value.customer_id = null
})

onMounted(() => { fetch(); fetchRefs() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1>任务管理</h1><NButton
        type="primary"
        size="small"
        @click="showCreate = true"
      >
        新建任务
      </NButton>
    </div>
    <NSpace
      style="margin-bottom: 16px"
      :size="8"
    >
      <NInput
        v-model:value="keyword"
        placeholder="搜索标题..."
        clearable
        style="width: 200px"
        size="small"
        @keyup.enter="page=1; fetch()"
      />
      <NSelect
        v-model:value="typeFilter"
        :options="[{label:'项目任务',value:'project'},{label:'客户任务',value:'customer'},{label:'日常任务',value:'daily'}]"
        placeholder="类型"
        clearable
        style="width: 110px"
        size="small"
        @update:value="page=1; fetch()"
      />
      <NSelect
        v-model:value="statusFilter"
        :options="[{label:'进行中',value:'in_progress'},{label:'已完成',value:'done'}]"
        placeholder="状态"
        clearable
        style="width: 100px"
        size="small"
        @update:value="page=1; fetch()"
      />
      <NInput
        v-model:value="dueBefore"
        type="text"
        placeholder="截止日期≤"
        clearable
        style="width: 130px"
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
        :data="tasks"
        :loading="loading"
        bordered
        size="small"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange(p: number) { page = p; fetch() }, onUpdatePageSize() {} }"
      />
    </div>
    <NModal
      v-model:show="showCreate"
      title="新建任务"
    >
      <NCard
        style="width: 440px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="类型"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.task_type"
              :options="[{label:'项目任务',value:'project'},{label:'客户任务',value:'customer'},{label:'日常任务',value:'daily'}]"
            />
          </NFormItem>
          <NFormItem
            label="标题"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.title"
              placeholder="任务标题"
            />
          </NFormItem>
          <NFormItem
            v-if="createForm.task_type === 'project'"
            label="项目"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.project_id"
              :options="projectOptions"
              filterable
              placeholder="选择项目"
            />
          </NFormItem>
          <NFormItem
            v-if="createForm.task_type === 'customer'"
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
            label="描述"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.description"
              type="textarea"
              :rows="2"
            />
          </NFormItem>
          <NFormItem
            label="优先级"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.priority"
              :options="[{label:'低',value:'low'},{label:'中',value:'medium'},{label:'高',value:'high'}]"
            />
          </NFormItem>
          <NFormItem
            label="截止日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.due_date"
              placeholder="2026-06-30"
            />
          </NFormItem>
          <NSpace justify="end">
            <NButton @click="showCreate = false">
              取消
            </NButton><NButton
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
