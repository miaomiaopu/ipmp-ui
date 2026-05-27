import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(
    (localStorage.getItem('theme') as ThemeMode) || 'light'
  )

  function apply(m: ThemeMode) {
    mode.value = m
    localStorage.setItem('theme', m)
    document.documentElement.setAttribute('data-theme', m)
  }

  function toggle() {
    apply(mode.value === 'light' ? 'dark' : 'light')
  }

  // 初始化
  apply(mode.value)

  return { mode, apply, toggle }
})
