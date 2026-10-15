import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, IdCard, ListChecks, UserRound } from 'lucide-react'
import { getMyTodayAttendance } from '../api/attendance.api'
import { getEmployeeProfile } from '../api/employees.api'
import { getMyLeaves } from '../api/leaves.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { QuickActions, type QuickAction } from '../components/dashboard/QuickActions'
import { RecentActivity, type ActivityItem, type ActivityTone } from '../components/dashboard/RecentActivity'
import { StatCard } from '../components/dashboard/StatCard'
import { useAuth } from '../hooks/useAuth'
import type { LeaveStatus } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'
import {
  formatDateOnly,
  formatDateTime,
  formatLeaveStatus,
  formatLeaveType,
  getAttendanceState,
} from '../utils/dashboard'

const quickActions: QuickAction[] = [
  {
    label: 'My profile',
    description: 'View your employee information',
    href: '/profile',
    icon: <UserRound className="size-5" />,
  },
  {
    label: 'Attendance status',
    description: 'Review today’s attendance',
    href: '/attendance',
    icon: <Clock3 className="size-5" />,
  },
  {
    label: 'Pending leave',
    description: 'See requests awaiting review',
    href: '/leaves',
    icon: <ListChecks className="size-5" />,
  },
  {
    label: 'Recent leave requests',
    description: 'Review your latest requests',
    href: '/leaves',
    icon: <CalendarDays className="size-5" />,
  },
]

const leaveTone: Record<LeaveStatus, ActivityTone> = {
  PENDING: 'amber',
  APPROVED: 'emerald',
  REJECTED: 'red',
  CANCELLED: 'slate',
}

export function EmployeeDashboardPage() {
  const { user } = useAuth()
  const profileQuery = useQuery({
    queryKey: ['dashboard', 'employee', 'profile'],
    queryFn: getEmployeeProfile,
  })
  const attendanceQuery = useQuery({
    queryKey: ['dashboard', 'employee', 'attendance', 'today'],
    queryFn: getMyTodayAttendance,
  })
  const pendingLeavesQuery = useQuery({
    queryKey: ['dashboard', 'employee', 'leaves', 'pending'],
    queryFn: () => getMyLeaves({ page: 1, limit: 1, status: 'PENDING' }),
  })
  const recentLeavesQuery = useQuery({
    queryKey: ['dashboard', 'employee', 'leaves', 'recent'],
    queryFn: () => getMyLeaves({ page: 1, limit: 5 }),
  })

  const isLoading = profileQuery.isPending
    || attendanceQuery.isPending
    || pendingLeavesQuery.isPending
    || recentLeavesQuery.isPending
  const error = profileQuery.error
    ?? attendanceQuery.error
    ?? pendingLeavesQuery.error
    ?? recentLeavesQuery.error

  if (isLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <DashboardError
        message={getApiErrorMessage(error)}
        onRetry={() => {
          void Promise.all([
            profileQuery.refetch(),
            attendanceQuery.refetch(),
            pendingLeavesQuery.refetch(),
            recentLeavesQuery.refetch(),
          ])
        }}
      />
    )
  }

  const attendanceRecords = attendanceQuery.data ?? []
  const attendanceState = getAttendanceState(attendanceRecords)
  const openAttendance = attendanceRecords.find((record) => record.checkOutTime === null)
  const latestAttendance = attendanceRecords[0]
  const attendanceLabels = {
    CHECKED_IN: {
      value: 'Checked in',
      helper: openAttendance ? `Since ${formatDateTime(openAttendance.checkInTime)}` : 'Attendance session is open',
      tone: 'emerald' as const,
    },
    CHECKED_OUT: {
      value: 'Checked out',
      helper: latestAttendance?.checkOutTime
        ? `Last checkout ${formatDateTime(latestAttendance.checkOutTime)}`
        : 'Today’s attendance is complete',
      tone: 'blue' as const,
    },
    NOT_CHECKED_IN: {
      value: 'Not checked in',
      helper: 'No attendance recorded for the current UTC day',
      tone: 'slate' as const,
    },
  }
  const attendanceSummary = attendanceLabels[attendanceState]
  const recentLeaves: ActivityItem[] = (recentLeavesQuery.data?.data ?? []).map((leave) => ({
    id: leave.id,
    title: formatLeaveType(leave.leaveType),
    description: `${formatDateOnly(leave.startDate)} – ${formatDateOnly(leave.endDate)}`,
    meta: `Requested ${formatDateOnly(leave.createdAt)}`,
    status: formatLeaveStatus(leave.status),
    tone: leaveTone[leave.status],
  }))

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Welcome, {profileQuery.data?.fullName}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {profileQuery.data?.jobTitle} · {profileQuery.data?.department}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <IdCard className="size-4" aria-hidden="true" />
            {user?.email}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">Employee</span>
        </div>
      </header>

      <section aria-label="Personal dashboard statistics" className="grid gap-4 sm:grid-cols-2">
        <StatCard
          id="attendance-status"
          label="My attendance status"
          value={attendanceSummary.value}
          helperText={attendanceSummary.helper}
          icon={<Clock3 className="size-5" />}
          tone={attendanceSummary.tone}
        />
        <StatCard
          id="my-pending-leaves"
          label="My pending leaves"
          value={pendingLeavesQuery.data?.pagination.total ?? 0}
          helperText="Requests currently awaiting an admin decision"
          icon={<CalendarDays className="size-5" />}
          tone="amber"
        />
      </section>

      <div className="mt-8">
        <QuickActions actions={quickActions} />
      </div>

      <div className="mt-8">
        <RecentActivity
          id="recent-leaves"
          title="Recent leave requests"
          description="Your five most recently submitted leave requests."
          items={recentLeaves}
          emptyTitle="No leave requests yet"
          emptyDescription="Your leave request history will appear here after you submit a request."
        />
      </div>
    </div>
  )
}
