import { Clock3 } from 'lucide-react'
import { formatWorkedMinutes } from '../../utils/dashboard'

interface WorkingHoursDisplayProps {
  workedMinutes: number | null
}

export function WorkingHoursDisplay({ workedMinutes }: WorkingHoursDisplayProps) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-700">
      <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
      {formatWorkedMinutes(workedMinutes)}
    </span>
  )
}
