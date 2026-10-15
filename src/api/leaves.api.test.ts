import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateLeaveInput, LeaveRequest, PaginatedResponse } from '../types/workforce'
import { apiClient } from './client'
import {
  approveLeave,
  cancelLeave,
  createLeave,
  getAdminLeaves,
  getLeave,
  getMyLeaves,
  rejectLeave,
} from './leaves.api'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const leave: LeaveRequest = {
  id: 'e8c3ca90-3061-4c04-bd5a-778176a1cc45',
  employeeId: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
  leaveType: 'ANNUAL',
  startDate: '2026-11-02T00:00:00.000Z',
  endDate: '2026-11-04T00:00:00.000Z',
  reason: 'Family event',
  status: 'PENDING',
  reviewedById: null,
  reviewedAt: null,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
  employee: {
    id: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
    fullName: 'Nimal Perera',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    user: { id: 'user-id', email: 'employee@example.com' },
  },
  reviewedBy: null,
}

const listResponse: PaginatedResponse<LeaveRequest> = {
  data: [leave],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
}

beforeEach(() => vi.clearAllMocks())

describe('leave API workflows', () => {
  it('lists only the current employee requests', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })
    await expect(getMyLeaves({ page: 1, limit: 10 })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith('/leaves/me', { params: { page: 1, limit: 10 } })
  })

  it('lists admin requests with the verified status filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })
    await expect(getAdminLeaves({ page: 1, limit: 10, status: 'PENDING' })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith('/leaves', {
      params: { page: 1, limit: 10, status: 'PENDING' },
    })
  })

  it('gets an authorized leave request by ID', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { leave } })
    await expect(getLeave(leave.id)).resolves.toEqual(leave)
    expect(apiClient.get).toHaveBeenCalledWith(`/leaves/${leave.id}`)
  })

  it('submits only the verified leave request fields', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { leave } })
    const input: CreateLeaveInput = {
      leaveType: 'ANNUAL',
      startDate: '2026-11-02',
      endDate: '2026-11-04',
      reason: 'Family event',
    }
    await expect(createLeave(input)).resolves.toEqual(leave)
    expect(apiClient.post).toHaveBeenCalledWith('/leaves', input)
  })

  it.each([
    ['approve', approveLeave],
    ['reject', rejectLeave],
    ['cancel', cancelLeave],
  ])('%ss a request without an invented body', async (action, request) => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { leave } })
    await expect(request(leave.id)).resolves.toEqual(leave)
    expect(apiClient.patch).toHaveBeenCalledWith(`/leaves/${leave.id}/${action}`)
  })
})
