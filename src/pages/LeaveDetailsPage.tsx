import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getLeave } from '../api/leaves.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { LeaveActionDialog, type LeaveAction } from '../components/leaves/LeaveActionDialog'
import { LeaveRequestDetails } from '../components/leaves/LeaveRequestDetails'
import { useAuth } from '../hooks/useAuth'
import type { LeaveRequest } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'

interface DetailsLocationState {
  notice?: string
}

export function LeaveDetailsPage() {
  const { leaveId = '' } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'ADMIN'
  const backPath = isAdmin ? '/leave-management' : '/leaves'
  const [notice, setNotice] = useState<string | null>((location.state as DetailsLocationState | null)?.notice ?? null)
  const [selectedAction, setSelectedAction] = useState<{ leave: LeaveRequest; action: LeaveAction } | null>(null)
  const leaveQuery = useQuery({
    queryKey: ['leaves', 'detail', leaveId],
    queryFn: () => getLeave(leaveId),
    enabled: Boolean(leaveId),
  })

  if (leaveQuery.isPending) return <DashboardSkeleton />
  if (leaveQuery.isError) return <DashboardError message={getApiErrorMessage(leaveQuery.error)} onRetry={() => void leaveQuery.refetch()} />
  if (!leaveQuery.data) return null

  const leave = leaveQuery.data

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to leave requests
      </Link>
      <header className="mb-7 mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-700">{isAdmin ? 'Leave management' : 'Employee portal'}</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Leave request details</h2>
        </div>
        {leave.status === 'PENDING' && (
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <>
                <button type="button" onClick={() => setSelectedAction({ leave, action: 'approve' })} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                  <Check className="size-4" aria-hidden="true" />Approve
                </button>
                <button type="button" onClick={() => setSelectedAction({ leave, action: 'reject' })} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                  <X className="size-4" aria-hidden="true" />Reject
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setSelectedAction({ leave, action: 'cancel' })} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                <XCircle className="size-4" aria-hidden="true" />Cancel request
              </button>
            )}
          </div>
        )}
      </header>

      {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
      <LeaveRequestDetails leave={leave} showEmployee={isAdmin} />

      <LeaveActionDialog
        leave={selectedAction?.leave ?? null}
        action={selectedAction?.action ?? null}
        onClose={() => setSelectedAction(null)}
        onSuccess={(_updatedLeave, action) => {
          setSelectedAction(null)
          const outcome = action === 'cancel' ? 'cancelled' : action === 'approve' ? 'approved' : 'rejected'
          setNotice(`Leave request was ${outcome}.`)
        }}
      />
    </div>
  )
}
