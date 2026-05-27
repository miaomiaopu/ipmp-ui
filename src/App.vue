<script setup lang="ts">
import { computed } from 'vue'
import {
  NMessageProvider, NConfigProvider, zhCN, dateZhCN, darkTheme,
  type GlobalThemeOverrides,
} from 'naive-ui'
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

const lightOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#2f4a6e',
    primaryColorHover: '#3d5f8c',
    primaryColorPressed: '#1e3552',
    primaryColorSuppl: '#2f4a6e',
    successColor: '#4e7a5e',
    warningColor: '#c0903c',
    errorColor: '#c4724f',
    fontFamily: "inherit",
    borderRadius: '6px',
  },
  Card: { borderRadius: '6px', borderColor: '#e6e2d6' },
  Menu: {
    itemTextColor: '#6b7189',
    itemTextColorHover: '#1c1f2e',
    itemTextColorActive: '#2f4a6e',
    itemColorActive: '#f0ede5',
    itemColorActiveHover: '#ebe7dd',
  },
  Tag: { borderRadius: '4px' },
  Input: { borderRadius: '6px' },
}

const darkOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#7b9fcc',
    primaryColorHover: '#93b3da',
    primaryColorPressed: '#5e85b5',
    primaryColorSuppl: '#7b9fcc',
    successColor: '#6ba87a',
    warningColor: '#d4a03c',
    errorColor: '#d48b6a',
    fontFamily: "inherit",
    borderRadius: '6px',
  },
  Card: { borderRadius: '6px', borderColor: '#2a2d3a' },
  Menu: {
    itemTextColor: '#787e93',
    itemTextColorHover: '#e4e6ed',
    itemTextColorActive: '#7b9fcc',
    itemColorActive: '#222530',
    itemColorActiveHover: '#2a2d3a',
  },
  Tag: { borderRadius: '4px' },
  Input: { borderRadius: '6px' },
}

const isDark = computed(() => themeStore.mode === 'dark')
const overrides = computed(() => isDark.value ? darkOverrides : lightOverrides)
</script>

<template>
  <NConfigProvider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="isDark ? darkTheme : null"
    :theme-overrides="overrides"
  >
    <NMessageProvider>
      <router-view />
    </NMessageProvider>
  </NConfigProvider>
</template>
