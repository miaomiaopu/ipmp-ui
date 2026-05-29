import api from './request'

export function getTasks(params: Record<string, any>) { return api.get('/tasks', { params }) }
export function getTask(id: string) { return api.get(`/tasks/${id}`) }
export function createTask(data: Record<string, any>) { return api.post('/tasks', data) }
export function updateTask(id: string, data: Record<string, any>) { return api.post(`/tasks/${id}/update`, data) }
export function updateTaskStatus(id: string, data: { status: string }) { return api.post(`/tasks/${id}/status`, data) }
export function deleteTask(id: string) { return api.post(`/tasks/${id}/delete`) }
