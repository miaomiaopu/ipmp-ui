<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getRequirements, createRequirement, updateRequirement, deleteRequirement } from '@/api/requirement'
import { getProjects } from '@/api/project'
import { getCustomers } from '@/api/customer'
import { requirementStatusOptions } from '@/utils/entityForms'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const typeFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const keyword = ref('')
const showCreate = ref(false)
function emptyRequirementForm() {
  return {
    req_type: 'project',
    requirement_code: '',
    title: '',
    description: '',
    project_id: null as string | null,
    customer_id: null as string | null,
    status: 'pending',
    priority: 'medium',
    scheduled_date: '',
  }
}

const createForm = ref(emptyRequirementForm())
const showEdit = ref(false)
const editingId = ref('')
const editForm = ref(emptyRequirementForm())
const saving = ref(false)
const projectOptions = ref<{ label: string; value: string }[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])

const priorityOptions = [{ label: '低', value: 'low' }, { label: '中', value: 'medium' }, { label: '高', value: 'high' }]

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '-'
}

const columns: DataTableColumns<any> = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '类型', key: 'req_type', width: 80, render(r: any) { return r.req_type === 'project' ? '项目' : '售后' } },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render(r: any) {
      return h(NSelect, {
        value: r.status,
        options: requirementStatusOptions,
        size: 'tiny',
        onUpdateValue: (value: string) => handleStatusUpdate(r, value),
      })
    },
  },
  { title: '关联', key: 'relation', width: 140, ellipsis: { tooltip: true }, render(r: any) { return r.project?.name || r.customer?.name || '-' } },
  { title: '计划日期', key: 'scheduled_date', width: 110, render(r: any) { return formatDate(r.scheduled_date) } },
  { title: '编号', key: 'requirement_code', width: 100 },
  {
    title: '操作', key: 'actions', width: 140, render(row: any) {
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
  try { const r = await getRequirements({ page: page.value, req_type: typeFilter.value, status: statusFilter.value, keyword: keyword.value }); items.value = r.data.data; total.value = r.data.pagination?.total || 0 }
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

function buildRequirementPayload(form: ReturnType<typeof emptyRequirementForm>) {
  const payload = { ...form } as Record<string, any>
  if (payload.req_type !== 'project') payload.project_id = null
  if (payload.req_type !== 'after_sales') payload.customer_id = null
  payload.scheduled_date = payload.scheduled_date || ''
  return payload
}

async function handleCreate() {
  saving.value = true
  try {
    const payload = buildRequirementPayload(createForm.value)
    delete payload.status
    await createRequirement(payload)
    showCreate.value = false
    createForm.value = emptyRequirementForm()
    message.success('创建成功')
    fetch()
  }
  catch (e: any) { message.error(e.message || '创建失败') }
  finally { saving.value = false }
}

function openEdit(row: any) {
  editingId.value = row.id
  editForm.value = {
    req_type: row.req_type || 'project',
    requirement_code: row.requirement_code || '',
    title: row.title || '',
    description: row.description || '',
    project_id: row.project_id || null,
    customer_id: row.customer_id || null,
    status: row.status || 'pending',
    priority: row.priority || 'medium',
    scheduled_date: row.scheduled_date?.slice(0, 10) || '',
  }
  showEdit.value = true
}

async function handleUpdate() {
  if (!editingId.value) return
  saving.value = true
  try {
    const payload = buildRequirementPayload(editForm.value)
    delete payload.req_type
    await updateRequirement(editingId.value, payload)
    showEdit.value = false
    message.success('更新成功')
    fetch()
  } catch (e: any) { message.error(e.message || '更新失败') }
  finally { saving.value = false }
}

async function handleStatusUpdate(row: any, status: string) {
  if (row.status === status) return
  try {
    await updateRequirement(row.id, { status })
    row.status = status
    message.success('状态已更新')
  } catch { message.error('状态更新失败') }
}

async function handleDelete(row: any) { try { await deleteRequirement(row.id); message.success('已删除'); fetch() } catch { message.error('删除失败') } }

watch(() => createForm.value.req_type, () => {
  createForm.value.project_id = null
  createForm.value.customer_id = null
})

onMounted(() => { fetch(); fetchRefs() })
</script>

<template>
  <div>
    <div class="page-header">
      <h1>需求管理</h1><NButton
        type="primary"
        size="small"
        @click="showCreate = true"
      >
        新建需求
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
        :options="[{label:'项目需求',value:'project'},{label:'售后需求',value:'after_sales'}]"
        placeholder="类型"
        clearable
        style="width: 110px"
        size="small"
        @update:value="page=1; fetch()"
      />
      <NSelect
        v-model:value="statusFilter"
        :options="requirementStatusOptions"
        placeholder="状态"
        clearable
        style="width: 120px"
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
        :data="items"
        :loading="loading"
        bordered
        size="small"
        :pagination="{ page, pageSize: 20, itemCount: total, onChange(p: number) { page = p; fetch() }, onUpdatePageSize() {} }"
      />
    </div>
    <NModal
      v-model:show="showCreate"
      title="新建需求"
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
              v-model:value="createForm.req_type"
              :options="[{label:'项目需求',value:'project'},{label:'售后需求',value:'after_sales'}]"
            />
          </NFormItem>
          <NFormItem
            label="标题"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.title"
              placeholder="需求标题"
            />
          </NFormItem>
          <NFormItem
            label="需求编号"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.requirement_code"
              placeholder="REQ-001"
            />
          </NFormItem>
          <NFormItem
            v-if="createForm.req_type === 'project'"
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
            v-if="createForm.req_type === 'after_sales'"
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
            label="计划日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.scheduled_date"
              placeholder="2026-06-30"
            />
          </NFormItem>
          <NFormItem
            label="优先级"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="createForm.priority"
              :options="priorityOptions"
            />
          </NFormItem>
          <NSpace
            justify="end"
            style="margin-top: 12px"
          >
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

    <NModal
      v-model:show="showEdit"
      title="编辑需求"
    >
      <NCard
        style="width: 460px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="editForm">
          <NFormItem
            label="标题"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.title" />
          </NFormItem>
          <NFormItem
            label="需求编号"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.requirement_code" />
          </NFormItem>
          <NFormItem
            v-if="editForm.req_type === 'project'"
            label="项目"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="editForm.project_id"
              :options="projectOptions"
              filterable
              placeholder="选择项目"
            />
          </NFormItem>
          <NFormItem
            v-if="editForm.req_type === 'after_sales'"
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
              :options="requirementStatusOptions"
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
          <NFormItem
            label="计划日期"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.scheduled_date"
              placeholder="2026-06-30"
            />
          </NFormItem>
          <NFormItem
            label="优先级"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="editForm.priority"
              :options="priorityOptions"
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
