import api from './request'

export function getAIConfig() { return api.get('/ai-config') }
export function updateAIConfig(data: Record<string, any>) { return api.post('/ai-config/update', data) }
export function deleteAIConfig() { return api.post('/ai-config/delete') }
