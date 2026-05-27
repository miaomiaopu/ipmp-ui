import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserBrief } from '@/types'
import { login as loginApi } from '@/api/auth'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserBrief | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  function setupFromStorage() {
    accessToken.value = localStorage.getItem('access_token')
    refreshToken.value = localStorage.getItem('refresh_token')
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try { user.value = JSON.parse(userStr) } catch { /* ignore */ }
    }
  }

  async function login(username: string, password: string) {
    const res = await loginApi(username, password)
    const data = res.data.data
    accessToken.value = data.access_token
    refreshToken.value = data.refresh_token
    user.value = data.user
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  return { user, accessToken, refreshToken, isLoggedIn, setupFromStorage, login, clearAuth }
})
