<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NDataTable, NButton, NSpace, NInput, NModal, NCard, NForm, NFormItem, NSelect, NPopconfirm, useMessage } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Customer } from '@/types'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customer'

const router = useRouter()
const message = useMessage()

const customers = ref<Customer[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const keyword = ref('')

const showCreate = ref(false)
const createForm = ref({ customer_code: '', name: '', contact_person: '', contact_phone: '', contact_email: '', address: '', notes: '' })
const showEdit = ref(false)
const editingId = ref('')
const editForm = ref({ customer_code: '', name: '', contact_person: '', contact_phone: '', contact_email: '', address: '', notes: '', status: 'active' })
const saving = ref(false)
const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '停用', value: 'inactive' },
]

const columns: DataTableColumns<Customer> = [
  { title: '编码', key: 'customer_code', width: 100, ellipsis: { tooltip: true } },
  { title: '客户名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '联系人', key: 'contact_person', width: 100 },
  { title: '电话', key: 'contact_phone', width: 130 },
  { title: '邮箱', key: 'contact_email', width: 170, ellipsis: { tooltip: true } },
  { title: '地址', key: 'address', width: 180, ellipsis: { tooltip: true } },
  { title: '状态', key: 'status', width: 80,
    render(row) {
      return h('span', { class: `status-dot ${row.status}` }, row.status === 'active' ? '正常' : '停用')
    },
  },
  {
    title: '操作', key: 'actions', width: 180,
    render(row) {
      return h(NSpace, { size: 4 }, {
        default: () => [
          h(NButton, { size: 'tiny', quaternary: true, onClick: () => router.push(`/customers/${row.id}`) }, { default: () => '查看' }),
          h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => openEdit(row) }, { default: () => '编辑' }),
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row) }, {
            trigger: () => h(NButton, { size: 'tiny', quaternary: true, type: 'error' }, { default: () => '删除' }),
            default: () => '确定删除该客户？',
          }),
        ],
      })
    },
  },
]

async function fetchCustomers() {
  loading.value = true
  try {
    const res = await getCustomers({ page: page.value, keyword: keyword.value })
    customers.value = res.data.data
    total.value = res.data.pagination?.total || 0
  } catch { message.error('获取客户列表失败') }
  finally { loading.value = false }
}

async function handleCreate() {
  saving.value = true
  try {
    await createCustomer(createForm.value as any)
    showCreate.value = false
    createForm.value = { customer_code: '', name: '', contact_person: '', contact_phone: '', contact_email: '', address: '', notes: '' }
    message.success('创建成功')
    fetchCustomers()
  } catch (e: any) { message.error(e.message || e.response?.data?.message || '创建失败') }
  finally { saving.value = false }
}

function openEdit(row: Customer) {
  editingId.value = row.id
  editForm.value = {
    customer_code: row.customer_code || '',
    name: row.name || '',
    contact_person: row.contact_person || '',
    contact_phone: '',
    contact_email: '',
    address: '',
    notes: row.notes || '',
    status: row.status || 'active',
  }
  showEdit.value = true
}

async function handleUpdate() {
  if (!editingId.value) return
  saving.value = true
  try {
    const payload: Record<string, string> = {
      customer_code: editForm.value.customer_code,
      name: editForm.value.name,
      contact_person: editForm.value.contact_person,
      notes: editForm.value.notes,
      status: editForm.value.status,
    }
    if (editForm.value.contact_phone) payload.contact_phone = editForm.value.contact_phone
    if (editForm.value.contact_email) payload.contact_email = editForm.value.contact_email
    if (editForm.value.address) payload.address = editForm.value.address
    await updateCustomer(editingId.value, payload as any)
    showEdit.value = false
    message.success('更新成功')
    fetchCustomers()
  } catch (e: any) { message.error(e.message || e.response?.data?.message || '更新失败') }
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
      <NButton
        type="primary"
        size="small"
        @click="showCreate = true"
      >
        新建客户
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
        @keyup.enter="page=1; fetchCustomers()"
      />
      <NButton
        size="small"
        @click="page=1; fetchCustomers()"
      >
        搜索
      </NButton>
    </NSpace>

    <div style="overflow-x: auto">
      <NDataTable
        :columns="columns"
        :data="customers"
        :loading="loading"
        bordered
        size="small"
        :pagination="{
          page: page, pageSize: 20, itemCount: total,
          onChange(p: number) { page = p; fetchCustomers() },
          onUpdatePageSize() {},
        }"
      />
    </div>

    <NModal
      v-model:show="showCreate"
      title="新建客户"
    >
      <NCard
        style="width: 480px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="createForm">
          <NFormItem
            label="客户编码"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.customer_code"
              placeholder="CUST-001"
            />
          </NFormItem>
          <NFormItem
            label="名称"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.name"
              placeholder="客户公司名称"
            />
          </NFormItem>
          <NFormItem
            label="联系人"
            :show-feedback="false"
          >
            <NInput v-model:value="createForm.contact_person" />
          </NFormItem>
          <NFormItem
            label="电话"
            :show-feedback="false"
          >
            <NInput v-model:value="createForm.contact_phone" />
          </NFormItem>
          <NFormItem
            label="邮箱"
            :show-feedback="false"
          >
            <NInput v-model:value="createForm.contact_email" />
          </NFormItem>
          <NFormItem
            label="地址"
            :show-feedback="false"
          >
            <NInput v-model:value="createForm.address" />
          </NFormItem>
          <NFormItem
            label="备注"
            :show-feedback="false"
          >
            <NInput
              v-model:value="createForm.notes"
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
      title="编辑客户"
    >
      <NCard
        style="width: 520px; max-width: 90vw"
        :bordered="true"
        role="dialog"
      >
        <NForm :model="editForm">
          <NFormItem
            label="客户编码"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.customer_code" />
          </NFormItem>
          <NFormItem
            label="名称"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.name" />
          </NFormItem>
          <NFormItem
            label="联系人"
            :show-feedback="false"
          >
            <NInput v-model:value="editForm.contact_person" />
          </NFormItem>
          <NFormItem
            label="电话"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.contact_phone"
              placeholder="留空不修改"
            />
          </NFormItem>
          <NFormItem
            label="邮箱"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.contact_email"
              placeholder="留空不修改"
            />
          </NFormItem>
          <NFormItem
            label="地址"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.address"
              placeholder="留空不修改"
            />
          </NFormItem>
          <NFormItem
            label="状态"
            :show-feedback="false"
          >
            <NSelect
              v-model:value="editForm.status"
              :options="statusOptions"
            />
          </NFormItem>
          <NFormItem
            label="备注"
            :show-feedback="false"
          >
            <NInput
              v-model:value="editForm.notes"
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
