import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { checkIn, checkOut, getMyAttendance, getMyTodayAttendance } from '../api/attendance.api'
import type { AttendanceRecord } from '../types/workforce'
import { AttendancePage } from './AttendancePage'

vi.mock('../api/attendance.api', () => ({
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  getMyAttendance: vi.fn(),
  getMyTodayAttendance: vi.fn(),
}))

const openRecord: AttendanceRecord = {
  id: 'attendance-id',
  employeeId: 'employee-id',
  checkInTime: '2026-10-15T08:00:00.000Z',
  checkOutTime: null,
  workedMinutes: null,
  createdAt: '2026-10-15T08:00:00.000Z',
  updatedAt: '2026-10-15T08:00:00.000Z',
  employee: {
    id: 'employee-id',
    fullName: 'Nimal Perera',
    department: 'Engineering',
    jobTitle: 'Engineer',
    user: { email: 'employee@example.com' },
  },
}

function renderPage(today: AttendanceRecord[] = []) {
  vi.mocked(getMyTodayAttendance).mockResolvedValue(today)
  vi.mocked(getMyAttendance).mockResolvedValue({
    data: today,
    pagination: { page: 1, limit: 10, total: today.length, totalPages: today.length ? 1 : 0 },
  })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><AttendancePage /></MemoryRouter>
    </QueryClientProvider>,
  )
  return invalidateSpy
}

describe('AttendancePage actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('checks in without sending a client time and refreshes attendance caches', async () => {
    vi.mocked(checkIn).mockResolvedValue(openRecord)
    const invalidateSpy = renderPage()
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Check in' }))
    expect(checkIn).toHaveBeenCalledWith()
    expect(await screen.findByRole('status')).toHaveTextContent('You are checked in.')
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['attendance'] }))
  })

  it('checks out when the backend reports an open session', async () => {
    vi.mocked(checkOut).mockResolvedValue({ ...openRecord, checkOutTime: '2026-10-15T09:30:00.000Z', workedMinutes: 90 })
    renderPage([openRecord])
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Check out' }))
    expect(checkOut).toHaveBeenCalledWith()
    expect(await screen.findByRole('status')).toHaveTextContent('You are checked out.')
  })

  it('shows the backend 409 message and refreshes stale state', async () => {
    vi.mocked(checkIn).mockRejectedValue({
      isAxiosError: true,
      response: { status: 409, data: { error: { message: 'Employee already has an open attendance session' } } },
    })
    const invalidateSpy = renderPage()
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Check in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Employee already has an open attendance session')
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['attendance'] }))
  })

  it('shows a clear permission error for a 403 response', async () => {
    vi.mocked(checkIn).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: { error: { message: 'Only active employees can use attendance' } } },
    })
    renderPage()
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Check in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('You do not have permission to perform this action.')
  })
})
