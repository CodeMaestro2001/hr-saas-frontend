import { useQuery } from '@tanstack/react-query'
import { CalendarClock, ClipboardList, Clock3, UserCheck, Users } from 'lucide-react'
import { getRecentAttendance } from '../api/attendance.api'
import { getAllEmployees } from '../api/employees.api'
import { getAdminLeaves } from '../api/leaves.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { QuickActions, type QuickAction } from '../components/dashboard/QuickActions'
import { RecentActivity, type ActivityItem } from '../components/dashboard/RecentActivity'
import { StatCard } from '../components/dashboard/StatCard'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { countActiveEmployees, formatDateTime, formatWorkedMinutes } from '../utils/dashboard'

const quickActions: QuickAction[] = [
  {
    label: 'Employee directory',
    description: 'Search and manage employees',
    href: '/employees',
    icon: <Users className="size-5" />,
  },
  {
    label: 'Pending leave',
    description: 'See requests awaiting review',
    href: '/leave-management?status=PENDING',
    icon: <ClipboardList className="size-5" />,
  },
  {
    label: 'Recent attendance',
    description: 'Review the latest sessions',
    href: '/attendance-management',
    icon: <Clock3 className="size-5" />,
  },
]

export function AdminDashboardPage() {
  const { user } = useAuth()
  const employeesQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'employees'],
    queryFn: getAllEmployees,
  })
  const pendingLeavesQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'leaves', 'pending'],
    queryFn: () => getAdminLeaves({ page: 1, limit: 1, status: 'PENDING' }),
  })
  const attendanceQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'attendance', 'recent'],
    queryFn: () => getRecentAttendance(5),
  })

  const isLoading = employeesQuery.isPending || pendingLeavesQuery.isPending || attendanceQuery.isPending
  const error = employeesQuery.error ?? pendingLeavesQuery.error ?? attendanceQuery.error

  if (isLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <DashboardError
        message={getApiErrorMessage(error)}
        onRetry={() => {
          void Promise.all([
            employeesQuery.refetch(),
            pendingLeavesQuery.refetch(),
            attendanceQuery.refetch(),
          ])
        }}
      />
    )
  }

  const employees = employeesQuery.data ?? []
  const recentAttendance: ActivityItem[] = (attendanceQuery.data?.data ?? []).map((record) => ({
    id: record.id,
    title: record.employee.fullName,
    description: record.checkOutTime
      ? `${formatDateTime(record.checkInTime)} – ${formatDateTime(record.checkOutTime)}`
      : `Checked in ${formatDateTime(record.checkInTime)}`,
    meta: formatWorkedMinutes(record.workedMinutes),
    status: record.checkOutTime ? 'Completed' : 'In progress',
    tone: record.checkOutTime ? 'slate' : 'emerald',
  }))

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-700">Administration</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Workforce overview</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Signed in as <span className="font-medium text-slate-800">{user?.email}</span> with administrator access.
        </p>
      </header>

      <section id="employee-overview" aria-label="Workforce statistics" className="scroll-mt-24 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total employees"
          value={employees.length}
          helperText="All employee profiles in the system"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Active employees"
          value={countActiveEmployees(employees)}
          helperText="Employees currently marked active"
          icon={<UserCheck className="size-5" />}
          tone="emerald"
        />
        <StatCard
          id="pending-leaves"
          label="Pending leave requests"
          value={pendingLeavesQuery.data?.pagination.total ?? 0}
          helperText="Requests currently awaiting a decision"
          icon={<CalendarClock className="size-5" />}
          tone="amber"
        />
      </section>

      <div className="mt-8">
        <QuickActions actions={quickActions} />
      </div>

      <div className="mt-8">
        <RecentActivity
          id="recent-attendance"
          title="Recent attendance"
          description="Latest attendance sessions across the workforce. Times are shown in your local time zone."
          items={recentAttendance}
          emptyTitle="No attendance records yet"
          emptyDescription="Recent employee check-ins will appear here once attendance has been recorded."
        />
      </div>
    </div>
  )
}
