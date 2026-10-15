import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  helperText: string
  icon: ReactNode
  tone?: 'blue' | 'emerald' | 'amber' | 'slate'
  id?: string
}

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  slate: 'bg-slate-100 text-slate-700',
}

export function StatCard({ label, value, helperText, icon, tone = 'blue', id }: StatCardProps) {
  return (
    <article id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{helperText}</p>
    </article>
  )
}
