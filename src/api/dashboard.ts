import api from './request'

export function getDashboardStats() {
  return api.get('/dashboard/stats')
}

export function getDashboardThisWeek() {
  return api.get('/dashboard/this-week')
}
