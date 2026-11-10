import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, CalendarDays, Clock3, ListChecks, UserRound } from 'lucide-react'
import { getEmployeeDashboardSummary } from '../api/dashboard.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { QuickActions, type QuickAction } from '../components/dashboard/QuickActions'
import { StatCard } from '../components/dashboard/StatCard'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateOnly, formatDateTime, formatLeaveType, formatWorkedMinutes } from '../utils/dashboard'

const quickActions: QuickAction[] = [
  { label: 'My profile', description: 'View your employee information', href: '/profile', icon: <UserRound className="size-5" /> },
  { label: 'Attendance', description: 'Check in, check out, and view history', href: '/attendance', icon: <Clock3 className="size-5" /> },
  { label: 'Request leave', description: 'Submit and review leave requests', href: '/leaves', icon: <ListChecks className="size-5" /> },
]

export function EmployeeDashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'employee', 'summary'],
    queryFn: getEmployeeDashboardSummary,
    refetchInterval: 60_000,
  })

  if (summaryQuery.isPending) return <DashboardSkeleton />
  if (summaryQuery.isError) return <DashboardError message={getApiErrorMessage(summaryQuery.error)} onRetry={() => void summaryQuery.refetch()} />

  const summary = summaryQuery.data
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${summary.monthlyAttendance.month}-01T00:00:00.000Z`))

  return (
    <div>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome, {summary.employee.fullName}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{summary.employee.jobTitle} · {summary.employee.department}</p>
      </header>

      <section aria-label="Personal dashboard statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present days" value={summary.monthlyAttendance.presentDays} helperText={`${monthLabel} · ${summary.monthlyAttendance.sessions} sessions`} icon={<CalendarCheck className="size-5" />} tone="emerald" />
        <StatCard label="Worked time" value={formatWorkedMinutes(summary.monthlyAttendance.workedMinutes)} helperText="Completed attendance sessions this month" icon={<Clock3 className="size-5" />} />
        <StatCard label="Remaining leave" value={`${summary.totalRemainingLeave} days`} helperText={`Calculated from approved ${summary.year} leave`} icon={<CalendarDays className="size-5" />} tone="amber" />
        <StatCard
          label="Attendance status"
          value={summary.currentAttendance.status === 'CHECKED_IN' ? 'Checked in' : 'Not checked in'}
          helperText={summary.currentAttendance.status === 'CHECKED_IN' ? `Since ${formatDateTime(summary.currentAttendance.checkInTime)}` : 'No open attendance session'}
          icon={<UserRound className="size-5" />}
          tone={summary.currentAttendance.status === 'CHECKED_IN' ? 'emerald' : 'slate'}
        />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Leave summary">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Leave balance</h3>
          <p className="mt-1 text-sm text-slate-500">Approved calendar days used during {summary.year}.</p>
          <dl className="mt-5 divide-y divide-slate-100">
            {summary.leaveBalance.map((balance) => (
              <div key={balance.leaveType} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <dt className="text-sm font-medium text-slate-700">{formatLeaveType(balance.leaveType)}</dt>
                <dd className="text-right text-sm"><span className="font-semibold text-slate-950">{balance.remaining} left</span><span className="ml-2 text-slate-500">{balance.used}/{balance.allowance} used</span></dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Upcoming approved leave</h3>
          {summary.upcomingApprovedLeave ? (
            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-emerald-950">
              <p className="font-semibold">{formatLeaveType(summary.upcomingApprovedLeave.leaveType)}</p>
              <p className="mt-1 text-sm">{formatDateOnly(summary.upcomingApprovedLeave.startDate)} – {formatDateOnly(summary.upcomingApprovedLeave.endDate)}</p>
              <p className="mt-3 text-sm leading-6 text-emerald-800">{summary.upcomingApprovedLeave.reason}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">No upcoming approved leave</p>
              <p className="mt-1 text-sm text-slate-500">Approved future requests will appear here.</p>
            </div>
          )}
          {summary.pendingLeaveCount > 0 && <p className="mt-4 text-xs text-slate-500">{summary.pendingLeaveCount} request{summary.pendingLeaveCount === 1 ? '' : 's'} awaiting review.</p>}
        </article>
      </section>

      <div className="mt-8"><QuickActions actions={quickActions} /></div>
    </div>
  )
}
