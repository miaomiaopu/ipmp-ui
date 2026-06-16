<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NGrid, NGridItem, NCard, NIcon, NButton, NSpace,
} from 'naive-ui'
import {
  BarChartOutline, PeopleOutline, FolderOpenOutline,
  TimerOutline, PersonAddOutline, SettingsOutline,
} from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { getDashboardStats, getDashboardThisWeek } from '@/api/dashboard'

const router = useRouter()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const stats = ref<Record<string, any>>({})
const thisWeek = ref<Record<string, any>>({})
const loading = ref(false)

const userStats = computed(() => [
  { label: '总用户数', value: stats.value.users ?? '-', icon: PeopleOutline, accent: 'var(--accent)' },
  { label: '活跃用户', value: stats.value.active_users ?? '-', icon: PersonAddOutline, accent: 'var(--warning)' },
])

const bizStats = computed(() => [
  { label: '客户数', value: stats.value.customers ?? '-', icon: PeopleOutline, accent: 'var(--accent)' },
  { label: '活跃项目', value: stats.value.active_projects ?? '-', icon: FolderOpenOutline, accent: 'var(--success)' },
  { label: '本周工时', value: stats.value.this_week_hours ?? '-', suffix: 'h', icon: TimerOutline, accent: 'var(--warning)' },
  { label: '待处理需求', value: stats.value.open_requirements ?? '-', icon: BarChartOutline, accent: 'var(--danger)' },
])

onMounted(async () => {
  loading.value = true
  try {
    const [statsRes, weekRes] = await Promise.all([getDashboardStats(), getDashboardThisWeek()])
    stats.value = statsRes.data.data || {}
    thisWeek.value = weekRes.data.data || {}
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ isAdmin ? '管理仪表盘' : '仪表盘' }}</h1>
    </div>

    <!-- Admin: user stats -->
    <NGrid
      v-if="isAdmin"
      :cols="2"
      :x-gap="16"
      :y-gap="16"
      responsive="screen"
      item-responsive
    >
      <NGridItem
        v-for="(s, i) in userStats"
        :key="i"
        span="0:2 640:1 1024:1"
      >
        <NCard
          size="small"
          :bordered="true"
          :loading="loading"
        >
          <div style="display: flex; align-items: flex-start; justify-content: space-between">
            <div>
              <div style="font-size: 12px; color: var(--ink-muted); margin-bottom: 6px">
                {{ s.label }}
              </div>
              <div
                style="font-size: 26px; font-weight: 700; letter-spacing: -0.5px"
                :style="{ color: s.accent }"
              >
                {{ s.value }}
              </div>
            </div>
            <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <NIcon
                :size="20"
                :color="s.accent"
              >
                <component :is="s.icon" />
              </NIcon>
            </div>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>

    <NSpace
      v-if="isAdmin"
      style="margin-top: 16px"
      :size="8"
    >
      <NButton
        size="small"
        @click="router.push('/users')"
      >
        <template #icon>
          <NIcon><PersonAddOutline /></NIcon>
        </template>
        管理用户
      </NButton>
      <NButton
        size="small"
        @click="router.push('/settings')"
      >
        <template #icon>
          <NIcon><SettingsOutline /></NIcon>
        </template>
        个人设置
      </NButton>
    </NSpace>

    <!-- Biz stats -->
    <NGrid
      :cols="isAdmin ? 4 : 2"
      :x-gap="16"
      :y-gap="16"
      :style="{ marginTop: isAdmin ? '24px' : '0' }"
      responsive="screen"
      item-responsive
    >
      <NGridItem
        v-for="(s, i) in bizStats"
        :key="i"
        span="0:2 640:1 1024:1"
      >
        <NCard
          size="small"
          :bordered="true"
          :loading="loading"
        >
          <div style="display: flex; align-items: flex-start; justify-content: space-between">
            <div>
              <div style="font-size: 12px; color: var(--ink-muted); margin-bottom: 6px">
                {{ s.label }}
              </div>
              <div
                style="font-size: 26px; font-weight: 700; letter-spacing: -0.5px"
                :style="{ color: s.accent }"
              >
                {{ s.value }}<span
                  v-if="s.suffix"
                  style="font-size: 14px; font-weight: 400; margin-left: 1px"
                >{{ s.suffix }}</span>
              </div>
            </div>
            <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0">
              <NIcon
                :size="20"
                :color="s.accent"
              >
                <component :is="s.icon" />
              </NIcon>
            </div>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>

    <!-- Welcome (non-admin only) -->
    <NCard
      v-if="!isAdmin"
      title="本周工作"
      :bordered="true"
      style="margin-top: 24px"
    >
      <div style="color: var(--ink-soft); line-height: 1.7">
        <p>{{ thisWeek.week_start }} 至 {{ thisWeek.week_end }}</p>
        <p>已填报 {{ thisWeek.total_hours ?? 0 }}h，{{ (thisWeek.work_logs || []).length }} 条记录。</p>
      </div>
    </NCard>
  </div>
</template>
