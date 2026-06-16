<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NButton, NCard, NCheckbox, NDataTable, NForm, NFormItem, NInput, NModal, NSelect, NSpace, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { generateWeeklyReport, getWeeklyReports } from '@/api/weeklyReport'
import { getProjects } from '@/api/project'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const showGenerate = ref(false)
const saving = ref(false)
const projectOptions = ref<{ label: string; value: string }[]>([])

function defaultWeek() {
  const now = new Date()
  const day = now.getDay() || 7
  const start = new Date(now)
  start.setDate(now.getDate() + 1 - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    week_start: start.toISOString().slice(0, 10),
    week_end: end.toISOString().slice(0, 10),
  }
}

const createForm = ref({
  report_type: 'personal',
  project_id: null as string | null,
  ...defaultWeek(),
  use_ai: false,
})

const statusLabel: Record<string, string> = {
  draft: '草稿',
  submitted: '已提交',
  reviewed: '已审核',
  final: '定稿',
}

const columns: DataTableColumns<any> = [
  { title: '周期', key: 'week', width: 190, render(row: any) { return `${row.week_start?.slice(0, 10)} ~ ${row.week_end?.slice(0, 10)}` } },
  { title: '类型', key: 'report_type', width: 90, render(row: any) { return row.report_type === 'project' ? '项目周报' : '个人周报' } },
  { title: '项目', key: 'project', width: 140, render(row: any) { return row.project?.name || '-' } },
  { title: '状态', key: 'status', width: 80, render(row: any) { return statusLabel[row.status] || row.status } },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
]

async function fetch() {
  loading.value = true
  try {
    const res = await getWeeklyReports({ page: page.value })
    items.value = res.data.data || []
    total.value = res.data.pagination?.total || 0
  } catch {
    message.error('获取周报失败')
  } finally {
    loading.value = false
  }
}

async function fetchProjects() {
  try {
    const res = await getProjects({ page_size: 100 })
    projectOptions.value = (res.data.data || []).map((p: any) => ({ label: p.name, value: p.id }))
  } catch {
    projectOptions.value = []
  }
}

async function handleGenerate() {
  saving.value = true
  try {
    const payload = { ...createForm.value }
    if (payload.report_type !== 'project') {
      payload.project_id = null
    }
    await generateWeeklyReport(payload)
    showGenerate.value = false
    message.success('周报已生成')
    fetch()
  } catch (e: any) {
    message.error(e.message || '生成失败')
  } finally {
    saving.value = false
  }
}

function openGenerate() {
  createForm.value = { report_type: 'personal', project_id: null, ...defaultWeek(), use_ai: false }
  showGenerate.value = true
}

onMounted(() => { fetch(); fetchProjects() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1>周报</h1>
      <NButton
        type="primary"
        size="small"
        @click="openGenerate"
      >
        生成周报
      </NButton>
    </div>

    <NDataTable
      :columns="columns"
      :data="items"
      :loading="loading"
      bordered
      size="small"
      :pagination="{ page, pageSize: 20, itemCount: total, onChange(p: number) { page = p; fetch() }, onUpdatePageSize() {} }"
    />

    <NModal
      v-model:show="showGenerate"
      title="生成周报"
    >
      <NCard
        style="width: 460px; max-width: 92vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="类型"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.report_type"
              :options="[{ label: '个人周报', value: 'personal' }, { label: '项目周报', value: 'project' }]"
            />
          </NFormItem>
          <NFormItem
            v-if="createForm.report_type === 'project'"
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
            label="开始日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.week_start"
              placeholder="2026-06-08"
            />
          </NFormItem>
          <NFormItem
            label="结束日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.week_end"
              placeholder="2026-06-14"
            />
          </NFormItem>
          <NCheckbox v-model:checked="createForm.use_ai">
            使用 AI mock 草稿
          </NCheckbox>
          <NSpace
            justify="end"
            style="margin-top: 16px"
          >
            <NButton @click="showGenerate = false">
              取消
            </NButton>
            <NButton
              type="primary"
              :loading="saving"
              @click="handleGenerate"
            >
              生成
            </NButton>
          </NSpace>
        </NForm>
      </NCard>
    </NModal>
  </div>
</template>
