<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getWorkLogs, createWorkLog, deleteWorkLog, exportWorkLogs } from '@/api/workLog'
import { getTasks } from '@/api/task'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const showCreate = ref(false)
const createForm = ref({ task_id: null as string | null, log_date: new Date().toISOString().slice(0, 10), hours: '8', description: '' })
const todayTotal = ref(0)
const saving = ref(false)
const taskOptions = ref<{ label: string; value: string }[]>([])

const columns: DataTableColumns<any> = [
  { title: '日期', key: 'log_date', width: 100, render(r: any) { return r.log_date?.slice(0, 10) || '-' } },
  { title: '工时', key: 'hours', width: 60, render(r: any) { return `${r.hours}h` } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '关联任务', key: 'task', width: 120, render(r: any) { return r.task?.title || '-' } },
  {
    title: '操作', key: 'actions', width: 80, render(row: any) {
      return h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
        trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
        default: () => '确定删除？',
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

function taskTypeLabel(type: string) {
  return ({ project: '项目', customer: '客户', daily: '日常' } as Record<string, string>)[type] || type
}

async function checkTodayHours() {
  try { const r = await getWorkLogs({ page_size: 100, start_date: createForm.value.log_date, end_date: createForm.value.log_date }); todayTotal.value = (r.data.data || []).reduce((s: number, w: any) => s + w.hours, 0) } catch { todayTotal.value = 0 }
}

async function handleCreate() {
  saving.value = true
  try { await createWorkLog({ ...createForm.value, hours: parseFloat(createForm.value.hours) }); showCreate.value = false; message.success('录入成功'); fetch() }
  catch (e: any) { message.error(e.message || '录入失败') }
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

onMounted(() => { fetch(); fetchTasks() })
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
  </div>
</template>
