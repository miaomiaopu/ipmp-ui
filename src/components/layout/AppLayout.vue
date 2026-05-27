<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout, NLayoutHeader, NLayoutContent, NMenu, NButton, NIcon,
  NSpace, NBreadcrumb, NBreadcrumbItem, NDrawer, NDrawerContent,
  NGrid, NGridItem,
} from 'naive-ui'
import {
  GridOutline, PeopleOutline, FolderOpenOutline,
  LogOutOutline, SunnyOutline, MoonOutline, MenuOutline,
  BarChartOutline,
} from '@vicons/ionicons5'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import type { MenuOption } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()

// 响应式断点
const windowWidth = ref(window.innerWidth)
const isMobile  = computed(() => windowWidth.value < 640)
const isTablet  = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
const isDesktop = computed(() => windowWidth.value >= 1024)
const showSidebar = computed(() => isDesktop.value || isTablet.value)

function onResize() { windowWidth.value = window.innerWidth }

onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

// 菜单定义
const menuOptions: MenuOption[] = [
  { label: '仪表盘',   key: '/dashboard',   icon: () => h(NIcon, null, () => h(BarChartOutline)) },
  { label: '客户管理', key: '/customers',    icon: () => h(NIcon, null, () => h(PeopleOutline)) },
  { label: '项目管理', key: '/projects',     icon: () => h(NIcon, null, () => h(FolderOpenOutline)) },
]

const mobileTabOptions = [
  { label: '概览', key: '/dashboard', icon: () => h(NIcon, null, () => h(BarChartOutline)) },
  { label: '客户', key: '/customers',  icon: () => h(NIcon, null, () => h(PeopleOutline)) },
  { label: '项目', key: '/projects',   icon: () => h(NIcon, null, () => h(FolderOpenOutline)) },
]

const currentKey = computed(() => {
  const p = route.path
  if (p.startsWith('/customers')) return '/customers'
  if (p.startsWith('/projects'))  return '/projects'
  return '/dashboard'
})

// 移动端抽屉
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
    <!-- ═══ Header ═══ -->
    <NLayoutHeader
      bordered
      style="height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px"
    >
      <div style="display: flex; align-items: center; gap: 10px">
        <NButton v-if="!showSidebar" quaternary size="small" @click="drawerOpen = true">
          <template #icon><NIcon><MenuOutline /></NIcon></template>
        </NButton>
        <span style="font-weight: 700; font-size: 16px; letter-spacing: -0.3px; color: var(--ink)">
          IPMP
        </span>
        <span class="hide-mobile" style="color: var(--ink-muted); font-size: 12px">
          项目管理系统
        </span>
      </div>

      <NSpace :size="4" align="center">
        <NButton quaternary size="small" @click="theme.toggle()">
          <template #icon>
            <NIcon><SunnyOutline v-if="theme.mode === 'dark'" /><MoonOutline v-else /></NIcon>
          </template>
        </NButton>

        <span class="hide-mobile" style="font-size: 13px; color: var(--ink-muted)">
          {{ auth.user?.display_name || auth.user?.username }}
        </span>
        <NButton quaternary size="small" @click="handleLogout">
          <template #icon><NIcon><LogOutOutline /></NIcon></template>
          <span class="hide-mobile">退出</span>
        </NButton>
      </NSpace>
    </NLayoutHeader>

    <NLayout has-sider style="flex: 1; overflow: hidden">
      <!-- ═══ PC/Tablet Sidebar ═══ -->
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

      <!-- ═══ Content ═══ -->
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

    <!-- ═══ Mobile Bottom Tab ═══ -->
    <div
      v-if="isMobile"
      style="
        position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
        background: var(--surface); border-top: 1px solid var(--rule);
        display: flex; align-items: center; z-index: 100;
      "
    >
      <div
        v-for="tab in mobileTabOptions" :key="tab.key"
        @click="navTo(tab.key)"
        :style="{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '2px',
          cursor: 'pointer', padding: '6px 0',
          color: currentKey === tab.key ? 'var(--accent)' : 'var(--ink-muted)',
          fontWeight: currentKey === tab.key ? 600 : 400,
        }"
      >
        <component :is="tab.icon" />
        <span style="font-size: 11px">{{ tab.label }}</span>
      </div>
    </div>

    <!-- ═══ Mobile Drawer ═══ -->
    <NDrawer v-model:show="drawerOpen" :width="240" placement="left">
      <NDrawerContent title="导航" body-content-style="padding: 8px 0">
        <NMenu
          :value="currentKey"
          :options="menuOptions"
          @update:value="navTo"
        />
      </NDrawerContent>
    </NDrawer>
  </NLayout>
</template>
