import { CalendarDays, ClipboardList, UserRound } from 'lucide-react'
import type { LeaveRequest } from '../../types/workforce'
import { formatDateOnly, formatLeaveType } from '../../utils/dashboard'
import { LeaveStatusBadge } from './LeaveStatusBadge'

interface LeaveRequestDetailsProps {
  leave: LeaveRequest
  showEmployee?: boolean
}

export function LeaveRequestDetails({ leave, showEmployee = false }: LeaveRequestDetailsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7" aria-labelledby="leave-details-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">{formatLeaveType(leave.leaveType)}</p>
          <h2 id="leave-details-heading" className="mt-2 text-xl font-semibold text-slate-950">
            {formatDateOnly(leave.startDate)} – {formatDateOnly(leave.endDate)}
          </h2>
        </div>
        <LeaveStatusBadge status={leave.status} />
      </div>

      <dl className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        {showEmployee && (
          <div className="flex gap-3">
            <UserRound className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Employee</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{leave.employee.fullName}</dd>
              <dd className="mt-0.5 text-xs text-slate-500">{leave.employee.department} · {leave.employee.jobTitle}</dd>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Submitted</dt>
            <dd className="mt-1 text-sm font-medium text-slate-900">{formatDateOnly(leave.createdAt)}</dd>
          </div>
        </div>
        {leave.reviewedAt && (
          <div className="flex gap-3">
            <ClipboardList className="mt-0.5 size-4 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Reviewed</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{formatDateOnly(leave.reviewedAt)}</dd>
              {leave.reviewedBy && <dd className="mt-0.5 text-xs text-slate-500">{leave.reviewedBy.email}</dd>}
            </div>
          </div>
        )}
      </dl>

      <div className="mt-6 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-slate-900">Reason</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{leave.reason}</p>
      </div>
    </section>
  )
}
