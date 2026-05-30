<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NDataTable, NButton, NSpace, NInput, NSelect, NModal, NCard, NForm, NFormItem, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { getRequirements, createRequirement, deleteRequirement } from '@/api/requirement'

const message = useMessage()
const items = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const typeFilter = ref<string | null>(null)
const keyword = ref('')
const showCreate = ref(false)
const createForm = ref({ req_type: 'project', title: '', description: '', priority: 'medium' })
const saving = ref(false)

const statusLabel: Record<string, string> = { pending: '待处理', approved: '已批准', rejected: '已拒绝', in_progress: '实施中', done: '已完成' }

const columns: DataTableColumns<any> = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '类型', key: 'req_type', width: 80, render(r: any) { return r.req_type === 'project' ? '项目' : '售后' } },
  { title: '状态', key: 'status', width: 70, render(r: any) { return statusLabel[r.status] } },
  { title: '编号', key: 'requirement_code', width: 80 },
  {
    title: '操作', key: 'actions', width: 100, render(row: any) {
      return h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
        trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
        default: () => '确定删除？',
      })
    },
  },
]

async function fetch() {
  loading.value = true
  try { const r = await getRequirements({ page: page.value, req_type: typeFilter.value, keyword: keyword.value }); items.value = r.data.data; total.value = r.data.pagination?.total || 0 }
  catch { message.error('获取列表失败') }
  finally { loading.value = false }
}

async function handleCreate() {
  saving.value = true
  try { await createRequirement(createForm.value); showCreate.value = false; message.success('创建成功'); fetch() }
  catch (e: any) { message.error(e.message || '创建失败') }
  finally { saving.value = false }
}

async function handleDelete(row: any) { try { await deleteRequirement(row.id); message.success('已删除'); fetch() } catch { message.error('删除失败') } }

onMounted(fetch)
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
  </div>
</template>
