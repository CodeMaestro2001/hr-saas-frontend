import { Clock3 } from 'lucide-react'
import type { AttendanceRecord } from '../../types/workforce'
import { formatDateTime } from '../../utils/dashboard'
import { WorkingHoursDisplay } from './WorkingHoursDisplay'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  showEmployee?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function AttendanceTable({
  records,
  showEmployee = false,
  emptyTitle = 'No attendance records',
  emptyDescription = 'Attendance sessions will appear here after they are recorded.',
}: AttendanceTableProps) {
  if (records.length === 0) {
    return (
      <div className="px-6 py-14 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Clock3 className="size-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 border-collapse text-left">
        <caption className="sr-only">Attendance sessions. Times are shown in your local time zone.</caption>
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {showEmployee && <th scope="col" className="px-5 py-3.5 sm:px-6">Employee</th>}
            <th scope="col" className="px-5 py-3.5 sm:px-6">Check in</th>
            <th scope="col" className="px-5 py-3.5 sm:px-6">Check out</th>
            <th scope="col" className="px-5 py-3.5 sm:px-6">Worked time</th>
            <th scope="col" className="px-5 py-3.5 sm:px-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record.id} className="transition-colors hover:bg-slate-50/70">
              {showEmployee && (
                <td className="px-5 py-4 sm:px-6">
                  <p className="font-semibold text-slate-900">{record.employee.fullName}</p>
                  <p className="mt-1 text-xs text-slate-500">{record.employee.department} · {record.employee.jobTitle}</p>
                </td>
              )}
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 sm:px-6">{formatDateTime(record.checkInTime)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-700 sm:px-6">
                {record.checkOutTime ? formatDateTime(record.checkOutTime) : <span className="font-medium text-emerald-700">Open session</span>}
              </td>
              <td className="px-5 py-4 sm:px-6"><WorkingHoursDisplay workedMinutes={record.workedMinutes} /></td>
              <td className="px-5 py-4 sm:px-6">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${record.checkOutTime ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {record.checkOutTime ? 'Completed' : 'In progress'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
