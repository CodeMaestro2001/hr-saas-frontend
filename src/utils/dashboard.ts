import type { AttendanceRecord, Employee, LeaveStatus, LeaveType } from '../types/workforce'

export function countActiveEmployees(employees: Employee[]) {
  return employees.filter((employee) => employee.isActive).length
}

export type AttendanceState = 'CHECKED_IN' | 'CHECKED_OUT' | 'NOT_CHECKED_IN'

export function getAttendanceState(records: AttendanceRecord[]): AttendanceState {
  if (records.some((record) => record.checkOutTime === null)) {
    return 'CHECKED_IN'
  }

  return records.length > 0 ? 'CHECKED_OUT' : 'NOT_CHECKED_IN'
}

export function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatLeaveType(type: LeaveType) {
  return `${type.charAt(0)}${type.slice(1).toLowerCase()} leave`
}

export function formatLeaveStatus(status: LeaveStatus) {
  return `${status.charAt(0)}${status.slice(1).toLowerCase()}`
}

export function formatWorkedMinutes(minutes: number | null) {
  if (minutes === null) return 'In progress'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes} min`
  return remainingMinutes === 0 ? `${hours} hr` : `${hours} hr ${remainingMinutes} min`
}
