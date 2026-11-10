import { useQuery } from '@tanstack/react-query'
import { CalendarClock, ClipboardList, Clock3, UserCheck, UserMinus, Users } from 'lucide-react'
import { getAdminDashboardSummary } from '../api/dashboard.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { QuickActions, type QuickAction } from '../components/dashboard/QuickActions'
import { RecentActivity, type ActivityItem } from '../components/dashboard/RecentActivity'
import { StatCard } from '../components/dashboard/StatCard'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime } from '../utils/dashboard'

const quickActions: QuickAction[] = [
  { label: 'Employee directory', description: 'Search and manage employees', href: '/employees', icon: <Users className="size-5" /> },
  { label: 'Pending leave', description: 'See requests awaiting review', href: '/leave-management?status=PENDING', icon: <ClipboardList className="size-5" /> },
  { label: 'Attendance', description: 'Review workforce sessions', href: '/attendance-management', icon: <Clock3 className="size-5" /> },
]

export function AdminDashboardPage() {
  const { user } = useAuth()
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'admin', 'summary'],
    queryFn: getAdminDashboardSummary,
    refetchInterval: 60_000,
  })

  if (summaryQuery.isPending) return <DashboardSkeleton />
  if (summaryQuery.isError) return <DashboardError message={getApiErrorMessage(summaryQuery.error)} onRetry={() => void summaryQuery.refetch()} />

  const summary = summaryQuery.data
  const checkedIn: ActivityItem[] = summary.currentlyCheckedIn.employees.map((employee) => ({
    id: employee.attendanceId,
    title: employee.fullName,
    description: `${employee.department} · ${employee.jobTitle}`,
    meta: `Since ${formatDateTime(employee.checkInTime)}`,
    status: 'Checked in',
    tone: 'emerald',
  }))

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-700">Administration</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Today’s workforce</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Live UTC-day summary for <span className="font-medium text-slate-800">{user?.email}</span>. Automatically refreshes every minute.
        </p>
      </header>

      <section aria-label="Today's workforce statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present today" value={summary.presentToday} helperText={`Of ${summary.activeEmployees} active employees`} icon={<UserCheck className="size-5" />} tone="emerald" />
        <StatCard label="Absent today" value={summary.absentToday} helperText="No attendance overlapping the current UTC day" icon={<UserMinus className="size-5" />} tone="slate" />
        <StatCard label="Currently checked in" value={summary.currentlyCheckedIn.count} helperText="Employees with an open attendance session" icon={<Clock3 className="size-5" />} />
        <StatCard label="Pending leave" value={summary.pendingLeaveCount} helperText="Requests awaiting an admin decision" icon={<CalendarClock className="size-5" />} tone="amber" />
      </section>

      <div className="mt-8"><QuickActions actions={quickActions} /></div>
      <div className="mt-8">
        <RecentActivity
          title="Currently checked-in employees"
          description="Open attendance sessions, ordered by most recent check-in. Times are displayed locally."
          items={checkedIn}
          emptyTitle="No employees are checked in"
          emptyDescription="Open attendance sessions will appear here in real time."
        />
      </div>
    </div>
  )
}
