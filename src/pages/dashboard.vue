<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NGrid, NGridItem, NCard, NIcon, NButton, NSpace,
} from 'naive-ui'
import {
  BarChartOutline, PeopleOutline, FolderOpenOutline,
  TimerOutline, PersonAddOutline, SettingsOutline,
} from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { getUsers } from '@/api/user'

const router = useRouter()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role === 'admin')

const userTotal = ref(0)
const adminCount = ref(0)

const userStats = [
  { label: '总用户数', value: userTotal, icon: PeopleOutline, accent: 'var(--accent)' },
  { label: '管理员', value: adminCount, icon: PersonAddOutline, accent: 'var(--warning)' },
]

const bizStats = [
  { label: '活跃项目', value: '-', icon: FolderOpenOutline, accent: 'var(--accent)' },
  { label: '本周任务', value: '-', icon: BarChartOutline, accent: 'var(--success)' },
  { label: '本周工时', value: '-', suffix: 'h', icon: TimerOutline, accent: 'var(--warning)' },
  { label: '待处理需求', value: '-', icon: PeopleOutline, accent: 'var(--danger)' },
]

onMounted(async () => {
  if (isAdmin.value) {
    try { const r = await getUsers({ page_size: 1000 }); userTotal.value = r.data.pagination?.total || 0; adminCount.value = (r.data.data || []).filter((u: any) => u.role === 'admin').length } catch { /* */ }
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
      title="欢迎"
      :bordered="true"
      style="margin-top: 24px"
    >
      <div style="color: var(--ink-soft); line-height: 1.7">
        <p>欢迎使用 IPMP 项目管理系统。</p>
        <p>通过左侧导航栏或底部 Tab 选择功能模块。</p>
        <p style="margin-top: 8px; font-size: 13px; color: var(--ink-muted)">
          连接后端数据库后将实时展示统计数据和本周工作摘要。
        </p>
      </div>
    </NCard>
  </div>
</template>
