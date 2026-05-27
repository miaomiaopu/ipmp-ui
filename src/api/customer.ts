import api from './request'
import type { Customer, Pagination } from '@/types'

export function getCustomers(params: { page?: number; page_size?: number; keyword?: string; status?: string }) {
  return api.get<{ code: number; data: Customer[]; pagination: Pagination }>('/customers', { params })
}

export function getCustomer(id: string) {
  return api.get<{ code: number; data: { customer: Customer; project_count: number } }>(`/customers/${id}`)
}

export function createCustomer(data: Partial<Customer>) {
  return api.post<{ code: number; data: Customer }>('/customers', data)
}

export function updateCustomer(id: string, data: Partial<Customer>) {
  return api.post(`/customers/${id}/update`, data)
}

export function deleteCustomer(id: string) {
  return api.post(`/customers/${id}/delete`)
}
