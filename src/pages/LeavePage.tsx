import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarDays, Eye, Plus, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getMyLeaves } from '../api/leaves.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { LeaveActionDialog, type LeaveAction } from '../components/leaves/LeaveActionDialog'
import { LeaveStatusBadge } from '../components/leaves/LeaveStatusBadge'
import { Pagination } from '../components/ui/Pagination'
import type { LeaveRequest } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateOnly, formatLeaveType } from '../utils/dashboard'

const PAGE_SIZE = 10

function LeaveListSkeleton() {
  return (
    <div role="status" aria-label="Loading leave requests" className="animate-pulse space-y-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-44 rounded-2xl border border-slate-200 bg-white" />
      ))}
      <span className="sr-only">Loading leave requests…</span>
    </div>
  )
}

export function LeavePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const [selectedAction, setSelectedAction] = useState<{ leave: LeaveRequest; action: LeaveAction } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const leavesQuery = useQuery({
    queryKey: ['leaves', 'me', { page }],
    queryFn: () => getMyLeaves({ page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const data = leavesQuery.data

  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      setSearchParams({ page: String(data.pagination.totalPages) }, { replace: true })
    }
  }, [data, page, setSearchParams])

  const changePage = (nextPage: number) => setSearchParams({ page: String(nextPage) })

  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My leave requests</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review your requests or submit a new one.</p>
        </div>
        <Link
          to="/leaves/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="size-4" aria-hidden="true" />
          Request leave
        </Link>
      </header>

      {notice && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      <div className="mt-7">
        {leavesQuery.isPending ? (
          <LeaveListSkeleton />
        ) : leavesQuery.isError ? (
          <DashboardError message={getApiErrorMessage(leavesQuery.error)} onRetry={() => void leavesQuery.refetch()} />
        ) : data && data.data.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {data.data.map((leave) => (
                <li key={leave.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-slate-950">{formatLeaveType(leave.leaveType)}</h3>
                        <LeaveStatusBadge status={leave.status} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {formatDateOnly(leave.startDate)} – {formatDateOnly(leave.endDate)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{leave.reason}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        to={`/leaves/${leave.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <Eye className="size-4" aria-hidden="true" />
                        Details
                      </Link>
                      {leave.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => setSelectedAction({ leave, action: 'cancel' })}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                          <XCircle className="size-4" aria-hidden="true" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemLabel="requests"
              ariaLabel="My leave request pages"
              onPageChange={changePage}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <CalendarDays className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No leave requests yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">Submit your first request when you need time away.</p>
          </div>
        )}
      </div>

      <LeaveActionDialog
        leave={selectedAction?.leave ?? null}
        action={selectedAction?.action ?? null}
        onClose={() => setSelectedAction(null)}
        onSuccess={(leave) => {
          setSelectedAction(null)
          setNotice(`${formatLeaveType(leave.leaveType)} was cancelled.`)
        }}
      />
    </div>
  )
}
