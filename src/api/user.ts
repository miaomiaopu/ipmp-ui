import api from './request'

export function getUsers(params: Record<string, any>) { return api.get('/users', { params }) }
export function getUser(id: string) { return api.get(`/users/${id}`) }
export function createUser(data: Record<string, any>) { return api.post('/users', data) }
export function updateUser(id: string, data: Record<string, any>) { return api.post(`/users/${id}/update`, data) }
export function deleteUser(id: string) { return api.post(`/users/${id}/delete`) }
export function resetPassword(id: string, data: { new_password: string }) { return api.post(`/users/${id}/reset-password`, data) }
export function changePassword(data: { old_password: string; new_password: string }) { return api.post('/auth/change-password', data) }
