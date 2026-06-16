import api from './request'

export function getWorkLogs(params: Record<string, any>) { return api.get('/work-logs', { params }) }
export function getWorkLogStats(params: Record<string, any>) { return api.get('/work-logs/stats', { params }) }
export function createWorkLog(data: Record<string, any>) { return api.post('/work-logs', data) }
export function updateWorkLog(id: string, data: Record<string, any>) { return api.post(`/work-logs/${id}/update`, data) }
export function deleteWorkLog(id: string) { return api.post(`/work-logs/${id}/delete`) }
export function exportWorkLogs(params: Record<string, any>) {
  return api.get('/work-logs/export', { params, responseType: 'blob' })
}
