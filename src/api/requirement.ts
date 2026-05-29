import api from './request'

export function getRequirements(params: Record<string, any>) { return api.get('/requirements', { params }) }
export function getRequirement(id: string) { return api.get(`/requirements/${id}`) }
export function createRequirement(data: Record<string, any>) { return api.post('/requirements', data) }
export function updateRequirement(id: string, data: Record<string, any>) { return api.post(`/requirements/${id}/update`, data) }
export function deleteRequirement(id: string) { return api.post(`/requirements/${id}/delete`) }
