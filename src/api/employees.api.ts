import type {
  CreateEmployeeInput,
  Employee,
  PaginatedResponse,
  UpdateEmployeeInput,
} from '../types/workforce'
import { apiClient } from './client'

const DASHBOARD_PAGE_SIZE = 100

export interface ListEmployeesParams {
  page: number
  limit: number
  search?: string
}

export async function getEmployees(params: ListEmployeesParams) {
  const response = await apiClient.get<PaginatedResponse<Employee>>('/employees', { params })
  return response.data
}

export async function getEmployeeProfile() {
  const response = await apiClient.get<{ employee: Employee }>('/employees/me')
  return response.data.employee
}

export async function getAllEmployees() {
  const firstPage = await getEmployees({ page: 1, limit: DASHBOARD_PAGE_SIZE })

  if (firstPage.pagination.totalPages <= 1) {
    return firstPage.data
  }

  const remainingPages = Array.from(
    { length: firstPage.pagination.totalPages - 1 },
    (_, index) => index + 2,
  )
  const responses = await Promise.all(
    remainingPages.map((page) => getEmployees({ page, limit: DASHBOARD_PAGE_SIZE })),
  )

  return [firstPage.data, ...responses.map((response) => response.data)].flat()
}

export async function getEmployee(employeeId: string) {
  const response = await apiClient.get<{ employee: Employee }>(`/employees/${employeeId}`)
  return response.data.employee
}

export async function createEmployee(input: CreateEmployeeInput) {
  const response = await apiClient.post<{ employee: Employee }>('/employees', input)
  return response.data.employee
}

export async function updateEmployee(employeeId: string, input: UpdateEmployeeInput) {
  const response = await apiClient.patch<{ employee: Employee }>(`/employees/${employeeId}`, input)
  return response.data.employee
}

export async function deactivateEmployee(employeeId: string) {
  const response = await apiClient.patch<{ employee: Employee }>(`/employees/${employeeId}/deactivate`)
  return response.data.employee
}
