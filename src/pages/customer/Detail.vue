<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NDescriptions, NDescriptionsItem, NButton, NSpace } from 'naive-ui'
import { ArrowBackOutline, EyeOutline, EyeOffOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { useMessage } from 'naive-ui'
import type { Customer } from '@/types'
import { getCustomer } from '@/api/customer'
import { maskAddress, maskEmail, maskName, maskPhone } from '@/utils/entityForms'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const customer = ref<Customer | null>(null)
const projectCount = ref(0)
const loading = ref(true)
const isMasked = ref(true)

function copyToClip(text: string, label: string) { navigator.clipboard.writeText(text); message.success(`${label}已复制`) }

onMounted(async () => {
  try {
    const res = await getCustomer(route.params.id as string)
    customer.value = res.data.data.customer
    projectCount.value = res.data.data.project_count
  } catch { message.error('加载客户详情失败') } finally { loading.value = false }
})
</script>

<template>
  <div>
    <NButton
      quaternary
      size="small"
      style="margin-bottom: 16px"
      @click="router.push('/customers')"
    >
      <template #icon>
        <NIcon><ArrowBackOutline /></NIcon>
      </template>
      返回列表
    </NButton>

    <div
      v-if="loading"
      style="color: var(--ink-muted)"
    >
      加载中...
    </div>

    <template v-else-if="customer">
      <div class="page-header">
        <h1>{{ customer.name }}</h1>
        <NSpace :size="8">
          <span
            class="status-dot"
            :class="customer.status"
          >
            {{ customer.status === 'active' ? '正常' : '停用' }}
          </span>
          <NButton
            size="tiny"
            quaternary
            @click="isMasked = !isMasked"
          >
            <template #icon>
              <NIcon><EyeOutline v-if="isMasked" /><EyeOffOutline v-else /></NIcon>
            </template>
            {{ isMasked ? '显示' : '隐藏' }}
          </NButton>
        </NSpace>
      </div>

      <NCard :bordered="true">
        <NDescriptions
          bordered
          :column="2"
          label-placement="left"
        >
          <NDescriptionsItem label="客户编码">
            <span
              class="font-mono"
              style="cursor:pointer"
              @click="copyToClip(customer.customer_code,'编码')"
            >{{ customer.customer_code }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="关联项目">
            {{ projectCount }} 个
          </NDescriptionsItem>
          <NDescriptionsItem label="联系人">
            <span
              style="cursor:pointer"
              @click="copyToClip(customer.contact_person,'姓名')"
            >{{ isMasked ? maskName(customer.contact_person) : customer.contact_person || '-' }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="电话">
            <span
              style="cursor:pointer"
              @click="copyToClip(customer.contact_phone,'电话')"
            >{{ isMasked ? maskPhone(customer.contact_phone) : customer.contact_phone || '-' }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="邮箱">
            <span
              style="cursor:pointer"
              @click="copyToClip(customer.contact_email,'邮箱')"
            >{{ isMasked ? maskEmail(customer.contact_email) : customer.contact_email || '-' }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem
            label="地址"
            :span="2"
          >
            {{ isMasked ? maskAddress(customer.address) : customer.address || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem
            label="备注"
            :span="2"
          >
            {{ customer.notes || '-' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </template>

    <div
      v-else
      style="color: var(--ink-muted)"
    >
      客户不存在
    </div>
  </div>
</template>
