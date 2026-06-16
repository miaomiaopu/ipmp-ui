<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NDescriptions, NDescriptionsItem, NButton } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { useMessage } from 'naive-ui'
import type { Project } from '@/types'
import { getProject } from '@/api/project'
import { projectStatusLabel } from '@/utils/entityForms'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const project = ref<(Project & { task_count: number; requirement_count: number }) | null>(null)
const loading = ref(true)

function formatDate(value: string | null | undefined) {
  return value ? value.slice(0, 10) : '-'
}

onMounted(async () => {
  try {
    const res = await getProject(route.params.id as string)
    project.value = res.data.data
  } catch {
    message.error('加载项目详情失败')
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
      @click="router.push('/projects')"
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

    <template v-else-if="project">
      <div class="page-header">
        <h1>{{ project.name }}</h1>
        <span
          class="status-dot"
          :class="project.status"
          style="font-size: 13px"
        >
          {{ projectStatusLabel[project.status] || project.status }}
        </span>
      </div>

      <NCard :bordered="true">
        <NDescriptions
          bordered
          :column="2"
          label-placement="left"
        >
          <NDescriptionsItem label="项目编码">
            <span class="font-mono">{{ project.project_code }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="客户">
            {{ project.customer?.name || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="项目经理">
            {{ project.manager?.display_name || '-' }}
          </NDescriptionsItem>
          <NDescriptionsItem label="开始日期">
            {{ formatDate(project.start_date) }}
          </NDescriptionsItem>
          <NDescriptionsItem label="上线日期">
            {{ formatDate(project.go_live_date) }}
          </NDescriptionsItem>
          <NDescriptionsItem label="竣工日期">
            {{ formatDate(project.completion_date) }}
          </NDescriptionsItem>
          <NDescriptionsItem label="关联任务">
            {{ project.task_count }} 个
          </NDescriptionsItem>
          <NDescriptionsItem label="关联需求">
            {{ project.requirement_count }} 个
          </NDescriptionsItem>
          <NDescriptionsItem
            label="描述"
            :span="2"
          >
            {{ project.description || '-' }}
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>
    </template>

    <div
      v-else
      style="color: var(--ink-muted)"
    >
      项目不存在
    </div>
  </div>
</template>
