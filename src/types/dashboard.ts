import type { LeaveType } from './workforce'

export interface AdminDashboardSummary {
  asOf: string
  timeZone: 'UTC'
  activeEmployees: number
  presentToday: number
  absentToday: number
  pendingLeaveCount: number
  currentlyCheckedIn: {
    count: number
    employees: Array<{
      attendanceId: string
      checkInTime: string
      id: string
      fullName: string
      department: string
      jobTitle: string
    }>
  }
}

export interface EmployeeDashboardSummary {
  asOf: string
  timeZone: 'UTC'
  year: number
  employee: { id: string; fullName: string; department: string; jobTitle: string }
  monthlyAttendance: { month: string; presentDays: number; sessions: number; workedMinutes: number }
  leaveBalance: Array<{ leaveType: LeaveType; allowance: number; used: number; remaining: number }>
  totalRemainingLeave: number
  upcomingApprovedLeave: { id: string; leaveType: LeaveType; startDate: string; endDate: string; reason: string } | null
  currentAttendance:
    | { status: 'CHECKED_IN'; id: string; checkInTime: string }
    | { status: 'NOT_CHECKED_IN' }
  pendingLeaveCount: number
}
