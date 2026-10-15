import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarDays, Check, Eye, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAdminLeaves } from '../api/leaves.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { LeaveActionDialog, type LeaveAction } from '../components/leaves/LeaveActionDialog'
import { LeaveStatusBadge } from '../components/leaves/LeaveStatusBadge'
import { Pagination } from '../components/ui/Pagination'
import type { LeaveRequest, LeaveStatus } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateOnly, formatLeaveType } from '../utils/dashboard'

const PAGE_SIZE = 10
const statusOptions: Array<{ value: '' | LeaveStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function AdminLeavePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const rawStatus = searchParams.get('status')
  const status = rawStatus && statusOptions.some((option) => option.value === rawStatus)
    ? rawStatus as LeaveStatus
    : null
  const [selectedAction, setSelectedAction] = useState<{ leave: LeaveRequest; action: LeaveAction } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const leavesQuery = useQuery({
    queryKey: ['leaves', 'admin', { page, status }],
    queryFn: () => getAdminLeaves({ page, limit: PAGE_SIZE, status: status ?? undefined }),
    placeholderData: keepPreviousData,
  })
  const data = leavesQuery.data

  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      const params: Record<string, string> = { page: String(data.pagination.totalPages) }
      if (status) params.status = status
      setSearchParams(params, { replace: true })
    }
  }, [data, page, setSearchParams, status])

  const changeStatus = (nextStatus: string) => {
    setSearchParams(nextStatus ? { status: nextStatus } : {})
  }
  const changePage = (nextPage: number) => {
    const params: Record<string, string> = { page: String(nextPage) }
    if (status) params.status = status
    setSearchParams(params)
  }

  return (
    <div>
      <header>
        <p className="mb-2 text-sm font-semibold text-blue-700">Administration</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Leave management</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Review employee requests and make decisions on pending leave.</p>
      </header>

      {notice && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      <div className="mt-7 flex items-center gap-3">
        <label htmlFor="leave-status-filter" className="text-sm font-semibold text-slate-700">Status</label>
        <select
          id="leave-status-filter"
          value={status ?? ''}
          onChange={(event) => changeStatus(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        >
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {leavesQuery.isPending ? (
          <div role="status" aria-label="Loading leave requests" className="animate-pulse divide-y divide-slate-100">
            {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 bg-white" />)}
            <span className="sr-only">Loading leave requests…</span>
          </div>
        ) : leavesQuery.isError ? (
          <div className="p-5"><DashboardError message={getApiErrorMessage(leavesQuery.error)} onRetry={() => void leavesQuery.refetch()} /></div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-220 border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Employee</th>
                    <th scope="col" className="px-6 py-3.5">Leave</th>
                    <th scope="col" className="px-6 py-3.5">Dates</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((leave) => (
                    <tr key={leave.id} className="align-top transition hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{leave.employee.fullName}</p>
                        <p className="mt-1 text-xs text-slate-500">{leave.employee.department}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{formatLeaveType(leave.leaveType)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDateOnly(leave.startDate)} – {formatDateOnly(leave.endDate)}</td>
                      <td className="px-6 py-4"><LeaveStatusBadge status={leave.status} /></td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link to={`/leave-management/${leave.id}`} aria-label={`View ${leave.employee.fullName}'s leave request`} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                          {leave.status === 'PENDING' && (
                            <>
                              <button type="button" aria-label={`Approve ${leave.employee.fullName}'s leave request`} onClick={() => setSelectedAction({ leave, action: 'approve' })} className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                                <Check className="size-4" aria-hidden="true" />
                              </button>
                              <button type="button" aria-label={`Reject ${leave.employee.fullName}'s leave request`} onClick={() => setSelectedAction({ leave, action: 'reject' })} className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                <X className="size-4" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} totalItems={data.pagination.total} itemLabel="requests" ariaLabel="Leave management pages" onPageChange={changePage} />
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><CalendarDays className="size-6" aria-hidden="true" /></span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No leave requests found</h3>
            <p className="mt-1 text-sm text-slate-500">{status ? `There are no ${status.toLowerCase()} requests.` : 'Employee requests will appear here.'}</p>
          </div>
        )}
      </div>

      <LeaveActionDialog
        leave={selectedAction?.leave ?? null}
        action={selectedAction?.action ?? null}
        onClose={() => setSelectedAction(null)}
        onSuccess={(leave, action) => {
          setSelectedAction(null)
          setNotice(`${leave.employee.fullName}'s request was ${action === 'approve' ? 'approved' : 'rejected'}.`)
        }}
      />
    </div>
  )
}
