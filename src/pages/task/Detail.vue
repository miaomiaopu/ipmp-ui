<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NDescriptions, NDescriptionsItem, NButton, NTag, NIcon, useMessage } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { getTask } from '@/api/task'

const route = useRoute(); const router = useRouter(); const message = useMessage()
const task = ref<any>(null); const loading = ref(true)
const typeLabel: Record<string, string> = { project: '项目任务', customer: '客户任务', daily: '日常任务' }
const statusLabel: Record<string, string> = { todo: '待办', in_progress: '进行中', done: '已完成' }

onMounted(async () => {
  try { const r = await getTask(route.params.id as string); task.value = r.data.data }
  catch { message.error('加载失败') }
  finally { loading.value = false }
})
</script>

<template>
  <div>
    <NButton
      quaternary
      size="small"
      style="margin-bottom: 16px"
      @click="router.push('/tasks')"
    >
      <template #icon>
        <NIcon><ArrowBackOutline /></NIcon>
      </template>返回列表
    </NButton>
    <div
      v-if="loading"
      style="color: var(--ink-muted)"
    >
      加载中...
    </div>
    <template v-else-if="task">
      <div class="page-header">
        <h1>{{ task.title }}</h1><span
          class="status-dot"
          :class="task.status"
          style="font-size: 13px"
        >{{ statusLabel[task.status] }}</span>
      </div>
      <NCard :bordered="true">
        <NDescriptions
          bordered
          :column="2"
          label-placement="left"
        >
          <NDescriptionsItem label="类型">
            {{ typeLabel[task.task_type] }}
          </NDescriptionsItem>
          <NDescriptionsItem label="优先级">
            {{ task.priority }}
          </NDescriptionsItem>
          <NDescriptionsItem label="截止日期">
            {{ task.due_date || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="关联项目">
            {{ task.project?.name || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="关联客户">
            {{ task.customer?.name || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem
            label="描述"
            :span="2"
          >
            {{ task.description || '-' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </template>
    <div
      v-else
      style="color: var(--ink-muted)"
    >
      任务不存在
    </div>
  </div>
</template>
