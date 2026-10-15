import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createLeave } from '../api/leaves.api'
import { LeaveForm } from '../components/leaves/LeaveForm'
import type { CreateLeaveInput } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'
import { formatLeaveType } from '../utils/dashboard'
import { invalidateLeaveQueries } from '../utils/leaveQueries'

export function RequestLeavePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = useMutation({ mutationFn: createLeave })

  const submit = async (input: CreateLeaveInput) => {
    setApiError(null)
    try {
      const leave = await mutation.mutateAsync(input)
      await invalidateLeaveQueries(queryClient)
      navigate(`/leaves/${leave.id}`, {
        replace: true,
        state: { notice: `${formatLeaveType(leave.leaveType)} request was submitted.` },
      })
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/leaves" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to leave requests
      </Link>
      <header className="mb-7 mt-5">
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Request leave</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Dates are inclusive. Pending and approved requests cannot overlap.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="Leave request information">
        <LeaveForm isSubmitting={mutation.isPending} apiError={apiError} onSubmit={submit} />
      </section>
    </div>
  )
}
