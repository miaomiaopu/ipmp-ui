import api from './request'
import type { LoginResponse, UserBrief } from '@/types'

export function login(username: string, password: string) {
  return api.post<{ code: number; data: LoginResponse }>('/auth/login', { username, password })
}

export function refreshToken(refreshToken: string) {
  return api.post<{ code: number; data: LoginResponse }>('/auth/refresh', { refresh_token: refreshToken })
}

export function logout() {
  return api.post('/auth/logout')
}

export function getMe() {
  return api.get<{ code: number; data: UserBrief }>('/auth/me')
}
