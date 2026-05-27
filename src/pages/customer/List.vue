<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NModal, NCard, NForm, NFormItem, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Customer } from '@/types'
import { getCustomers, createCustomer, deleteCustomer } from '@/api/customer'

const router = useRouter()
const message = useMessage()

const customers = ref<Customer[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const keyword = ref('')

const showCreate = ref(false)
const createForm = ref({ customer_code: '', name: '', contact_person: '', contact_phone: '', contact_email: '', notes: '' })
const saving = ref(false)

const columns: DataTableColumns<Customer> = [
  { title: '编码', key: 'customer_code', width: 100, ellipsis: { tooltip: true } },
  { title: '客户名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '联系人', key: 'contact_person', width: 100 },
  { title: '电话', key: 'contact_phone', width: 130 },
  { title: '状态', key: 'status', width: 80,
    render(row) {
      return h('span', { class: `status-dot ${row.status}` }, row.status === 'active' ? '正常' : '停用')
    },
  },
  {
    title: '操作', key: 'actions', width: 140,
    render(row) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, onClick: () => router.push(`/customers/${row.id}`) }, { default: () => '查看' }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' }),
        ],
      })
    },
  },
]

async function fetchCustomers() {
  loading.value = true
  try {
    const res = await getCustomers({ page: page.value, keyword: keyword.value })
    const body = res.data
    customers.value = body.data
    total.value = body.pagination?.total || 0
  } catch { message.error('获取客户列表失败') }
  finally { loading.value = false }
}

async function handleCreate() {
  saving.value = true
  try {
    await createCustomer(createForm.value as any)
    showCreate.value = false
    createForm.value = { customer_code: '', name: '', contact_person: '', contact_phone: '', contact_email: '', notes: '' }
    message.success('创建成功')
    fetchCustomers()
  } catch (e: any) { message.error(e.response?.data?.message || '创建失败') }
  finally { saving.value = false }
}

async function handleDelete(row: Customer) {
  try { await deleteCustomer(row.id); message.success('已删除'); fetchCustomers() }
  catch { message.error('删除失败') }
}

onMounted(fetchCustomers)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>客户管理</h1>
      <NButton type="primary" @click="showCreate = true" size="small">新建客户</NButton>
    </div>

    <NSpace style="margin-bottom: 16px" :size="8">
      <NInput
        v-model:value="keyword" placeholder="搜索名称或编码..."
        clearable style="width: 260px" size="small"
        @keyup.enter="page=1; fetchCustomers()"
      />
      <NButton size="small" @click="page=1; fetchCustomers()">搜索</NButton>
    </NSpace>

    <NDataTable
      :columns="columns" :data="customers" :loading="loading" bordered size="small"
      :pagination="{
        page: page, pageSize: 20, itemCount: total,
        onChange(p: number) { page = p; fetchCustomers() },
        onUpdatePageSize() {},
      }"
    />

    <!-- Create Modal -->
    <NModal v-model:show="showCreate" title="新建客户">
      <NCard style="width: 480px; max-width: 90vw" :bordered="true" role="dialog">
        <NForm :model="createForm">
          <NFormItem label="客户编码" :show-feedback="false">
            <NInput v-model:value="createForm.customer_code" placeholder="CUST-001" />
          </NFormItem>
          <NFormItem label="名称" :show-feedback="false">
            <NInput v-model:value="createForm.name" placeholder="客户公司名称" />
          </NFormItem>
          <NFormItem label="联系人" :show-feedback="false">
            <NInput v-model:value="createForm.contact_person" />
          </NFormItem>
          <NFormItem label="电话" :show-feedback="false">
            <NInput v-model:value="createForm.contact_phone" />
          </NFormItem>
          <NFormItem label="邮箱" :show-feedback="false">
            <NInput v-model:value="createForm.contact_email" />
          </NFormItem>
          <NFormItem label="备注" :show-feedback="false">
            <NInput v-model:value="createForm.notes" type="textarea" :rows="2" />
          </NFormItem>
          <NSpace justify="end">
            <NButton @click="showCreate = false">取消</NButton>
            <NButton type="primary" :loading="saving" @click="handleCreate">创建</NButton>
          </NSpace>
        </NForm>
      </NCard>
    </NModal>
  </div>
</template>
