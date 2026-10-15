export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface Employee {
  id: string
  userId: string
  email: string
  fullName: string
  department: string
  jobTitle: string
  hireDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeInput {
  email: string
  password: string
  fullName: string
  department: string
  jobTitle: string
  hireDate: string
}

export type UpdateEmployeeInput = Omit<CreateEmployeeInput, 'password'>

export type LeaveType = 'ANNUAL' | 'SICK' | 'CASUAL'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface CreateLeaveInput {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export interface LeaveEmployee {
  id: string
  fullName: string
  department: string
  jobTitle: string
  user: {
    id: string
    email: string
  }
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  reviewedById: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  employee: LeaveEmployee
  reviewedBy: {
    id: string
    email: string
  } | null
}

export interface AttendanceEmployee {
  id: string
  fullName: string
  department: string
  jobTitle: string
  user: {
    email: string
  }
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  checkInTime: string
  checkOutTime: string | null
  workedMinutes: number | null
  createdAt: string
  updatedAt: string
  employee: AttendanceEmployee
}
