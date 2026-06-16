<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NButton, NIcon, NGrid, NGridItem, NDataTable } from 'naive-ui'
import { TimerOutline } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'
import { getWorkLogStats, getWorkLogs } from '@/api/workLog'

const router = useRouter()
const stats = ref<any[]>([])
const detailList = ref<any[]>([])
const loading = ref(false)
const viewMode = ref<'daily' | 'weekly' | 'table'>('daily')
const selectedDate = ref('')

// Group by date for daily view
const dailyGroups = computed(() => {
  const map: Record<string, { date: string; hours: number; logs: any[] }> = {}
  for (const s of stats.value) {
    const d = s.log_date?.slice(0, 10) || '?'
    if (!map[d]) map[d] = { date: d, hours: 0, logs: [] }
    map[d].hours += s.hours
    map[d].logs.push(s)
  }
  return Object.values(map).sort((a, b) => b.date.localeCompare(a.date))
})

const columns: DataTableColumns<any> = [
  { title: '日期', key: 'log_date', width: 100, render(r: any) { return r.log_date?.slice(0, 10) || '-' } },
  { title: '工时', key: 'hours', width: 60, render(r: any) { return r.hours + 'h' } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  { title: '任务', key: 'task', width: 120, render(r: any) { return r.task?.title || '-' } },
  { title: '项目', key: 'project', width: 100, render(r: any) { return r.project?.name || '-' } },
]

const totalHours = computed(() => stats.value.reduce((s, w) => s + w.hours, 0))

async function fetch() {
  loading.value = true
  try {
    const res = await getWorkLogStats({ page_size: 1000 })
    stats.value = res.data.data || []
    detailList.value = stats.value
  } catch { /* */ }
  finally { loading.value = false }
}

function showDetail(date: string) {
  selectedDate.value = date
  detailList.value = stats.value.filter((s: any) => s.log_date?.slice(0, 10) === date)
  viewMode.value = 'table'
}

function backToDaily() {
  detailList.value = stats.value
  viewMode.value = 'daily'
}

onMounted(fetch)
</script>

<template>
  <div>
    <div class="page-header">
      <h1>工时概览</h1>
      <NButton
        size="small"
        @click="viewMode = viewMode === 'daily' ? 'table' : 'daily'"
      >
        {{ viewMode === 'table' ? '日报视图' : '列表视图' }}
      </NButton>
    </div>

    <NCard
      v-if="viewMode === 'daily'"
      :bordered="true"
      style="margin-bottom: 16px"
    >
      <div style="font-size: 14px; color: var(--ink-muted); margin-bottom: 12px">
        总工时: <strong style="color: var(--ink)">{{ totalHours }}h</strong>
      </div>
      <NGrid
        :cols="2"
        :x-gap="16"
        :y-gap="12"
        responsive="screen"
        item-responsive
      >
        <NGridItem
          v-for="g in dailyGroups"
          :key="g.date"
          span="0:2 640:1 1024:1"
        >
          <NCard
            size="small"
            :bordered="true"
            hoverable
            style="cursor: pointer"
            @click="showDetail(g.date)"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div>
                <div style="font-weight: 600; color: var(--ink)">
                  {{ g.date }}
                </div>
                <div style="font-size: 12px; color: var(--ink-muted)">
                  {{ g.logs.length }} 条记录
                </div>
              </div>
              <div style="font-size: 20px; font-weight: 700; color: var(--accent)">
                {{ g.hours }}h
              </div>
            </div>
          </NCard>
        </NGridItem>
      </NGrid>
    </NCard>

    <NCard
      v-if="viewMode === 'table'"
      :bordered="true"
    >
      <NButton
        quaternary
        size="small"
        style="margin-bottom: 12px"
        @click="backToDaily"
      >
        <template #icon>
          <NIcon><TimerOutline /></NIcon>
        </template>
        返回日报
      </NButton>
      <NDataTable
        :columns="columns"
        :data="detailList"
        bordered
        size="small"
      />
    </NCard>
  </div>
</template>
