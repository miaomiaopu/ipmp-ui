import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  apply(mode.value)

  return { mode, apply, toggle }
})
