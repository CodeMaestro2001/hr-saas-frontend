interface EmployeeStatusBadgeProps {
  isActive: boolean
}

export function EmployeeStatusBadge({ isActive }: EmployeeStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      isActive
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
        : 'bg-slate-100 text-slate-600 ring-slate-500/15'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
