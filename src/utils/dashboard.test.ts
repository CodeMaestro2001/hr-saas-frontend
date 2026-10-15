import { describe, expect, it } from 'vitest'
import type { AttendanceRecord, Employee } from '../types/workforce'
import { countActiveEmployees, formatWorkedMinutes, getAttendanceState } from './dashboard'

const makeEmployee = (isActive: boolean): Employee => ({
  id: crypto.randomUUID(),
  userId: crypto.randomUUID(),
  email: 'employee@example.com',
  fullName: 'Test Employee',
  department: 'Engineering',
  jobTitle: 'Engineer',
  hireDate: '2025-01-01T00:00:00.000Z',
  isActive,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

const makeAttendance = (checkOutTime: string | null): AttendanceRecord => ({
  id: crypto.randomUUID(),
  employeeId: crypto.randomUUID(),
  checkInTime: '2026-10-15T08:00:00.000Z',
  checkOutTime,
  workedMinutes: checkOutTime ? 90 : null,
  createdAt: '2026-10-15T08:00:00.000Z',
  updatedAt: '2026-10-15T08:00:00.000Z',
  employee: {
    id: crypto.randomUUID(),
    fullName: 'Test Employee',
    department: 'Engineering',
    jobTitle: 'Engineer',
    user: { email: 'employee@example.com' },
  },
})

describe('dashboard data helpers', () => {
  it('counts only active employee profiles', () => {
    expect(countActiveEmployees([
      makeEmployee(true),
      makeEmployee(false),
      makeEmployee(true),
    ])).toBe(2)
  })

  it('reports checked in when any attendance session remains open', () => {
    expect(getAttendanceState([
      makeAttendance('2026-10-15T09:30:00.000Z'),
      makeAttendance(null),
    ])).toBe('CHECKED_IN')
  })

  it('reports checked out when today contains only completed sessions', () => {
    expect(getAttendanceState([
      makeAttendance('2026-10-15T09:30:00.000Z'),
    ])).toBe('CHECKED_OUT')
  })

  it('reports not checked in when today has no attendance', () => {
    expect(getAttendanceState([])).toBe('NOT_CHECKED_IN')
  })

  it.each([
    [null, 'In progress'],
    [25, '25 min'],
    [60, '1 hr'],
    [95, '1 hr 35 min'],
    [150, '2 hr 30 min'],
  ])('formats worked minutes %s as %s', (minutes, expected) => {
    expect(formatWorkedMinutes(minutes)).toBe(expected)
  })
})
