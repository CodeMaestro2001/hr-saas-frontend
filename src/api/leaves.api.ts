import type {
  CreateLeaveInput,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  PaginatedResponse,
} from '../types/workforce'
import { apiClient } from './client'

export interface ListLeavesParams {
  page?: number
  limit?: number
  status?: LeaveStatus
  leaveType?: LeaveType
}

export async function getAdminLeaves(params: ListLeavesParams = {}) {
  const response = await apiClient.get<PaginatedResponse<LeaveRequest>>('/leaves', { params })
  return response.data
}

export async function getMyLeaves(params: ListLeavesParams = {}) {
  const response = await apiClient.get<PaginatedResponse<LeaveRequest>>('/leaves/me', { params })
  return response.data
}

export async function getLeave(leaveId: string) {
  const response = await apiClient.get<{ leave: LeaveRequest }>(`/leaves/${leaveId}`)
  return response.data.leave
}

export async function createLeave(input: CreateLeaveInput) {
  const response = await apiClient.post<{ leave: LeaveRequest }>('/leaves', input)
  return response.data.leave
}

export async function approveLeave(leaveId: string) {
  const response = await apiClient.patch<{ leave: LeaveRequest }>(`/leaves/${leaveId}/approve`)
  return response.data.leave
}

export async function rejectLeave(leaveId: string) {
  const response = await apiClient.patch<{ leave: LeaveRequest }>(`/leaves/${leaveId}/reject`)
  return response.data.leave
}

export async function cancelLeave(leaveId: string) {
  const response = await apiClient.patch<{ leave: LeaveRequest }>(`/leaves/${leaveId}/cancel`)
  return response.data.leave
}
