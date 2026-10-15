import { BriefcaseBusiness, Building2, CalendarDays, Mail, UserRound } from 'lucide-react'
import type { Employee } from '../../types/workforce'
import { formatDateOnly } from '../../utils/dashboard'
import { EmployeeStatusBadge } from './EmployeeStatusBadge'

interface EmployeeProfileDetailsProps {
  employee: Employee
}

export function EmployeeProfileDetails({ employee }: EmployeeProfileDetailsProps) {
  const details = [
    { label: 'Email', value: employee.email, icon: Mail },
    { label: 'Department', value: employee.department, icon: Building2 },
    { label: 'Job title', value: employee.jobTitle, icon: BriefcaseBusiness },
    { label: 'Hire date', value: formatDateOnly(employee.hireDate), icon: CalendarDays },
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7" aria-labelledby="employee-profile-heading">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <UserRound className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h2 id="employee-profile-heading" className="text-xl font-semibold text-slate-950">{employee.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">Employee profile</p>
          </div>
        </div>
        <EmployeeStatusBadge isActive={employee.isActive} />
      </div>

      <dl className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-slate-900">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  )
}
