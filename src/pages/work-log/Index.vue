<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog, exportWorkLogs } from '@/api/workLog'
import { getTasks } from '@/api/task'
import { getProjects } from '@/api/project'
import { getCustomers } from '@/api/customer'
import { buildWorkLogPayload } from '@/utils/entityForms'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const showCreate = ref(false)
function emptyWorkLogForm() {
  return {
    task_id: null as string | null,
    project_id: null as string | null,
    customer_id: null as string | null,
    log_date: new Date().toISOString().slice(0, 10),
    hours: '8',
    description: '',
  }
}

const createForm = ref(emptyWorkLogForm())
const showEdit = ref(false)
const editingId = ref('')
const editForm = ref({ log_date: '', hours: '', description: '' })
const todayTotal = ref(0)
const saving = ref(false)
const taskOptions = ref<{ label: string; value: string }[]>([])
const projectOptions = ref<{ label: string; value: string }[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])

const columns: DataTableColumns<any> = [
  { title: '日期', key: 'log_date', width: 100, render(r: any) { return r.log_date?.slice(0, 10) || '-' } },
  { title: '工时', key: 'hours', width: 60, render(r: any) { return `${r.hours}h` } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '关联任务', key: 'task', width: 140, ellipsis: { tooltip: true }, render(r: any) { return r.task?.title || '-' } },
  { title: '项目', key: 'project', width: 130, ellipsis: { tooltip: true }, render(r: any) { return r.project?.name || '-' } },
  { title: '客户', key: 'customer', width: 130, ellipsis: { tooltip: true }, render(r: any) { return r.customer?.name || '-' } },
  {
    title: '操作', key: 'actions', width: 120, render(row: any) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, { default: () => '编辑' }),
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
            trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
            default: () => '确定删除？',
          }),
        ],
      })
    },
  },
]

async function fetch() {
  loading.value = true
  try { const r = await getWorkLogs({ page: page.value }); items.value = r.data.data; total.value = r.data.pagination?.total || 0 }
  catch { message.error('获取列表失败') }
  finally { loading.value = false }
}

async function fetchTasks() {
  try {
    const r = await getTasks({ page_size: 100 })
    taskOptions.value = (r.data.data || []).map((t: any) => ({ label: `[${taskTypeLabel(t.task_type)}] ${t.title}`, value: t.id }))
  } catch {}
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

function taskTypeLabel(type: string) {
  return ({ project: '项目', customer: '客户', daily: '日常' } as Record<string, string>)[type] || type
}

async function checkTodayHours() {
  try { const r = await getWorkLogs({ page_size: 100, start_date: createForm.value.log_date, end_date: createForm.value.log_date }); todayTotal.value = (r.data.data || []).reduce((s: number, w: any) => s + w.hours, 0) } catch { todayTotal.value = 0 }
}

async function handleCreate() {
  saving.value = true
  try {
    await createWorkLog(buildWorkLogPayload(createForm.value))
    showCreate.value = false
    createForm.value = emptyWorkLogForm()
    message.success('录入成功')
    fetch()
  }
  catch (e: any) { message.error(e.message || '录入失败') }
  finally { saving.value = false }
}

function openEdit(row: any) {
  editingId.value = row.id
  editForm.value = {
    log_date: row.log_date?.slice(0, 10) || '',
    hours: String(row.hours ?? ''),
    description: row.description || '',
  }
  showEdit.value = true
}

async function handleUpdate() {
  if (!editingId.value) return
  saving.value = true
  try {
    await updateWorkLog(editingId.value, {
      log_date: editForm.value.log_date,
      hours: parseFloat(editForm.value.hours),
      description: editForm.value.description,
    })
    showEdit.value = false
    message.success('更新成功')
    fetch()
  } catch (e: any) { message.error(e.message || '更新失败') }
  finally { saving.value = false }
}

async function handleDelete(row: any) { try { await deleteWorkLog(row.id); message.success('已删除'); fetch() } catch { message.error('删除失败') } }

async function handleExport() {
  try {
    const res = await exportWorkLogs({})
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'work_logs.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  } catch {
    message.error('导出失败')
  }
}

onMounted(() => { fetch(); fetchTasks(); fetchRefs() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1>工时录入</h1>
      <NSpace :size="8">
        <NButton
          size="small"
          @click="handleExport"
        >
          导出
        </NButton>
        <NButton
          type="primary"
          size="small"
          @click="showCreate = true; checkTodayHours()"
        >
          录入工时
        </NButton>
      </NSpace>
    </div>
    <div style="overflow-x: auto">
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        bordered
        size="small"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange(p: number) { page = p; fetch() }, onUpdatePageSize() {} }"
      />
    </div>
    <NModal
      v-model:show="showCreate"
      title="录入工时"
    >
      <NCard
        style="width: 400px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.log_date"
              placeholder="2026-01-01"
            />
          </NFormItem>
          <NFormItem
            label="工时(h)"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.hours"
              placeholder="0.5-24"
            />
          </NFormItem>
          <p
            v-if="todayTotal > 0"
            style="font-size: 12px; color: var(--warning); margin: -8px 0 8px 0"
          >
            今日已填报 {{ todayTotal }}h
          </p>
          <NFormItem
            label="关联任务"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.task_id"
              :options="taskOptions"
              placeholder="选择任务"
              clearable
              filterable
            />
          </NFormItem>
          <NFormItem
            label="关联项目"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.project_id"
              :options="projectOptions"
              placeholder="不选任务时可选择项目"
              clearable
              filterable
            />
          </NFormItem>
          <NFormItem
            label="关联客户"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.customer_id"
              :options="customerOptions"
              placeholder="不选任务时可选择客户"
              clearable
              filterable
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
              placeholder="工作内容"
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
              保存
            </NButton>
          </NSpace>
        </NForm>
      </NCard>
    </NModal>

    <NModal
      v-model:show="showEdit"
      title="编辑工时"
    >
      <NCard
        style="width: 400px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="editForm">
          <NFormItem
            label="日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.log_date"
              placeholder="2026-01-01"
            />
          </NFormItem>
          <NFormItem
            label="工时(h)"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.hours"
              placeholder="0.5-24"
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
              placeholder="工作内容"
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
