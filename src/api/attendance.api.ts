import type { AttendanceRecord, PaginatedResponse } from '../types/workforce'
import { apiClient } from './client'

export interface ListAttendanceParams {
  page: number
  limit: number
}

export async function checkIn() {
  const response = await apiClient.post<{ attendance: AttendanceRecord }>('/attendance/check-in')
  return response.data.attendance
}

export async function checkOut() {
  const response = await apiClient.post<{ attendance: AttendanceRecord }>('/attendance/check-out')
  return response.data.attendance
}

export async function getMyAttendance(params: ListAttendanceParams) {
  const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance/me', { params })
  return response.data
}

export async function getRecentAttendance(limit = 5) {
  return getAdminAttendance({ page: 1, limit })
}

export async function getAdminAttendance(params: ListAttendanceParams) {
  const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance', { params })
  return response.data
}

export async function getEmployeeAttendance(employeeId: string, params: ListAttendanceParams) {
  const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
    `/attendance/employee/${employeeId}`,
    { params },
  )
  return response.data
}

export async function getMyTodayAttendance() {
  const response = await apiClient.get<{ data: AttendanceRecord[] }>('/attendance/today')
  return response.data.data
}
