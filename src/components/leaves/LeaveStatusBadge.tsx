import type { LeaveStatus } from '../../types/workforce'
import { formatLeaveStatus } from '../../utils/dashboard'

interface LeaveStatusBadgeProps {
  status: LeaveStatus
}

const statusClasses: Record<LeaveStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  REJECTED: 'bg-red-50 text-red-700 ring-red-600/15',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-500/15',
}

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}>
      {formatLeaveStatus(status)}
    </span>
  )
}
