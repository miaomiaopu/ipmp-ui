<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getTasks, createTask, deleteTask } from '@/api/task'

const router = useRouter()
const message = useMessage()
const tasks = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const typeFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const keyword = ref('')
const showCreate = ref(false)
const createForm = ref({ task_type: 'project', title: '', description: '', priority: 'medium' })
const saving = ref(false)

const statusLabel: Record<string, string> = { todo: '待办', in_progress: '进行中', done: '已完成' }
const priorityLabel: Record<string, string> = { low: '低', medium: '中', high: '高', urgent: '紧急' }

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
  try { const r = await getTasks({ page: page.value, task_type: typeFilter.value, status: statusFilter.value, keyword: keyword.value }); tasks.value = r.data.data; total.value = r.data.pagination?.total || 0 }
  catch { message.error('获取列表失败') }
  finally { loading.value = false }
}

async function handleCreate() {
  saving.value = true
  try { await createTask(createForm.value); showCreate.value = false; createForm.value = { task_type: 'project', title: '', description: '', priority: 'medium' }; message.success('创建成功'); fetch() }
  catch (e: any) { message.error(e.message || '创建失败') }
  finally { saving.value = false }
}

async function handleDelete(row: any) { try { await deleteTask(row.id); message.success('已删除'); fetch() } catch { message.error('删除失败') } }

onMounted(fetch)
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
        :options="[{label:'待办',value:'todo'},{label:'进行中',value:'in_progress'},{label:'已完成',value:'done'}]"
        placeholder="状态"
        clearable
        style="width: 100px"
        size="small"
        @update:value="page=1; fetch()"
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
              :options="[{label:'低',value:'low'},{label:'中',value:'medium'},{label:'高',value:'high'},{label:'紧急',value:'urgent'}]"
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
