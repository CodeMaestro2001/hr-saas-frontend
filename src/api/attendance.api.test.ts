import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AttendanceRecord, PaginatedResponse } from '../types/workforce'
import { apiClient } from './client'
import {
  checkIn,
  checkOut,
  getAdminAttendance,
  getEmployeeAttendance,
  getMyAttendance,
  getMyTodayAttendance,
} from './attendance.api'

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const attendance: AttendanceRecord = {
  id: 'aa80992c-5444-4d75-baf9-d34af497f916',
  employeeId: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
  checkInTime: '2026-10-15T21:30:00.000Z',
  checkOutTime: '2026-10-16T00:00:00.000Z',
  workedMinutes: 150,
  createdAt: '2026-10-15T21:30:00.000Z',
  updatedAt: '2026-10-16T00:00:00.000Z',
  employee: {
    id: '8f22ac1e-a1b8-4176-a3fd-e83a0e156446',
    fullName: 'Nimal Perera',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    user: { email: 'employee@example.com' },
  },
}
const listResponse: PaginatedResponse<AttendanceRecord> = {
  data: [attendance],
  pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
}

describe('attendance API workflows', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['check-in', checkIn],
    ['check-out', checkOut],
  ])('posts %s without client-generated data', async (path, request) => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { attendance } })
    await expect(request()).resolves.toEqual(attendance)
    expect(apiClient.post).toHaveBeenCalledWith(`/attendance/${path}`)
  })

  it('loads the current employee history with verified pagination', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })
    await expect(getMyAttendance({ page: 1, limit: 10 })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith('/attendance/me', { params: { page: 1, limit: 10 } })
  })

  it('loads today records from the unpaginated data envelope', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: [attendance] } })
    await expect(getMyTodayAttendance()).resolves.toEqual([attendance])
    expect(apiClient.get).toHaveBeenCalledWith('/attendance/today')
  })

  it('loads paginated attendance for administrators', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })
    await expect(getAdminAttendance({ page: 1, limit: 10 })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith('/attendance', { params: { page: 1, limit: 10 } })
  })

  it('uses the employee record ID for admin employee history', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: listResponse })
    await expect(getEmployeeAttendance(attendance.employeeId, { page: 1, limit: 10 })).resolves.toEqual(listResponse)
    expect(apiClient.get).toHaveBeenCalledWith(`/attendance/employee/${attendance.employeeId}`, {
      params: { page: 1, limit: 10 },
    })
  })
})
