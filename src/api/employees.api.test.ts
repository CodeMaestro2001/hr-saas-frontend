import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Employee, PaginatedResponse } from '../types/workforce'
import { apiClient } from './client'
import {
  createEmployee,
  deactivateEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from './employees.api'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const employee: Employee = {
  id: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
  userId: 'ad1d9ca2-eaa9-4394-bdf8-ac73cec73c75',
  email: 'employee@example.com',
  fullName: 'Nimal Perera',
  department: 'Engineering',
  jobTitle: 'Software Engineer',
  hireDate: '2025-01-15T00:00:00.000Z',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

const listResponse: PaginatedResponse<Employee> = {
  data: [employee],
  pagination: { page: 2, limit: 10, total: 12, totalPages: 2 },
}

beforeEach(() => vi.clearAllMocks())

describe('employee API workflows', () => {
  it('lists employees with server-side search and pagination', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })

    await expect(getEmployees({ page: 2, limit: 10, search: 'Nimal' })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith('/employees', {
      params: { page: 2, limit: 10, search: 'Nimal' },
    })
  })

  it('gets an employee by record ID', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { employee } })

    await expect(getEmployee(employee.id)).resolves.toEqual(employee)
    expect(apiClient.get).toHaveBeenCalledWith(`/employees/${employee.id}`)
  })

  it('creates an employee with the verified request fields', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { employee } })
    const input = {
      email: employee.email,
      password: 'initial-password',
      fullName: employee.fullName,
      department: employee.department,
      jobTitle: employee.jobTitle,
      hireDate: '2025-01-15',
    }

    await expect(createEmployee(input)).resolves.toEqual(employee)
    expect(apiClient.post).toHaveBeenCalledWith('/employees', input)
  })

  it('updates only supported employee fields', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { employee } })
    const input = {
      email: employee.email,
      fullName: employee.fullName,
      department: 'Platform Engineering',
      jobTitle: employee.jobTitle,
      hireDate: '2025-01-15',
    }

    await expect(updateEmployee(employee.id, input)).resolves.toEqual(employee)
    expect(apiClient.patch).toHaveBeenCalledWith(`/employees/${employee.id}`, input)
  })

  it('deactivates without sending an invented request body', async () => {
    const inactiveEmployee = { ...employee, isActive: false }
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { employee: inactiveEmployee } })

    await expect(deactivateEmployee(employee.id)).resolves.toEqual(inactiveEmployee)
    expect(apiClient.patch).toHaveBeenCalledWith(`/employees/${employee.id}/deactivate`)
  })
})
