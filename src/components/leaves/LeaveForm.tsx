import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { CreateLeaveInput } from '../../types/workforce'
import { leaveFormSchema, type LeaveFormInput, type LeaveFormValues } from '../../validation/leave'

interface LeaveFormProps {
  isSubmitting: boolean
  apiError?: string | null
  onSubmit: (input: CreateLeaveInput) => Promise<void>
}

const inputClasses = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500'

export function LeaveForm({ isSubmitting, apiError, onSubmit }: LeaveFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveFormInput, unknown, LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {apiError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="leaveType" className="mb-2 block text-sm font-semibold text-slate-800">Leave type</label>
        <select
          id="leaveType"
          aria-invalid={Boolean(errors.leaveType)}
          aria-describedby={errors.leaveType ? 'leaveType-error' : undefined}
          disabled={isSubmitting}
          className={inputClasses}
          {...register('leaveType')}
        >
          <option value="">Select a leave type</option>
          <option value="ANNUAL">Annual leave</option>
          <option value="SICK">Sick leave</option>
          <option value="CASUAL">Casual leave</option>
        </select>
        {errors.leaveType && <p id="leaveType-error" className="mt-1.5 text-sm text-red-600">{errors.leaveType.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="mb-2 block text-sm font-semibold text-slate-800">Start date</label>
          <input
            id="startDate"
            type="date"
            aria-invalid={Boolean(errors.startDate)}
            aria-describedby={errors.startDate ? 'startDate-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('startDate')}
          />
          {errors.startDate && <p id="startDate-error" className="mt-1.5 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className="mb-2 block text-sm font-semibold text-slate-800">End date</label>
          <input
            id="endDate"
            type="date"
            aria-invalid={Boolean(errors.endDate)}
            aria-describedby={errors.endDate ? 'endDate-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('endDate')}
          />
          {errors.endDate && <p id="endDate-error" className="mt-1.5 text-sm text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label htmlFor="reason" className="text-sm font-semibold text-slate-800">Reason</label>
          <span className="text-xs text-slate-400">Maximum 500 characters</span>
        </div>
        <textarea
          id="reason"
          rows={5}
          maxLength={500}
          placeholder="Briefly explain your leave request"
          aria-invalid={Boolean(errors.reason)}
          aria-describedby={errors.reason ? 'reason-error' : undefined}
          disabled={isSubmitting}
          className={`${inputClasses} resize-y`}
          {...register('reason')}
        />
        {errors.reason && <p id="reason-error" className="mt-1.5 text-sm text-red-600">{errors.reason.message}</p>}
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          {isSubmitting ? 'Submitting…' : 'Submit request'}
        </button>
      </div>
    </form>
  )
}
