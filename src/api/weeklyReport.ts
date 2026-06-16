import api from './request'

export function getWeeklyReports(params: Record<string, any>) {
  return api.get('/weekly-reports', { params })
}

export function getWeeklyReport(id: string) {
  return api.get(`/weekly-reports/${id}`)
}

export function generateWeeklyReport(data: Record<string, any>) {
  return api.post('/weekly-reports/generate', data)
}

export function updateWeeklyReport(id: string, data: Record<string, any>) {
  return api.post(`/weekly-reports/${id}/update`, data)
}

export function reviewWeeklyReport(id: string) {
  return api.post(`/weekly-reports/${id}/review`)
}

export function finalizeWeeklyReport(id: string) {
  return api.post(`/weekly-reports/${id}/finalize`)
}
