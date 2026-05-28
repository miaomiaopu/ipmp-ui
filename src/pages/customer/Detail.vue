<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NDescriptions, NDescriptionsItem, NButton } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { useMessage } from 'naive-ui'
import type { Customer } from '@/types'
import { getCustomer } from '@/api/customer'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const customer = ref<Customer | null>(null)
const projectCount = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getCustomer(route.params.id as string)
    customer.value = res.data.data.customer
    projectCount.value = res.data.data.project_count
  } catch {
    message.error('加载客户详情失败')
  } finally {
    loading.value = false
  }
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
        <span
          class="status-dot"
          :class="customer.status"
        >
          {{ customer.status === 'active' ? '正常' : '停用' }}
        </span>
      </div>

      <NCard :bordered="true">
        <NDescriptions
          bordered
          :column="2"
          label-placement="left"
        >
          <NDescriptionsItem label="客户编码">
            <span class="font-mono">{{ customer.customer_code }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="关联项目">
            {{ projectCount }} 个
          </NDescriptionsItem>
          <NDescriptionsItem label="联系人">
            {{ customer.contact_person || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="电话">
            {{ customer.contact_phone || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="邮箱">
            {{ customer.contact_email || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem
            label="地址"
            :span="2"
          >
            {{ customer.address || '-' }}
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
