<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout, NLayoutHeader, NLayoutContent, NMenu, NButton, NIcon,
  NSpace, NDrawer, NDrawerContent,
} from 'naive-ui'
import {
  PeopleOutline, FolderOpenOutline,
  LogOutOutline, SunnyOutline, MoonOutline, MenuOutline,
  BarChartOutline, ListOutline, CheckmarkCircleOutline,
  TimerOutline, SettingsOutline, PersonAddOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import type { MenuOption } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()

// 响应式断点: <640 手机, 640-1023 平板, >=1024 桌面
const windowWidth = ref(window.innerWidth)
const isMobile  = computed(() => windowWidth.value < 640)
const isTablet  = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
const isDesktop = computed(() => windowWidth.value >= 1024)
const showSidebar = computed(() => isDesktop.value || isTablet.value)

function onResize() { windowWidth.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

const isAdmin = computed(() => auth.user?.role === 'admin')

const I = (icon: any) => () => h(NIcon, null, () => h(icon))

const adminMenuOptions: MenuOption[] = [
  { label: '仪表盘',    key: '/dashboard', icon: I(BarChartOutline) },
  { label: '用户管理',  key: '/users',     icon: I(PersonAddOutline) },
  { label: '个人设置',  key: '/settings',  icon: I(SettingsOutline) },
]

const userMenuOptions: MenuOption[] = [
  { label: '仪表盘',    key: '/dashboard',    icon: I(BarChartOutline) },
  { label: '客户管理',  key: '/customers',     icon: I(PeopleOutline) },
  { label: '项目管理',  key: '/projects',      icon: I(FolderOpenOutline) },
  { label: '任务管理',  key: '/tasks',         icon: I(ListOutline) },
  { label: '需求管理',  key: '/requirements',  icon: I(CheckmarkCircleOutline) },
  { label: '工时录入',  key: '/work-logs',     icon: I(TimerOutline) },
  { label: '个人设置',  key: '/settings',      icon: I(SettingsOutline) },
]

const menuOptions = computed(() => isAdmin.value ? adminMenuOptions : userMenuOptions)

const mobileTabOptions = computed(() =>
  isAdmin.value
    ? [{ label: '概览', key: '/dashboard', icon: I(BarChartOutline) }]
    : [
        { label: '概览', key: '/dashboard',   icon: I(BarChartOutline) },
        { label: '客户', key: '/customers',    icon: I(PeopleOutline) },
        { label: '项目', key: '/projects',     icon: I(FolderOpenOutline) },
        { label: '工时', key: '/work-logs',    icon: I(TimerOutline) },
      ],
)

const currentKey = computed(() => {
  const p = route.path
  if (p.startsWith('/users'))         return '/users'
  if (p.startsWith('/customers'))     return '/customers'
  if (p.startsWith('/projects'))      return '/projects'
  if (p.startsWith('/tasks'))         return '/tasks'
  if (p.startsWith('/requirements'))  return '/requirements'
  if (p.startsWith('/work-logs'))     return '/work-logs'
  if (p.startsWith('/settings'))      return '/settings'
  return '/dashboard'
})

const drawerOpen = ref(false)

function navTo(key: string) {
  router.push(key)
  drawerOpen.value = false
}

function handleLogout() {
  auth.clearAuth()
  router.push('/login')
}
</script>

<template>
  <NLayout style="height: 100vh">
    <!-- Header -->
    <NLayoutHeader
      bordered
      style="height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px"
    >
      <div style="display: flex; align-items: center; gap: 10px">
        <NButton
          v-if="!showSidebar"
          quaternary
          size="small"
          @click="drawerOpen = true"
        >
          <template #icon>
            <NIcon><MenuOutline /></NIcon>
          </template>
        </NButton>
        <span style="font-weight: 700; font-size: 16px; letter-spacing: -0.3px; color: var(--ink)">
          IPMP
        </span>
        <span
          class="hide-mobile"
          style="color: var(--ink-muted); font-size: 12px"
        >
          项目管理系统
        </span>
      </div>

      <NSpace
        :size="4"
        align="center"
      >
        <NButton
          quaternary
          size="small"
          @click="theme.toggle()"
        >
          <template #icon>
            <NIcon><SunnyOutline v-if="theme.mode === 'dark'" /><MoonOutline v-else /></NIcon>
          </template>
        </NButton>

        <span
          class="hide-mobile"
          style="font-size: 13px; color: var(--ink-muted)"
        >
          {{ auth.user?.display_name || auth.user?.username }}
        </span>
        <NButton
          quaternary
          size="small"
          @click="handleLogout"
        >
          <template #icon>
            <NIcon><LogOutOutline /></NIcon>
          </template>
          <span class="hide-mobile">退出</span>
        </NButton>
      </NSpace>
    </NLayoutHeader>

    <NLayout
      has-sider
      style="flex: 1; overflow: hidden"
    >
      <!-- PC/Tablet Sidebar -->
      <div
        v-if="showSidebar"
        style="width: 200px; border-right: 1px solid var(--rule); background: var(--surface); padding-top: 8px; flex-shrink: 0; overflow-y: auto"
      >
        <NMenu
          :value="currentKey"
          :options="menuOptions"
          :collapsed="false"
          @update:value="navTo"
        />
      </div>

      <!-- Content -->
      <NLayoutContent
        :content-style="{
          padding: isMobile ? '16px' : '24px',
          background: 'var(--paper)',
          overflowY: 'auto',
          paddingBottom: isMobile ? '72px' : '24px',
        }"
      >
        <router-view />
      </NLayoutContent>
    </NLayout>

    <!-- Mobile Bottom Tab -->
    <div
      v-if="isMobile"
      style="
        position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
        background: var(--surface); border-top: 1px solid var(--rule);
        display: flex; align-items: center; z-index: 100;
      "
    >
      <div
        v-for="tab in mobileTabOptions"
        :key="tab.key"
        :style="{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2px',
          cursor: 'pointer', padding: '6px 0',
          color: currentKey === tab.key ? 'var(--accent)' : 'var(--ink-muted)',
          fontWeight: currentKey === tab.key ? 600 : 400,
        }"
        @click="navTo(tab.key)"
      >
        <component :is="tab.icon" />
        <span style="font-size: 11px">{{ tab.label }}</span>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <NDrawer
      v-model:show="drawerOpen"
      :width="240"
      placement="left"
    >
      <NDrawerContent
        title="导航"
        body-content-style="padding: 8px 0"
      >
        <NMenu
          :value="currentKey"
          :options="menuOptions"
          @update:value="navTo"
        />
      </NDrawerContent>
    </NDrawer>
  </NLayout>
</template>
