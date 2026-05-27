import api from './request'
import type { Project, Pagination } from '@/types'

export function getProjects(params: {
  page?: number; page_size?: number; keyword?: string
  status?: string; customer_id?: string
}) {
  return api.get<{ code: number; data: Project[]; pagination: Pagination }>('/projects', { params })
}

export function getProject(id: string) {
  return api.get<{ code: number; data: Project & { task_count: number; requirement_count: number } }>(`/projects/${id}`)
}

export function createProject(data: Partial<Project>) {
  return api.post<{ code: number; data: Project }>('/projects', data)
}

export function updateProject(id: string, data: Partial<Project>) {
  return api.post(`/projects/${id}/update`, data)
}

export function deleteProject(id: string) {
  return api.post(`/projects/${id}/delete`)
}
