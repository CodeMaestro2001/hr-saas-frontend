import type { AdminDashboardSummary, EmployeeDashboardSummary } from '../types/dashboard'
import { apiClient } from './client'

export async function getAdminDashboardSummary() {
  const response = await apiClient.get<{ summary: AdminDashboardSummary }>('/dashboard/admin')
  return response.data.summary
}

export async function getEmployeeDashboardSummary() {
  const response = await apiClient.get<{ summary: EmployeeDashboardSummary }>('/dashboard/employee')
  return response.data.summary
}
