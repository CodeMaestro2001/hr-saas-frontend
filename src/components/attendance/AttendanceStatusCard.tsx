import { CircleCheck, CircleMinus, Clock3 } from 'lucide-react'
import type { AttendanceRecord } from '../../types/workforce'
import { formatDateTime, getAttendanceState } from '../../utils/dashboard'
import { CheckInOutButton } from './CheckInOutButton'

interface AttendanceStatusCardProps {
  records: AttendanceRecord[]
  isActionPending: boolean
  onAction: () => void
}

export function AttendanceStatusCard({ records, isActionPending, onAction }: AttendanceStatusCardProps) {
  const state = getAttendanceState(records)
  const openSession = records.find((record) => record.checkOutTime === null)
  const latestSession = records[0]
  const isCheckedIn = state === 'CHECKED_IN'
  const details = isCheckedIn && openSession
    ? `Checked in ${formatDateTime(openSession.checkInTime)}`
    : state === 'CHECKED_OUT' && latestSession?.checkOutTime
      ? `Last checked out ${formatDateTime(latestSession.checkOutTime)}`
      : 'No attendance recorded for the current UTC day.'
  const Icon = isCheckedIn ? CircleCheck : state === 'CHECKED_OUT' ? Clock3 : CircleMinus

  return (
    <section aria-labelledby="attendance-status-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${isCheckedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current status</p>
            <h2 id="attendance-status-title" className="mt-1 text-lg font-bold text-slate-950">
              {isCheckedIn ? 'Checked in' : state === 'CHECKED_OUT' ? 'Checked out' : 'Not checked in'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{details}</p>
          </div>
        </div>
        <CheckInOutButton isCheckedIn={isCheckedIn} isPending={isActionPending} onClick={onAction} />
      </div>
    </section>
  )
}
